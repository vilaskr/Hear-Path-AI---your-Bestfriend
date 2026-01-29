import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatMode } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  currentMode: ChatMode;
  onSendMessage: (content: string, image?: { data: string; mimeType: string }) => void;
  onModeChange: (mode: ChatMode) => void;
  isTyping: boolean;
  isCrisisMode?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, currentMode, onSendMessage, onModeChange, isTyping, isCrisisMode }) => {
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior, 
          block: 'end' 
        });
      }
    });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isTyping]);

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new MutationObserver(() => scrollToBottom('smooth'));
    observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !pendingImage) return;
    onSendMessage(input, pendingImage ? { data: pendingImage.data, mimeType: pendingImage.mimeType } : undefined);
    setInput('');
    setPendingImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setPendingImage({ data: base64, mimeType: file.type, preview: URL.createObjectURL(file) });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col min-h-full transition-all duration-700 ${isCrisisMode ? 'bg-red-950/10' : ''} relative`}
    >
      {/* Immersive Contact Header */}
      <div className="flex flex-col items-center mb-8 pt-4 shrink-0">
        <div className={`w-20 h-20 rounded-[32px] p-[1.5px] mb-3 transition-all duration-700 ${isCrisisMode ? 'bg-red-600 scale-110 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500'}`}>
          <div className="w-full h-full rounded-[30px] bg-black flex items-center justify-center p-[2px]">
             <div className={`w-full h-full rounded-[28px] flex items-center justify-center text-3xl shadow-inner transition-colors ${isCrisisMode ? 'bg-red-900' : 'bg-zinc-900'}`}>
              {isCrisisMode ? '🤝' : '❤️'}
             </div>
          </div>
        </div>
        <h2 className="text-lg font-black tracking-tight">{isCrisisMode ? 'Safe Presence' : 'HeartPath AI'}</h2>
        <p className={`text-[11px] font-extrabold tracking-widest uppercase transition-colors ${isCrisisMode ? 'text-red-400' : 'text-zinc-500'}`}>
          {isCrisisMode ? 'I am here with you' : 'Your Digital Best Friend'}
        </p>
      </div>

      {/* Mode Selectors */}
      {!isCrisisMode && (
        <div className="flex justify-center mb-8 sticky top-4 z-20 py-1 shrink-0">
          <div className="inline-flex p-1.5 bg-zinc-900/60 rounded-full backdrop-blur-2xl border border-white/5 shadow-2xl">
            {[
              { id: ChatMode.CASUAL, label: 'Casual' },
              { id: ChatMode.SUPPORT, label: 'Support' },
              { id: ChatMode.STUDY, label: 'Study' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  currentMode === mode.id ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 space-y-6 px-1 pb-10">
        {messages.length === 0 && (
          <div className="py-20 text-center opacity-20 px-10">
            <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em]">Start a gentle conversation</p>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isLastModel = !isUser && (idx === messages.length - 1 || (idx + 1 < messages.length && messages[idx+1].role === 'user'));
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-3 ${isUser ? 'message-animate-user' : 'message-animate-model'}`}
            >
              {!isUser && (
                <div className={`w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center text-[10px] border border-white/5 overflow-hidden shadow-lg transition-colors ${isCrisisMode ? 'bg-red-800' : 'bg-zinc-800'}`}>
                  {isLastModel ? (isCrisisMode ? '🤝' : '❤️') : ''}
                </div>
              )}
              <div 
                className={`max-w-[85%] px-5 py-3.5 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  isUser 
                    ? (isCrisisMode ? 'bg-red-700 rounded-[24px] rounded-br-none' : 'bubble-user') 
                    : (isCrisisMode ? 'bg-zinc-900 border-red-900/50 rounded-[24px] rounded-bl-none' : 'bubble-model shadow-black/40')
                } text-white`}
              >
                {msg.image && (
                  <img src={`data:${msg.image.mimeType};base64,${msg.image.data}`} alt="shared" className="max-w-full rounded-2xl mb-3 border border-white/10 shadow-sm" onLoad={() => scrollToBottom('smooth')} />
                )}
                {msg.content && <p className={`text-[15px] leading-[1.5] font-medium whitespace-pre-wrap ${isCrisisMode && !isUser ? 'text-red-50' : ''}`}>{msg.content}</p>}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start items-end gap-3 message-animate-model">
            <div className={`w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center text-[10px] border border-white/5 ${isCrisisMode ? 'bg-red-800' : 'bg-zinc-800'}`}>
              {isCrisisMode ? '🤝' : '❤️'}
            </div>
            <div className={`px-6 py-4 flex gap-1.5 items-center border border-white/5 rounded-[24px] shadow-lg ${isCrisisMode ? 'bg-zinc-900' : 'bg-zinc-900'}`}>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-10 w-full invisible pointer-events-none" aria-hidden="true" />
      </div>

      {/* Input Area */}
      <div className={`fixed bottom-[calc(env(safe-area-inset-bottom)+70px)] left-0 right-0 px-6 z-40 transition-all duration-300`}>
        <div className="max-w-3xl mx-auto">
          {pendingImage && (
            <div className="relative inline-block ml-11 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <img src={pendingImage.preview} alt="preview" className="w-full h-full object-cover" />
              </div>
              <button onClick={() => setPendingImage(null)} className="absolute -top-3 -right-3 bg-zinc-800 border border-white/10 text-white rounded-full p-1.5 shadow-xl hover:bg-zinc-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {!isCrisisMode && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 flex-shrink-0 active:scale-90 transition-all border border-white/5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </button>
            )}

            <div className={`flex-1 bg-zinc-900/70 backdrop-blur-3xl rounded-[28px] flex items-center px-5 py-1.5 gap-3 border transition-all shadow-2xl ${isCrisisMode ? 'border-red-500/50' : 'border-white/10 focus-within:border-indigo-500/50'}`}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={isCrisisMode ? "I'm listening..." : "Message HeartPath..."}
                className="flex-1 bg-transparent border-none py-3 text-[16px] text-white placeholder:text-zinc-600 outline-none"
              />
              
              <div className="flex items-center gap-4 ml-auto">
                {input.trim() || pendingImage ? (
                  <button onClick={() => handleSubmit()} className={`font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all ${isCrisisMode ? 'text-red-500' : 'text-indigo-400 hover:text-indigo-300'}`}>
                    {isCrisisMode ? 'Presence' : 'Send'}
                  </button>
                ) : (
                  <>
                    <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
                    <button className="text-zinc-500 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;