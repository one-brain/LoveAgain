import React from 'react';
import {
  Badge,
  Menu,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { ChevronDown16Regular } from '@fluentui/react-icons';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface SelectDropdownProps<T = string> {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  label?: string;
  placeholder?: string;
  prefixIcon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  disabled?: boolean;
}

export function SelectDropdown<T extends string | number>({
  id,
  value,
  onChange,
  options,
  label,
  placeholder = 'Select option...',
  prefixIcon,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  size = 'md',
  align = 'left',
  disabled = false,
}: SelectDropdownProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value);

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-caption1 rounded-md gap-1.5 min-h-7',
    md: 'px-3 py-2 text-body1 rounded-md gap-2 min-h-9',
    lg: 'px-4 py-2.5 text-body2 rounded-md gap-2.5 min-h-11',
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-caption1 font-semibold text-foreground mb-1"
        >
          {label}
        </label>
      )}

      <Menu
        checkedValues={{ selected: [String(value)] }}
        positioning={align === 'right' ? 'below-end' : 'below-start'}
      >
        <MenuTrigger disableButtonEnhancement>
          <button
            id={id}
            type="button"
            disabled={disabled}
            role="combobox"
            aria-label={label || placeholder}
            className={`w-full flex items-center justify-between border border-border-strong bg-card hover:bg-muted text-foreground transition-colors outline-none select-none font-normal shadow-2xs ${
              sizeClasses[size]
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${triggerClassName}`}
          >
            <span className="flex items-center gap-2 truncate">
              {prefixIcon && <span className="text-muted-foreground shrink-0">{prefixIcon}</span>}
              {selectedOption?.icon && (
                <span className="text-brand-fg shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
            </span>

            <ChevronDown16Regular className="text-muted-foreground ml-2 shrink-0" />
          </button>
        </MenuTrigger>

        <MenuPopover className={`min-w-[200px] max-h-72 overflow-y-auto ${menuClassName}`}>
          <MenuList aria-label={label || placeholder}>
            {options.map((opt) => (
              <MenuItemRadio
                key={String(opt.value)}
                name="selected"
                value={String(opt.value)}
                disabled={opt.disabled}
                icon={opt.icon ? <span>{opt.icon}</span> : undefined}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="truncate">
                    <div className="truncate text-body1">{opt.label}</div>
                    {opt.description && (
                      <div className="text-caption1 text-muted-foreground truncate">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  {opt.badge && (
                    <Badge appearance="tint" color="informative" size="small">
                      {opt.badge}
                    </Badge>
                  )}
                </div>
              </MenuItemRadio>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
}
