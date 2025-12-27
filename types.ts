
export enum AppView {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  RECOVERY = 'RECOVERY',
  INITIAL_CHAT = 'INITIAL_CHAT', 
  DISCOVERY = 'DISCOVERY',
  HOME = 'HOME',           
  FRIENDS = 'FRIENDS',     
  LEARNING = 'LEARNING',   
  MAP = 'MAP',
  CHAT = 'CHAT',           
  PROFILE = 'PROFILE',
  TIMELINE = 'TIMELINE',   
  DAILY_CHECKIN = 'DAILY_CHECKIN',
  LOOP_SUMMARY = 'LOOP_SUMMARY',
  TIMEOUT = 'TIMEOUT',
  ACTIVITY_PLAYER = 'ACTIVITY_PLAYER',
  FRIEND_ASSESSMENT = 'FRIEND_ASSESSMENT',
  BETA_SURVEY = 'BETA_SURVEY'
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  text: string;
  energyLevel: number; 
}

export interface Friend {
  id: string;
  name: string;
  category: string;
  closeness: number;
  trust: number;
  safety: number;
  joy: number;
  relationshipStrength: number; 
  orbitDistance: number; 
  timeline: TimelineEvent[];
}

export interface Message {
  id: string;
  sender: 'user' | 'grace';
  text: string;
  timestamp: number;
  isSafetyResource?: boolean;
}

export interface AssessmentData {
  answers: Record<string, any>;
  interests: string[];
}

export type ActivityType = 'READING' | 'SCENARIO' | 'REFLECTION' | 'MILESTONE_PROMPT' | 'ASK_GRACE' | 'GUIDED_CHOICE';

export interface LearningActivity {
  id: string;
  type: ActivityType;
  title: string;
  content: string; 
  prompt?: string;
  options?: { label: string; feedback: string }[];
  isCompleted?: boolean;
  userResponse?: string; 
  selectedOptionIndex?: number;
  graceInterpretation?: string;
  isDynamic?: boolean; 
}

export interface LearningModule {
  id: string;
  title: string;
  subtitle: string;
  status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED';
  intro: string; 
  timeEstimate: string; 
  category: string; 
  tag: string; 
  icon: string; 
  activities: LearningActivity[];
  masteryScore: number; 
  currentActivityIndex: number; 
}

export interface UserInsight {
  theme: string;
  observation: string;
  timestamp: number;
}

export interface UserState {
  name: string;
  recoveryKey: string; 
  email?: string;
  phone?: string;
  avatarId: string; 
  pronouns?: string;
  theme: 'dark' | 'light';
  friends: Friend[];
  selfTimeline: TimelineEvent[]; 
  masteryProgress: number; 
  initialAssessment?: AssessmentData;
  learningPath: LearningModule[];
  hasSeenDashboardTour: boolean;
  insights: UserInsight[];
  currentVibe: 'CALM' | 'GROWTH' | 'PROTECTION' | 'FLOW';
  lastFriendAddedAt: number | null;
  lastCheckInAt: number | null;
  totalSessionTimeToday: number;
  sessionStartTime: number | null;
  sessionModuleIds: string[]; 
  joinDate: number; // For tracking the 11-day limits
}

export type LoopAction = 
  | { type: 'UPDATE_VIBE'; payload: UserState['currentVibe'] }
  | { type: 'UNLOCK_SKILL'; payload: Partial<LearningModule> }
  | { type: 'CREATE_ACTIVITY'; payload: { moduleId: string; activity: LearningActivity } };
