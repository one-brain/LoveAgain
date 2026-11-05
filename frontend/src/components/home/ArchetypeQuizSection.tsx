import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShareIcon,
  MapPinIcon,
  StarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export type ArchetypeId = 'epicurean' | 'intellectual' | 'empathetic' | 'explorer';

export interface ArchetypeProfile {
  id: ArchetypeId;
  title: string;
  badge: string;
  subtitle: string;
  tagline: string;
  description: string;
  traits: string[];
  idealMeetup: string;
  conversationSparks: string[];
  accentColor: string;
  bgGlow: string;
  sampleCompanions: {
    id: string;
    name: string;
    headline: string;
    city: string;
    area: string;
    rate: number;
    rating: number;
    trustScore: number;
    photoUrl: string;
    tag: string;
  }[];
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeProfile> = {
  epicurean: {
    id: 'epicurean',
    title: 'The Epicurean Connoisseur',
    badge: 'Curated Taste & Sensory Elegance',
    subtitle: 'Top 18% Compatibility Match',
    tagline: 'You savor the finer nuances of culinary artistry, vintage design, and unhurried conversation.',
    description:
      'You appreciate the craftsmanship behind exceptional food, wine, architecture, and live acoustic music. For you, companionship is about discovering hidden tasting menus, private gallery previews, or quiet rooftop lounges where aesthetic curiosity is celebrated.',
    traits: ['Artisanal Appreciation', 'Cultured Curiosity', 'Sensory Storytelling', 'Atmospheric Sensitivity'],
    idealMeetup: 'A 4-course curated tasting dinner at an artisanal bistro or a quiet jazz cocktail lounge in Indiranagar / Bandra.',
    conversationSparks: ['Memorable regional culinary secrets', 'Contemporary architecture & design', 'Travels through vintage cities'],
    accentColor: 'text-[#881337] dark:text-rose-400',
    bgGlow: 'from-[#881337]/15 via-[#C5A059]/10 to-transparent',
    sampleCompanions: [
      {
        id: '158b9ff7-19de-49ce-a57c-b37738591285',
        name: 'Elena Rostova',
        headline: 'Semi-Pro Tennis Coach & Art Gallery Plus-One',
        city: 'Bengaluru',
        area: 'Indiranagar',
        rate: 1500,
        rating: 4.98,
        trustScore: 99,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        tag: 'Art Gallery & Fine Dining',
      },
      {
        id: '00000000-0000-0000-0000-000000000007',
        name: 'Ananya Sharma',
        headline: 'Regional Homestyle Cook & Festive Floral Artist',
        city: 'Bengaluru',
        area: 'Jayanagar',
        rate: 1200,
        rating: 4.96,
        trustScore: 99,
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        tag: 'Culinary Traditions & Tea',
      },
    ],
  },
  intellectual: {
    id: 'intellectual',
    title: 'The Intellectual Debater',
    badge: 'Mental Stimulation & High-Curiosity',
    subtitle: 'Top 14% Compatibility Match',
    tagline: 'You crave ideas that challenge premises, contrarian perspectives, and sharp wit.',
    description:
      'Small talk bores you. You seek meaningful sparring over philosophy, macroeconomic currents, frontier technology, and literature. You value companions who read voraciously, listen critically, and love exploring "why" rather than "what".',
    traits: ['Contrarian Banter', 'Deep Generalist', 'Socratic Sparring', 'Unfiltered Curiosity'],
    idealMeetup: 'A quiet independent roastery café or a historic library coffee walk in Church Street / Fort.',
    conversationSparks: ['Emerging tech & civilization futures', 'Psychological paradoxes & literature', 'Unconventional career pivots'],
    accentColor: 'text-indigo-600 dark:text-indigo-400',
    bgGlow: 'from-indigo-600/15 via-[#C5A059]/10 to-transparent',
    sampleCompanions: [
      {
        id: '00000000-0000-0000-0000-000000000006',
        name: 'Naveen Kumar',
        headline: 'Sanskrit & Kannada Scholar, Heritage Temple Walk Guide',
        city: 'Bengaluru',
        area: 'Basavanagudi',
        rate: 1100,
        rating: 4.94,
        trustScore: 98,
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        tag: 'Heritage History & Philosophy',
      },
      {
        id: '010e1920-fdf6-4419-85c1-95d284c6730d',
        name: 'Dr. Sophia Chen',
        headline: 'Cardiologist · Classical Violinist & Nature Trail Guide',
        city: 'Bengaluru',
        area: 'Lavelle Road',
        rate: 1200,
        rating: 4.92,
        trustScore: 97,
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        tag: 'Medicine, Violin & Science',
      },
    ],
  },
  empathetic: {
    id: 'empathetic',
    title: 'The Empathetic Confidant',
    badge: 'Sanctuary Presence & Warmth',
    subtitle: 'Top 22% Compatibility Match',
    tagline: 'You value genuine psychological safety, deep active listening, and calm warmth.',
    description:
      'Living under high executive pressure or demanding responsibilities, you treasure moments where you can take off your armor. You look for compassionate, grounded companions who offer non-judgmental presence and authentic emotional resonance.',
    traits: ['Attentive Presence', 'Emotional Sanctuary', 'Unrushed Patience', 'Grounded Grace'],
    idealMeetup: 'A peaceful botanical garden walk, a serene tea room, or a quiet breakfast by the lake.',
    conversationSparks: ['Navigating life transitions', 'Balancing personal peace with ambition', 'Cherished childhood memories'],
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    bgGlow: 'from-emerald-600/15 via-[#C5A059]/10 to-transparent',
    sampleCompanions: [
      {
        id: '00000000-0000-0000-0000-000000000008',
        name: 'Col. Rajeshwar Rao (Retd.)',
        headline: 'Senior Companion, Temple Escort & Society Chess Partner',
        city: 'Bengaluru',
        area: 'Malleswaram',
        rate: 1000,
        rating: 4.99,
        trustScore: 100,
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
        tag: 'Patience, Wisdom & Chess',
      },
      {
        id: '010e1920-fdf6-4419-85c1-95d284c6730d',
        name: 'Dr. Sophia Chen',
        headline: 'Classical Violinist & Gentle Nature Trail Guide',
        city: 'Bengaluru',
        area: 'Lavelle Road',
        rate: 1200,
        rating: 4.92,
        trustScore: 97,
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        tag: 'Mindful Walks & Calm',
      },
    ],
  },
  explorer: {
    id: 'explorer',
    title: 'The Dynamic Explorer',
    badge: 'Spontaneous Energy & Urban Discovery',
    subtitle: 'Top 25% Compatibility Match',
    tagline: 'You thrive on unexpected discoveries, lively street energy, and playful adventures.',
    description:
      'You see the city as a canvas of hidden speakeasies, indie live gigs, street photography trails, and spontaneous pop-ups. You want a high-spirited companion who matches your curiosity and is always up for trying something unexpected.',
    traits: ['Spontaneous Spirit', 'Urban Discovery', 'Creative Drive', 'Infectious Optimism'],
    idealMeetup: 'A sunset street photography walk followed by an artisanal night food market or indie gig.',
    conversationSparks: ['Hidden city subcultures & secret spots', 'Upcoming music & film festivals', 'Crazy travel adventures'],
    accentColor: 'text-amber-600 dark:text-amber-400',
    bgGlow: 'from-amber-600/15 via-[#881337]/10 to-transparent',
    sampleCompanions: [
      {
        id: '6d187ed5-aff0-4fa3-856c-9beb89264b15',
        name: 'Marcus Vance',
        headline: 'Commercial Photographer & Street Foodie Guide',
        city: 'Bengaluru',
        area: 'Koramangala',
        rate: 1800,
        rating: 4.95,
        trustScore: 98,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        tag: 'Photography & Night Trails',
      },
      {
        id: '158b9ff7-19de-49ce-a57c-b37738591285',
        name: 'Elena Rostova',
        headline: 'Semi-Pro Tennis Player & Event Plus-One',
        city: 'Bengaluru',
        area: 'Indiranagar',
        rate: 1500,
        rating: 4.98,
        trustScore: 99,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        tag: 'Weekend Sports & Gigs',
      },
    ],
  },
};

interface QuestionOption {
  label: string;
  subtext: string;
  archetype: ArchetypeId;
}

interface Question {
  id: number;
  prompt: string;
  context: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: 'How would you spend an ideal Friday evening unwind?',
    context: 'Choose the setting that instinctively feels most restorative to you.',
    options: [
      {
        label: 'A curated 4-course tasting menu or discovering an intimate jazz bar',
        subtext: 'Sensory appreciation, fine aesthetics & relaxed luxury',
        archetype: 'epicurean',
      },
      {
        label: 'Lingering over coffee while discussing a book, venture idea, or global trend',
        subtext: 'Intellectual sparring, big ideas & curious minds',
        archetype: 'intellectual',
      },
      {
        label: 'Decompressing from high-pressure work in a quiet, serene garden café',
        subtext: 'Warm presence, deep listening & genuine sanctuary',
        archetype: 'empathetic',
      },
      {
        label: 'Checking out a spontaneous live indie music gig, secret speakeasy, or night trail',
        subtext: 'High-energy, creative pulse & urban discovery',
        archetype: 'explorer',
      },
    ],
  },
  {
    id: 2,
    prompt: 'What makes a two-hour conversation truly unforgettable to you?',
    context: 'What leaves you energized after stepping away from a meetup?',
    options: [
      {
        label: 'Sharing refined aesthetic discoveries, travel anecdotes, and sensory nuances',
        subtext: 'Appreciation of culture, art, and exquisite taste',
        archetype: 'epicurean',
      },
      {
        label: 'Challenging each other’s assumptions and debating contrarian angles',
        subtext: 'Rigorous curiosity, mental depth & witty banter',
        archetype: 'intellectual',
      },
      {
        label: 'Feeling completely heard, unjudged, and stepping away with a lighter spirit',
        subtext: 'Heartfelt vulnerability, warmth & psychological ease',
        archetype: 'empathetic',
      },
      {
        label: 'Continuous infectious laughter, spontaneous plans, and creative sparks',
        subtext: 'Unpredictable fun, optimism & playful adventure',
        archetype: 'explorer',
      },
    ],
  },
  {
    id: 3,
    prompt: 'Which venue atmosphere feels like your natural sanctuary?',
    context: 'Where do you feel most comfortable opening up and being yourself?',
    options: [
      {
        label: 'A low-lit dining lounge with bespoke acoustic playlists and artisanal cocktails',
        subtext: 'Intimate ambiance, impeccable service & culinary mastery',
        archetype: 'epicurean',
      },
      {
        label: 'A quiet corner table in a historic library or third-wave specialty roastery',
        subtext: 'Aromatic coffee, book-lined shelves & calm focus',
        archetype: 'intellectual',
      },
      {
        label: 'A sunlit botanical greenhouse café or quiet park bench under rain-tree canopies',
        subtext: 'Natural greenery, unhurried pace & peaceful serenity',
        archetype: 'empathetic',
      },
      {
        label: 'A vibrant arts alleyway, boutique vinyl bar, or bustling local food bazaar',
        subtext: 'Electric pulse, eclectic sights & living culture',
        archetype: 'explorer',
      },
    ],
  },
  {
    id: 4,
    prompt: 'What kind of energy do you need most in your life right now?',
    context: 'What would feel like the most meaningful addition to your weekend?',
    options: [
      {
        label: 'Cultured, sophisticated, and aesthetically inspiring elegance',
        subtext: 'Elevating daily routine into a refined experience',
        archetype: 'epicurean',
      },
      {
        label: 'Intellectually provocative, curious, and mind-expanding banter',
        subtext: 'Sharpening thoughts beyond standard work chatter',
        archetype: 'intellectual',
      },
      {
        label: 'Grounding, gentle, restorative, and deeply comforting warmth',
        subtext: 'A calm anchor in a noisy, fast-paced metro',
        archetype: 'empathetic',
      },
      {
        label: 'Vibrant, refreshing, adventurous, and delightfully spontaneous',
        subtext: 'Breaking out of the repetitive urban grind',
        archetype: 'explorer',
      },
    ],
  },
];

