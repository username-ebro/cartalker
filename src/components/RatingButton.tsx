'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

export type RatingValue = 'up' | 'down' | null;

interface RatingButtonProps {
  /** Current rating value */
  value?: RatingValue;
  /** Callback when rating changes */
  onChange?: (rating: RatingValue) => void;
  /** Optional label to display above buttons */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether buttons are disabled */
  disabled?: boolean;
  className?: string;
}

/**
 * RatingButton Component
 *
 * Thumbs up/down rating for AI advice and recommendations.
 * Used throughout CarTalker to collect user feedback on advice quality.
 *
 * @example
 * ```tsx
 * <RatingButton
 *   label="Was this advice helpful?"
 *   onChange={(rating) => console.log('Rated:', rating)}
 * />
 * ```
 */
export function RatingButton({
  value: controlledValue,
  onChange,
  label = 'Was this helpful?',
  size = 'md',
  disabled = false,
  className = '',
}: RatingButtonProps) {
  const [internalValue, setInternalValue] = useState<RatingValue>(null);

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleRating = (rating: RatingValue) => {
    if (disabled) return;

    // Toggle off if clicking the same rating
    const newRating = value === rating ? null : rating;

    // Update internal state if uncontrolled
    if (controlledValue === undefined) {
      setInternalValue(newRating);
    }

    // Call onChange callback
    onChange?.(newRating);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span className="text-sm text-marble-gray font-medium">
          {label}
        </span>
      )}

      <div className="flex items-center gap-3">
        {/* Thumbs Up Button */}
        <button
          type="button"
          onClick={() => handleRating('up')}
          disabled={disabled}
          className={`
            ${sizeClasses[size]}
            rounded-full
            border-2
            transition-all duration-200
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-info-blue focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              value === 'up'
                ? 'bg-savings-green border-savings-green text-white shadow-md scale-110'
                : 'bg-white border-marble-gray text-marble-gray hover:border-savings-green hover:text-savings-green hover:scale-105'
            }
          `}
          aria-label="Thumbs up"
          aria-pressed={value === 'up'}
        >
          <ThumbsUp size={iconSizes[size]} strokeWidth={2} />
        </button>

        {/* Thumbs Down Button */}
        <button
          type="button"
          onClick={() => handleRating('down')}
          disabled={disabled}
          className={`
            ${sizeClasses[size]}
            rounded-full
            border-2
            transition-all duration-200
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-info-blue focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              value === 'down'
                ? 'bg-danger-red border-danger-red text-white shadow-md scale-110'
                : 'bg-white border-marble-gray text-marble-gray hover:border-danger-red hover:text-danger-red hover:scale-105'
            }
          `}
          aria-label="Thumbs down"
          aria-pressed={value === 'down'}
        >
          <ThumbsDown size={iconSizes[size]} strokeWidth={2} />
        </button>
      </div>

      {/* Feedback message */}
      {value && !disabled && (
        <div className="text-xs text-marble-gray animate-in fade-in slide-in-from-bottom-2 duration-200">
          {value === 'up' ? (
            <span className="text-savings-green">✓ Thanks for the feedback!</span>
          ) : (
            <span className="text-danger-red">We'll work on improving this advice</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Inline Rating (compact version for tight spaces)
 */
export function InlineRating({
  value,
  onChange,
  size = 'sm',
  disabled = false,
  showFeedback = false,
}: Omit<RatingButtonProps, 'label' | 'className'> & { showFeedback?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <RatingButton
        value={value}
        onChange={onChange}
        size={size}
        disabled={disabled}
        label=""
        className={showFeedback ? '' : '[&>div:last-child]:hidden'}
      />
    </div>
  );
}
