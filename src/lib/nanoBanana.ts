/**
 * NanoBanana (Gemini Image Generation) Integration
 * Ported from Figma project for CarTalker mascot generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBksqQxD34LaYEc69fHc5AA2nbLUsU4DyY';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not found');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface ImageGenerationOptions {
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
}

export interface ImageGenerationResult {
  imageData: string; // base64
  mimeType: string;
  metadata?: {
    finishReason: string;
    safetyRatings: any[];
  };
}

/**
 * Generate image from text prompt using Gemini 2.5 Flash Image
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  const {
    aspectRatio = '1:1',
    numberOfImages = 1,
  } = options;

  console.log('🎨 Generating image with NanoBanana...');
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

  try {
    const model = genAI.getGenerativeModel({
      model: 'imagen-3.0-generate-001',
    });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        // @ts-ignore - Gemini image generation config
        responseModalities: ['Image'],
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    const response = await result.response;
    const candidates = response.candidates;

    if (!candidates || !candidates[0]) {
      throw new Error('No image generated');
    }

    const candidate = candidates[0];
    const content = candidate.content;

    if (!content || !content.parts || !Array.isArray(content.parts)) {
      throw new Error('Invalid response structure from API');
    }

    // Extract image data from response
    const imagePart = content.parts.find((part: any) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data in response');
    }

    console.log('✅ Image generated successfully!');

    return {
      imageData: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
      metadata: {
        finishReason: candidate.finishReason || 'STOP',
        safetyRatings: candidate.safetyRatings || []
      }
    };
  } catch (error) {
    console.error('❌ NanoBanana error:', error);
    throw error;
  }
}

/**
 * Save generated image to file system
 */
export async function saveImage(
  result: ImageGenerationResult,
  outputPath: string
): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');

  if (!result.imageData) {
    throw new Error('No image data in result');
  }

  // Decode base64 image data
  const buffer = Buffer.from(result.imageData, 'base64');

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Write file
  await fs.writeFile(outputPath, buffer);

  console.log(`💾 Saved to: ${outputPath}`);

  return outputPath;
}

/**
 * Estimate cost for generation
 * Nano Banana pricing: ~1290 tokens per image
 */
export function estimateCost(numberOfImages: number = 1): {
  numberOfImages: number;
  tokensPerImage: number;
  totalTokens: number;
  estimatedCost: number;
  formattedCost: string;
} {
  const tokensPerImage = 1290;
  const costPer1MTokens = 30.00;

  const totalTokens = numberOfImages * tokensPerImage;
  const cost = (totalTokens / 1000000) * costPer1MTokens;

  return {
    numberOfImages,
    tokensPerImage,
    totalTokens,
    estimatedCost: cost,
    formattedCost: `$${cost.toFixed(4)}`
  };
}
