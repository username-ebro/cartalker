import { IssuesList } from '@/components/IssuesList';

export default function IssuesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Issues</h1>
        <p className="mt-2 text-gray-600">
          Track and manage issues across all your vehicles.
        </p>
      </div>

      <IssuesList />
    </div>
  );
}