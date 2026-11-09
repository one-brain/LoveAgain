import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  Spinner,
} from '@fluentui/react-components';
import {
  Sparkle20Regular,
  ArrowRight16Regular,
  ArrowLeft16Regular,
  CheckmarkCircle20Regular,
  ArrowCounterclockwise16Regular,
  Share16Regular,
  Location16Regular,
  Star16Filled,
  ShieldCheckmark16Regular,
} from '@fluentui/react-icons';

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
    badge: 'Curated taste & sensory elegance',
    subtitle: 'Top 18% Compatibility Match',
    tagline: 'You savor the finer nuances of culinary artistry, vintage design, and unhurried conversation.',
    description:
      'You appreciate the craftsmanship behind exceptional food, wine, architecture, and live acoustic music. For you, companionship is about discovering hidden tasting menus, private gallery previews, or quiet rooftop lounges where aesthetic curiosity is celebrated.',
    traits: ['Artisanal Appreciation', 'Cultured Curiosity', 'Sensory Storytelling', 'Atmospheric Sensitivity'],
    idealMeetup: 'A 4-course curated tasting dinner at an artisanal bistro or a quiet jazz cocktail lounge in Indiranagar / Bandra.',
    conversationSparks: ['Memorable regional culinary secrets', 'Contemporary architecture & design', 'Travels through vintage cities'],
    accentColor: 'text-brand-fg',
    bgGlow: '',
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
    badge: 'Mental stimulation & high curiosity',
    subtitle: 'Top 14% Compatibility Match',
    tagline: 'You crave ideas that challenge premises, contrarian perspectives, and sharp wit.',
    description:
      'Small talk bores you. You seek meaningful sparring over philosophy, macroeconomic currents, frontier technology, and literature. You value companions who read voraciously, listen critically, and love exploring "why" rather than "what".',
    traits: ['Contrarian Banter', 'Deep Generalist', 'Socratic Sparring', 'Unfiltered Curiosity'],
    idealMeetup: 'A quiet independent roastery café or a historic library coffee walk in Church Street / Fort.',
    conversationSparks: ['Emerging tech & civilization futures', 'Psychological paradoxes & literature', 'Unconventional career pivots'],
    accentColor: 'text-brand-fg',
    bgGlow: '',
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
    badge: 'Sanctuary presence & warmth',
    subtitle: 'Top 22% Compatibility Match',
    tagline: 'You value genuine psychological safety, deep active listening, and calm warmth.',
    description:
      'Living under high executive pressure or demanding responsibilities, you treasure moments where you can take off your armor. You look for compassionate, grounded companions who offer non-judgmental presence and authentic emotional resonance.',
    traits: ['Attentive Presence', 'Emotional Sanctuary', 'Unrushed Patience', 'Grounded Grace'],
    idealMeetup: 'A peaceful botanical garden walk, a serene tea room, or a quiet breakfast by the lake.',
    conversationSparks: ['Navigating life transitions', 'Balancing personal peace with ambition', 'Cherished childhood memories'],
    accentColor: 'text-brand-fg',
    bgGlow: '',
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
    badge: 'Spontaneous energy & urban discovery',
    subtitle: 'Top 25% Compatibility Match',
    tagline: 'You thrive on unexpected discoveries, lively street energy, and playful adventures.',
    description:
      'You see the city as a canvas of hidden speakeasies, indie live gigs, street photography trails, and spontaneous pop-ups. You want a high-spirited companion who matches your curiosity and is always up for trying something unexpected.',
    traits: ['Spontaneous Spirit', 'Urban Discovery', 'Creative Drive', 'Infectious Optimism'],
    idealMeetup: 'A sunset street photography walk followed by an artisanal night food market or indie gig.',
    conversationSparks: ['Hidden city subcultures & secret spots', 'Upcoming music & film festivals', 'Crazy travel adventures'],
    accentColor: 'text-brand-fg',
    bgGlow: '',
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
      setQuizState('analyzing');

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
    const shareText = `My Cue Companionship Archetype is "${computedArchetype.title}" — ${computedArchetype.tagline}\n\nDiscover your companion wavelength on Cue: ${window.location.origin}`;
    navigator.clipboard?.writeText(shareText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const currentQ = QUESTIONS[currentQuestionIndex];
  const progressFraction = (currentQuestionIndex + 1) / QUESTIONS.length;

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Idle Teaser State */}
        {quizState === 'idle' && (
          <Card className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-light border border-border text-brand-fg text-caption1 font-semibold mb-3">
                <Sparkle20Regular className="text-trust" />
                <span>60-second vibe diagnosis</span>
              </div>

              <h2 className="text-title2 sm:text-title1 font-semibold text-foreground mb-3">
                Discover your ideal companion archetype
              </h2>

              <p className="text-body2 text-muted-foreground leading-relaxed mb-6">
                Not sure where to begin? Answer four quick questions to diagnose your natural connection style. We'll match you with verified companions who share your exact conversational wavelength.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button
                  appearance="primary"
                  size="large"
                  icon={<ArrowRight16Regular />}
                  iconPosition="after"
                  onClick={startQuiz}
                  className="min-h-11"
                >
                  Start quiz
                </Button>

                <div className="flex items-center gap-3 text-caption1 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheckmark16Regular className="text-trust" />
                    100% private & free
                  </span>
                  <span>•</span>
                  <span className="tabular">1,200+ members diagnosed</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 2. Active Quiz State */}
        {quizState === 'active' && currentQ && (
          <Card className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
            {/* Top progress and back row */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <Button
                appearance="subtle"
                size="medium"
                icon={<ArrowLeft16Regular />}
                onClick={handleBack}
                className="min-h-11"
              >
                {currentQuestionIndex === 0 ? 'Cancel' : 'Previous'}
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-caption1 font-mono tabular font-semibold text-muted-foreground">
                  Step {currentQuestionIndex + 1} of {QUESTIONS.length}
                </span>
                <div className="w-24 sm:w-32">
                  <ProgressBar value={progressFraction} thickness="medium" />
                </div>
              </div>
            </div>

            {/* Question prompt */}
            <div className="mb-6 max-w-2xl">
              <h3 className="text-title3 sm:text-title2 font-semibold text-foreground mb-1.5">
                {currentQ.prompt}
              </h3>
              <p className="text-body1 text-muted-foreground">
                {currentQ.context}
              </p>
            </div>

            {/* 4 Interactive option cards (strictly 44px+ touch targets) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectOption(opt.archetype)}
                    className="min-h-16 p-4 sm:p-5 rounded-2xl border border-border bg-card hover:border-border-strong hover:bg-muted transition-colors text-left flex items-start gap-3.5 group cursor-pointer shadow-2xs card-hover-effect"
                  >
                    <div className="min-w-8 min-h-8 w-8 h-8 rounded-full bg-muted group-hover:bg-accent group-hover:text-accent-foreground border border-border flex items-center justify-center font-mono tabular font-semibold text-caption1 text-foreground transition-colors shrink-0 mt-0.5">
                      {letter}
                    </div>

                    <div className="flex-1">
                      <div className="text-body1 sm:text-body2 font-semibold text-foreground group-hover:text-brand-fg transition-colors mb-1">
                        {opt.label}
                      </div>
                      <div className="text-caption1 text-muted-foreground leading-relaxed">
                        {opt.subtext}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* 3. Analyzing State */}
        {quizState === 'analyzing' && (
          <Card className="rounded-2xl border border-border bg-card p-12 sm:p-16 text-center shadow-sm flex flex-col items-center gap-4">
            <Spinner size="large" />
            <h3 className="text-title3 font-semibold text-foreground">
              Synthesizing your conversational wavelength...
            </h3>
            <p className="text-body1 text-muted-foreground max-w-md mx-auto">
              Mapping your preferences against verified companions in Bengaluru, Mumbai, and Delhi-NCR.
            </p>
          </Card>
        )}

        {/* 4. Result Reveal */}
        {quizState === 'result' && computedArchetype && (
          <Card className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
            {/* Result Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-light border border-trust-border text-trust text-caption1 font-semibold mb-2">
                  <Sparkle20Regular />
                  <span>{computedArchetype.badge}</span>
                </div>
                <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
                  {computedArchetype.title}
                </h2>
                <p className="text-body1 text-muted-foreground mt-1 tabular">
                  {computedArchetype.subtitle} • Tailored platonic compatibility
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  appearance="secondary"
                  size="large"
                  icon={copyFeedback ? <CheckmarkCircle20Regular className="text-success" /> : <Share16Regular />}
                  onClick={handleCopyShare}
                  className="min-h-11"
                >
                  {copyFeedback ? 'Copied summary!' : 'Share result'}
                </Button>

                <Button
                  appearance="subtle"
                  size="large"
                  icon={<ArrowCounterclockwise16Regular />}
                  onClick={startQuiz}
                  className="min-h-11"
                >
                  Retake
                </Button>
              </div>
            </div>

            {/* Archetype Description & Core Traits Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-4">
                <p className="text-subtitle2 font-semibold text-foreground leading-relaxed">
                  "{computedArchetype.tagline}"
                </p>
                <p className="text-body1 text-muted-foreground leading-relaxed">
                  {computedArchetype.description}
                </p>

                {/* Best Meetup Recommendation */}
                <div className="p-4 rounded-2xl bg-muted border border-border mt-4">
                  <div className="text-caption1 font-semibold text-brand-fg mb-1">
                    Ideal first meetup setting
                  </div>
                  <div className="text-body1 text-foreground">
                    {computedArchetype.idealMeetup}
                  </div>
                </div>
              </div>

              {/* Core Traits & Topics */}
              <div className="bg-muted rounded-2xl border border-border p-5 flex flex-col justify-between">
                <div>
                  <div className="text-caption1 font-semibold text-foreground mb-3">
                    Your core connection traits
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {computedArchetype.traits.map((trait) => (
                      <Badge
                        key={trait}
                        appearance="outline"
                        color="informative"
                        size="medium"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-caption1 font-semibold text-foreground mb-2">
                    Conversation sparks
                  </div>
                  <ul className="space-y-1.5 text-caption1 text-muted-foreground list-disc list-inside">
                    {computedArchetype.conversationSparks.map((spark) => (
                      <li key={spark}>{spark}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Matched Verified Companions Showcase */}
            <div className="pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h3 className="text-subtitle1 font-semibold text-foreground">
                    Top verified companions matching your archetype
                  </h3>
                  <p className="text-caption1 text-muted-foreground">
                    Available for public coffee, dining, and cultural outings in Bengaluru & Mumbai.
                  </p>
                </div>

                <Button
                  appearance="subtle"
                  size="medium"
                  icon={<ArrowRight16Regular />}
                  iconPosition="after"
                  onClick={() => navigate('/discovery')}
                  className="min-h-11 self-start sm:self-auto !text-brand-fg"
                >
                  View all
                </Button>
              </div>

              {/* Companions Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {computedArchetype.sampleCompanions.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 rounded-2xl border border-border bg-card shadow-sm card-hover-effect flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <img
                      src={comp.photoUrl}
                      alt={comp.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-border"
                    />

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-subtitle2 text-foreground truncate">
                          {comp.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-caption2 font-semibold tabular bg-trust-light text-trust border border-trust-border">
                          {comp.trustScore}% Trust
                        </span>
                      </div>

                      <p className="text-caption1 text-muted-foreground truncate mb-2">
                        {comp.headline}
                      </p>

                      <div className="flex items-center gap-3 text-caption1 text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Location16Regular className="text-muted-foreground" />
                          {comp.area}, {comp.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-trust font-semibold tabular">
                          <Star16Filled className="text-trust" />
                          {comp.rating}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="text-body1 font-mono tabular font-semibold text-foreground">
                          ₹{comp.rate.toLocaleString('en-IN')}{' '}
                          <span className="text-caption1 font-normal text-muted-foreground">/ hr</span>
                        </div>

                        <Button
                          appearance="primary"
                          size="small"
                          icon={<ArrowRight16Regular />}
                          iconPosition="after"
                          onClick={() => navigate(`/providers/${comp.id}`)}
                          className="min-h-11 sm:min-h-8"
                        >
                          Reserve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
};
