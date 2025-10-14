/**
 * Context-Aware Talking Points Generator
 *
 * Generates empowering, polite, and effective talking points for
 * negotiating with mechanics about service recommendations.
 *
 * Based on legitimacy analysis and pricing data.
 */

import { ServiceCheck } from './serviceIntervals';

export interface TalkingPoint {
  type: 'question' | 'statement' | 'objection' | 'negotiation' | 'education';
  text: string;
  tone: 'polite' | 'firm' | 'skeptical' | 'assertive' | 'educational';
  context?: string; // when to use this
  priority: 'primary' | 'secondary' | 'backup';
}

export interface TalkingPointsSet {
  opening: TalkingPoint[];
  clarifying: TalkingPoint[];
  objecting: TalkingPoint[];
  negotiating: TalkingPoint[];
  closing: TalkingPoint[];
  emergencyExit?: TalkingPoint[]; // if feeling pressured
}

/**
 * Generate comprehensive talking points based on service legitimacy check
 */
export function generateTalkingPoints(
  serviceCheck: ServiceCheck,
  serviceType: string,
  quotedPrice?: number,
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    mileage: number;
  }
): TalkingPointsSet {
  const { urgencyLevel, reason, flags, scamLikelihood = 0 } = serviceCheck;

  // Determine overall strategy
  const isScammy = scamLikelihood > 60 || urgencyLevel === 'scam';
  const isLegitimate = urgencyLevel === 'urgent' || urgencyLevel === 'overdue' || urgencyLevel === 'safety-critical';
  const isPriceHigh = !!(quotedPrice && serviceCheck.estimatedFairPrice &&
    quotedPrice > serviceCheck.estimatedFairPrice.max * 1.3);

  const points: TalkingPointsSet = {
    opening: generateOpening(serviceType, serviceCheck, isScammy, isLegitimate),
    clarifying: generateClarifying(serviceType, serviceCheck, vehicleInfo),
    objecting: generateObjections(serviceType, serviceCheck, isScammy, quotedPrice),
    negotiating: generateNegotiations(serviceType, serviceCheck, quotedPrice, isPriceHigh),
    closing: generateClosing(serviceType, serviceCheck, isScammy, isLegitimate),
  };

  // Add emergency exit for high-pressure situations
  if (isScammy || scamLikelihood > 70) {
    points.emergencyExit = generateEmergencyExit(serviceType);
  }

  return points;
}

/**
 * Generate opening statements/questions
 */
function generateOpening(
  serviceType: string,
  check: ServiceCheck,
  isScammy: boolean,
  isLegitimate: boolean
): TalkingPoint[] {
  const points: TalkingPoint[] = [];

  if (isLegitimate) {
    points.push({
      type: 'statement',
      text: `I understand ${serviceType} is due. I'd like to proceed with that.`,
      tone: 'polite',
      priority: 'primary',
    });

    points.push({
      type: 'question',
      text: `Can you show me the condition of the [part/fluid] so I can see why it needs service?`,
      tone: 'educational',
      context: 'Shows engagement, educates you, keeps mechanic accountable',
      priority: 'secondary',
    });
  } else if (isScammy) {
    points.push({
      type: 'question',
      text: `Can you explain why ${serviceType} is being recommended at this mileage?`,
      tone: 'polite',
      context: 'Make them justify the recommendation',
      priority: 'primary',
    });

    points.push({
      type: 'question',
      text: `What does my owner's manual say about the service interval for ${serviceType}?`,
      tone: 'polite',
      context: 'References authoritative source',
      priority: 'primary',
    });
  } else {
    points.push({
      type: 'question',
      text: `I see ${serviceType} on the list. What's the urgency level for this?`,
      tone: 'polite',
      priority: 'primary',
    });

    points.push({
      type: 'question',
      text: `Can we schedule ${serviceType} for a future visit when it's actually due?`,
      tone: 'polite',
      priority: 'secondary',
    });
  }

  return points;
}

