import React, { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Field,
  Tag,
  TagGroup,
  Badge,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Add16Regular,
  Sparkle16Regular,
  Checkmark16Regular,
} from '@fluentui/react-icons';

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
    description: 'Artisanal cafes, pour-over tastings, relaxed conversations & quiet reading sessions',
    defaultTags: ['Specialty Cafes', 'Engaging Conversationalist', 'Third Wave Coffee', 'Quiet Ambience'],
  },
  {
    name: 'Restaurant Visits & Dining',
    description: 'Fine dining dinners, casual lunch meetups, culinary food walks & chef tastings',
    defaultTags: ['Fine Dining Etiquette', 'Foodie Explorer', 'Dinner Outings', 'Cuisine Pairings'],
  },
  {
    name: 'Shopping & Styling Companion',
    description: 'Personal shopping assistant, boutique explorations, wardrobe styling & mall visits',
    defaultTags: ['Wardrobe Styling', 'Boutique Crawls', 'Patient Shopping Buddy', 'Mall Navigation'],
  },
  {
    name: 'Movies & Cinema Outings',
    description: 'Multiplex new releases, film festival companion, IMAX screenings & post-show chats',
    defaultTags: ['Cinema Buff', 'IMAX Screenings', 'Film Discussion', 'Popcorn & Movie Dates'],
  },
  {
    name: 'Weekend Activities & Getaways',
    description: 'Sunday farmer markets, scenic outdoor spots, day trips, museum trails & picnic outings',
    defaultTags: ['Weekend Day Trips', 'Sunday Markets', 'Scenic Drives', 'Park Walks & Picnics'],
  },
  {
    name: 'Special Events & Plus-One',
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
      <div>
        <span className="block text-caption1 font-semibold text-muted-foreground mb-2">
          Published specialties
        </span>
        <div className="flex flex-wrap gap-2">
          {specialties.length === 0 ? (
            <p className="text-caption1 text-muted-foreground">
              No services added yet. Add your first specialty below.
            </p>
          ) : (
            <TagGroup
              onDismiss={(_e, { value }) => handleRemove(String(value))}
              aria-label="Published specialties"
              className="flex flex-wrap gap-2"
            >
              {specialties.map((specialty) => (
                <Tag
                  key={specialty}
                  value={specialty}
                  dismissible
                  dismissIcon={{ 'aria-label': `Remove ${specialty}` }}
                  appearance="brand"
                  shape="rounded"
                >
                  {specialty}
                </Tag>
              ))}
            </TagGroup>
          )}
        </div>
      </div>

      {specialties.length > 0 && (
        <div className="space-y-3">
          <span className="block text-caption1 font-semibold text-muted-foreground">
            Skill & level highlights
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialties.map((specialty) => (
              <Card
                key={specialty}
                className="border border-border bg-background rounded-2xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-body1 font-semibold text-foreground">{specialty}</h4>
                  <span className="text-caption1 text-muted-foreground tabular">
                    {(serviceTags[specialty] || []).length} tags
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-7">
                  {(serviceTags[specialty] || []).length > 0 && (
                    <TagGroup
                      onDismiss={(_e, { value }) => handleRemoveTag(specialty, String(value))}
                      className="flex flex-wrap gap-1.5"
                    >
                      {(serviceTags[specialty] || []).map((tag) => (
                        <Tag
                          key={tag}
                          value={tag}
                          size="small"
                          dismissible
                          appearance="outline"
                        >
                          {tag}
                        </Tag>
                      ))}
                    </TagGroup>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={tagInputs[specialty] || ''}
                    onChange={(_e, data) =>
                      setTagInputs((prev) => ({ ...prev, [specialty]: data.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(specialty);
                      }
                    }}
                    placeholder="e.g. Intermediate, Rally partner"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    appearance="primary"
                    size="small"
                    onClick={() => handleAddTag(specialty)}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkle16Regular className="text-brand-fg" />
            <h3 className="text-body1 font-semibold text-foreground">
              Curated companionship services
            </h3>
          </div>
          <span className="text-caption1 text-muted-foreground">
            Select to offer or expand your profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {RECOMMENDED_COMPANIONSHIP_SERVICES.map((srv) => {
            const isAdded = specialties.includes(srv.name);
            return (
              <Card
                key={srv.name}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-sm ${
                  isAdded ? 'bg-accent-light border-brand-stroke' : 'bg-card border-border'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-body1 font-semibold text-foreground">{srv.name}</h4>
                    {isAdded ? (
                      <Badge appearance="tint" color="brand" icon={<Checkmark16Regular />}>
                        Active
                      </Badge>
                    ) : (
                      <Badge appearance="outline" color="informative">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-caption1 text-muted-foreground mt-0.5 leading-snug">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {srv.defaultTags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-caption2 px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {isAdded ? (
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => handleRemove(srv.name)}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      appearance="primary"
                      size="small"
                      icon={<Add16Regular />}
                      onClick={() => handleQuickAddService(srv.name, srv.defaultTags)}
                    >
                      Add
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleAdd} className="space-y-2 pt-2 border-t border-border">
        <Field label="Add custom specialty">
          <div className="flex gap-2">
            <Input
              value={newSpecialty}
              onChange={(_e, data) => setNewSpecialty(data.value)}
              placeholder="e.g. Squash, Painting, Cycling, Chess..."
              className="flex-1"
            />
            <Button type="submit" appearance="primary" icon={<Add16Regular />}>
              Add specialty
            </Button>
          </div>
        </Field>
        {error && (
          <MessageBar intent="error">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}
      </form>
    </div>
  );
};
