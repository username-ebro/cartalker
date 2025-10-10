'use client';

import { useState } from 'react';
import { Search, AlertTriangle, DollarSign, Wrench } from 'lucide-react';
import { lookupCode, generateCodeSummary, isMisfireCode, CheckEngineCode } from '@/utils/checkEngineCodes';

export function CheckEngineCodeLookup() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CheckEngineCode | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = () => {
    const normalizedCode = code.toUpperCase().trim();
    const codeInfo = lookupCode(normalizedCode);

    if (codeInfo) {
      setResult(codeInfo);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const getUrgencyColor = (urgency: CheckEngineCode['urgency']) => {
    switch (urgency) {
      case 'critical': return 'danger-red';
      case 'high': return 'warning-amber';
      case 'medium': return 'info-blue';
      case 'low': return 'marble-gray';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Input */}
      <div className="bg-white rounded-lg border-2 border-marble-gray p-6">
        <h3 className="font-mono text-xl font-bold text-notebook-black mb-4">
          Check Engine Code Lookup
        </h3>

        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Enter code (e.g., P0420)"
            className="flex-1 px-4 py-3 border-2 border-marble-gray rounded-lg focus:border-info-blue focus:outline-none font-mono uppercase"
          />
          <button
            onClick={handleLookup}
            disabled={!code.trim()}
            className="px-6 py-3 bg-tire-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
          >
            <Search size={20} />
            Lookup
          </button>
        </div>

        <p className="text-sm text-marble-gray mt-3">
          Enter your OBD-II diagnostic code to get instant advice and cost estimates
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg border-2 border-marble-gray p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className={`flex items-start justify-between pb-4 border-b-2 border-${getUrgencyColor(result.urgency)}`}>
            <div className="flex-1">
              <h4 className="font-mono text-2xl font-bold text-notebook-black mb-2">
                {result.code}
              </h4>
              <p className="text-lg text-marble-gray">
                {result.description}
              </p>
            </div>
            <div className={`px-4 py-2 bg-${getUrgencyColor(result.urgency)}/10 border-2 border-${getUrgencyColor(result.urgency)} rounded-lg`}>
              <p className={`text-sm font-bold text-${getUrgencyColor(result.urgency)} uppercase`}>
                {result.urgency}
              </p>
            </div>
          </div>

          {/* Driveable Status */}
          <div className={`p-4 rounded-lg ${result.driveable ? 'bg-savings-green/10 border-2 border-savings-green' : 'bg-danger-red/10 border-2 border-danger-red'}`}>
            <p className={`font-semibold ${result.driveable ? 'text-savings-green' : 'text-danger-red'}`}>
              {result.driveable ? '✅ Safe to drive' : '⛔ Do not drive - tow to shop'}
            </p>
            {isMisfireCode(result.code) && (
              <p className="text-sm text-danger-red mt-2">
                ⚠️ If check engine light is FLASHING, stop immediately (catalytic converter damage risk)
              </p>
            )}
          </div>

          {/* Cost Estimate */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <DollarSign className="text-info-blue" size={24} />
            <div>
              <p className="text-sm text-marble-gray">Estimated Repair Cost</p>
              <p className="font-mono text-xl font-bold text-notebook-black">
                ${result.estimatedCost.min} - ${result.estimatedCost.max}
              </p>
            </div>
          </div>

          {/* Possible Causes */}
          <div>
            <h5 className="font-mono font-bold text-notebook-black mb-2 flex items-center gap-2">
              <Wrench size={18} />
              Possible Causes
            </h5>
            <ul className="space-y-1">
              {result.possibleCauses.map((cause, i) => (
                <li key={i} className="text-sm text-marble-gray pl-6 relative">
                  <span className="absolute left-0">•</span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* Symptoms */}
          <div>
            <h5 className="font-mono font-bold text-notebook-black mb-2">Common Symptoms</h5>
            <div className="flex flex-wrap gap-2">
              {result.symptoms.map((symptom, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-info-blue/10 text-info-blue text-sm rounded-full border border-info-blue"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Action */}
          <div className="p-4 bg-yellow-highlight/30 border-l-4 border-warning-amber rounded">
            <h5 className="font-mono font-bold text-notebook-black mb-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning-amber" />
              Recommended Action
            </h5>
            <p className="text-sm text-notebook-black">
              {result.recommendedAction}
            </p>
          </div>

          {/* System */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-marble-gray">
              System: {result.system}
            </p>
          </div>
        </div>
      )}

      {/* Not Found */}
      {notFound && (
        <div className="bg-white rounded-lg border-2 border-marble-gray p-6 text-center animate-in fade-in duration-300">
          <AlertTriangle className="mx-auto text-warning-amber mb-3" size={48} />
          <h4 className="font-mono font-bold text-notebook-black mb-2">
            Code Not in Database
          </h4>
          <p className="text-marble-gray mb-4">
            We don't have information for code "{code.toUpperCase()}" yet.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-notebook-black mb-3">
              <strong>Next Steps:</strong>
            </p>
            <ul className="space-y-2 text-sm text-marble-gray">
              <li>• Get it diagnosed at AutoZone, O'Reilly's, or Advance Auto (free code reading)</li>
              <li>• Search online: "{code.toUpperCase()} [your car make/model]"</li>
              <li>• Ask Tireman in the chat for general advice</li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      {!result && !notFound && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-marble-gray mb-3">
            <strong>Try these common codes:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {['P0420', 'P0300', 'P0171', 'P0442'].map(exampleCode => (
              <button
                key={exampleCode}
                onClick={() => {
                  setCode(exampleCode);
                  setResult(lookupCode(exampleCode));
                  setNotFound(false);
                }}
                className="px-3 py-1 bg-white border border-marble-gray rounded text-sm text-notebook-black hover:bg-gray-100 transition-colors"
              >
                {exampleCode}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
