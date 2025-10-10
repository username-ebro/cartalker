'use client';

import { useState } from 'react';
import { VoiceInput } from './VoiceInput';

/**
 * Example usage of the VoiceInput component
 * This shows how to integrate voice input into a form or issue reporting flow
 */
export function VoiceInputExample() {
  const [issueDescription, setIssueDescription] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<string[]>([]);

  const handleTranscriptChange = (transcript: string) => {
    // This gets called in real-time as the user speaks
    setIssueDescription(transcript);
  };

  const handleFinalTranscript = (transcript: string) => {
    // This gets called when the user stops recording
    console.log('Final transcript:', transcript);

    // You could auto-save here, or trigger form validation
    if (transcript.trim()) {
      setSavedTranscripts(prev => [...prev, transcript]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!issueDescription.trim()) {
      alert('Please describe the issue');
      return;
    }

    // Here you would normally submit to your API
    console.log('Submitting issue:', issueDescription);
    alert(`Issue submitted: "${issueDescription}"`);

    // Reset form
    setIssueDescription('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Report Car Issue
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voice Input Component */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the issue (voice or text)
            </label>

            <VoiceInput
              onTranscriptChange={handleTranscriptChange}
              onFinalTranscript={handleFinalTranscript}
              placeholder="Describe what's wrong with your car..."
            />
          </div>

          {/* Manual Text Input (Fallback/Edit) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or type it manually
            </label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="e.g., My brakes are squeaking when I stop..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!issueDescription.trim()}
          >
            Submit Issue
          </button>
        </form>

        {/* Previous Transcripts (Debug/Demo) */}
        {savedTranscripts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Previous Transcripts
            </h3>
            <div className="space-y-2">
              {savedTranscripts.map((transcript, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700"
                >
                  {transcript}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
