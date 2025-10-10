export interface ParsedDocumentData {
  dates: DateMatch[];
  amounts: AmountMatch[];
  mileage: MileageMatch[];
  serviceTypes: ServiceTypeMatch[];
  businessInfo: BusinessInfoMatch[];
  confidence: number;
  summary: string;
}

export interface DateMatch {
  text: string;
  date: Date;
  confidence: number;
  context: string;
}

export interface AmountMatch {
  text: string;
  amount: number;
  currency: string;
  type: 'total' | 'labor' | 'parts' | 'tax' | 'other';
  confidence: number;
  context: string;
}

export interface MileageMatch {
  text: string;
  mileage: number;
  confidence: number;
  context: string;
}

export interface ServiceTypeMatch {
  text: string;
  serviceType: string;
  category: string;
  confidence: number;
  context: string;
}

export interface BusinessInfoMatch {
  name?: string;
  address?: string;
  phone?: string;
  confidence: number;
}

// Date patterns - various formats
const DATE_PATTERNS = [
  // MM/DD/YYYY, M/D/YYYY
  { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, format: 'US' },
  // DD/MM/YYYY, D/M/YYYY
  { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, format: 'EU' },
  // YYYY-MM-DD
  { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/g, format: 'ISO' },
  // Month DD, YYYY
  { regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi, format: 'US_LONG' },
  // DD Month YYYY
  { regex: /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi, format: 'EU_LONG' },
];

// Currency/amount patterns
const AMOUNT_PATTERNS = [
  // $123.45, $1,234.56
  { regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, type: 'USD' },
  // 123.45, 1,234.56 (when near money context)
  { regex: /(?:^|\s)(\d{1,3}(?:,\d{3})*\.\d{2})(?=\s|$)/g, type: 'NUMERIC' },
];

// Mileage patterns
const MILEAGE_PATTERNS = [
  // 123,456 miles, 50000 mi, 75K miles
  { regex: /(\d{1,3}(?:,\d{3})*)\s*(?:miles?|mi\.?)/gi },
  { regex: /(\d{1,3}(?:,\d{3})*)\s*(?:kilometers?|km\.?)/gi },
  { regex: /(\d{1,2}(?:\.\d)?)[kK]\s*(?:miles?|mi\.?)/gi }, // 75K miles
  // Odometer reading context
  { regex: /(?:odometer|mileage)[:\s]*(\d{1,3}(?:,\d{3})*)/gi },
];

// Service type mappings
const SERVICE_MAPPINGS = {
  'OIL_CHANGE': {
    keywords: ['oil change', 'oil service', 'lube', 'motor oil', 'engine oil', 'oil filter'],
    category: 'FLUIDS'
  },
  'BRAKE_PADS': {
    keywords: ['brake pad', 'brake shoe', 'brakes', 'brake service', 'brake repair'],
    category: 'BRAKES'
  },
  'TIRE_ROTATION': {
    keywords: ['tire rotation', 'rotate tires', 'tire service'],
    category: 'TIRES'
  },
  'TIRE_REPLACEMENT': {
    keywords: ['tire replacement', 'new tires', 'tire install', 'tire mount'],
    category: 'TIRES'
  },
  'BRAKE_FLUID': {
    keywords: ['brake fluid', 'brake fluid flush', 'brake fluid change'],
    category: 'BRAKES'
  },
  'AIR_FILTER': {
    keywords: ['air filter', 'engine air filter', 'cabin filter', 'cabin air filter'],
    category: 'FILTERS'
  },
  'SPARK_PLUGS': {
    keywords: ['spark plug', 'ignition', 'tune up', 'tune-up'],
    category: 'ENGINE'
  },
  'TRANSMISSION_SERVICE': {
    keywords: ['transmission', 'trans service', 'transmission fluid', 'trans fluid'],
    category: 'TRANSMISSION'
  },
  'COOLANT_FLUSH': {
    keywords: ['coolant', 'antifreeze', 'radiator flush', 'cooling system'],
    category: 'FLUIDS'
  },
  'BATTERY': {
    keywords: ['battery', 'battery replacement', 'battery test', 'battery service'],
    category: 'ELECTRICAL'
  },
  'INSPECTION': {
    keywords: ['inspection', 'safety inspection', 'emissions test', 'smog check'],
    category: 'INSPECTION'
  },
  'AC_SERVICE': {
    keywords: ['air conditioning', 'a/c service', 'ac repair', 'freon', 'refrigerant'],
    category: 'HVAC'
  },
  'WHEEL_ALIGNMENT': {
    keywords: ['alignment', 'wheel alignment', 'front end alignment'],
    category: 'SUSPENSION'
  }
};

