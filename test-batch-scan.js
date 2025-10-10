const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDc9DnX2ed4eyL0LcBnDT-Q9oaCCp7nUzg');

async function processDocument(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Extract ALL information from this automotive document.
  This could be a warranty registration, vehicle registration, receipt, or contract.
  Focus on:
  - Document type
  - Vehicle information (VIN, make, model, year)
  - Owner/customer information
  - Dates (purchase, registration, warranty start/end)
  - Coverage details
  - Any important terms or conditions
  - Costs/fees if present

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

async function checkEarlierReceipt() {
  console.log('Processing i43514...');
  const receipt = await processDocument('/Users/evanstoudt/Documents/File Cabinet/Coding/cartalker/receipts/evan/i43514.JPG');
  console.log('i43514 Results:');
  console.log(receipt);
}

checkEarlierReceipt().catch(console.error);