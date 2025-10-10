import { ChatInterface } from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Car Chat Assistant</h1>
        <p className="mt-2 text-gray-600">
          Ask questions about your vehicles, get maintenance advice, and troubleshoot issues.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}