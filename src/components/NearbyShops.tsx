'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Star, ExternalLink } from 'lucide-react';

export interface ShopLocation {
  id: string;
  name: string;
  address: string;
  distance: number; // miles
  rating?: number;
  reviewCount?: number;
  phone?: string;
  hours?: string;
  specialty?: string; // "Tires", "General Repair", "Dealership", etc.
  priceLevel?: 1 | 2 | 3 | 4; // $ to $$$$
  lat?: number;
  lng?: number;
}

interface NearbyShopsProps {
  /** User's current location (or vehicle location) */
  userLocation?: {
    lat: number;
    lng: number;
  };
  /** Filter by shop specialty */
  specialty?: 'tires' | 'general' | 'dealership' | 'all';
  /** Maximum distance in miles */
  maxDistance?: number;
  /** Show map view */
  showMap?: boolean;
  /** Callback when shop is selected */
  onShopSelect?: (shop: ShopLocation) => void;
}

/**
 * NearbyShops Component
 *
 * Displays nearby auto shops with:
 * - Distance calculation
 * - Ratings & reviews
 * - Get directions link
 * - Call directly
 * - Optional map view
 *
 * Used in Delta Tire scenario to show alternative shops.
 */
export function NearbyShops({
  userLocation,
  specialty = 'all',
  maxDistance = 10,
  showMap = false,
  onShopSelect,
}: NearbyShopsProps) {
  const [shops, setShops] = useState<ShopLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<ShopLocation | null>(null);

  useEffect(() => {
    // Simulate fetching nearby shops
    // In production, this would call Google Places API or similar
    const mockShops: ShopLocation[] = [
      {
        id: '1',
        name: 'Costco Tire Center',
        address: '1234 Costco Way, Your City, ST 12345',
        distance: 2.3,
        rating: 4.5,
        reviewCount: 1247,
        phone: '(555) 123-4567',
        hours: 'Open until 8:30 PM',
        specialty: 'Tires',
        priceLevel: 2,
        lat: 40.7128,
        lng: -74.0060,
      },
      {
        id: '2',
        name: 'Discount Tire',
        address: '5678 Main St, Your City, ST 12345',
        distance: 3.1,
        rating: 4.3,
        reviewCount: 892,
        phone: '(555) 234-5678',
        hours: 'Open until 7:00 PM',
        specialty: 'Tires',
        priceLevel: 2,
        lat: 40.7148,
        lng: -74.0070,
      },
      {
        id: '3',
        name: 'Tire Rack Street',
        address: '9012 Oak Ave, Your City, ST 12345',
        distance: 4.7,
        rating: 4.7,
        reviewCount: 2341,
        phone: '(555) 345-6789',
        hours: 'Open until 6:00 PM',
        specialty: 'Tires',
        priceLevel: 3,
        lat: 40.7168,
        lng: -74.0080,
      },
    ];

    setTimeout(() => {
      setShops(mockShops.filter(shop => shop.distance <= maxDistance));
      setIsLoading(false);
    }, 1000);
  }, [userLocation, maxDistance]);

  const handleGetDirections = (shop: ShopLocation) => {
    const destination = encodeURIComponent(shop.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSelectShop = (shop: ShopLocation) => {
    setSelectedShop(shop);
    onShopSelect?.(shop);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg border-2 border-marble-gray p-8">
        <div className="flex items-center justify-center gap-3 text-marble-gray">
          <div className="w-6 h-6 border-2 border-info-blue border-t-transparent rounded-full animate-spin" />
          <span>Finding nearby shops...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-xl font-bold text-notebook-black flex items-center gap-2">
            <MapPin className="text-info-blue" size={24} />
            Nearby Shops
          </h3>
          <p className="text-sm text-marble-gray mt-1">
            Found {shops.length} shops within {maxDistance} miles
          </p>
        </div>
      </div>

      {/* Map View (Optional) */}
      {showMap && (
        <div className="bg-gray-200 rounded-lg border-2 border-marble-gray h-64 flex items-center justify-center">
          <div className="text-center text-marble-gray">
            <MapPin size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Map view coming soon</p>
            <p className="text-xs">(Google Maps API integration)</p>
          </div>
        </div>
      )}

      {/* Shop List */}
      <div className="space-y-3">
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => handleSelectShop(shop)}
            className={`
              bg-white rounded-lg border-2 p-4 cursor-pointer transition-all
              ${selectedShop?.id === shop.id
                ? 'border-info-blue ring-2 ring-info-blue/20'
                : 'border-marble-gray hover:border-info-blue'
              }
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Shop Name */}
                <h4 className="font-mono font-bold text-notebook-black mb-1">
                  {shop.name}
                </h4>

                {/* Address */}
                <p className="text-sm text-marble-gray mb-2">
                  {shop.address}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {/* Distance */}
                  <div className="flex items-center gap-1 text-info-blue">
                    <Navigation size={14} />
                    <span className="font-medium">{shop.distance.toFixed(1)} mi</span>
                  </div>

                  {/* Rating */}
                  {shop.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-warning-amber fill-warning-amber" />
                      <span className="font-medium text-notebook-black">
                        {shop.rating.toFixed(1)}
                      </span>
                      {shop.reviewCount && (
                        <span className="text-marble-gray">
                          ({shop.reviewCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Specialty */}
                  {shop.specialty && (
                    <span className="px-2 py-0.5 bg-info-blue/10 text-info-blue text-xs font-semibold rounded">
                      {shop.specialty}
                    </span>
                  )}

                  {/* Price Level */}
                  {shop.priceLevel && (
                    <span className="text-marble-gray">
                      {'$'.repeat(shop.priceLevel)}
                    </span>
                  )}
                </div>

                {/* Hours */}
                {shop.hours && (
                  <p className="text-xs text-marble-gray mt-2">
                    {shop.hours}
                  </p>
                )}
              </div>
            </div>

            {/* Actions (Expanded when selected) */}
            {selectedShop?.id === shop.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Get Directions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetDirections(shop);
                  }}
                  className="px-4 py-2 bg-info-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium shadow-md"
                >
                  <Navigation size={16} />
                  Get Directions
                </button>

                {/* Call */}
                {shop.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(shop.phone!);
                    }}
                    className="px-4 py-2 border-2 border-marble-gray text-notebook-black bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Phone size={16} />
                    Call {shop.phone}
                  </button>
                )}

                {/* View on Google Maps */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' ' + shop.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 border-2 border-marble-gray text-notebook-black bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <ExternalLink size={16} />
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {shops.length === 0 && (
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-8 text-center">
          <MapPin size={48} className="mx-auto mb-3 text-marble-gray opacity-50" />
          <p className="text-marble-gray">
            No shops found within {maxDistance} miles
          </p>
          <p className="text-sm text-marble-gray mt-2">
            Try increasing the search radius
          </p>
        </div>
      )}
    </div>
  );
}
