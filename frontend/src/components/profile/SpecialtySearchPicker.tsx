import React, { useState, useMemo } from 'react';
import {
  Button,
  Combobox,
  Option,
  Tag,
  TagGroup,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Add16Regular,
  Checkmark16Regular,
  Sparkle16Regular,
} from '@fluentui/react-icons';

export interface SpecialtySearchPickerProps {
  selectedSpecialties: string[];
  onChange: (specialties: string[]) => void;
  availablePresets?: string[];
  maxItems?: number;
  disabled?: boolean;
}

export const CURATED_COMPANIONSHIP_SERVICES = [
  'Coffee Dates & Cafe Chats',
  'Restaurant Visits & Dining',
  'Shopping & Styling Companion',
  'Movies & Cinema Outings',
  'Weekend Activities & Getaways',
  'Special Events & Plus-One',
  'Regional Homestyle Cook',
  'Yoga & Mindfulness',
  'Senior Companion & Temple Escort',
  'Workout & Tennis Partner',
  'Photography & Video',
  'City Guide & Tours',
];

const DEFAULT_POPULAR_PRESETS = [
  'Coffee Dates & Cafe Chats',
  'Restaurant Visits & Dining',
  'Shopping & Styling Companion',
  'Movies & Cinema Outings',
  'Weekend Activities & Getaways',
  'Special Events & Plus-One',
  'Workout & Tennis Partner',
  'Regional Homestyle Cook',
  'Senior Companion & Temple Escort',
  'City Guide & Tours',
];

export const SpecialtySearchPicker: React.FC<SpecialtySearchPickerProps> = ({
  selectedSpecialties = [],
  onChange,
  availablePresets = [],
  maxItems = 15,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const allKnownOptions = useMemo(() => {
    const set = new Set<string>([...CURATED_COMPANIONSHIP_SERVICES, ...availablePresets]);
    selectedSpecialties.forEach((s) => set.add(s));
    return Array.from(set);
  }, [availablePresets, selectedSpecialties]);

  const formatSpecialtyName = (str: string) =>
    str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

  const queryTrimmed = searchQuery.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!queryTrimmed) return allKnownOptions;
    return allKnownOptions.filter((opt) => opt.toLowerCase().includes(queryTrimmed));
  }, [allKnownOptions, queryTrimmed]);

  const exactMatch = useMemo(() => {
    if (!queryTrimmed) return null;
    return allKnownOptions.find((opt) => opt.toLowerCase() === queryTrimmed);
  }, [allKnownOptions, queryTrimmed]);

  const showCustomAddOption =
    queryTrimmed.length > 1 && (!exactMatch || !selectedSpecialties.includes(exactMatch));

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggle = (item: string) => {
    if (disabled) return;
    if (selectedSpecialties.includes(item)) {
      handleRemove(item);
    } else {
      handleAdd(item);
    }
  };

  const handleAdd = (item: string) => {
    if (disabled) return;
    if (selectedSpecialties.length >= maxItems) {
      showFeedback(`Maximum of ${maxItems} activities allowed.`);
      return;
    }
    if (selectedSpecialties.includes(item)) {
      showFeedback(`"${item}" is already selected.`);
      return;
    }
    onChange([...selectedSpecialties, item]);
    showFeedback(`Added "${item}"`);
    setSearchQuery('');
  };

  const handleRemove = (item: string) => {
    if (disabled) return;
    onChange(selectedSpecialties.filter((s) => s !== item));
  };

  const handleAddCustom = () => {
    if (disabled) return;
    const formatted = formatSpecialtyName(searchQuery);
    if (!formatted) return;

    if (exactMatch) {
      handleAdd(exactMatch);
      return;
    }

    if (selectedSpecialties.some((s) => s.toLowerCase() === formatted.toLowerCase())) {
      showFeedback(`"${formatted}" is already in your selected activities.`);
      return;
    }

    handleAdd(formatted);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-caption1 font-semibold text-muted-foreground">
          Offered specialties & activities (<span className="tabular">{selectedSpecialties.length}</span> selected)
        </span>
        {selectedSpecialties.length > 0 && !disabled && (
          <Button appearance="subtle" size="small" onClick={() => onChange([])}>
            Clear all
          </Button>
        )}
      </div>

      {/* Selected Tags Shelf */}
      <div className="min-h-11 p-2.5 rounded-lg bg-muted border border-border flex flex-wrap items-center gap-2">
        {selectedSpecialties.length === 0 ? (
          <p className="text-caption1 text-muted-foreground px-1 py-1">
            No activities selected yet. Search below or choose from popular suggestions.
          </p>
        ) : (
          <TagGroup
            onDismiss={(_e, { value }) => handleRemove(String(value))}
            aria-label="Selected specialties"
            className="flex flex-wrap gap-1.5"
          >
            {selectedSpecialties.map((spec) => (
              <Tag
                key={spec}
                value={spec}
                dismissible={!disabled}
                dismissIcon={{ 'aria-label': `Remove ${spec}` }}
                appearance="brand"
                shape="rounded"
              >
                {spec}
              </Tag>
            ))}
          </TagGroup>
        )}
      </div>

      {/* Combobox with multiselect + custom add */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Combobox
          multiselect
          freeform
          disabled={disabled}
          placeholder="Search activities (e.g. Coffee Dates, Restaurant Visits, Shopping) or type custom..."
          value={searchQuery}
          selectedOptions={selectedSpecialties}
          onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          onOptionSelect={(_e, data) => {
            if (!data.optionValue) return;
            if (data.optionValue.startsWith('__custom__:')) {
              handleAddCustom();
              return;
            }
            onChange(data.selectedOptions.slice(0, maxItems));
            setSearchQuery('');
          }}
          className="flex-1"
        >
          {showCustomAddOption && (
            <Option
              key="__custom__"
              value={`__custom__:${formatSpecialtyName(searchQuery)}`}
              text={formatSpecialtyName(searchQuery)}
            >
              Add custom activity: "{formatSpecialtyName(searchQuery)}"
            </Option>
          )}
          {filteredOptions.map((opt) => (
            <Option key={opt} value={opt} text={opt}>
              {opt}
            </Option>
          ))}
        </Combobox>

        {showCustomAddOption && (
          <Button
            appearance="secondary"
            icon={<Add16Regular />}
            onClick={handleAddCustom}
            disabled={disabled}
          >
            Add "{formatSpecialtyName(searchQuery)}"
          </Button>
        )}
      </div>

      {feedback && (
        <MessageBar intent="info">
          <MessageBarBody>{feedback}</MessageBarBody>
        </MessageBar>
      )}

      {/* Popular Quick-Pick Shortcuts */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-1.5 text-caption1 font-semibold text-muted-foreground">
          <Sparkle16Regular className="text-brand-fg" />
          <span>Popular suggestions</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_POPULAR_PRESETS.map((preset) => {
            const isSelected = selectedSpecialties.includes(preset);
            return (
              <Button
                key={preset}
                type="button"
                size="small"
                appearance={isSelected ? 'primary' : 'outline'}
                icon={isSelected ? <Checkmark16Regular /> : <Add16Regular />}
                disabled={disabled}
                onClick={() => handleToggle(preset)}
              >
                {preset}
              </Button>
            );
          })}
        </div>
      </div>

      <p className="text-caption1 text-muted-foreground">
        Companions with 3 to 6 distinct activities receive more meetup requests from clients.
      </p>
    </div>
  );
};