export const ArchetypeQuizSection: React.FC = () => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<'idle' | 'active' | 'analyzing' | 'result'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<ArchetypeId[]>([]);
  const [computedArchetype, setComputedArchetype] = useState<ArchetypeProfile | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const startQuiz = () => {
    setQuizState('active');
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setComputedArchetype(null);
  };

  const handleSelectOption = (archetype: ArchetypeId) => {
    const nextAnswers = [...selectedAnswers, archetype];
    setSelectedAnswers(nextAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished all questions -> calculate
      setQuizState('analyzing');

      // Tally votes
      const tallies: Record<ArchetypeId, number> = {
        epicurean: 0,
        intellectual: 0,
        empathetic: 0,
        explorer: 0,
      };

      for (const ans of nextAnswers) {
        tallies[ans] = (tallies[ans] || 0) + 1;
      }

      let bestArchetype: ArchetypeId = 'epicurean';
      let maxScore = -1;

      for (const [key, score] of Object.entries(tallies) as [ArchetypeId, number][]) {
        if (score > maxScore) {
          maxScore = score;
          bestArchetype = key;
        }
      }

      // Simulate a brief, luxurious calculation animation
      setTimeout(() => {
        setComputedArchetype(ARCHETYPES[bestArchetype]);
        setQuizState('result');
      }, 1000);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswers((prev) => prev.slice(0, -1));
    } else {
      setQuizState('idle');
    }
  };

  const handleCopyShare = () => {
    if (!computedArchetype) return;
    const shareText = `✨ My Cue Companionship Archetype is "${computedArchetype.title}" — ${computedArchetype.tagline}\n\nDiscover your companion wavelength on Cue: ${window.location.origin}`;
    navigator.clipboard?.writeText(shareText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const currentQ = QUESTIONS[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100);

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Idle Teaser State */}
        {quizState === 'idle' && (
          <div className="relative rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-muted/30 p-8 sm:p-12 shadow-xl overflow-hidden group">
            {/* Ambient luxury glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-[#881337]/10 via-[#C5A059]/10 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#881337]/10 border border-[#881337]/20 text-[#881337] dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <SparklesIcon className="w-4 h-4 text-[#C5A059]" />
                <span>60-Second Vibe Diagnosis</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold text-foreground font-serif tracking-tight leading-tight mb-4">
                Discover Your Ideal Companion Archetype
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
                Not sure where to begin? Answer four quick, high-taste questions to diagnose your natural connection style. We'll match you with verified companions who share your exact conversational wavelength.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="button"
                  onClick={startQuiz}
                  className="min-h-[48px] px-8 py-3.5 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-white font-bold text-sm sm:text-base transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Start 60s Quiz</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4 text-[#C5A059]" />
                    100% Private & Free
                  </span>
                  <span>•</span>
                  <span>1,200+ Members Diagnosed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Active Quiz State */}
        {quizState === 'active' && currentQ && (
          <div className="relative rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Top progress and back row */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
              <button
                type="button"
                onClick={handleBack}
                className="min-h-[44px] min-w-[44px] -ml-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{currentQuestionIndex === 0 ? 'Cancel' : 'Previous'}</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Step {currentQuestionIndex + 1} of {QUESTIONS.length}
                </span>
                <div className="w-24 sm:w-32 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-[#881337] transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question prompt */}
            <div className="mb-8 max-w-2xl">
              <h3 className="text-2xl sm:text-4xl font-bold text-foreground font-serif tracking-tight leading-snug mb-2">
                {currentQ.prompt}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {currentQ.context}
              </p>
            </div>

            {/* 4 Interactive option cards (strictly 44px+ touch targets) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectOption(opt.archetype)}
                    className="min-h-[64px] p-5 rounded-2xl border border-border/80 bg-card hover:border-[#881337] hover:bg-[#881337]/5 dark:hover:bg-[#881337]/10 transition-all text-left flex items-start gap-4 group cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    <div className="min-w-[32px] min-h-[32px] w-8 h-8 rounded-full bg-muted group-hover:bg-[#881337] group-hover:text-white border border-border/80 flex items-center justify-center font-mono font-bold text-xs text-foreground transition-colors shrink-0 mt-0.5">
                      {letter}
                    </div>

                    <div className="flex-1">
                      <div className="text-sm sm:text-base font-semibold text-foreground group-hover:text-[#881337] dark:group-hover:text-rose-400 transition-colors leading-snug mb-1">
                        {opt.label}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {opt.subtext}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Analyzing Pulse State */}
        {quizState === 'analyzing' && (
          <div className="rounded-3xl border border-border bg-card p-12 sm:p-20 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#881337]/10 border border-[#881337]/20 flex items-center justify-center mx-auto mb-6 animate-spin">
              <SparklesIcon className="w-8 h-8 text-[#881337]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground font-serif mb-2">
              Synthesizing Your Conversational Wavelength...
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Mapping your preferences against verified companions in Bengaluru, Mumbai, and Delhi-NCR.
            </p>
          </div>
        )}

        {/* 4. Luxury Result Reveal */}
        {quizState === 'result' && computedArchetype && (
          <div className="relative rounded-3xl border border-[#C5A059]/40 bg-card p-6 sm:p-10 shadow-2xl overflow-hidden animate-in fade-in duration-300">
            {/* Ambient luxury glow */}
            <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${computedArchetype.bgGlow} blur-3xl pointer-events-none`} />

            {/* Result Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-border/70">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-wider mb-2">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>{computedArchetype.badge}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold text-foreground font-serif tracking-tight leading-tight">
                  {computedArchetype.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                  {computedArchetype.subtitle} • Tailored Platonic Compatibility
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border flex items-center gap-2 transition-all cursor-pointer"
                >
                  {copyFeedback ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      <span>Copied Summary!</span>
                    </>
                  ) : (
                    <>
                      <ShareIcon className="w-4 h-4 text-muted-foreground" />
                      <span>Share Result</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={startQuiz}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold border border-border/80 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            </div>

            {/* Archetype Description & Core Traits Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 space-y-4">
                <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed font-serif">
                  "{computedArchetype.tagline}"
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {computedArchetype.description}
                </p>

                {/* Best Meetup Recommendation */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 mt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#881337] dark:text-rose-400 mb-1">
                    Ideal First Meetup Setting
                  </div>
                  <div className="text-xs sm:text-sm text-foreground/90 font-medium leading-normal">
                    {computedArchetype.idealMeetup}
                  </div>
                </div>
              </div>

              {/* Core Traits & Topics */}
              <div className="bg-muted/30 rounded-2xl border border-border/70 p-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Your Core Connection Traits
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {computedArchetype.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-2.5 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground shadow-2xs"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Conversation Sparks
                  </div>
                  <ul className="space-y-1.5 text-xs text-foreground/80 list-disc list-inside">
                    {computedArchetype.conversationSparks.map((spark) => (
                      <li key={spark}>{spark}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Matched Verified Companions Showcase */}
            <div className="pt-8 border-t border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif">
                    Top Verified Companions Matching Your Archetype
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Available for public coffee, dining, and cultural outings in Bengaluru & Mumbai.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/discovery')}
                  className="min-h-[44px] text-xs font-bold text-[#881337] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>View All Companions</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Companions Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {computedArchetype.sampleCompanions.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl border border-border/90 bg-card hover:border-[#881337]/60 hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 group"
                  >
                    <img
                      src={comp.photoUrl}
                      alt={comp.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 shadow-sm border border-border/80"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-base text-foreground font-serif truncate">
                          {comp.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                          {comp.trustScore}% Trust
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {comp.headline}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-0.5">
                          <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          {comp.area}, {comp.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <StarIcon className="w-3.5 h-3.5 fill-current" />
                          {comp.rating}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <div className="text-xs font-mono font-bold text-foreground">
                          ₹{comp.rate.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-muted-foreground">/ hr</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/providers/${comp.id}`)}
                          className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-white text-xs font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center gap-1"
                        >
                          <span>Reserve</span>
                          <ArrowRightIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

