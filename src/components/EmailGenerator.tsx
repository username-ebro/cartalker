'use client';

import { useState } from 'react';
import { Mail, Copy, Check, Sparkles } from 'lucide-react';

export interface EmailTemplate {
  subject: string;
  body: string;
  recipient?: string;
}

interface EmailGeneratorProps {
  /** Scenario context for email generation */
  context: {
    scenario: 'parts-markup' | 'warranty-claim' | 'price-quote' | 'custom';
    dealerName?: string;
    partName?: string;
    partPrice?: number;
    onlinePrice?: number;
    warrantyCoverage?: string;
    issueDescription?: string;
    customPrompt?: string;
  };
  /** User information */
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    vehicleInfo?: string;
  };
  /** Callback when email is sent/copied */
  onComplete?: (email: EmailTemplate) => void;
}

/**
 * EmailGenerator Component
 *
 * Generates professional emails for common CarTalker scenarios:
 * - Parts markup (Phil scenario): "I sourced the part myself, what's labor-only?"
 * - Warranty claims: "This should be covered, here's the documentation"
 * - Price quotes: "Your competitor quoted X, can you match?"
 *
 * Uses templates + AI to create persuasive, professional communication.
 */
export function EmailGenerator({
  context,
  userInfo,
  onComplete,
}: EmailGeneratorProps) {
  const [generatedEmail, setGeneratedEmail] = useState<EmailTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateEmail = async () => {
    setIsGenerating(true);

    // Simulate AI generation delay (in production, call Gemini API)
    await new Promise(resolve => setTimeout(resolve, 1000));

    let email: EmailTemplate;

    switch (context.scenario) {
      case 'parts-markup':
        email = {
          subject: `Labor-Only Quote Request - ${context.partName}`,
          body: `Dear ${context.dealerName || 'Service Advisor'},

Thank you for providing the quote for ${context.partName || 'the required part'} replacement.

I appreciate the detailed estimate, however I've found the OEM part available online for $${context.onlinePrice?.toFixed(2) || 'XXX'}. Since ${context.dealerName || 'your shop'} would need to order the part anyway, I'd like to provide the part myself to reduce costs.

Could you please provide a labor-only quote for the installation? I'm happy to sign a waiver acknowledging that you're not responsible for warranty on the part itself.

I'd like to schedule this service at your earliest convenience.

Thank you for your understanding.

Best regards,
${userInfo?.name || '[Your Name]'}
${userInfo?.phone ? `Phone: ${userInfo.phone}` : ''}
${userInfo?.vehicleInfo ? `Vehicle: ${userInfo.vehicleInfo}` : ''}`,
        };
        break;

      case 'warranty-claim':
        email = {
          subject: `Warranty Coverage Verification - ${context.issueDescription || 'Vehicle Issue'}`,
          body: `Dear ${context.dealerName || 'Service Department'},

I'm writing regarding a recent issue with my vehicle: ${context.issueDescription || '[describe issue]'}.

According to my warranty documentation, this appears to be covered under ${context.warrantyCoverage || 'my current warranty'}. The issue involves [component/system], which falls under the powertrain/bumper-to-bumper coverage that is still active.

Vehicle Details:
${userInfo?.vehicleInfo || '[Vehicle Year/Make/Model]'}
Current Mileage: [Current mileage]
Warranty Expiration: [Date or mileage]

Could you please confirm warranty coverage for this repair and schedule a diagnostic appointment? I have all warranty documentation available and ready to provide.

Please let me know the next steps and earliest available appointment.

Thank you,
${userInfo?.name || '[Your Name]'}
${userInfo?.email ? `Email: ${userInfo.email}` : ''}
${userInfo?.phone ? `Phone: ${userInfo.phone}` : ''}`,
        };
        break;

      case 'price-quote':
        email = {
          subject: `Service Quote Inquiry - ${context.issueDescription || 'Vehicle Service'}`,
          body: `Dear ${context.dealerName || 'Service Team'},

I'm seeking a quote for ${context.issueDescription || '[describe service needed]'}.

I've received quotes from other shops in the area and am comparing options. Specifically, I received a quote of $${context.onlinePrice?.toFixed(2) || 'XXX'} from [competitor name] for the same service.

Could you provide your best quote for this work? I'm looking for:
- [Specific service/part 1]
- [Specific service/part 2]
- Any applicable warranties

I'm ready to schedule as soon as I finalize the quote comparison.

Thank you for your time.

Best regards,
${userInfo?.name || '[Your Name]'}
${userInfo?.vehicleInfo || '[Vehicle Info]'}
${userInfo?.phone ? `Phone: ${userInfo.phone}` : ''}`,
        };
        break;

      default:
        email = {
          subject: 'Vehicle Service Inquiry',
          body: context.customPrompt || 'Please customize this email template.',
        };
    }

    setGeneratedEmail(email);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    if (!generatedEmail) return;

    const emailText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    await navigator.clipboard.writeText(emailText);

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openInMailClient = () => {
    if (!generatedEmail) return;

    const mailtoLink = `mailto:${generatedEmail.recipient || ''}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
    window.location.href = mailtoLink;

    onComplete?.(generatedEmail);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!generatedEmail ? (
        // Generation Trigger
        <div className="bg-white rounded-lg border-2 border-marble-gray p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-info-blue/10 rounded-full flex items-center justify-center">
            <Mail className="text-info-blue" size={32} />
          </div>

          <h3 className="font-mono text-xl font-bold text-notebook-black mb-2">
            Generate Professional Email
          </h3>

          <p className="text-marble-gray mb-6 max-w-md mx-auto">
            {context.scenario === 'parts-markup' &&
              `Create a professional email asking for labor-only pricing on ${context.partName}.`
            }
            {context.scenario === 'warranty-claim' &&
              'Generate an email to claim warranty coverage for your issue.'
            }
            {context.scenario === 'price-quote' &&
              'Request a competitive quote from this shop.'
            }
          </p>

          <button
            onClick={generateEmail}
            disabled={isGenerating}
            className="px-8 py-3 bg-tire-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Email
              </>
            )}
          </button>
        </div>
      ) : (
        // Generated Email Display
        <div className="bg-white rounded-lg border-2 border-marble-gray overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-info-blue/10 border-b-2 border-marble-gray p-4">
            <div className="flex items-center gap-2 text-info-blue mb-2">
              <Mail size={20} />
              <span className="font-semibold">Ready to Send</span>
            </div>
            <h3 className="font-mono text-lg font-bold text-notebook-black">
              {generatedEmail.subject}
            </h3>
          </div>

          {/* Email Body */}
          <div className="p-6">
            <div className="bg-gray-50 border border-gray-300 rounded p-4 font-sans text-sm text-notebook-black whitespace-pre-wrap leading-relaxed">
              {generatedEmail.body}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t-2 border-marble-gray bg-gray-50 p-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setGeneratedEmail(null)}
              className="text-sm text-marble-gray hover:text-notebook-black transition-colors"
            >
              ← Generate Different Email
            </button>

            <div className="flex items-center gap-3">
              {/* Copy Button */}
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 border-2 border-marble-gray text-notebook-black bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {isCopied ? (
                  <>
                    <Check size={18} className="text-savings-green" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Email
                  </>
                )}
              </button>

              {/* Open in Mail Client */}
              <button
                onClick={openInMailClient}
                className="px-6 py-2 bg-info-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
              >
                <Mail size={18} />
                Open in Mail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
