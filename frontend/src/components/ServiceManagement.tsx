import React, { useState } from 'react';
import { PlusIcon, XMarkIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ServiceManagementProps {
  specialties: string[];
  onAddService?: (specialty: string) => void;
  onRemoveService?: (specialty: string) => void;
  serviceTags?: Record<string, string[]>;
  onServiceTagsChange?: (specialty: string, tags: string[]) => void;
}

export const RECOMMENDED_COMPANIONSHIP_SERVICES = [
  {
    name: 'Coffee Dates & Cafe Chats',
    icon: '☕',
    description: 'Artisanal cafes, pour-over tastings, relaxed conversations & quiet reading sessions',
    defaultTags: ['Specialty Cafes', 'Engaging Conversationalist', 'Third Wave Coffee', 'Quiet Ambience'],
  },
  {
    name: 'Restaurant Visits & Dining',
    icon: '🍽️',
    description: 'Fine dining dinners, casual lunch meetups, culinary food walks & chef tastings',
    defaultTags: ['Fine Dining Etiquette', 'Foodie Explorer', 'Dinner Outings', 'Cuisine Pairings'],
  },
  {
    name: 'Shopping & Styling Companion',
    icon: '🛍️',
    description: 'Personal shopping assistant, boutique explorations, wardrobe styling & mall visits',
    defaultTags: ['Wardrobe Styling', 'Boutique Crawls', 'Patient Shopping Buddy', 'Mall Navigation'],
  },
  {
    name: 'Movies & Cinema Outings',
    icon: '🎬',
    description: 'Multiplex new releases, film festival companion, IMAX screenings & post-show chats',
    defaultTags: ['Cinema Buff', 'IMAX Screenings', 'Film Discussion', 'Popcorn & Movie Dates'],
  },
  {
    name: 'Weekend Activities & Getaways',
    icon: '🌄',
    description: 'Sunday farmer markets, scenic outdoor spots, day trips, museum trails & picnic outings',
    defaultTags: ['Weekend Day Trips', 'Sunday Markets', 'Scenic Drives', 'Park Walks & Picnics'],
  },
  {
    name: 'Special Events & Plus-One',
    icon: '🎟️',
    description: 'Wedding plus-one, corporate galas, live concerts, black-tie dinners & art exhibitions',
    defaultTags: ['Wedding Plus-One', 'Gala & Black-Tie', 'Concert Partner', 'Art Gallery Openings'],
  },
];

export const ServiceManagement: React.FC<ServiceManagementProps> = ({
  specialties,
  onAddService,
  onRemoveService,
  serviceTags = {},
  onServiceTagsChange,
}) => {
  const [newSpecialty, setNewSpecialty] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSpecialty.trim();
    if (!trimmed) return;

    if (specialties.includes(trimmed)) {
      setError('This service already exists');
      return;
    }

    setError(null);
    try {
      await onAddService?.(trimmed);
      setNewSpecialty('');
      setTagInputs((prev) => ({ ...prev, [trimmed]: '' }));
    } catch {
      setError('Failed to add service');
    }
  };

  const handleQuickAddService = async (serviceName: string, defaultTags: string[]) => {
    if (specialties.includes(serviceName)) return;
    setError(null);
    try {
      await onAddService?.(serviceName);
      if (onServiceTagsChange && defaultTags.length > 0) {
        onServiceTagsChange(serviceName, defaultTags);
      }
    } catch {
      setError('Failed to add service');
    }
  };

  const handleRemove = async (specialty: string) => {
    setError(null);
    try {
      await onRemoveService?.(specialty);
    } catch {
      setError('Failed to remove service');
    }
  };

  const handleAddTag = (specialty: string) => {
    const tag = (tagInputs[specialty] || '').trim();
    if (!tag) return;

    const currentTags = serviceTags[specialty] || [];
    if (currentTags.includes(tag)) {
      setError('This tag already exists for this service');
      return;
    }

    const updatedTags = [...currentTags, tag];
    onServiceTagsChange?.(specialty, updatedTags);
    setTagInputs((prev) => ({ ...prev, [specialty]: '' }));
    setError(null);
  };

  const handleRemoveTag = (specialty: string, tag: string) => {
    const currentTags = serviceTags[specialty] || [];
    const updatedTags = currentTags.filter((t) => t !== tag);
    onServiceTagsChange?.(specialty, updatedTags);
  };

  return (
    <div className="space-y-6">
      {/* Current Specialties Chips */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-2">
          Published Specialties
        </label>
        <div className="flex flex-wrap gap-2">
          {specialties.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No services added yet. Add your first specialty below.
            </p>
          ) : (
            specialties.map((specialty) => (
              <div
                key={specialty}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-accent/15 text-accent border border-accent/25 shadow-2xs"
              >
                <span>{specialty}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(specialty)}
                  className="text-accent/70 hover:text-accent transition-colors"
                  aria-label={`Remove ${specialty}`}
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Specialty Skill Tags Detail Cards */}
      {specialties.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-muted-foreground">
            Skill & Level Highlights
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialties.map((specialty) => (
              <div
                key={specialty}
                className="border border-border bg-background rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {specialty}
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {(serviceTags[specialty] || []).length} tags
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {(serviceTags[specialty] || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-card border border-border text-foreground"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(specialty, tag)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInputs[specialty] || ''}
                    onChange={(e) =>
                      setTagInputs((prev) => ({ ...prev, [specialty]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(specialty);
                      }
                    }}
                    placeholder="e.g. Intermediate, Rally partner"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(specialty)}
                    className="px-3 py-1.5 text-xs font-semibold bg-accent text-accent-foreground rounded-xl shadow-2xs hover:bg-accent-hover transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Companionship Services Showcase */}
      <div className="space-y-3 pt-2 border-t border-border/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              Curated Companionship Services
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Tap to offer or expand your profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {RECOMMENDED_COMPANIONSHIP_SERVICES.map((srv) => {
            const isAdded = specialties.includes(srv.name);
            return (
              <div
                key={srv.name}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                  isAdded
                    ? 'bg-accent/5 border-accent/30 shadow-2xs'
                    : 'bg-card border-border hover:border-accent/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-base" role="img" aria-hidden="true">
                      {srv.icon}
                    </span>
                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/25">
                        <CheckIcon className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Recommended
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground font-serif">
                    {srv.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {srv.defaultTags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {isAdded ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(srv.name)}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleQuickAddService(srv.name, srv.defaultTags)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs cursor-pointer"
                    >
                      <PlusIcon className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Custom Specialty Input Form */}
      <form onSubmit={handleAdd} className="space-y-2 pt-2 border-t border-border/70">
        <label className="block text-xs font-semibold text-muted-foreground">
          Add Custom Specialty
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="e.g. Squash, Painting, Cycling, Chess..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-accent text-accent-foreground rounded-xl hover:bg-accent-hover transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Specialty</span>
          </button>
        </div>
        {error && <p className="text-xs text-destructive mt-1 font-medium">{error}</p>}
      </form>
    </div>
  );
};
