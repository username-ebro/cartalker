/**
 * Demo Data for Testing Scenarios
 *
 * Realistic data for demonstrating CarTalker features to friends
 */

import { PriceOption } from '@/components/PriceComparison';
import { ShopLocation } from '@/components/NearbyShops';

/**
 * Delta Tire Scenario - $380 Savings
 * User at Delta Tire gets $1,200 quote for tire replacement
 */
export const DELTA_TIRE_SCENARIO = {
  original: {
    shop: 'Delta Tire',
    price: 1200,
    warranty: '2-year road hazard protection included'
  },
  alternatives: [
    {
      shop: 'Costco Tire Center',
      price: 820,
      warranty: '5-year prorated warranty',
      distance: 2.3,
      rating: 4.5,
      phone: '(555) 123-4567',
      address: '1234 Costco Way, Your City, ST 12345',
      url: 'https://costco.com',
      notes: 'Requires Costco membership ($60/year)'
    },
    {
      shop: 'Discount Tire',
      price: 950,
      warranty: '3-year road hazard warranty',
      distance: 3.7,
      rating: 4.6,
      phone: '(555) 234-5678',
      address: '5678 Main St, Your City, ST 12345',
      url: 'https://discounttire.com',
      notes: 'Free tire rotation for life'
    },
    {
      shop: "Sam's Club Tire & Battery",
      price: 840,
      warranty: '5-year road hazard protection',
      distance: 4.2,
      rating: 4.3,
      phone: '(555) 345-6789',
      address: '9012 Oak Ave, Your City, ST 12345',
      url: 'https://samsclub.com',
      notes: "Requires Sam's Club membership ($50/year)"
    }
  ] as PriceOption[]
};

/**
 * Oil Change Scam Scenario
 * Jiffy Lube recommending 5 services, 3 unnecessary
 */
export const OIL_CHANGE_SCAM_SCENARIO = {
  shop: 'Jiffy Lube',
  recommendations: [
    { service: 'Oil Change', price: 55, necessary: true },
    { service: 'Transmission Flush', price: 180, necessary: false, reason: 'Done 8k miles ago' },
    { service: 'Engine Flush', price: 120, necessary: false, reason: 'Not recommended by manufacturer' },
    { service: 'Cabin Air Filter', price: 45, necessary: false, reason: '$10 on Amazon, 2-min DIY' },
    { service: 'Fuel Injector Cleaning', price: 150, necessary: false, reason: 'Not needed unless symptoms' }
  ],
  totalCost: 550,
  necessaryCost: 55,
  savings: 495
};

/**
 * Phil Scenario - Parts Markup
 * Dealership charging $1,200 for part that costs $600 online
 */
export const PHIL_PARTS_SCENARIO = {
  part: 'Catalytic Converter',
  dealership: {
    name: 'Honda Dealership',
    partPrice: 1200,
    laborPrice: 400,
    total: 1600
  },
  online: {
    source: 'RockAuto',
    partPrice: 600,
    url: 'https://rockauto.com',
    oem: true
  },
  laborOnly: {
    estimatedLabor: 400,
    totalWithOwnPart: 1000
  },
  savings: 600
};

/**
 * Nearby Auto Shops - Various specialties
 */
