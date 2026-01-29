import React, { useState, useEffect, useRef } from 'react';
import { ChatMode, Message, MoodLog, JournalEntry, User, AppState } from './types';
import { geminiService } from './services/gemini';
import { supabase } from './services/supabase';
import { storageService } from './services/storage';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import MoodTracker from './components/MoodTracker';
import Journal from './components/Journal';
import Auth from './components/Auth';
import EmergencyOverlay from './components/EmergencyOverlay';

const App: React.FC = () => {
  const [isLocalMode, setIsLocalMode] = useState(!supabase);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const [state, setState] = useState<AppState>(() => {
    const persisted = storageService.loadState();
    return {
      user: persisted.user || null,
      currentMode: persisted.currentMode || ChatMode.CASUAL,
      messages: persisted.messages || [],
      moodLogs: persisted.moodLogs || [],
      journalEntries: persisted.journalEntries || [],
      isCrisisMode: false,
      emergencyTriggered: false,
      lastUserInteraction: Date.now(),
    };
  });

  const [activeTab, setActiveTab] = useState<'chat' | 'mood' | 'journal'>('chat');
  const [isTyping, setIsTyping] = useState(false);
  const checkInTimerRef = useRef<number | null>(null);
  const emergencyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLocalMode) {
      storageService.saveState(state);
    }
  }, [state, isLocalMode]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuth({ id: session.user.id, email: session.user.email! });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleAuth({ id: session.user.id, email: session.user.email! });
      } else {
        setState(prev => ({ ...prev, user: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (user: User) => {
    setState(prev => ({ ...prev, user }));
    setIsLocalMode(false);
    
    if (!supabase) return;

    try {
      const [msgs, moods, journals] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
        supabase.from('mood_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('journal_entries').select('*').order('created_at', { ascending: false })
      ]);

      setState(prev => ({
        ...prev,
        messages: msgs.data?.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          mode: m.mode as ChatMode,
          timestamp: new Date(m.created_at).getTime(),
          image: m.image_data ? { data: m.image_data, mimeType: m.mime_type } : undefined
        })) || [],
        moodLogs: moods.data?.map(m => ({
          id: m.id,
          score: m.score,
          note: m.note,
          timestamp: new Date(m.created_at).getTime()
        })) || [],
        journalEntries: journals.data?.map(j => ({
          id: j.id,
          title: j.title,
          content: j.content,
          timestamp: new Date(j.created_at).getTime()
        })) || []
      }));
    } catch (e) {
      console.error("Supabase sync failed:", e);
    }
  };

  useEffect(() => {
    if (state.isCrisisMode && !state.emergencyTriggered) {
      emergencyTimerRef.current = window.setTimeout(() => {
        setState(prev => ({ ...prev, emergencyTriggered: true }));
      }, 60000) as unknown as number;

      checkInTimerRef.current = window.setInterval(async () => {
        const timeSinceLast = Date.now() - state.lastUserInteraction;
        if (timeSinceLast > 15000) {
           const presenceResponse = await geminiService.generateResponse(
             ChatMode.CRISIS,
             state.messages,
             "[System: User has been silent. Maintain presence.]"
           );
           addModelMessage(presenceResponse, ChatMode.CRISIS);
        }
      }, 20000) as unknown as number;
    } else {
      if (checkInTimerRef.current) clearInterval(checkInTimerRef.current);
      if (emergencyTimerRef.current) clearTimeout(emergencyTimerRef.current);
    }
    return () => {
      if (checkInTimerRef.current) clearInterval(checkInTimerRef.current);
      if (emergencyTimerRef.current) clearTimeout(emergencyTimerRef.current);
    };
  }, [state.isCrisisMode, state.emergencyTriggered, state.lastUserInteraction, state.messages]);

  const addModelMessage = async (content: string, mode: ChatMode) => {
    let id = Date.now().toString() + "-model";
    let timestamp = Date.now();

    if (state.user && state.user.id !== 'guest' && supabase) {
      const { data } = await supabase.from('messages').insert({
        user_id: state.user.id,
        role: 'model',
        content,
        mode
      }).select().single();
      if (data) {
        id = data.id;
        timestamp = new Date(data.created_at).getTime();
      }
    }

    const modelMsg: Message = { id, role: 'model', content, timestamp, mode };
    setState(prev => ({ ...prev, messages: [...prev.messages, modelMsg] }));
  };

  const handleSendMessage = async (content: string, image?: { data: string; mimeType: string }) => {
    const interactionTime = Date.now();
    setState(prev => ({ ...prev, lastUserInteraction: interactionTime }));

    let id = Date.now().toString() + "-user";
    if (state.user && state.user.id !== 'guest' && supabase) {
      const { data } = await supabase.from('messages').insert({
        user_id: state.user.id,
        role: 'user',
        content,
        mode: state.currentMode,
        image_data: image?.data,
        mime_type: image?.mimeType
      }).select().single();
      if (data) id = data.id;
    }

    const userMsg: Message = {
      id,
      role: 'user',
      content,
      image,
      timestamp: interactionTime,
      mode: state.currentMode,
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setIsTyping(true);

    const isCrisis = await geminiService.checkCrisisIntent(content);
    const effectiveMode = isCrisis ? ChatMode.CRISIS : state.currentMode;
    
    if (isCrisis && !state.isCrisisMode) {
      setState(prev => ({ ...prev, isCrisisMode: true, currentMode: ChatMode.CRISIS }));
    }

    const aiResponse = await geminiService.generateResponse(
      effectiveMode,
      state.messages,
      content,
      image
    );

    await addModelMessage(aiResponse, effectiveMode);
    setIsTyping(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    storageService.clear();
    setState({
      user: null,
      currentMode: ChatMode.CASUAL,
      messages: [],
      moodLogs: [],
      journalEntries: [],
      isCrisisMode: false,
      emergencyTriggered: false,
      lastUserInteraction: Date.now(),
    });
    setIsLocalMode(!supabase);
  };

  const handleAddMood = async (score: number, note: string) => {
    let id = Date.now().toString();
    let timestamp = Date.now();

    if (state.user && state.user.id !== 'guest' && supabase) {
      const { data } = await supabase.from('mood_logs').insert({
        user_id: state.user.id,
        score,
        note
      }).select().single();
      if (data) {
        id = data.id;
        timestamp = new Date(data.created_at).getTime();
      }
    }

    setState(prev => ({
      ...prev,
      moodLogs: [{ id, score, note, timestamp }, ...prev.moodLogs]
    }));
  };

  const handleAddJournal = async (title: string, content: string) => {
    let id = Date.now().toString();
    let timestamp = Date.now();

    if (state.user && state.user.id !== 'guest' && supabase) {
      const { data } = await supabase.from('journal_entries').insert({
        user_id: state.user.id,
        title,
        content
      }).select().single();
      if (data) {
        id = data.id;
        timestamp = new Date(data.created_at).getTime();
      }
    }

    setState(prev => ({
      ...prev,
      journalEntries: [{ id, title, content, timestamp }, ...prev.journalEntries]
    }));
  };

  if (!state.user && !showSetupGuide) {
    return (
      <Auth 
        onAuth={handleAuth} 
        onContinueGuest={() => {
          setState(prev => ({ ...prev, user: { id: 'guest', email: 'guest@local' } }));
          setIsLocalMode(true);
        }}
        isSupabaseMissing={!supabase}
        onShowSetup={() => setShowSetupGuide(true)}
      />
    );
  }

  if (showSetupGuide) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-2xl w-full bg-zinc-900/50 border border-white/10 rounded-[48px] p-10 space-y-8 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <header className="text-center space-y-4">
            <div className="text-5xl">🚀</div>
            <h1 className="text-3xl font-black text-white tracking-tight">Vercel & Supabase Setup</h1>
            <p className="text-zinc-400 text-sm">Follow these steps to enable cloud sync and real authentication.</p>
          </header>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">Step 1: Vercel Env Vars</h3>
              <div className="bg-black/60 p-5 rounded-3xl font-mono text-[11px] text-zinc-500 border border-white/5 space-y-1">
                <p>SUPABASE_URL = "your-project-url"</p>
                <p>SUPABASE_ANON_KEY = "your-anon-key"</p>
                <p>API_KEY = "your-gemini-api-key"</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">Step 2: Database Schema</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Go to Supabase > SQL Editor and run the following:</p>
              <pre className="bg-black/60 p-4 rounded-2xl font-mono text-[9px] text-indigo-300 border border-indigo-500/20 overflow-x-auto whitespace-pre">
{`CREATE TABLE messages (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users NOT NULL, role text, content text, mode text, image_data text, mime_type text, created_at timestamp with time zone DEFAULT now());
CREATE TABLE mood_logs (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users NOT NULL, score int, note text, created_at timestamp with time zone DEFAULT now());
CREATE TABLE journal_entries (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users NOT NULL, title text, content text, created_at timestamp with time zone DEFAULT now());
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_data" ON messages FOR ALL USING (auth.uid() = user_id);`}
              </pre>
            </div>
          </div>

          <button 
            onClick={() => setShowSetupGuide(false)}
            className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-2xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {state.emergencyTriggered && (
        <EmergencyOverlay onDismiss={() => setState(prev => ({ ...prev, emergencyTriggered: false, isCrisisMode: false, currentMode: ChatMode.CASUAL }))} />
      )}
      
      {isLocalMode && (
        <div className="fixed top-[calc(env(safe-area-inset-top)+80px)] left-1/2 -translate-x-1/2 z-[60] bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-xl animate-bounce">
          Standalone Local Mode
        </div>
      )}

      <Layout 
        user={state.user!} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
      >
        {activeTab === 'chat' && (
          <ChatInterface 
            messages={state.messages} 
            currentMode={state.currentMode}
            onSendMessage={handleSendMessage}
            onModeChange={(m) => setState(prev => ({ ...prev, currentMode: m }))}
            isTyping={isTyping}
            isCrisisMode={state.isCrisisMode}
          />
        )}
        {activeTab === 'mood' && (
          <MoodTracker 
            logs={state.moodLogs} 
            onAddMood={handleAddMood} 
          />
        )}
        {activeTab === 'journal' && (
          <Journal 
            entries={state.journalEntries} 
            onAddEntry={handleAddJournal} 
          />
        )}
      </Layout>
    </div>
  );
};

export default App;