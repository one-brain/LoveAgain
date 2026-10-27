import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  CheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export interface SpecialtySearchPickerProps {
  selectedSpecialties: string[];
  onChange: (specialties: string[]) => void;
  availablePresets?: string[];
  maxItems?: number;
  disabled?: boolean;
}

const DEFAULT_POPULAR_PRESETS = [
  'Regional Homestyle Cook',
  'Yoga & Mindfulness',
  'Senior Companion & Temple Escort',
  'Workout & Tennis Partner',
  'Photography & Video',
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
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Combine presets with any existing custom items in selectedSpecialties
  const allKnownOptions = useMemo(() => {
    const set = new Set<string>(availablePresets);
    selectedSpecialties.forEach((s) => set.add(s));
    return Array.from(set);
  }, [availablePresets, selectedSpecialties]);

  // Clean & title-case helper
  const formatSpecialtyName = (str: string) => {
    return str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // Filter matching items
  const queryTrimmed = searchQuery.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!queryTrimmed) return [];
    return allKnownOptions.filter((opt) =>
      opt.toLowerCase().includes(queryTrimmed)
    );
  }, [allKnownOptions, queryTrimmed]);

  // Check if typed query exactly matches any known option
  const exactMatch = useMemo(() => {
    if (!queryTrimmed) return null;
    return allKnownOptions.find(
      (opt) => opt.toLowerCase() === queryTrimmed
    );
  }, [allKnownOptions, queryTrimmed]);

  const showCustomAddOption = queryTrimmed.length > 1 && (!exactMatch || !selectedSpecialties.includes(exactMatch));

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
    setIsOpen(false);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && exactMatch) {
        handleAdd(exactMatch);
      } else if (filteredOptions.length > 0 && !showCustomAddOption) {
        handleAdd(filteredOptions[0]);
      } else if (showCustomAddOption) {
        handleAddCustom();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Header & Counter */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-muted-foreground">
          Offered Specialties & Activities ({selectedSpecialties.length} selected)
        </label>
        {selectedSpecialties.length > 0 && !disabled && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] font-semibold text-muted-foreground hover:text-rose-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected Items Tags Shelf */}
      <div className="min-h-[44px] p-2.5 rounded-2xl bg-muted/30 border border-border/80 flex flex-wrap items-center gap-2">
        {selectedSpecialties.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-1 py-1">
            No activities selected yet. Search below or type your own to add.
          </p>
        ) : (
          selectedSpecialties.map((spec) => (
            <span
              key={spec}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent/15 text-accent border border-accent/25 shadow-2xs animate-in fade-in duration-150"
            >
              <span>{spec}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(spec)}
                  aria-label={`Remove ${spec}`}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-accent/70 hover:text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Search & Autocomplete Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            disabled={disabled}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search activities (e.g. Cooking, Yoga, Saree, Tennis) or type custom..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <p className="text-[11px] font-medium text-accent mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {feedback}
          </p>
        )}

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-64 overflow-y-auto bg-card border border-border rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-98 duration-100">
            {/* Custom Add Action if typing something new */}
            {showCustomAddOption && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent flex items-center justify-between transition-colors border border-accent/20 group"
              >
                <div className="flex items-center gap-2 truncate">
                  <PlusIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    Add custom activity: <strong className="text-foreground font-bold">"{formatSpecialtyName(searchQuery)}"</strong>
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors shrink-0 ml-2">
                  Press Enter
                </span>
              </button>
            )}

            {/* Filtered Preset Matches */}
            {queryTrimmed && filteredOptions.length > 0 && (
              <div className="space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Matching Activities
                </div>
                {filteredOptions.map((opt) => {
                  const isSelected = selectedSpecialties.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggle(opt)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold">
                          <CheckIcon className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-foreground">
                          <PlusIcon className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* No matches for query */}
            {queryTrimmed && filteredOptions.length === 0 && !showCustomAddOption && (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No matching activities found.
              </div>
            )}

            {/* Empty Query View: Popular Quick-Pick Shortcuts */}
            {!queryTrimmed && (
              <div className="p-1 space-y-2">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  <SparklesIcon className="w-3 h-3 text-accent" />
                  <span>Popular Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_POPULAR_PRESETS.map((preset) => {
                    const isSelected = selectedSpecialties.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleToggle(preset)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-accent text-accent-foreground border-accent shadow-2xs font-semibold'
                            : 'bg-muted/40 hover:bg-muted text-foreground border-border/80'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{preset}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Companions with 3 to 6 distinct activities receive up to 2.5x more meetup requests from clients.
      </p>
    </div>
  );
};

