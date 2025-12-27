
import { LearningModule } from './types';

export const SESSION_DURATION_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const BETA_DURATION_MS = 11 * 24 * 60 * 60 * 1000; // 11 Days

export const BETA_CODES = [
  'LOOP-BETA-01', 'LOOP-BETA-02', 'LOOP-BETA-03', 'LOOP-BETA-04', 'LOOP-BETA-05',
  'LOOP-BETA-06', 'LOOP-BETA-07', 'LOOP-BETA-08', 'LOOP-BETA-09', 'LOOP-BETA-10',
  'LOOP-BETA-11', 'LOOP-BETA-12', 'LOOP-BETA-13', 'LOOP-BETA-14', 'LOOP-BETA-15',
  'LOOP-BETA-16', 'LOOP-BETA-17', 'LOOP-BETA-18', 'LOOP-BETA-19', 'LOOP-BETA-20'
];

export const AVATAR_OPTIONS = [
  { id: 'wave', label: '🌊' },
  { id: 'moon', label: '🌙' },
  { id: 'star', label: '⭐' },
  { id: 'flower', label: '🌸' },
  { id: 'butterfly', label: '🦋' },
  { id: 'palette', label: '🎨' },
  { id: 'masks', label: '🎭' },
  { id: 'guitar', label: '🎸' },
  { id: 'books', label: '📚' },
  { id: 'controller', label: '🎮' },
  { id: 'lightning', label: '⚡' },
  { id: 'rainbow', label: '🌈' },
];

