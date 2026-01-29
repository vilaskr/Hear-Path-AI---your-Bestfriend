import React, { useState } from 'react';
import { MoodLog } from '../types';
import { MOOD_EMOJIS } from '../constants';

interface MoodTrackerProps {
  logs: MoodLog[];
  onAddMood: (score: number, note: string) => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ logs, onAddMood }) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (selectedScore !== null) {
      onAddMood(selectedScore, note);
      setSelectedScore(null);
      setNote('');
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Emotional Map</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Pause, Breathe, Reflect</p>
      </header>

      {/* Hero Selection Card */}
      <section className="bg-zinc-900/40 rounded-[48px] p-10 text-center relative border border-white/5 shadow-2xl overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -mr-10 -mt-10" />
        
        <div className="grid grid-cols-5 gap-4 mb-12">
          {MOOD_EMOJIS.map((item) => {
            const isSelected = selectedScore === item.score;
            return (
              <button
                key={item.score}
                onClick={() => setSelectedScore(item.score)}
                className={`flex flex-col items-center transition-all duration-500 group ${
                  isSelected ? 'scale-125 -translate-y-2' : 'opacity-30 hover:opacity-100 hover:scale-110'
                }`}
              >
                <span className={`text-5xl mb-3 block filter transition-all ${isSelected ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'grayscale-[50%]'}`}>
                  {item.emoji}
                </span>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${isSelected ? 'opacity-100 text-indigo-400' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className={`space-y-6 transition-all duration-700 ${selectedScore ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind? (Optional)"
              className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/30 rounded-[32px] p-6 text-zinc-100 placeholder:text-zinc-700 transition-all h-36 resize-none outline-none text-[15px]"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-white text-black font-black py-5 rounded-[28px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            Save This Moment
          </button>
        </div>
      </section>

      {/* History Grid */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-white tracking-tight">Recent Checks</h3>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{logs.length} Total</span>
        </div>
        
        {logs.length === 0 ? (
          <div className="py-24 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[48px]">
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Your journey is empty for now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {logs.map((log) => {
              const mood = MOOD_EMOJIS.find(m => m.score === log.score);
              return (
                <div key={log.id} className="bg-zinc-900/30 border border-white/5 rounded-[32px] p-6 flex items-center gap-6 transition-all hover:bg-zinc-900/50 active:scale-[0.98]">
                  <span className="text-5xl">{mood?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <h4 className="font-black text-white tracking-tight">{mood?.label}</h4>
                      <time className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </time>
                    </div>
                    {log.note && (
                      <p className="text-[14px] text-zinc-400 truncate font-medium">"{log.note}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MoodTracker;