/**
 * Generate clarifying questions
 */
function generateClarifying(
  serviceType: string,
  check: ServiceCheck,
  vehicleInfo?: { make: string; model: string; year: number; mileage: number }
): TalkingPoint[] {
  const points: TalkingPoint[] = [];

  // Standard clarifying questions
  points.push({
    type: 'question',
    text: `What specific problem am I preventing by doing ${serviceType} right now?`,
    tone: 'polite',
    context: 'Makes them articulate value, reveals if it\'s just "preventive"',
    priority: 'primary',
  });

  points.push({
    type: 'question',
    text: `What symptoms would indicate that ${serviceType} is actually needed?`,
    tone: 'educational',
    context: 'Learn for future, see if symptoms match',
    priority: 'secondary',
  });

  points.push({
    type: 'question',
    text: `What happens if I wait another [X] miles to do this service?`,
    tone: 'polite',
    context: 'Gauge true urgency',
    priority: 'primary',
  });

  if (check.milesUntilDue && check.milesUntilDue > 0) {
    points.push({
      type: 'question',
      text: `My records show this was done [X] miles ago. The interval is [Y] miles. Why is it due early?`,
      tone: 'skeptical',
      context: 'Reference your records',
      priority: 'primary',
    });
  }

  // Service-specific clarifying questions
  if (serviceType.toLowerCase().includes('flush')) {
    points.push({
      type: 'question',
      text: `Is this a drain-and-fill or a flush? What's the difference in your process?`,
      tone: 'educational',
      context: 'Flush can be harmful on some services',
      priority: 'primary',
    });

    points.push({
      type: 'question',
      text: `What does the current fluid look like? Can you show me?`,
      tone: 'polite',
      context: 'Visual confirmation of necessity',
      priority: 'primary',
    });
  }

  if (serviceType.toLowerCase().includes('filter')) {
    points.push({
      type: 'question',
      text: `Can I see the current filter condition?`,
      tone: 'polite',
      context: 'Should show you the old part',
      priority: 'primary',
    });
  }

  if (serviceType.toLowerCase().includes('brake')) {
    points.push({
      type: 'question',
      text: `What's the current pad thickness? What's the minimum?`,
      tone: 'polite',
      context: 'Specific measurements prove necessity',
      priority: 'primary',
    });

    points.push({
      type: 'question',
      text: `Are the rotors being replaced or resurfaced? Why?`,
      tone: 'polite',
      context: 'Rotors often upsold unnecessarily',
      priority: 'secondary',
    });
  }

  return points;
}

/**
 * Generate objections for questionable recommendations
 */
function generateObjections(
  serviceType: string,
  check: ServiceCheck,
  isScammy: boolean,
  quotedPrice?: number
): TalkingPoint[] {
  const points: TalkingPoint[] = [];

  if (isScammy || check.urgencyLevel === 'unnecessary') {
    points.push({
      type: 'objection',
      text: `I'd like to decline ${serviceType} for now. It's not in line with my manufacturer's maintenance schedule.`,
      tone: 'firm',
      context: 'Direct but polite refusal',
      priority: 'primary',
    });

    points.push({
      type: 'objection',
      text: `I'm not comfortable with this recommendation. It doesn't match what I've researched.`,
      tone: 'assertive',
      context: 'Shows you\'ve done homework',
      priority: 'primary',
    });

    points.push({
      type: 'objection',
      text: `This service was just done [X] miles ago. I don't see why it would be needed again so soon.`,
      tone: 'skeptical',
      context: 'Reference your maintenance records',
      priority: 'primary',
    });
  }

  if (check.flags.length > 0) {
    points.push({
      type: 'objection',
      text: `I've heard that ${serviceType} is often oversold. Can you provide documentation from the manufacturer supporting this?`,
      tone: 'skeptical',
      context: 'Request proof',
      priority: 'secondary',
    });
  }

  if (check.scamLikelihood && check.scamLikelihood > 70) {
    points.push({
      type: 'objection',
      text: `I'm going to pass on ${serviceType}. I'd like to get a second opinion first.`,
      tone: 'firm',
      context: 'Exercises your right to second opinion',
      priority: 'primary',
    });

    points.push({
      type: 'statement',
      text: `I'm only interested in manufacturer-recommended services today.`,
      tone: 'assertive',
      context: 'Sets clear boundary',
      priority: 'primary',
    });
  }

  // Price objections
  if (quotedPrice && check.estimatedFairPrice) {
    const { min, max } = check.estimatedFairPrice;
    if (quotedPrice > max * 1.3) {
      points.push({
        type: 'objection',
        text: `This price seems high. I've seen quotes of $${min}-$${max} for ${serviceType} elsewhere.`,
        tone: 'skeptical',
        context: 'Reference market rate',
        priority: 'primary',
      });
    }
  }

  return points;
}

/**
 * Generate price negotiation points
 */
function generateNegotiations(
  serviceType: string,
  check: ServiceCheck,
  quotedPrice?: number,
  isPriceHigh?: boolean
): TalkingPoint[] {
  const points: TalkingPoint[] = [];

  if (!quotedPrice || !check.estimatedFairPrice) {
    return points;
  }

  const { min, max } = check.estimatedFairPrice;
  const midpoint = (min + max) / 2;

  if (isPriceHigh) {
    points.push({
      type: 'negotiation',
      text: `The price seems higher than I expected. Can you break down the cost for me?`,
      tone: 'polite',
      context: 'Make them justify pricing',
      priority: 'primary',
    });

    points.push({
      type: 'negotiation',
      text: `Is there a more economical option? Maybe an aftermarket part instead of OEM?`,
      tone: 'polite',
      context: 'Request alternatives',
      priority: 'secondary',
    });

    points.push({
      type: 'negotiation',
      text: `I've gotten quotes around $${midpoint.toFixed(0)} for this service. Can you match that?`,
      tone: 'firm',
      context: 'Direct negotiation with market rate',
      priority: 'primary',
    });

    points.push({
      type: 'negotiation',
      text: `If I approve multiple services today, can you give me a discount?`,
      tone: 'polite',
      context: 'Bundle negotiation',
      priority: 'secondary',
    });
  } else {
    points.push({
      type: 'negotiation',
      text: `The price is fair. Let's proceed.`,
      tone: 'polite',
      priority: 'primary',
    });
  }

  // DIY alternative
  if (check.alternativeAction?.includes('DIY')) {
    points.push({
      type: 'negotiation',
      text: `I could do this myself, but I value your expertise. Can we work on the price?`,
      tone: 'polite',
      context: 'Acknowledges DIY option as leverage',
      priority: 'secondary',
    });
  }

  return points;
}

/**
 * Generate closing statements
 */
function generateClosing(
  serviceType: string,
  check: ServiceCheck,
  isScammy: boolean,
  isLegitimate: boolean
): TalkingPoint[] {
  const points: TalkingPoint[] = [];

  if (isLegitimate) {
    points.push({
      type: 'statement',
      text: `Let's go ahead with ${serviceType}. Thanks for the thorough explanation.`,
      tone: 'polite',
      priority: 'primary',
    });

    points.push({
      type: 'question',
      text: `After this is done, when should I schedule the next ${serviceType}?`,
      tone: 'educational',
      context: 'Learn for future planning',
      priority: 'secondary',
    });
  } else if (isScammy) {
    points.push({
      type: 'statement',
      text: `I'm going to decline ${serviceType} today. Please just do [the other approved services].`,
      tone: 'firm',
      priority: 'primary',
    });

    points.push({
      type: 'statement',
      text: `I appreciate your time, but I'll be getting a second opinion on ${serviceType}.`,
      tone: 'polite',
      priority: 'primary',
    });
  } else {
    points.push({
      type: 'statement',
      text: `Let's table ${serviceType} for now. Can you note it for my next visit?`,
      tone: 'polite',
      priority: 'primary',
    });

    points.push({
      type: 'statement',
      text: `I'll approve [other services], but I'd like to wait on ${serviceType}.`,
      tone: 'polite',
      priority: 'primary',
    });
  }

  // Documentation request
  points.push({
    type: 'question',
    text: `Can I get a detailed invoice showing exactly what was done?`,
    tone: 'polite',
    context: 'Important for records',
    priority: 'secondary',
  });

  return points;
}

