const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDc9DnX2ed4eyL0LcBnDT-Q9oaCCp7nUzg');

async function processDocument(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Extract ALL information from this automotive document/contract page.
  This appears to be part of a multi-page vehicle service contract or warranty.
  Focus on:
  - Contract type and provider
  - Vehicle information
  - Coverage details
  - Terms and conditions
  - Exclusions
  - Pricing
  - Any specific clauses or limitations

  Return ONLY a JSON object with the extracted data.`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    },
    prompt
  ]);

  const response = await result.response;
  return response.text();
}

async function processAllPages() {
  console.log('Processing DC Pages 4-10...\n');

  for (let i = 4; i <= 10; i++) {
    console.log(`Processing Page ${i}...`);
    const page = await processDocument(`/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/dc${i}.JPG`);
    console.log(`Page ${i} Results:`);
    console.log(page);
    console.log('\n');
  }
}

processAllPages().catch(console.error);