// Business info patterns
const BUSINESS_PATTERNS = {
  phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
  address: /\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Way|Ln|Lane|Ct|Court)\b/gi,
};

export function parseDocumentText(text: string): ParsedDocumentData {
  const dates = extractDates(text);
  const amounts = extractAmounts(text);
  const mileage = extractMileage(text);
  const serviceTypes = extractServiceTypes(text);
  const businessInfo = extractBusinessInfo(text);

  // Calculate overall confidence
  const confidence = calculateOverallConfidence(dates, amounts, mileage, serviceTypes);

  // Generate summary
  const summary = generateSummary(dates, amounts, mileage, serviceTypes, businessInfo);

  return {
    dates,
    amounts,
    mileage,
    serviceTypes,
    businessInfo,
    confidence,
    summary
  };
}

function extractDates(text: string): DateMatch[] {
  const matches: DateMatch[] = [];

  for (const pattern of DATE_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(text)) !== null) {
      try {
        let date: Date;
        let confidence = 0.8;

        const context = getContext(text, match.index, match[0].length);

        switch (pattern.format) {
          case 'US':
            date = new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
            break;
          case 'EU':
            // Assume EU format if day > 12
            if (parseInt(match[1]) > 12) {
              date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
              confidence = 0.9;
            } else {
              date = new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
              confidence = 0.6; // Lower confidence due to ambiguity
            }
            break;
          case 'ISO':
            date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
            confidence = 0.95;
            break;
          case 'US_LONG':
          case 'EU_LONG':
            const monthMap: { [key: string]: number } = {
              jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
              jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
            };
            const monthStr = pattern.format === 'US_LONG' ? match[1] : match[2];
            const dayNum = pattern.format === 'US_LONG' ? parseInt(match[2]) : parseInt(match[1]);
            const yearNum = pattern.format === 'US_LONG' ? parseInt(match[3]) : parseInt(match[3]);

            date = new Date(yearNum, monthMap[monthStr.toLowerCase().substring(0, 3)], dayNum);
            confidence = 0.9;
            break;
          default:
            continue;
        }

        // Validate date is reasonable (not in future, not too old)
        const now = new Date();
        const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());

        if (date > now || date < tenYearsAgo) {
          confidence *= 0.5;
        }

        matches.push({
          text: match[0],
          date,
          confidence,
          context
        });
      } catch (error) {
        // Invalid date, skip
        continue;
      }
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

