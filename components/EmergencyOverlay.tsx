import React, { useEffect } from 'react';
import { INDIA_EMERGENCY_RESOURCES, EMERGENCY_RESOURCES } from '../constants';

interface EmergencyOverlayProps {
  onDismiss: () => void;
}

const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({ onDismiss }) => {
  useEffect(() => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playAlert = () => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    };

    const interval = setInterval(playAlert, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-red-950/98 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-700 overflow-y-auto">
      <div className="max-w-md w-full bg-zinc-950/80 border border-red-500/30 rounded-[48px] p-8 text-center space-y-6 shadow-2xl shadow-red-500/10 my-8">
        <div className="w-20 h-20 bg-red-600 rounded-full mx-auto flex items-center justify-center animate-pulse shadow-lg shadow-red-600/40">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-white leading-tight">Please stay with us.</h1>
          <p className="text-red-100/70 text-sm font-medium">I'm really worried about you. There are people ready to listen and help you through this right now.</p>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">Primary India Helplines</p>
          
          {/* Priority Resources */}
          <div className="grid grid-cols-1 gap-3">
            {INDIA_EMERGENCY_RESOURCES.filter(res => res.priority).map((res, i) => (
              <a 
                key={`priority-${i}`}
                href={`tel:${res.number}`}
                className="flex items-center justify-between w-full p-5 bg-white text-black rounded-3xl font-bold transition-all active:scale-[0.97] shadow-lg shadow-white/5"
              >
                <div className="text-left">
                  <span className="block text-xs text-zinc-500 uppercase tracking-tight">{res.label}</span>
                  <span className="text-lg">{res.name}</span>
                </div>
                <div className="bg-red-600 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">
                  Call {res.number}
                </div>
              </a>
            ))}
          </div>

          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center pt-2">Additional Support</p>
          
          {/* Secondary Resources */}
          <div className="grid grid-cols-1 gap-2">
            {INDIA_EMERGENCY_RESOURCES.filter(res => !res.priority).map((res, i) => (
              <a 
                key={`secondary-${i}`}
                href={`tel:${res.number}`}
                className="flex items-center justify-between w-full p-4 bg-zinc-900 border border-white/5 text-white rounded-2xl font-bold transition-all active:scale-[0.98]"
              >
                <div className="text-left">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest">{res.label}</span>
                  <span className="text-sm">{res.name}</span>
                </div>
                <span className="text-zinc-400 text-xs font-mono">{res.number}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <button 
            onClick={onDismiss}
            className="w-full py-4 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            I am safe now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyOverlay;