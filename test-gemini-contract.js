const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDc9DnX2ed4eyL0LcBnDT-Q9oaCCp7nUzg');

async function processContract(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Extract ALL information from this automotive warranty/service contract document.
  Focus on:
  - Contract holder name and address
  - Vehicle information (make, model, year, VIN)
  - Contract dates (purchase date, effective date, expiration date)
  - Coverage type and level
  - Deductible amounts
  - Covered components (list all)
  - Exclusions (list all)
  - Term length and mileage limits
  - Contract price and payment details
  - Service provider information
  - Any special conditions or limitations

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
  console.log('Processing Page 1...');
  const page1 = await processContract('/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/dw1.JPG');
  console.log('Page 1 Results:');
  console.log(page1);

  console.log('\n\nProcessing Page 2...');
  const page2 = await processContract('/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/dw2.JPG');
  console.log('Page 2 Results:');
  console.log(page2);

  console.log('\n\nProcessing Page 3...');
  const page3 = await processContract('/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/dw3.JPG');
  console.log('Page 3 Results:');
  console.log(page3);
}

processAllPages().catch(console.error);