function extractAmounts(text: string): AmountMatch[] {
  const matches: AmountMatch[] = [];

  for (const pattern of AMOUNT_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(text)) !== null) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0) continue;

      const context = getContext(text, match.index, match[0].length).toLowerCase();
      const confidence = calculateAmountConfidence(amount, context);
      const type = determineAmountType(context);

      matches.push({
        text: match[0],
        amount,
        currency: pattern.type === 'USD' ? 'USD' : 'USD', // Default to USD
        type,
        confidence,
        context
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

function extractMileage(text: string): MileageMatch[] {
  const matches: MileageMatch[] = [];

  for (const pattern of MILEAGE_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(text)) !== null) {
      let mileageStr = match[1];
      let mileage: number;

      if (mileageStr.includes('K') || mileageStr.includes('k')) {
        mileage = parseFloat(mileageStr.replace(/[Kk]/g, '')) * 1000;
      } else {
        mileage = parseInt(mileageStr.replace(/,/g, ''));
      }

      if (isNaN(mileage) || mileage <= 0 || mileage > 500000) continue;

      const context = getContext(text, match.index, match[0].length);
      const confidence = calculateMileageConfidence(mileage, context);

      matches.push({
        text: match[0],
        mileage,
        confidence,
        context
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

function extractServiceTypes(text: string): ServiceTypeMatch[] {
  const matches: ServiceTypeMatch[] = [];
  const lowerText = text.toLowerCase();

  for (const [serviceType, config] of Object.entries(SERVICE_MAPPINGS)) {
    for (const keyword of config.keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        const context = getContext(text, match.index, match[0].length);
        const confidence = calculateServiceConfidence(keyword, context);

        matches.push({
          text: match[0],
          serviceType,
          category: config.category,
          confidence,
          context
        });
      }
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

function extractBusinessInfo(text: string): BusinessInfoMatch[] {
  const matches: BusinessInfoMatch[] = [];

  // Extract phone numbers
  let phoneMatch;
  const phoneRegex = new RegExp(BUSINESS_PATTERNS.phone.source, BUSINESS_PATTERNS.phone.flags);
  while ((phoneMatch = phoneRegex.exec(text)) !== null) {
    matches.push({
      phone: phoneMatch[0],
      confidence: 0.8
    });
  }

  // Extract addresses
  let addressMatch;
  const addressRegex = new RegExp(BUSINESS_PATTERNS.address.source, BUSINESS_PATTERNS.address.flags);
  while ((addressMatch = addressRegex.exec(text)) !== null) {
    matches.push({
      address: addressMatch[0],
      confidence: 0.7
    });
  }

  // Try to extract business name (simple heuristic)
  const lines = text.split('\n').slice(0, 5); // Check first 5 lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 3 && line.length < 50 &&
        /^[A-Z][A-Za-z\s&'.-]+$/.test(line) &&
        !line.match(/\d{1,2}\/\d{1,2}\/\d{4}/) && // Not a date
        !line.match(/\$\d+/) && // Not an amount
        i < 3) { // In first 3 lines
      matches.push({
        name: line,
        confidence: 0.6
      });
      break; // Only take the first potential business name
    }
  }

  return matches;
}

function getContext(text: string, index: number, length: number, contextSize: number = 50): string {
  const start = Math.max(0, index - contextSize);
  const end = Math.min(text.length, index + length + contextSize);
  return text.substring(start, end);
}

function calculateAmountConfidence(amount: number, context: string): number {
  let confidence = 0.5;

  // Higher confidence for reasonable service amounts
  if (amount >= 20 && amount <= 5000) confidence += 0.3;

  // Look for money-related context
  if (context.includes('total') || context.includes('amount')) confidence += 0.2;
  if (context.includes('labor') || context.includes('parts')) confidence += 0.15;
  if (context.includes('tax')) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

function determineAmountType(context: string): AmountMatch['type'] {
  if (context.includes('total') || context.includes('amount due')) return 'total';
  if (context.includes('labor') || context.includes('labour')) return 'labor';
  if (context.includes('parts') || context.includes('part')) return 'parts';
  if (context.includes('tax')) return 'tax';
  return 'other';
}

function calculateMileageConfidence(mileage: number, context: string): number {
  let confidence = 0.5;

  // Reasonable mileage range
  if (mileage >= 1000 && mileage <= 300000) confidence += 0.3;

  // Context clues
  if (context.toLowerCase().includes('odometer')) confidence += 0.2;
  if (context.toLowerCase().includes('mileage')) confidence += 0.15;

  return Math.min(confidence, 1.0);
}

function calculateServiceConfidence(keyword: string, context: string): number {
  let confidence = 0.6;

  // Longer keywords are more specific
  if (keyword.length > 10) confidence += 0.2;

  // Service-related context
  const lowerContext = context.toLowerCase();
  if (lowerContext.includes('service') || lowerContext.includes('repair')) confidence += 0.1;
  if (lowerContext.includes('replace') || lowerContext.includes('install')) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

function calculateOverallConfidence(
  dates: DateMatch[],
  amounts: AmountMatch[],
  mileage: MileageMatch[],
  serviceTypes: ServiceTypeMatch[]
): number {
  const weights = {
    dates: 0.25,
    amounts: 0.3,
    mileage: 0.2,
    serviceTypes: 0.25
  };

  const avgConfidence = (
    (dates[0]?.confidence || 0) * weights.dates +
    (amounts[0]?.confidence || 0) * weights.amounts +
    (mileage[0]?.confidence || 0) * weights.mileage +
    (serviceTypes[0]?.confidence || 0) * weights.serviceTypes
  );

  return Math.min(avgConfidence, 1.0);
}

function generateSummary(
  dates: DateMatch[],
  amounts: AmountMatch[],
  mileage: MileageMatch[],
  serviceTypes: ServiceTypeMatch[],
  businessInfo: BusinessInfoMatch[]
): string {
  const parts: string[] = [];

  if (serviceTypes.length > 0) {
    const topService = serviceTypes[0];
    parts.push(`${topService.serviceType.replace(/_/g, ' ').toLowerCase()}`);
  }

  if (dates.length > 0) {
    parts.push(`on ${dates[0].date.toLocaleDateString()}`);
  }

  if (mileage.length > 0) {
    parts.push(`at ${mileage[0].mileage.toLocaleString()} miles`);
  }

  if (amounts.length > 0) {
    const total = amounts.find(a => a.type === 'total') || amounts[0];
    parts.push(`for $${total.amount.toFixed(2)}`);
  }

  if (businessInfo.find(b => b.name)) {
    const business = businessInfo.find(b => b.name);
    parts.push(`at ${business!.name}`);
  }

  return parts.length > 0
    ? `Service record: ${parts.join(' ')}`
    : 'Document contains service-related information';
}