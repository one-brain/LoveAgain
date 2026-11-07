import React, { useRef } from 'react';

interface OtpCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  id?: string;
}

export const OtpCodeInput: React.FC<OtpCodeInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  hasError = false,
  id = 'otp',
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cleanValue = value.replace(/\D/g, '').slice(0, length);
  const digits = Array.from({ length }, (_, idx) => cleanValue[idx] || '');

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputRefs.current[clamped]?.focus();
    inputRefs.current[clamped]?.select();
  };

  const handleDigitChange = (index: number, rawInput: string) => {
    const numeric = rawInput.replace(/\D/g, '');
    if (!numeric) {
      const next = [...digits];
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    // Handle multi-digit input (e.g. mobile autocomplete or paste via onChange)
    if (numeric.length > 1) {
      const next = [...digits];
      for (let i = 0; i < numeric.length && index + i < length; i++) {
        next[index + i] = numeric[i];
      }
      const joined = next.join('').slice(0, length);
      onChange(joined);
      focusCell(Math.min(index + numeric.length, length - 1));
      return;
    }

    const next = [...digits];
    next[index] = numeric[0];
    onChange(next.join(''));

    if (index < length - 1) {
      focusCell(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = '';
        onChange(next.join(''));
        focusCell(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusCell(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-2.5" role="group" aria-label="6-digit verification code">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          id={idx === 0 ? id : `${id}-${idx}`}
          name={idx === 0 ? id : `${id}-${idx}`}
          type="text"
          inputMode="numeric"
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          disabled={disabled}
          autoFocus={autoFocus && idx === 0}
          value={digit}
          aria-label={`Digit ${idx + 1} of ${length}`}
          onChange={(e) => handleDigitChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className={`w-full h-12 sm:h-13 text-center text-subtitle1 font-semibold font-mono tabular rounded-xl bg-card border transition-colors focus:outline-none ${
            hasError
              ? 'border-destructive text-destructive focus:border-destructive'
              : digit
                ? 'border-brand text-brand-fg bg-brand-light/30 focus:border-brand'
                : 'border-border-strong text-foreground focus:border-brand'
          } disabled:opacity-50`}
        />
      ))}
    </div>
  );
};
