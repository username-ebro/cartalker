'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  placeholder?: string;
  autoStart?: boolean;
  className?: string;
}

type RecordingState = 'idle' | 'listening' | 'processing' | 'error';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceInput({
  onTranscriptChange,
  onFinalTranscript,
  placeholder = "Tap to describe the issue...",
  autoStart = false,
  className = ""
}: VoiceInputProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  // Keep callback refs up to date
  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onTranscriptChange, onFinalTranscript]);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setErrorMessage('Voice input is not supported in this browser. Try Chrome or Safari.');
      return;
    }

    // Initialize recognition
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState('listening');
      isListeningRef.current = true;
      setErrorMessage('');
    };

    recognition.onend = () => {
      setState('idle');
      isListeningRef.current = false;

      // Call final transcript callback if provided
      setTranscript((currentTranscript) => {
        if (onFinalTranscriptRef.current && currentTranscript) {
          onFinalTranscriptRef.current(currentTranscript);
        }
        return currentTranscript;
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalText += transcriptText + ' ';
        } else {
          interimText += transcriptText;
        }
      }

      if (finalText) {
        setTranscript((prevTranscript) => {
          const newTranscript = prevTranscript + finalText;
          onTranscriptChangeRef.current(newTranscript);
          return newTranscript;
        });
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);

      let userMessage = '';

      switch (event.error) {
        case 'not-allowed':
          userMessage = 'Microphone access denied. Please enable microphone permissions in your browser settings.';
          break;
        case 'no-speech':
          userMessage = 'No speech detected. Try speaking closer to your microphone.';
          break;
        case 'audio-capture':
          userMessage = 'No microphone found. Please connect a microphone and try again.';
          break;
        case 'network':
          userMessage = 'Network error. Check your internet connection.';
          break;
        case 'aborted':
          // User stopped recording, not an error
          userMessage = '';
          break;
        default:
          userMessage = `Error: ${event.error}. Please try again.`;
      }

      if (userMessage) {
        setErrorMessage(userMessage);
        setState('error');
      } else {
        setState('idle');
      }

      isListeningRef.current = false;
    };

    recognitionRef.current = recognition;

    // Auto-start if requested
    if (autoStart) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error auto-starting recognition:', error);
      }
    }

    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [autoStart]); // Only run once on mount or when autoStart changes

  const startListening = () => {
    if (!recognitionRef.current || isListeningRef.current) return;

    try {
      setTranscript('');
      setInterimTranscript('');
      setErrorMessage('');
      setState('listening');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setErrorMessage('Failed to start voice input. Please try again.');
      setState('error');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListeningRef.current) return;

    try {
      recognitionRef.current.stop();
      setState('processing');
    } catch (error) {
      console.error('Error stopping recognition:', error);
      setState('idle');
    }
  };

  const toggleListening = () => {
    if (state === 'listening') {
      stopListening();
    } else if (state === 'idle' || state === 'error') {
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    onTranscriptChange('');
    if (state === 'listening') {
      stopListening();
    }
  };

  // Get combined display text
  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  // Browser not supported - show fallback
  if (!isSupported) {
    return (
      <div className={`p-4 bg-amber-50 border-2 border-amber-200 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">Voice input not supported</p>
            <p className="text-xs text-amber-700 mt-1">
              {errorMessage || 'Please use Chrome or Safari for voice input, or type your issue manually.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Voice Input Button */}
      <button
        onClick={toggleListening}
        disabled={state === 'processing'}
        className={`
          w-full min-h-[120px] rounded-lg border-2 transition-all duration-200
          flex flex-col items-center justify-center gap-3 p-6
          ${state === 'listening'
            ? 'bg-red-50 border-red-400 shadow-lg'
            : state === 'error'
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md active:scale-98'
          }
          ${state === 'processing' ? 'cursor-wait opacity-75' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        style={{ minHeight: '120px', minWidth: '44px' }}
        aria-label={state === 'listening' ? 'Stop recording' : 'Start voice input'}
      >
        {/* Icon */}
        <div className={`
          p-4 rounded-full transition-all duration-200
          ${state === 'listening'
            ? 'bg-red-500 animate-pulse'
            : state === 'processing'
            ? 'bg-blue-500'
            : 'bg-gray-800'
          }
        `}>
          {state === 'listening' ? (
            <Mic className="w-8 h-8 text-white" strokeWidth={2} />
          ) : state === 'processing' ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" strokeWidth={2} />
          ) : state === 'error' ? (
            <MicOff className="w-8 h-8 text-amber-600" strokeWidth={2} />
          ) : (
            <Mic className="w-8 h-8 text-white" strokeWidth={2} />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className={`
            font-semibold text-base
            ${state === 'listening' ? 'text-red-700' : state === 'error' ? 'text-amber-700' : 'text-gray-700'}
          `}>
            {state === 'listening' && 'Listening...'}
            {state === 'idle' && 'Tap to Speak'}
            {state === 'processing' && 'Processing...'}
            {state === 'error' && 'Try Again'}
          </p>
          {state === 'idle' && (
            <p className="text-xs text-gray-500 mt-1">{placeholder}</p>
          )}
          {state === 'listening' && (
            <p className="text-xs text-red-600 mt-1">Tap again to stop</p>
          )}
        </div>
      </button>

      {/* Transcript Display */}
      {displayText && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-xs font-medium text-blue-900">Transcript:</p>
            <button
              onClick={clearTranscript}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          </div>
          <p className="text-sm text-gray-900">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 italic"> {interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {/* Error Display */}
      {errorMessage && state === 'error' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">Voice input error</p>
              <p className="text-xs text-amber-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
