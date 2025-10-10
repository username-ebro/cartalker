/**
 * Generate Tireman mascot using NanoBanana
 * Run: npx tsx scripts/generate-mascot.ts
 */

import { generateImage, saveImage } from '../src/lib/nanoBanana';
import path from 'path';

const mascotPrompt = `
A friendly, helpful cartoon tire character mascot with expressive eyes and simple arms.
The character should look knowledgeable and trustworthy, like a car expert friend.
Style: Simple, clean line art suitable for a mobile app icon and UI elements.
Personality: Friendly and approachable, like Microsoft's Clippy but redesigned as a tire.
The tire should have a slight smile, welcoming eyes, and be waving with one arm.
Black and white color scheme with clean lines, modern but playful aesthetic.
Suitable for both light and dark mode UIs.
Mascot name: "Tireman" - your helpful car advisor.
`;

async function generateMascot() {
  console.log('🎨 Generating Tireman mascot...\n');

  try {
    // Generate the image
    const result = await generateImage(mascotPrompt.trim(), {
      aspectRatio: '1:1',
      numberOfImages: 1
    });

    // Save to public directory
    const outputDir = path.join(process.cwd(), 'public', 'mascot');
    const outputPath = path.join(outputDir, 'tireman-mascot.png');

    await saveImage(result, outputPath);

    console.log('\n✅ Tireman mascot generated successfully!');
    console.log(`📁 Location: ${outputPath}`);
    console.log('🎯 Ready to use in CarTalker UI\n');

    // Generate alternative versions
    console.log('🎨 Generating alternative poses...\n');

    const variants = [
      {
        name: 'tireman-thinking',
        prompt: 'The same friendly tire character, but with a thoughtful expression, hand on chin, like they are analyzing a car problem. Same clean line art style.'
      },
      {
        name: 'tireman-success',
        prompt: 'The same friendly tire character celebrating with both arms raised in success, big happy smile, like they just saved someone money. Same clean line art style.'
      },
      {
        name: 'tireman-wave',
        prompt: 'The same friendly tire character waving hello with a friendly welcoming gesture. Same clean line art style.'
      }
    ];

    for (const variant of variants) {
      console.log(`Generating ${variant.name}...`);
      const variantResult = await generateImage(variant.prompt, {
        aspectRatio: '1:1',
        numberOfImages: 1
      });

      const variantPath = path.join(outputDir, `${variant.name}.png`);
      await saveImage(variantResult, variantPath);
      console.log(`✅ Saved: ${variant.name}.png\n`);
    }

    console.log('🎉 All mascot variants generated!');
    console.log('📁 Check public/mascot/ directory\n');

  } catch (error) {
    console.error('❌ Failed to generate mascot:', error);
    process.exit(1);
  }
}

generateMascot();
