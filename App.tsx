
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserState, AppView, Message, Friend, LearningModule, TimelineEvent, LearningActivity, LoopAction } from './types';
import { AVATAR_OPTIONS, INITIAL_CURRICULUM, SESSION_DURATION_LIMIT_MS, BETA_CODES, BETA_DURATION_MS } from './constants';
import ChatInterface from './components/ChatInterface';
import FriendshipVisualizer from './components/FriendshipVisualizer';
import FriendshipMap from './components/FriendshipMap';
import ActivityPlayer from './components/ActivityPlayer';
import RelationshipTimeline from './components/RelationshipTimeline'; 
import { InfinityLogo } from './components/InfinityLogo';
import { ConstellationIcon } from './components/ConstellationIcon';
import { PracticeIcon } from './components/PracticeIcon';
import { sendMessageToGrace } from './services/geminiService';

const THEMES = {
  CALM: 'bg-[#030712]',
  GROWTH: 'bg-[#030712]',
  PROTECTION: 'bg-[#030712]',
  FLOW: 'bg-[#030712]'
};

const BetaSurvey: React.FC<{ onComplete: (data: any) => void, onBack: () => void }> = ({ onComplete, onBack }) => {
  const [quant, setQuant] = useState({ grace: 5, map: 5, impact: 5 });
  const [qual, setQual] = useState({ favorite: '', friction: '', growth: '' });

  const handleSend = () => {
    const body = `
BETA FEEDBACK REPORT
---------------------
Grace Helpfulness: ${quant.grace}/10
Map Intuitiveness: ${quant.map}/10
Overall Impact: ${quant.impact}/10

Favorite Moment:
${qual.favorite}

Technical Friction:
${qual.friction}

Growth Insights:
${qual.growth}
    `.trim();

    const mailto = `mailto:loop@loopool.xyz?subject=Loop Beta Feedback&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    onComplete({ quant, qual });
  };

  return (
    <div className="absolute inset-0 z-[200] flex flex-col bg-[#030712] p-8 text-white animate-fade-in overflow-y-auto pb-20">
      <header className="text-center space-y-3 mb-10">
        <h2 className="text-3xl font-light">Share your Journey</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">End of Beta Survey</p>
      </header>

      <div className="w-full max-w-lg mx-auto space-y-12">
        {/* Quantitative */}
        <div className="space-y-8">
          {[
            { key: 'grace', label: 'How helpful was Grace as a guide?' },
            { key: 'map', label: 'How intuitive was the Big Ideas Map?' },
            { key: 'impact', label: 'Overall, how much did the app impact your thinking?' }
          ].map(q => (
            <div key={q.key} className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-light text-slate-300">{q.label}</label>
                <span className="text-indigo-400 font-bold">{(quant as any)[q.key]}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={(quant as any)[q.key]} 
                onChange={e => setQuant({ ...quant, [q.key]: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          ))}
        </div>

        {/* Qualitative */}
        <div className="space-y-8">
           {[
             { key: 'favorite', label: 'What was your favorite moment or activity?', placeholder: 'Tell us what resonated...' },
             { key: 'friction', label: 'Did you experience any technical issues or confusion?', placeholder: 'Be as specific as possible...' },
             { key: 'growth', label: 'Has your perspective on your friendships shifted?', placeholder: 'Describe the growth in your orbit...' }
           ].map(q => (
             <div key={q.key} className="space-y-2">
               <label className="text-xs uppercase tracking-widest font-bold text-slate-500 px-1">{q.label}</label>
               <textarea 
                 value={(qual as any)[q.key]}
                 onChange={e => setQual({ ...qual, [q.key]: e.target.value })}
                 className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-sm focus:border-indigo-500/50 outline-none min-h-[120px]"
                 placeholder={q.placeholder}
               />
             </div>
           ))}
        </div>

        <button 
          onClick={handleSend}
          className="w-full py-6 bg-indigo-600 rounded-3xl font-bold uppercase tracking-widest shadow-xl shadow-indigo-900/40"
        >
          Submit to loop@loopool.xyz
        </button>
        <button onClick={onBack} className="w-full py-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
      </div>
    </div>
  );
};

const BetaArchiveMode: React.FC<{ onOpenSurvey: () => void }> = ({ onOpenSurvey }) => (
  <div className="absolute inset-0 z-[150] flex flex-col bg-[#030712] p-12 text-white items-center justify-center text-center animate-fade-in">
    <div className="relative mb-12">
      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
      <button 
        onClick={onOpenSurvey}
        className="relative w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-4xl shadow-2xl border border-white/20 hover:scale-110 active:scale-95 transition-all animate-pulse cursor-pointer"
      >
        ⭐
      </button>
    </div>
    <div className="space-y-6 max-w-sm">
      <h2 className="text-3xl font-light">Phase One Complete.</h2>
      <p className="text-slate-400 text-lg font-light leading-relaxed">
        Your 11-day beta journey has reached its orbit. To help us expand the Loop for everyone, please share your reflections through the golden star.
      </p>
      <div className="pt-8 text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Thank you for traveling with us.</div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [showIntro, setShowIntro] = useState(false);
  const [user, setUser] = useState<UserState | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isGraceThinking, setIsGraceThinking] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [timelineFriendId, setTimelineFriendId] = useState<string | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [pendingFriend, setPendingFriend] = useState<Partial<Friend> | null>(null);
  const [showPostConnectionChoices, setShowPostConnectionChoices] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [betaError, setBetaError] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('loop_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) { localStorage.removeItem('loop_user'); }
    }
  }, []);

  useEffect(() => { if (user) localStorage.setItem('loop_user', JSON.stringify(user)); }, [user]);

  // Expiry Logic
  const isBetaExpired = useMemo(() => {
    if (!user) return false;
    return (Date.now() - user.joinDate) >= BETA_DURATION_MS;
  }, [user]);

  useEffect(() => {
    if (isBetaExpired && view !== AppView.BETA_SURVEY) {
      // Force "Archive" view implicitly handled in render
    }
  }, [isBetaExpired, view]);

  const handleSendMessage = useCallback(async (input: string) => {
    if (!user || isGraceThinking) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsGraceThinking(true);
    try {
      const history = chatHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
      const result = await sendMessageToGrace(history, input);
      let updatedUser = { ...user };
      const graceMsg: Message = { id: (Date.now() + 1).toString(), sender: 'grace', text: result.text, timestamp: Date.now(), isSafetyResource: result.isSafetyResource };
      setChatHistory(prev => [...prev, graceMsg]);
      setUser(updatedUser);
    } catch (e) { console.error(e); } finally { setIsGraceThinking(false); }
  }, [user, chatHistory, isGraceThinking]);

  const validateBetaKey = (key: string) => {
    if (BETA_CODES.includes(key.trim())) {
      setBetaError(null);
      return true;
    }
    setBetaError("Invalid Beta Access Code. This testing phase is restricted.");
    return false;
  };

  const handleOnboardingComplete = (u: Partial<UserState>) => {
    if (!validateBetaKey(u.recoveryKey || '')) return;
    const now = Date.now();
    const userState: UserState = { 
      ...u, 
      insights: [], currentVibe: 'CALM', masteryProgress: 0, 
      selfTimeline: [], friends: [], hasSeenDashboardTour: false, 
      lastFriendAddedAt: null, lastCheckInAt: null, totalSessionTimeToday: 0,
      sessionStartTime: now,
      joinDate: now,
      sessionModuleIds: [],
      learningPath: INITIAL_CURRICULUM,
      theme: 'dark'
    } as UserState;
    setUser(userState);
    setView(AppView.HOME);
  };

  const handleLogin = (name: string, key: string) => {
    if (!validateBetaKey(key)) return;
    // For beta simulation, we check local storage or create new with this key
    const saved = localStorage.getItem('loop_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.recoveryKey === key.trim()) {
        setUser(parsed);
        setView(AppView.HOME);
        return;
      }
    }
    setBetaError("No local data found for this key. Use onboarding to create your orbit.");
  };

  const currentTheme = THEMES[user?.currentVibe || 'CALM'];

  return (
    <div className={`flex flex-col h-screen ${currentTheme} text-slate-200 transition-colors duration-[1000ms] overflow-hidden relative font-['Nunito']`}>
      
      {/* Beta Archive Mode Overlay */}
      {isBetaExpired && view !== AppView.BETA_SURVEY && (
        <BetaArchiveMode onOpenSurvey={() => setView(AppView.BETA_SURVEY)} />
      )}

      {/* Beta Survey View */}
      {view === AppView.BETA_SURVEY && (
        <BetaSurvey onComplete={() => setView(AppView.LANDING)} onBack={() => setView(AppView.LANDING)} />
      )}

      <main className="flex-1 overflow-hidden relative">
        {view === AppView.LANDING && !showIntro && (
          <div className="flex items-center justify-center h-full bg-[#030712] cursor-pointer" onClick={() => user ? setView(AppView.HOME) : setShowIntro(true)}>
            <div className="flex flex-col items-center">
              <InfinityLogo className="w-48 h-24 sm:w-56 sm:h-28 text-indigo-500 animate-pulse" />
              <div className="mt-8 sm:mt-12 text-slate-500 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">BETA ACCESS REQUIRED</div>
            </div>
          </div>
        )}

        {showIntro && view === AppView.LANDING && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#030712] text-white animate-fade-in text-center space-y-12">
            <h1 className="text-3xl font-light">Welcome to the Private Beta.</h1>
            <p className="text-slate-500 text-lg leading-relaxed">Please enter your unique beta access code to begin.</p>
            <div className="w-full max-w-md flex flex-col gap-4">
              <button onClick={() => setView(AppView.ONBOARDING)} className="w-full py-6 bg-indigo-600 rounded-3xl font-bold uppercase tracking-widest">New Journey</button>
              <button onClick={() => setView(AppView.LOGIN)} className="w-full py-4 text-slate-500 text-xs font-bold uppercase">Already Participated</button>
            </div>
          </div>
        )}

        {view === AppView.ONBOARDING && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#030712] text-white space-y-10 animate-fade-in">
            <header className="text-center space-y-2">
              <h2 className="text-2xl font-light">Beta Enrollment</h2>
              <p className="text-slate-500 text-xs uppercase">Enter your assigned code</p>
            </header>
            <div className="w-full max-w-md space-y-6">
              <input 
                autoFocus 
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-6 text-2xl text-center focus:border-indigo-500 font-mono tracking-widest"
                placeholder="LOOP-BETA-XX"
                onChange={(e) => setBetaError(null)}
                id="beta-input"
              />
              {betaError && <div className="text-rose-500 text-xs text-center">{betaError}</div>}
              <input id="name-input" className="w-full bg-slate-900 border border-white/5 rounded-2xl p-6 text-xl text-center focus:border-indigo-500" placeholder="Display Name" />
              <button 
                onClick={() => handleOnboardingComplete({ 
                  name: (document.getElementById('name-input') as HTMLInputElement).value, 
                  recoveryKey: (document.getElementById('beta-input') as HTMLInputElement).value,
                  avatarId: 'star'
                })}
                className="w-full py-6 bg-indigo-600 rounded-3xl font-bold uppercase tracking-widest"
              >
                Enroll in Beta
              </button>
            </div>
            <button onClick={() => setView(AppView.LANDING)} className="text-slate-600 text-[10px] font-bold uppercase">Back</button>
          </div>
        )}

        {view === AppView.LOGIN && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#030712] text-white space-y-10 animate-fade-in">
             <header className="text-center space-y-2">
              <h2 className="text-2xl font-light">Participant Login</h2>
              <p className="text-slate-500 text-xs uppercase">Resume your orbit</p>
            </header>
            <div className="w-full max-w-md space-y-6">
               <input 
                autoFocus 
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-6 text-2xl text-center focus:border-indigo-500 font-mono tracking-widest"
                placeholder="LOOP-BETA-XX"
                id="login-key-input"
              />
              {betaError && <div className="text-rose-500 text-xs text-center">{betaError}</div>}
              <button 
                onClick={() => handleLogin('', (document.getElementById('login-key-input') as HTMLInputElement).value)}
                className="w-full py-6 bg-indigo-600 rounded-3xl font-bold uppercase tracking-widest"
              >
                Resume Journey
              </button>
            </div>
            <button onClick={() => setView(AppView.LANDING)} className="text-slate-600 text-[10px] font-bold uppercase">Back</button>
          </div>
        )}

        {/* Existing Main Views (Only rendered if NOT EXPIRED) */}
        {!isBetaExpired && (
          <>
            {view === AppView.HOME && user && (
              <div className="p-8 space-y-10 overflow-y-auto pb-32 h-full">
                <header>
                  <h1 className="text-3xl font-light">Hello, {user.name}</h1>
                  <p className="text-indigo-400 text-[9px] tracking-widest uppercase mt-2">Beta Participant • Day {Math.floor((Date.now() - user.joinDate) / (24*60*60*1000)) + 1} of 11</p>
                </header>
                <div className="grid grid-cols-1 gap-6">
                  <button onClick={() => setView(AppView.LEARNING)} className="bg-slate-800/40 p-8 rounded-[40px] border border-slate-800 text-left hover:border-indigo-500/30 transition-all flex items-center justify-between group">
                    <p className="text-white text-2xl font-light">Practice</p>
                    <PracticeIcon className="w-12 h-12 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </button>
                  <button onClick={() => setView(AppView.MAP)} className="bg-slate-800/40 p-8 rounded-[40px] border border-slate-800 text-left hover:border-indigo-500/30 transition-all flex items-center justify-between group">
                    <p className="text-white text-2xl font-light">The Map</p>
                    <ConstellationIcon className="w-12 h-12 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </button>
                  <button onClick={() => setView(AppView.FRIENDS)} className="bg-slate-800/40 p-8 rounded-[40px] border border-slate-800 text-left">
                     <p className="text-white text-2xl font-light">{user.friends.length} Connections in Orbit</p>
                  </button>
                </div>
              </div>
            )}
            
            {view === AppView.LEARNING && user && (
              <div className="p-8 space-y-8 overflow-y-auto h-full pb-32">
                 <header className="text-center py-4"><h1 className="text-lg font-bold uppercase tracking-widest">Practice</h1></header>
                 <div className="space-y-8">
                   {user.learningPath.map(module => (
                     <div key={module.id} className="p-8 bg-slate-800/40 rounded-[40px] border border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                         <div className="text-4xl">{module.icon}</div>
                         <div><h3 className="text-xl font-light text-white">{module.title}</h3></div>
                       </div>
                       <button onClick={() => { setActiveModuleId(module.id); setView(AppView.ACTIVITY_PLAYER); }} className="text-indigo-500">→</button>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {view === AppView.MAP && user && (
              <div className="h-full flex flex-col">
                <FriendshipMap modules={user.learningPath} onModuleClick={(m) => { setActiveModuleId(m.id); setView(AppView.ACTIVITY_PLAYER); }} />
              </div>
            )}

            {view === AppView.FRIENDS && user && (
              <div className="h-full flex flex-col items-center justify-center p-8">
                <FriendshipVisualizer friends={user.friends} userAvatarId={user.avatarId} onFriendClick={fid => { setTimelineFriendId(fid); setView(AppView.TIMELINE); }} />
                <button onClick={() => setIsAddingFriend(true)} className="absolute bottom-12 right-8 w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-3xl font-light shadow-2xl">+</button>
              </div>
            )}

            {view === AppView.ACTIVITY_PLAYER && user && activeModuleId && (
              <ActivityPlayer module={user.learningPath.find(m => m.id === activeModuleId)!} onComplete={() => setView(AppView.MAP)} onBack={() => setView(AppView.MAP)} />
            )}

            {view === AppView.CHAT && <ChatInterface chatHistory={chatHistory} isThinking={isGraceThinking} onSendMessage={handleSendMessage} />}
          </>
        )}
      </main>

      {/* Persistent Navigation (Hidden if Expired or Landing) */}
      {!isBetaExpired && view !== AppView.LANDING && view !== AppView.ONBOARDING && view !== AppView.LOGIN && (
        <nav className="h-24 border-t border-white/5 flex items-center justify-around px-6 pb-6 bg-[#030712]/80 backdrop-blur-2xl z-40">
           <button onClick={() => setView(AppView.HOME)} className={`flex flex-col items-center gap-1 ${view === AppView.HOME ? 'text-indigo-400' : 'text-slate-600'}`}>
             <span className="text-2xl">⌂</span><span className="text-[8px] font-bold uppercase">Home</span>
           </button>
           <button onClick={() => setView(AppView.LEARNING)} className={`flex flex-col items-center gap-1 ${view === AppView.LEARNING ? 'text-indigo-400' : 'text-slate-600'}`}>
             <span className="text-2xl">☄️</span><span className="text-[8px] font-bold uppercase">Practice</span>
           </button>
           <button onClick={() => setView(AppView.MAP)} className={`flex flex-col items-center gap-1 ${view === AppView.MAP ? 'text-indigo-400' : 'text-slate-600'}`}>
             <span className="text-2xl">○</span><span className="text-[8px] font-bold uppercase">Map</span>
           </button>
           <button onClick={() => setView(AppView.CHAT)} className={`flex flex-col items-center gap-1 ${view === AppView.CHAT ? 'text-indigo-400' : 'text-slate-600'}`}>
             <span className="text-2xl">✨</span><span className="text-[8px] font-bold uppercase">Grace</span>
           </button>
        </nav>
      )}

    </div>
  );
};

export default App;
