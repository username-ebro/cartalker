'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { InlineRating } from './RatingButton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  rating?: 'up' | 'down' | null;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Tireman, your car advisor. I can help you save money, avoid scams, and make smart decisions about your vehicles. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useVoice, setUseVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response for MVP
      // In production, this would call OpenAI API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantResponse = generateMockResponse(input.trim());

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('oil change')) {
      return "Oil changes are typically needed every 5,000-7,500 miles for conventional oil, or 7,500-10,000 miles for synthetic oil. Check your owner's manual for specific recommendations. For your VW GTI, synthetic oil is recommended every 10,000 miles or 1 year.";
    }

    if (lowerInput.includes('brake')) {
      return "Brake pads typically last 25,000-70,000 miles depending on your driving habits. Signs you need new brake pads include: squealing sounds, grinding noises, reduced braking performance, or vibration when braking. Have them inspected if you notice any of these symptoms.";
    }

    if (lowerInput.includes('tire')) {
      return "Tires should be rotated every 5,000-8,000 miles to ensure even wear. Check tire pressure monthly - it should match the PSI listed on your driver's door jamb. Replace tires when tread depth reaches 2/32 of an inch (use the penny test!).";
    }

    if (lowerInput.includes('maintenance') || lowerInput.includes('service')) {
      return "Regular maintenance is key to vehicle longevity! Follow your manufacturer's maintenance schedule for oil changes, filter replacements, fluid checks, and inspections. I can help you track these in your CarTalker maintenance log.";
    }

    if (lowerInput.includes('check engine')) {
      return "A check engine light can indicate various issues - from a loose gas cap to serious engine problems. I recommend getting it diagnosed with an OBD-II scanner first. Common causes include oxygen sensor issues, catalytic converter problems, or spark plug issues.";
    }

    if (lowerInput.includes('wrangler') || lowerInput.includes('jeep')) {
      return "Jeep Wranglers are known for their off-road capability! Common maintenance items include checking the transfer case fluid, inspecting suspension components after off-roading, and keeping up with oil changes. The 3.6L V6 is generally reliable with proper maintenance.";
    }

    if (lowerInput.includes('volkswagen') || lowerInput.includes('vw') || lowerInput.includes('gti')) {
      return "VW GTIs are great performance cars! Key maintenance items include: using high-quality synthetic oil, replacing the carbon cleaning system regularly, checking the timing chain tensioner, and maintaining the turbocharger. DSG transmission fluid should be changed every 40,000 miles.";
    }

    return "That's a great question! For specific vehicle advice, I'd recommend checking your owner's manual or consulting with a qualified mechanic. I can help you track maintenance records and remind you of upcoming services in your CarTalker dashboard.";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 p-4 border-b-2 border-marble-gray bg-notebook-white">
        <img
          src="/mascot/tireman-mascot.svg"
          alt="Tireman"
          className="w-10 h-10"
        />
        <div>
          <h3 className="text-lg font-mono font-bold text-notebook-black">Tireman</h3>
          <p className="text-sm text-marble-gray">Your car-savvy advisor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-xs lg:max-w-md ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-600 ml-2' : 'bg-gray-300 mr-2'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-tire-black text-white'
                      : 'bg-gray-100 text-notebook-black border border-marble-gray'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <p className="text-xs text-marble-gray">
                    {formatTime(message.timestamp)}
                  </p>
                  {message.role === 'assistant' && (
                    <InlineRating
                      value={message.rating}
                      onChange={(rating) => {
                        setMessages(prev =>
                          prev.map(m =>
                            m.id === message.id ? { ...m, rating } : m
                          )
                        );
                      }}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 p-4">
        {!useVoice ? (
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about maintenance, troubleshooting, or car advice..."
              className="flex-1 px-4 py-2 border-2 border-marble-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-info-blue focus:border-info-blue"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setUseVoice(true)}
              className="px-4 py-2 border-2 border-marble-gray text-notebook-black bg-white rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-tire-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info-blue disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <VoiceInput
              onTranscriptChange={(text) => setInput(text)}
              onFinalTranscript={(text) => {
                setInput(text);
                setUseVoice(false);
              }}
              placeholder="Tap to speak your question..."
            />
            <button
              onClick={() => setUseVoice(false)}
              className="text-sm text-marble-gray hover:text-notebook-black transition-colors"
            >
              ← Back to typing
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setInput("When should I change my oil?")}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            disabled={isLoading}
          >
            Oil change timing
          </button>
          <button
            onClick={() => setInput("How often should I rotate my tires?")}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            disabled={isLoading}
          >
            Tire rotation
          </button>
          <button
            onClick={() => setInput("What does a check engine light mean?")}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            disabled={isLoading}
          >
            Check engine light
          </button>
        </div>
      </div>
    </div>
  );
}