/**
 * Generate emergency exit strategies for high-pressure situations
 */
function generateEmergencyExit(serviceType: string): TalkingPoint[] {
  return [
    {
      type: 'statement',
      text: `I need to check with [my spouse/partner/parent] before approving any additional services.`,
      tone: 'polite',
      context: 'Buys time to research',
      priority: 'primary',
    },
    {
      type: 'statement',
      text: `I appreciate the recommendations, but I need to review my budget. I'll call back if I want to proceed.`,
      tone: 'polite',
      context: 'Exit with dignity',
      priority: 'primary',
    },
    {
      type: 'statement',
      text: `This is more than I planned to spend today. Just do [the minimum/oil change] and I'll come back for the rest.`,
      tone: 'firm',
      context: 'Reduces scope immediately',
      priority: 'primary',
    },
    {
      type: 'statement',
      text: `I'm feeling pressured and uncomfortable. I'd like to take my car and think about this.`,
      tone: 'assertive',
      context: 'For truly aggressive upselling',
      priority: 'backup',
    },
    {
      type: 'statement',
      text: `Thank you for the inspection. I'm going to get a second opinion before proceeding.`,
      tone: 'firm',
      context: 'Clear exit',
      priority: 'primary',
    },
  ];
}

/**
 * Generate situation-specific talking points
 */
export function generateSituationPoints(situation: {
  type: 'multi-flush' | 'engine-flush' | 'transmission-flush-high-mileage' | 'premium-filter-upsell' | 'all-fluids-at-once';
  services: string[];
}): TalkingPoint[] {
  const points: TalkingPoint[] = [];

  switch (situation.type) {
    case 'multi-flush':
      points.push(
        {
          type: 'objection',
          text: `Why are multiple flushes being recommended at once? That seems unusual.`,
          tone: 'skeptical',
          priority: 'primary',
        },
        {
          type: 'statement',
          text: `I'd prefer to space out these services over several visits to manage cost.`,
          tone: 'polite',
          priority: 'secondary',
        }
      );
      break;

    case 'engine-flush':
      points.push(
        {
          type: 'objection',
          text: `I've read that engine flushes can damage seals and dislodge sludge. Why do you recommend it?`,
          tone: 'skeptical',
          priority: 'primary',
        },
        {
          type: 'statement',
          text: `I maintain regular oil changes. I don't think an engine flush is necessary.`,
          tone: 'firm',
          priority: 'primary',
        }
      );
      break;

    case 'transmission-flush-high-mileage':
      points.push(
        {
          type: 'objection',
          text: `My transmission has high mileage. I've heard that flushing it at this point can cause problems. Is a drain-and-fill safer?`,
          tone: 'skeptical',
          priority: 'primary',
        },
        {
          type: 'question',
          text: `Are there any symptoms with my transmission? If it's shifting fine, should we leave it alone?`,
          tone: 'polite',
          priority: 'primary',
        }
      );
      break;

    case 'premium-filter-upsell':
      points.push(
        {
          type: 'objection',
          text: `What's the actual benefit of the premium filter over the standard one?`,
          tone: 'skeptical',
          priority: 'primary',
        },
        {
          type: 'statement',
          text: `I'll stick with the standard filter. It meets the manufacturer specs.`,
          tone: 'firm',
          priority: 'primary',
        }
      );
      break;

    case 'all-fluids-at-once':
      points.push(
        {
          type: 'question',
          text: `Why are all fluids being recommended at the same time? That seems like a lot.`,
          tone: 'skeptical',
          priority: 'primary',
        },
        {
          type: 'statement',
          text: `Let's prioritize the most critical services and schedule the others over the next few months.`,
          tone: 'polite',
          priority: 'primary',
        }
      );
      break;
  }

  return points;
}