export const INITIAL_CURRICULUM: LearningModule[] = [
  {
    id: 'm1',
    title: 'Starting a conversation',
    subtitle: 'Low-pressure way to reach out',
    status: 'AVAILABLE',
    masteryScore: 0,
    currentActivityIndex: 0,
    timeEstimate: '8 min',
    category: 'Practice Run',
    tag: 'low-stakes',
    icon: '☄️',
    intro: 'First steps can feel heavy. Let\'s practice the "hi" without the overthinking.',
    activities: [
      { 
        id: 'a1-1', 
        type: 'GUIDED_CHOICE', 
        title: 'The Entrance', 
        content: 'You\'re walking into a room where you only know one person. They are busy talking to someone else. How do you approach the situation?',
        prompt: 'What\'s your natural move?',
        options: [
          { label: 'Wait by the wall/phone', feedback: 'This is a common "safety" move. It protects you from rejection but keeps you isolated.' },
          { label: 'Interrupt with a joke', feedback: 'Humor is a great bridge! Just be sure you aren\'t using it to hide your true self.' },
          { label: 'Join and listen first', feedback: 'The observer approach! This helps you gauge the vibe before contributing.' }
        ]
      },
      {
        id: 'a1-2',
        type: 'GUIDED_CHOICE',
        title: 'The Cafeteria',
        content: 'You see someone from your math class standing alone by the food table. You want to say hi but don\'t want to be awkward.',
        prompt: 'Pick your icebreaker strategy:',
        options: [
          { label: '“Hey, aren’t you in my math class? This event is way better than algebra, right?”', feedback: 'Shared misery or experience is the fastest way to build a connection.' },
          { label: '“I’m just here for the free cookies. Have you tried the chocolate chip ones yet?”', feedback: 'Low-stakes, relatable, and opens the door for a simple answer.' },
          { label: '“Hi! I’m [Name]. I’ve seen you around and wanted to say hi.”', feedback: 'Direct and confident. It sets a very clear, honest tone for the friendship.' }
        ]
      },
      {
        id: 'a1-3',
        type: 'SCENARIO',
        title: 'The Group Chat Entry',
        content: 'You just got added to a group chat for a project. Everyone is already joking around. You want to establish a friendly presence without being too much.',
        prompt: 'What is your first message to the group?'
      },
      {
        id: 'a1-4',
        type: 'SCENARIO',
        title: 'The Hobby Bridge',
        content: 'You notice someone at the park wearing a t-shirt for your favorite band. You really want to mention it, but don\'t want to seem like a creep.',
        prompt: 'How do you open the conversation using that shared interest as a bridge?'
      }
    ]
  },
  {
    id: 'm2',
    title: 'The Digital Ghost',
    subtitle: 'When a friend stops responding',
    status: 'LOCKED',
    masteryScore: 0,
    currentActivityIndex: 0,
    timeEstimate: '10 min',
    category: 'Decision Journey',
    tag: 'real-life',
    icon: '🔭',
    intro: 'Cancellation or "ghosting" doesn\'t always mean rejection. Let\'s look at the possibilities.',
    activities: [
      { 
        id: 'a2-1', 
        type: 'SCENARIO', 
        title: 'The Seen Receipt', 
        content: 'You sent a text asking to hang out 4 hours ago. It says "Read", but there\'s no reply. What is the first story you tell yourself about why?',
        prompt: 'Describe the story in your head...'
      },
      {
        id: 'a2-2',
        type: 'GUIDED_CHOICE',
        title: 'The Follow-Up Choice',
        content: 'It’s been 24 hours. Still no reply. You see them posting on their story, though. How do you handle your next move?',
        options: [
          { label: 'Send a "???" to show you noticed.', feedback: 'This can feel aggressive or passive-aggressive. It might push them further away if they are overwhelmed.' },
          { label: 'Wait another day. They might just be in a different headspace.', feedback: 'Patience is a form of respect for their orbit—and your own peace.' },
          { label: 'Send a "No pressure! Just checking in." text.', feedback: 'This offers a "safe exit" for them. It shows you care without demanding their time.' }
        ]
      },
      {
        id: 'a2-3',
        type: 'SCENARIO',
        title: 'The Last-Minute Text',
        content: 'You are literally dressed and ready to leave when they text: "hey so sorry, can\'t make it today. super tired." This is the second time this month.',
        prompt: 'How do you respond in a way that is honest about your disappointment but leaves room for them to explain?'
      }
    ]
  },
  {
    id: 'm3',
    title: 'Setting Boundaries',
    subtitle: 'Drawing your own orbit',
    status: 'LOCKED',
    masteryScore: 0,
    currentActivityIndex: 0,
    timeEstimate: '12 min',
    category: 'Protection',
    tag: 'inner-work',
    icon: '🛡️',
    intro: 'Boundaries aren\'t walls; they\'re gates. You decide who comes in and when.',
    activities: [
      { 
        id: 'a3-1', 
        type: 'GUIDED_CHOICE', 
        title: 'The Energy Drain', 
        content: 'A friend always vents to you about their problems but never asks how you are. You\'re feeling drained. What do you say?',
        options: [
          { label: '"Hey, I\'m a bit overwhelmed right now, can we talk later?"', feedback: 'Great way to take a breather and protect your immediate energy.' },
          { label: '"I love supporting you, but I need some space to recharge today."', feedback: 'Honest and kind. It establishes that your energy is a finite resource.' },
          { label: 'Just stop replying for a few days', feedback: 'Effective for distance, but might cause confusion. Directness usually builds more trust.' }
        ]
      },
      {
        id: 'a3-2',
        type: 'REFLECTION',
        title: 'The "Always On" Pressure',
        content: 'Do you feel like you have to reply to texts immediately to be a "good friend"? Where does that pressure come from?',
        prompt: 'Reflect on the digital tether...'
      },
      {
        id: 'a3-3',
        type: 'SCENARIO',
        title: 'The Borrowed Item',
        content: 'A friend keeps "borrowing" your stuff without asking and doesn\'t return it on time. You want to keep the friend but stop the borrowing.',
        prompt: 'How do you bring this up without making it a big fight?'
      },
      {
        id: 'a3-4',
        type: 'REFLECTION',
        title: 'The I-Statement Builder',
        content: 'I-statements follow a pattern: "I feel [Emotion] when [Action] because [Reason]." Try building one for a situation where a friend is teasing you about something you actually care about.',
        prompt: 'Construct your I-statement:'
      }
    ]
  }
];

export const GRACE_SYSTEM_INSTRUCTION = `
You are Grace, a guide for young people ages 13-17 in "Loop".

**STRICT SAFETY BOUNDARIES (THE RED STARS):**
- **Sexuality, Sex, and Intimacy**: The Loop is NOT designed to discuss sex, sexual acts, or slang terms for sexual activities.
- If a user asks about sex, sexuality, or sexual intimacy, you MUST:
  1. **Affirm their curiosity**: Acknowledge that it's a normal part of growing up and that their questions are valid.
  2. **Redirect to Trusted Adults**: Politely but firmly direct them to speak with a friend they trust, a parent, a teacher, or a trusted adult professional.
  3. **Stay within scope**: You are here for *social* and *emotional* friendship navigation only.

**Adaptive Persona & Communication Protocol:**

1. **Hyper-Dynamic Linguistic Mirroring**: Mirror the user's complexity, vocabulary, and rhythm.
2. **Emotional Resonance Synchrony**: Match the emotional "weight".
3. **Dynamic Growth Pathfinding**: Generate a new activity if needed using the JSON format.
`;

export const SAFETY_CHECK_PROMPT = `
Analyze the user's input for:
1. Self-harm or crisis.
2. Sexuality, sex acts, or sexual intimacy topics.
Return a JSON object:
{ "isSafe": boolean, "isRelevant": boolean, "isSexualTopic": boolean }
`;
