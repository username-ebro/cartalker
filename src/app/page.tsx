import { VehiclesGrid } from '@/components/VehiclesGrid';
import Image from 'next/image';
import Link from 'next/link';
import { DollarSign, Shield, FileText, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section with Tireman */}
      <div className="mb-12 bg-white rounded-lg border-2 border-notebook-black p-8 shadow-lg border-l-4 border-l-margin-red">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Tireman Mascot */}
          <div className="flex-shrink-0">
            <Image
              src="/mascot/tireman-mascot.svg"
              alt="Tireman - Your Car Advisor"
              width={120}
              height={120}
              className="animate-in fade-in duration-500"
            />
          </div>

          {/* Welcome Message */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-mono font-bold text-notebook-black mb-3">
              Hey, I'm Tireman! 👋
            </h1>
            <p className="text-lg text-marble-gray mb-4">
              Your friendly car advisor. I help you save money, avoid scams, and keep your vehicles running smoothly.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-savings-green/10 text-savings-green text-sm font-semibold rounded-full border border-savings-green">
                💰 Save Money
              </span>
              <span className="px-3 py-1 bg-info-blue/10 text-info-blue text-sm font-semibold rounded-full border border-info-blue">
                🛡️ Warranty Help
              </span>
              <span className="px-3 py-1 bg-warning-amber/10 text-warning-amber text-sm font-semibold rounded-full border border-warning-amber">
                🗂️ Digital File Cabinet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Link
          href="/chat"
          className="bg-white rounded-lg border-2 border-marble-gray p-6 hover:border-info-blue hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-info-blue/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-info-blue/20 transition-colors">
            <MessageCircle className="text-info-blue" size={24} />
          </div>
          <h3 className="font-mono font-bold text-notebook-black mb-2">Ask Tireman</h3>
          <p className="text-sm text-marble-gray">Get instant advice about your car issues</p>
        </Link>

        <Link
          href="/maintenance"
          className="bg-white rounded-lg border-2 border-marble-gray p-6 hover:border-savings-green hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-savings-green/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-savings-green/20 transition-colors">
            <DollarSign className="text-savings-green" size={24} />
          </div>
          <h3 className="font-mono font-bold text-notebook-black mb-2">Save Money</h3>
          <p className="text-sm text-marble-gray">Compare prices & avoid overcharges</p>
        </Link>

        <Link
          href="/documents"
          className="bg-white rounded-lg border-2 border-marble-gray p-6 hover:border-warning-amber hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-warning-amber/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-warning-amber/20 transition-colors">
            <FileText className="text-warning-amber" size={24} />
          </div>
          <h3 className="font-mono font-bold text-notebook-black mb-2">Documents</h3>
          <p className="text-sm text-marble-gray">Store receipts & service records</p>
        </Link>

        <Link
          href="/issues"
          className="bg-white rounded-lg border-2 border-marble-gray p-6 hover:border-danger-red hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-danger-red/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-danger-red/20 transition-colors">
            <Shield className="text-danger-red" size={24} />
          </div>
          <h3 className="font-mono font-bold text-notebook-black mb-2">Check Recalls</h3>
          <p className="text-sm text-marble-gray">Safety recalls & warranty info</p>
        </Link>
      </div>

      {/* Vehicles Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-mono font-bold text-notebook-black">My Garage</h2>
            <p className="mt-2 text-marble-gray">
              Track your vehicles, maintenance records, and issues all in one place.
            </p>
          </div>
          <Link
            href="/vehicles/add"
            className="px-6 py-3 bg-tire-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md font-medium"
          >
            + Add Vehicle
          </Link>
        </div>

        <VehiclesGrid />
      </div>
    </div>
  );
}
