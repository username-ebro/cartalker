const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDc9DnX2ed4eyL0LcBnDT-Q9oaCCp7nUzg');

async function processReceipt(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Extract ALL information from this automotive service receipt with 100% accuracy.
  Pay special attention to:
  - Shop/dealer name and location
  - Date of service
  - Vehicle information (make/model/year/VIN/mileage)
  - Customer information
  - Services performed
  - Parts replaced
  - Labor charges
  - Total cost
  - Invoice/RO number
  - Warranty information if present

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

async function processFirstPage() {
  console.log('Processing mf1 (cover page)...');
  const page1 = await processReceipt('/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/mf1.JPG');
  console.log('mf1 Results:');
  console.log(page1);
}

processFirstPage().catch(console.error);