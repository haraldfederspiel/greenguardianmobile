
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    // Make sure the image is base64 format with data URI prefix
    const formattedImage = image.startsWith('data:') 
      ? image 
      : `data:image/jpeg;base64,${image}`;
    
    console.log('Sending image to Groq for analysis...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an OCR specialist that reads text from product images and extracts key information about the product. Focus on ingredients, product name, brand, nutrition facts, and sustainability information. Present the information in a clear, concise format.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please analyze this product image and extract all text. Then provide a summary of the product, focusing on its name, ingredients, and any sustainability information.' },
              { type: 'image_url', image_url: { url: formattedImage } }
            ]
          }
        ],
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Groq API error:', data);
      throw new Error(`Groq API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const result = data.choices[0].message.content;
    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-product function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