/**
 * Generate a formatted script for the customer to follow
 */
export function generateConversationScript(
  serviceCheck: ServiceCheck,
  serviceType: string,
  quotedPrice?: number
): string {
  const points = generateTalkingPoints(serviceCheck, serviceType, quotedPrice);

  let script = `## Conversation Guide: ${serviceType}\n\n`;
  script += `**Urgency Level:** ${serviceCheck.urgencyLevel.toUpperCase()}\n`;
  script += `**Confidence:** ${serviceCheck.confidence}%\n`;
  script += `**Scam Likelihood:** ${serviceCheck.scamLikelihood || 0}%\n\n`;

  script += `### Analysis\n${serviceCheck.reason}\n\n`;

  if (serviceCheck.flags.length > 0) {
    script += `### Red Flags\n`;
    serviceCheck.flags.forEach(flag => {
      script += `- ${flag}\n`;
    });
    script += `\n`;
  }

  script += `### Opening (Start here)\n`;
  points.opening.forEach(point => {
    script += `- **[${point.type}]** ${point.text}\n`;
    if (point.context) script += `  - *Context: ${point.context}*\n`;
  });
  script += `\n`;

  script += `### Clarifying Questions\n`;
  points.clarifying.slice(0, 3).forEach(point => {
    script += `- **[${point.type}]** ${point.text}\n`;
    if (point.context) script += `  - *Context: ${point.context}*\n`;
  });
  script += `\n`;

  if (points.objecting.length > 0) {
    script += `### If You're Not Convinced\n`;
    points.objecting.slice(0, 3).forEach(point => {
      script += `- **[${point.type}]** ${point.text}\n`;
    });
    script += `\n`;
  }

  if (points.negotiating.length > 0) {
    script += `### Price Negotiation\n`;
    points.negotiating.forEach(point => {
      script += `- **[${point.type}]** ${point.text}\n`;
    });
    script += `\n`;
  }

  script += `### Closing\n`;
  points.closing.forEach(point => {
    script += `- **[${point.type}]** ${point.text}\n`;
  });
  script += `\n`;

  if (points.emergencyExit) {
    script += `### Emergency Exit (If Feeling Pressured)\n`;
    points.emergencyExit.forEach(point => {
      script += `- ${point.text}\n`;
    });
    script += `\n`;
  }

  if (serviceCheck.alternativeAction) {
    script += `### Alternative Action\n${serviceCheck.alternativeAction}\n\n`;
  }

  return script;
}

/**
 * Quick talking points for common scenarios
 */
export const QUICK_RESPONSES = {
  tooExpensive: "That's more than I budgeted for. Can we work on the price or use aftermarket parts?",
  needSecondOpinion: "I appreciate the recommendation, but I'd like to get a second opinion first.",
  notInManual: "I checked my owner's manual and don't see this service listed at this interval. Can you explain?",
  justDone: "This service was recently done. Why is it needed again so soon?",
  feelingPressured: "I'm feeling rushed. I need time to think about this.",
  onlyEssentials: "I'm only interested in the essential, manufacturer-recommended services today.",
  showMeProof: "Can you show me the actual condition of the part/fluid so I can see why it needs service?",
  diyOption: "This seems like something I could do myself. What would just the parts cost?",
  bundleDiscount: "If I approve multiple services, can you give me a discount?",
  declinePolitely: "I'm going to pass on that service today. Please just focus on [the approved items].",
};
