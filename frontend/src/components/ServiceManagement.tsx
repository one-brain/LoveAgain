import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ServiceManagementProps {
  specialties: string[];
  onAddService?: (specialty: string) => void;
  onRemoveService?: (specialty: string) => void;
  serviceTags?: Record<string, string[]>;
  onServiceTagsChange?: (specialty: string, tags: string[]) => void;
}

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

      {/* Add New Specialty Input Form */}
      <form onSubmit={handleAdd} className="space-y-2">
        <label className="block text-xs font-semibold text-muted-foreground">
          Add Another Specialty
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="e.g. Squash, Painting, Cycling..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-accent text-accent-foreground rounded-xl hover:bg-accent-hover transition-colors shadow-xs flex items-center gap-1.5"
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