export const NEARBY_SHOPS: ShopLocation[] = [
  {
    id: '1',
    name: 'Delta Tire',
    address: '123 Main St, Your City, ST 12345',
    distance: 1.2,
    rating: 4.2,
    reviewCount: 487,
    phone: '(555) 111-2222',
    hours: 'Open until 7:00 PM',
    specialty: 'Tires',
    priceLevel: 3,
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: '2',
    name: 'Costco Tire Center',
    address: '456 Costco Blvd, Your City, ST 12345',
    distance: 2.3,
    rating: 4.5,
    reviewCount: 1247,
    phone: '(555) 222-3333',
    hours: 'Open until 8:30 PM',
    specialty: 'Tires',
    priceLevel: 2,
    lat: 40.7148,
    lng: -74.0070
  },
  {
    id: '3',
    name: "Joe's Auto Repair",
    address: '789 Oak Ave, Your City, ST 12345',
    distance: 1.8,
    rating: 4.8,
    reviewCount: 892,
    phone: '(555) 333-4444',
    hours: 'Open until 6:00 PM',
    specialty: 'General Repair',
    priceLevel: 2,
    lat: 40.7108,
    lng: -74.0050
  },
  {
    id: '4',
    name: 'Honda Dealership Service',
    address: '321 Dealer Dr, Your City, ST 12345',
    distance: 3.5,
    rating: 4.1,
    reviewCount: 654,
    phone: '(555) 444-5555',
    hours: 'Open until 5:00 PM',
    specialty: 'Dealership',
    priceLevel: 4,
    lat: 40.7168,
    lng: -74.0080
  },
  {
    id: '5',
    name: 'Brake Masters',
    address: '987 Brake Ln, Your City, ST 12345',
    distance: 2.9,
    rating: 4.6,
    reviewCount: 1053,
    phone: '(555) 555-6666',
    hours: 'Open until 7:00 PM',
    specialty: 'Brakes',
    priceLevel: 2,
    lat: 40.7138,
    lng: -74.0065
  }
];

/**
 * Check Engine Code Scenarios
 */
export const CHECK_ENGINE_SCENARIOS = [
  {
    code: 'P0420',
    userStory: 'Check engine light came on yesterday, no performance issues',
    expectedAdvice: 'Catalyst efficiency - not urgent, likely O2 sensor ($200-400) not cat ($800-2000)',
    urgency: 'low'
  },
  {
    code: 'P0300',
    userStory: 'Engine shaking, light is FLASHING',
    expectedAdvice: 'STOP DRIVING - Flashing light = catalytic converter damage risk',
    urgency: 'critical'
  },
  {
    code: 'P0442',
    userStory: 'Light came on after filling gas',
    expectedAdvice: 'Try tightening gas cap first ($0), clear code, see if returns',
    urgency: 'low'
  }
];

/**
 * Warranty Scenario
 * User's car has issue that should be covered
 */
export const WARRANTY_SCENARIO = {
  vehicle: {
    year: 2023,
    make: 'Honda',
    model: 'Accord',
    purchaseDate: '2023-03-15',
    currentMileage: 28000,
    warrantyType: 'Powertrain',
    warrantyExpiration: {
      years: 5,
      miles: 60000,
      expirationDate: '2028-03-15'
    }
  },
  issue: {
    description: 'Transmission slipping when accelerating',
    component: 'Transmission',
    isCoveredByPowertrain: true,
    dealerQuote: 2400,
    actualCost: 0 // covered by warranty
  },
  emailTemplate: {
    subject: 'Warranty Coverage Verification - Transmission Issue',
    scenario: 'warranty-claim'
  }
};

/**
 * Receipt Data Examples
 */
export const RECEIPT_EXAMPLES = [
  {
    date: '2025-10-01',
    service: 'Oil Change & Tire Rotation',
    mileage: 45234,
    cost: 75,
    shop: 'Delta Tire',
    extractedCorrectly: true
  },
  {
    date: '2025-09-15',
    service: 'Brake Pad Replacement',
    mileage: 44800,
    cost: 320,
    shop: "Joe's Auto Repair",
    extractedCorrectly: true
  },
  {
    // OCR error example - needs validation
    date: '2025-08-20',
    service: 'Oil Change', // OCR read "0il Change"
    mileage: 44200, // OCR read "44Z00"
    cost: 65,
    shop: 'Jiffy Lube',
    extractedCorrectly: false,
    ocrErrors: ['Service name had typo', 'Mileage had OCR error']
  }
];

/**
 * Helper function to get scenario by name
 */
export function getScenario(name: string) {
  switch (name.toLowerCase()) {
    case 'delta-tire':
    case 'delta':
      return DELTA_TIRE_SCENARIO;
    case 'phil':
    case 'parts-markup':
      return PHIL_PARTS_SCENARIO;
    case 'oil-change-scam':
    case 'jiffy-lube':
      return OIL_CHANGE_SCAM_SCENARIO;
    case 'warranty':
      return WARRANTY_SCENARIO;
    default:
      return null;
  }
}
