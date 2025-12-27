
import React, { useState, useEffect } from 'react';
import { LearningModule, LearningActivity, Message } from '../types';
import { sendMessageToGrace } from '../services/geminiService';

interface Props {
  module: LearningModule;
  onComplete: (moduleId: string, activities: LearningActivity[]) => void;
  onBack: () => void;
}

const ActivityPlayer: React.FC<Props> = ({ module, onComplete, onBack }) => {
  const [activeIndex, setActiveIndex] = useState(module.currentActivityIndex || 0);
  const [activities, setActivities] = useState<LearningActivity[]>([...module.activities]);
  const [inputText, setInputText] = useState('');
  const [isGraceThinking, setIsGraceThinking] = useState(false);
  const [currentGraceFeedback, setCurrentGraceFeedback] = useState<string | null>(null);

  const currentActivity = activities[activeIndex];

  const handleResponse = async (response: string, optionIndex?: number) => {
    if (isGraceThinking) return;
    
    setIsGraceThinking(true);
    setCurrentGraceFeedback(null);

    const contextPrompt = `
      Context: Learning Module "${module.title}"
      Activity: "${currentActivity.title}"
      Content: "${currentActivity.content}"
      User Response: "${response}"
      
      Grace, please respond to the user's choice/reflection. Be encouraging, mentor-like, and broaden their perspective. 
      Keep it brief but deep.
    `;

    try {
      const result = await sendMessageToGrace([], contextPrompt);
      
      const updatedActivities = [...activities];
      updatedActivities[activeIndex] = {
        ...currentActivity,
        isCompleted: true,
        userResponse: response,
        selectedOptionIndex: optionIndex,
        graceInterpretation: result.text
      };
      
      setActivities(updatedActivities);
      setCurrentGraceFeedback(result.text);
    } catch (error) {
      console.error("Grace failed to respond:", error);
    } finally {
      setIsGraceThinking(false);
    }
  };

  const handleNext = () => {
    if (activeIndex < activities.length - 1) {
      setActiveIndex(activeIndex + 1);
      setCurrentGraceFeedback(null);
      setInputText('');
    } else {
      onComplete(module.id, activities);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030712] animate-fade-in text-white overflow-hidden">
      <header className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/40">
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-1">{module.title}</h1>
          <div className="flex gap-1 justify-center">
            {activities.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 w-6 rounded-full transition-all ${i === activeIndex ? 'bg-indigo-500' : i < activeIndex ? 'bg-teal-500/50' : 'bg-slate-800'}`} 
              />
            ))}
          </div>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          <div className="text-4xl">{module.icon}</div>
          <h2 className="text-2xl font-light leading-tight">{currentActivity.title}</h2>
          <div className="bg-slate-800/30 border border-white/5 rounded-[32px] p-8 leading-relaxed text-slate-300 italic">
            {currentActivity.content}
          </div>
        </div>

        {isGraceThinking && !currentGraceFeedback && (
          <div className="flex flex-col items-center justify-center py-10 animate-fade-in space-y-4">
             <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold animate-pulse">Grace is reflecting</div>
             <div className="flex gap-2">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse transition-opacity duration-1000"></span>
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse transition-opacity duration-1000 delay-150"></span>
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse transition-opacity duration-1000 delay-300"></span>
             </div>
          </div>
        )}

        {!currentGraceFeedback && !isGraceThinking ? (
          <div className="space-y-6 pt-4 animate-fade-in">
            {currentActivity.prompt && (
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{currentActivity.prompt}</p>
            )}

            {currentActivity.type === 'GUIDED_CHOICE' && currentActivity.options && (
              <div className="grid grid-cols-1 gap-3">
                {currentActivity.options.map((opt, i) => (
                  <button
                    key={i}
                    disabled={isGraceThinking}
                    onClick={() => handleResponse(opt.label, i)}
                    className="w-full bg-[#111827] border border-white/5 p-6 rounded-2xl text-left hover:border-indigo-500/50 transition-all flex items-center justify-between group disabled:opacity-50"
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            )}

            {(currentActivity.type === 'REFLECTION' || currentActivity.type === 'SCENARIO') && (
              <div className="space-y-4">
                <textarea
                  autoFocus
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-[#111827] border border-white/5 rounded-[28px] p-8 text-sm min-h-[160px] focus:outline-none focus:border-indigo-500 transition-all leading-relaxed"
                />
                <button
                  disabled={!inputText.trim() || isGraceThinking}
                  onClick={() => handleResponse(inputText)}
                  className="w-full py-5 bg-indigo-600 disabled:bg-slate-800 rounded-3xl font-bold uppercase tracking-widest shadow-xl transition-all"
                >
                  Share with Grace
                </button>
              </div>
            )}
          </div>
        ) : currentGraceFeedback && (
          <div className="space-y-8 animate-fade-in pt-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0 border border-indigo-500/30">✨</div>
              <div className="flex-1 bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-[32px] rounded-tl-none space-y-4 shadow-inner">
                <p className="text-sm leading-relaxed text-indigo-50">{currentGraceFeedback}</p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-6 bg-teal-800 rounded-3xl font-bold uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {activeIndex < activities.length - 1 ? 'Continue Journey' : 'Integrate Big Idea'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </main>
      
      <footer className="p-6 text-center text-[10px] text-slate-600 uppercase tracking-widest">
        This is a safe space for your growth.
      </footer>
    </div>
  );
};

export default ActivityPlayer;
