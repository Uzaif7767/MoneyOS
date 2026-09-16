import fs from 'fs';
import path from 'path';
import { Groq } from 'groq-sdk';

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0 && !process.env[key.trim()]) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    }
  }
}

loadEnvLocal();

async function testModels() {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  // List models if API supports it or test candidates
  console.log('Fetching available models from Groq API...');
  try {
    const list = await client.models.list();
    console.log('Available Groq Models:', list.data.map(m => m.id));
    return;
  } catch (err) {
    console.log('Could not fetch models list directly:', err.message);
  }

  const candidateModels = [
    'llama-3.1-8b-instant',
    'llama3-8b-8192',
    'llama3-70b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ];

  for (const model of candidateModels) {
    try {
      console.log(`Testing model: ${model}...`);
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      });
      console.log(`SUCCESS with ${model}:`, completion.choices[0]?.message?.content);
      break;
    } catch (e) {
      console.log(`FAILED with ${model}:`, e.message);
    }
  }
}

testModels();
