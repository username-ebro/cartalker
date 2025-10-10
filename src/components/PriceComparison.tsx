'use client';

import { useState } from 'react';
import { DollarSign, TrendingDown, MapPin, ExternalLink, AlertCircle } from 'lucide-react';

export interface PriceOption {
  shop: string;
  price: number;
  warranty?: string;
  distance?: number; // miles
  rating?: number; // 1-5
  phone?: string;
  address?: string;
  url?: string;
  notes?: string;
}

interface PriceComparisonProps {
  /** The original quote (what user was told) */
  originalQuote: {
    shop: string;
    price: number;
    warranty?: string;
  };
  /** Alternative options found */
  alternatives: PriceOption[];
  /** What's being compared (e.g., "tire replacement") */
  serviceDescription: string;
  /** Show map integration */
  showMap?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * PriceComparison Component
 *
 * The heart of the Delta Tire scenario - shows users how much they can save
 * by comparing quotes from different shops.
 *
 * This component can save users hundreds of dollars in real-time.
 */
export function PriceComparison({
  originalQuote,
  alternatives,
  serviceDescription,
  showMap = false,
  isLoading = false,
}: PriceComparisonProps) {
  const [selectedOption, setSelectedOption] = useState<PriceOption | null>(null);

  // Calculate best savings
  const bestOption = alternatives.reduce((best, current) =>
    current.price < best.price ? current : best
  , alternatives[0]);

  const savings = originalQuote.price - (bestOption?.price || 0);
  const savingsPercent = ((savings / originalQuote.price) * 100).toFixed(0);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg border-2 border-marble-gray p-8">
        <div className="flex items-center justify-center gap-3 text-marble-gray">
          <div className="w-6 h-6 border-2 border-info-blue border-t-transparent rounded-full animate-spin" />
          <span>Searching for better prices nearby...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Savings Banner */}
      {savings > 0 && (
        <div className="bg-savings-green/10 border-2 border-savings-green rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-savings-green rounded-full flex items-center justify-center">
              <TrendingDown className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-mono text-xl font-bold text-notebook-black">
                You Could Save ${savings.toFixed(2)}
              </h3>
              <p className="text-sm text-marble-gray">
                That's {savingsPercent}% off the original quote for {serviceDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Original Quote */}
      <div className="bg-white rounded-lg border-2 border-warning-amber p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-warning-amber font-semibold uppercase tracking-wide mb-1">
              Original Quote
            </div>
            <h4 className="font-mono text-lg font-bold text-notebook-black">
              {originalQuote.shop}
            </h4>
            {originalQuote.warranty && (
              <p className="text-sm text-marble-gray mt-1">
                Warranty: {originalQuote.warranty}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="font-mono text-3xl font-bold text-warning-amber">
              ${originalQuote.price.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Options */}
      <div className="space-y-3">
        <h4 className="font-mono font-bold text-notebook-black flex items-center gap-2">
          <AlertCircle size={18} className="text-info-blue" />
          Better Options Found
        </h4>

        {alternatives.map((option, index) => {
          const optionSavings = originalQuote.price - option.price;
          const isSelected = selectedOption === option;
          const isBest = option === bestOption;

          return (
            <div
              key={index}
              onClick={() => setSelectedOption(option)}
              className={`
                bg-white rounded-lg border-2 p-4 cursor-pointer transition-all
                ${isSelected ? 'border-info-blue ring-2 ring-info-blue/20' : 'border-marble-gray hover:border-info-blue'}
                ${isBest ? 'bg-savings-green/5' : ''}
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-mono font-bold text-notebook-black">
                      {option.shop}
                    </h5>
                    {isBest && (
                      <span className="px-2 py-0.5 bg-savings-green text-white text-xs font-semibold rounded">
                        BEST PRICE
                      </span>
                    )}
                  </div>

                  {option.warranty && (
                    <p className="text-sm text-marble-gray mb-2">
                      Warranty: {option.warranty}
                    </p>
                  )}

                  {option.distance !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-marble-gray mb-1">
                      <MapPin size={14} />
                      {option.distance.toFixed(1)} miles away
                    </div>
                  )}

                  {option.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-warning-amber">★</span>
                      <span className="text-marble-gray">
                        {option.rating.toFixed(1)} / 5.0
                      </span>
                    </div>
                  )}

                  {option.notes && (
                    <p className="text-xs text-marble-gray mt-2 italic">
                      {option.notes}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-notebook-black">
                    ${option.price.toFixed(2)}
                  </div>
                  {optionSavings > 0 && (
                    <div className="text-sm font-semibold text-savings-green mt-1">
                      Save ${optionSavings.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {option.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={16} className="text-marble-gray mt-0.5 flex-shrink-0" />
                      <span className="text-notebook-black">{option.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    {option.phone && (
                      <a
                        href={`tel:${option.phone}`}
                        className="px-4 py-2 bg-info-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Call {option.phone}
                      </a>
                    )}

                    {option.url && (
                      <a
                        href={option.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border-2 border-marble-gray text-notebook-black bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        Visit Website
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {showMap && option.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(option.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border-2 border-marble-gray text-notebook-black bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <MapPin size={14} />
                        Get Directions
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {savings > 0 && (
        <div className="bg-notebook-white border-l-4 border-savings-green p-4 rounded">
          <p className="text-sm text-marble-gray">
            <strong className="text-notebook-black font-mono">Tireman's Advice:</strong> You could walk away from {originalQuote.shop} and save <strong className="text-savings-green">${savings.toFixed(2)}</strong> by going to {bestOption.shop}.
            {bestOption.distance !== undefined && ` It's only ${bestOption.distance.toFixed(1)} miles away.`}
          </p>
        </div>
      )}
    </div>
  );
}
