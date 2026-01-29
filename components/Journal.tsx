import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import { JournalEntry } from '../types';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (title: string, content: string) => void;
}

const Journal: React.FC<JournalProps> = ({ entries, onAddEntry }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    const isActuallyEmpty = content.replace(/<(.|\n)*?>/g, '').trim().length === 0;
    if (!isActuallyEmpty) {
      onAddEntry(title || 'Untitled Thought', content);
      setIsAdding(false);
      setTitle('');
      setContent('');
    }
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic'],
      [{ 'list': 'bullet' }],
    ],
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">Reflections</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Capture Your World</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center shadow-2xl active:scale-90 transition-all"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </header>

      {isAdding ? (
        <div className="bg-zinc-900/60 backdrop-blur-3xl rounded-[48px] p-10 space-y-8 animate-in zoom-in-95 duration-500 border border-white/5 shadow-2xl">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of this moment"
            className="w-full text-3xl font-black bg-transparent border-none outline-none placeholder:text-zinc-800 text-white tracking-tight"
          />
          
          <div className="border-t border-white/5 pt-6 min-h-[300px]">
            <ReactQuill 
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              placeholder="What are you carrying today?"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="flex-1 px-6 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-[28px] shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Save Reflection
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          {entries.length === 0 ? (
            <div className="py-24 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[48px] flex flex-col items-center">
              <span className="text-6xl mb-6">🖋️</span>
              <p className="font-black uppercase tracking-[0.2em] text-[10px]">No thoughts captured yet</p>
            </div>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="bg-zinc-900/30 backdrop-blur-3xl rounded-[48px] p-10 transition-all hover:bg-zinc-900/50 border border-white/5 active:scale-[0.99] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all" />
                
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-3xl font-black text-white leading-tight tracking-tight pr-4">{entry.title}</h3>
                  <time className="shrink-0 text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-2xl uppercase tracking-[0.2em]">
                    {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </time>
                </div>
                <div 
                  className="prose prose-invert max-w-none text-zinc-400 leading-[1.7] font-medium text-[16px]"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Journal;