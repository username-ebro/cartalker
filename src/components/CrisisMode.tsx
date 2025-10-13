'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Check,
  DollarSign,
  Shield,
  MessageSquare,
  ChevronRight,
  Loader2,
  Car,
  Clock,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { VoiceInput } from './VoiceInput';

interface CrisisModeProps {
  onClose: () => void;
}

interface Vehicle {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  nickname: string | null;
}

interface TalkingPoint {
  type: 'question' | 'statement' | 'objection';
  text: string;
  tone: 'polite' | 'firm' | 'skeptical' | 'assertive';
  stage?: 'opening' | 'clarifying' | 'objecting' | 'negotiating' | 'closing';
  priority?: 'primary' | 'secondary';
}

interface PriceAnalysis {
  quotedPrice: number;
  typicalRange: { low: number; high: number };
  verdict: 'fair' | 'high' | 'excessive';
  savings?: number;
}

interface Legitimacy {
  isLegitimate: boolean;
  urgencyLevel: 'scam' | 'unnecessary' | 'can-wait' | 'soon' | 'overdue' | 'urgent' | 'safety-critical';
  confidence: number;
  scamLikelihood: number;
  reason: string;
  nextDueAt?: number;
  nextDueDate?: Date;
  talkingPoints: string[];
  flags: string[];
  priceAnalysis?: PriceAnalysis;
}

interface AnalysisResult {
  serviceType: string;
  serviceDescription?: string;
  vehicleInfo?: {
    make: string | null;
    model: string | null;
    year: number | null;
    currentMileage: number | null;
  };
  legitimacy: Legitimacy;
  talkingPoints: TalkingPoint[];
  recommendations: string[];
}

type UrgencyLevel = 'scam' | 'unnecessary' | 'can-wait' | 'soon' | 'overdue' | 'urgent' | 'safety-critical';

