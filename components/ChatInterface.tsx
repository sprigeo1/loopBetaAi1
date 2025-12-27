
import React, { useState, useRef, useEffect } from 'react';
import { Message, LoopAction } from '../types';
import { InfinityLogo } from './InfinityLogo';

interface Props {
  chatHistory: Message[];
  isThinking?: boolean;
  onSendMessage: (text: string) => void;
  onAction?: (action: LoopAction) => void;
}

const ChatInterface: React.FC<Props> = ({ chatHistory, isThinking = false, onSendMessage, onAction }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking]);

  // Ensure focus when view appears
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header - Subtle and transparent */}
      <div className="p-5 flex items-center gap-4 bg-slate-900/60 backdrop-blur-md border-b border-white/5 shrink-0 z-10">
        <InfinityLogo className="w-8 h-4 text-indigo-400" variant="infinity" />
        <div className="flex flex-col">
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-white leading-none">Grace</h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.15em] mt-1 font-medium">Reflective Intelligence</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={scrollRef}>
        {chatHistory.length === 0 && (
            <div className="text-center mt-12 opacity-30 space-y-3 px-8">
                <div className="w-12 h-px bg-slate-500 mx-auto mb-4"></div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold">The Loop is Open</p>
                <p className="text-sm italic font-light">"I'm listening to everything you're building."</p>
            </div>
        )}
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : msg.isSafetyResource 
                  ? 'bg-rose-900/40 border border-rose-500/30 text-rose-50 text-center rounded-bl-none italic' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-slate-800/50 p-4 rounded-[20px] rounded-bl-none flex items-center gap-1.5 border border-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 bg-indigo-400/80 rounded-full animate-[pulse_1.2s_infinite]"></span>
              <span className="w-2 h-2 bg-indigo-400/80 rounded-full animate-[pulse_1.2s_infinite_200ms]"></span>
              <span className="w-2 h-2 bg-indigo-400/80 rounded-full animate-[pulse_1.2s_infinite_400ms]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Ensuring it sits above any nav elements */}
      <div className="p-5 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 shrink-0 z-20">
        <div className="relative flex items-center max-w-lg mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isThinking ? "Grace is reflecting..." : "Share a thought..."}
            className="w-full bg-slate-800/40 border border-slate-700/50 text-white rounded-[30px] py-4 px-6 pr-14 focus:outline-none focus:border-indigo-500/50 transition-all font-light placeholder:text-slate-600 text-base"
            autoComplete="off"
            autoFocus
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isThinking} 
            className="absolute right-2 p-3 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-slate-700 disabled:opacity-40 transition-all shadow-lg active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