const urgencyColors: Record<UrgencyLevel, { bg: string; text: string; border: string }> = {
  'scam': { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' },
  'unnecessary': { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
  'can-wait': { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-500' },
  'soon': { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500' },
  'overdue': { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-600' },
  'urgent': { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' },
  'safety-critical': { bg: 'bg-red-700', text: 'text-red-700', border: 'border-red-700' }
};

const urgencyLabels: Record<UrgencyLevel, string> = {
  'scam': 'LIKELY SCAM',
  'unnecessary': 'UNNECESSARY',
  'can-wait': 'CAN WAIT',
  'soon': 'DUE SOON',
  'overdue': 'OVERDUE',
  'urgent': 'URGENT',
  'safety-critical': 'SAFETY CRITICAL'
};

export function CrisisMode({ onClose }: CrisisModeProps) {
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Demo vehicle fallback
  const DEMO_VEHICLE: Vehicle = {
    id: 'demo',
    make: 'Volkswagen',
    model: 'GTI',
    year: 2016,
    mileage: 85000,
    nickname: 'Demo Vehicle'
  };

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Focus trap
  useEffect(() => {
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      window.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => window.removeEventListener('keydown', handleTab);
    }
  }, [step]);

  async function loadVehicles() {
    try {
      const response = await fetch('/api/vehicles?userId=demo-user');
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setVehicles(data.data);
        setSelectedVehicleId(data.data[0].id);
      } else {
        // Use demo vehicle if no vehicles found
        setVehicles([DEMO_VEHICLE]);
        setSelectedVehicleId('demo');
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setVehicles([DEMO_VEHICLE]);
      setSelectedVehicleId('demo');
    } finally {
      setLoadingVehicles(false);
    }
  }

  async function handleAnalyze() {
    // Validation
    if (!serviceDescription.trim()) {
      setError('Please describe the service recommendation');
      return;
    }

    if (!selectedVehicleId) {
      setError('Please select a vehicle');
      return;
    }

    setError('');
    setStep('loading');

    try {
      const response = await fetch('/api/crisis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          serviceDescription: serviceDescription.trim(),
          quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.analysis);
      setStep('results');
    } catch (err) {
      console.error('Error analyzing service:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze service. Please try again.');
      setStep('input');
    }
  }

  function handleVoiceTranscriptChange(transcript: string) {
    setServiceDescription(transcript);
  }

  function handleReset() {
    setStep('input');
    setServiceDescription('');
    setQuotedPrice('');
    setAnalysisResult(null);
    setError('');
  }

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border-4 border-danger-red"
      >
        {/* Header - Sticky */}
        <div className="flex-shrink-0 bg-danger-red text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-2xl font-mono font-bold">Crisis Mode</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close Crisis Mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* INPUT SCREEN */}
          {step === 'input' && (
            <div className="p-6 space-y-6">
              {/* Vehicle Selector */}
              <div>
                <label className="block text-sm font-bold text-notebook-black mb-2 font-mono">
                  SELECT VEHICLE
                </label>
                {loadingVehicles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-marble-gray" />
                  </div>
                ) : (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-marble-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-danger-red text-lg font-medium"
                    style={{ minHeight: '44px' }}
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        {vehicle.mileage ? ` - ${vehicle.mileage.toLocaleString()} mi` : ''}
                        {vehicle.id === 'demo' ? ' (Demo)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Service Description - Voice or Text */}
              <div>
                <label className="block text-sm font-bold text-notebook-black mb-2 font-mono">
                  WHAT SERVICE DID THEY RECOMMEND?
                </label>

                {/* Voice Input */}
                <VoiceInput
                  onTranscriptChange={handleVoiceTranscriptChange}
                  placeholder="Tap to describe the service..."
                  className="mb-4"
                />

                {/* Manual Text Input */}
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Or type here: transmission flush, brake pads, coolant service, etc."
                  className="w-full px-4 py-3 border-2 border-marble-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-danger-red resize-none text-base"
                  rows={3}
                />
              </div>

              {/* Quoted Price (Optional) */}
              <div>
                <label className="block text-sm font-bold text-notebook-black mb-2 font-mono">
                  QUOTED PRICE (OPTIONAL)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-marble-gray w-5 h-5" />
                  <input
                    type="number"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 border-2 border-marble-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-danger-red text-lg"
                    style={{ minHeight: '44px' }}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!serviceDescription.trim() || !selectedVehicleId}
                className="w-full py-4 bg-danger-red text-white rounded-lg font-bold text-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg font-mono"
                style={{ minHeight: '56px' }}
              >
                ANALYZE NOW
              </button>

              {/* Help Text */}
              <div className="bg-blue-50 border-2 border-info-blue rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-info-blue flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Instant Analysis</p>
                    <p>I'll check if this service is legitimate, compare prices, and give you talking points to negotiate confidently.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOADING SCREEN */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <Loader2 className="w-16 h-16 text-danger-red animate-spin mb-6" />
              <h3 className="text-2xl font-mono font-bold text-notebook-black mb-2">
                Analyzing Service...
              </h3>
              <p className="text-marble-gray text-center">
                Checking maintenance records, price data, and scam indicators
              </p>
            </div>
          )}

          {/* RESULTS SCREEN */}
          {step === 'results' && analysisResult && (
            <div className="p-6 space-y-6">
              {/* Vehicle & Service Info */}
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-5 h-5 text-marble-gray" />
                  <h3 className="font-mono font-bold text-notebook-black">
                    {selectedVehicle?.nickname ||
                     `${selectedVehicle?.year} ${selectedVehicle?.make} ${selectedVehicle?.model}`}
                  </h3>
                </div>
                <p className="text-sm text-marble-gray">
                  Service: <span className="font-semibold">{analysisResult.serviceType}</span>
                  {selectedVehicle?.mileage && (
                    <> • {selectedVehicle.mileage.toLocaleString()} miles</>
                  )}
                </p>
              </div>

              {/* Urgency Badge */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`px-6 py-3 ${urgencyColors[analysisResult.legitimacy.urgencyLevel].bg} text-white rounded-lg font-mono font-bold text-lg shadow-lg`}>
                    {urgencyLabels[analysisResult.legitimacy.urgencyLevel]}
                  </div>
                  <div className="text-sm text-marble-gray">
                    {analysisResult.legitimacy.confidence}% confidence
                  </div>
                </div>

                {/* Scam Likelihood Meter */}
                {analysisResult.legitimacy.scamLikelihood > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning-amber" />
                    <div>
                      <p className="text-xs font-semibold text-marble-gray">SCAM LIKELIHOOD</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              analysisResult.legitimacy.scamLikelihood > 70 ? 'bg-red-600' :
                              analysisResult.legitimacy.scamLikelihood > 40 ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${analysisResult.legitimacy.scamLikelihood}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{analysisResult.legitimacy.scamLikelihood}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reason Explanation */}
              <div className={`border-l-4 ${urgencyColors[analysisResult.legitimacy.urgencyLevel].border} bg-gray-50 p-4 rounded-lg`}>
                <h4 className="font-mono font-bold text-notebook-black mb-2">Why?</h4>
                <p className="text-marble-gray">{analysisResult.legitimacy.reason}</p>
              </div>

              {/* Price Analysis */}
              {analysisResult.legitimacy.priceAnalysis && (
                <div className="bg-white border-2 border-marble-gray rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-savings-green" />
                    <h4 className="font-mono font-bold text-notebook-black">Price Analysis</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-marble-gray mb-1">Quoted Price</p>
                      <p className="text-lg font-bold text-notebook-black">
                        ${analysisResult.legitimacy.priceAnalysis.quotedPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-marble-gray mb-1">Typical Range</p>
                      <p className="text-lg font-bold text-notebook-black">
                        ${analysisResult.legitimacy.priceAnalysis.typicalRange.low} -
                        ${analysisResult.legitimacy.priceAnalysis.typicalRange.high}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-marble-gray mb-1">Verdict</p>
                      <div className="flex items-center gap-2">
                        {analysisResult.legitimacy.priceAnalysis.verdict === 'fair' && (
                          <>
                            <Check className="w-5 h-5 text-savings-green" />
                            <span className="font-bold text-savings-green">Fair</span>
                          </>
                        )}
                        {analysisResult.legitimacy.priceAnalysis.verdict === 'high' && (
                          <>
                            <TrendingUp className="w-5 h-5 text-warning-amber" />
                            <span className="font-bold text-warning-amber">High</span>
                          </>
                        )}
                        {analysisResult.legitimacy.priceAnalysis.verdict === 'excessive' && (
                          <>
                            <TrendingUp className="w-5 h-5 text-danger-red" />
                            <span className="font-bold text-danger-red">Excessive</span>
                          </>
                        )}
                      </div>
                    </div>
                    {analysisResult.legitimacy.priceAnalysis.savings && (
                      <div>
                        <p className="text-xs text-marble-gray mb-1">Potential Savings</p>
                        <p className="text-lg font-bold text-savings-green">
                          ${analysisResult.legitimacy.priceAnalysis.savings.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Flags */}
              {analysisResult.legitimacy.flags.length > 0 && (
                <div className="bg-amber-50 border-2 border-warning-amber rounded-lg p-4">
                  <h4 className="font-mono font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Warning Flags
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.legitimacy.flags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                        <span className="text-warning-amber font-bold mt-0.5">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Talking Points */}
              <div className="bg-white border-2 border-info-blue rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-info-blue" />
                  <h4 className="font-mono font-bold text-notebook-black">What To Say</h4>
                </div>
                <div className="space-y-3">
                  {analysisResult.talkingPoints.slice(0, 6).map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-info-blue flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-notebook-black">{point.text}</p>
                        <p className="text-xs text-marble-gray mt-1">
                          Tone: {point.tone}
                          {point.stage && ` • ${point.stage}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white border-2 border-savings-green rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-savings-green" />
                  <h4 className="font-mono font-bold text-notebook-black">Recommendations</h4>
                </div>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-marble-gray">
                      <Check className="w-4 h-4 text-savings-green flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Due Date */}
              {analysisResult.legitimacy.nextDueDate && (
                <div className="bg-gray-50 border-2 border-marble-gray rounded-lg p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-marble-gray" />
                  <div>
                    <p className="text-xs text-marble-gray">Next Due Date</p>
                    <p className="text-sm font-bold text-notebook-black">
                      {new Date(analysisResult.legitimacy.nextDueDate).toLocaleDateString()}
                      {analysisResult.legitimacy.nextDueAt &&
                        ` at ${analysisResult.legitimacy.nextDueAt.toLocaleString()} miles`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        {step === 'results' && (
          <div className="flex-shrink-0 bg-gray-50 border-t-2 border-gray-300 px-6 py-4 flex gap-3 flex-wrap">
            <button
              onClick={handleReset}
              className="flex-1 min-w-[200px] px-6 py-3 border-2 border-marble-gray text-notebook-black rounded-lg font-bold hover:bg-gray-100 transition-colors"
              style={{ minHeight: '48px' }}
            >
              Analyze Another
            </button>
            <button
              onClick={onClose}
              className="flex-1 min-w-[200px] px-6 py-3 bg-savings-green text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-md"
              style={{ minHeight: '48px' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
