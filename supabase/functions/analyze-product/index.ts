
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

// Get environment variables
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || Deno.env.get('groq');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to convert base64 data URI to a File-like object
const dataURItoBlob = (dataURI: string) => {
  // Extract base64 data from the data URI
  const [meta, base64Data] = dataURI.split(',');
  const contentType = meta.split(':')[1].split(';')[0];
  
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return {
    blob: new Blob([bytes], { type: contentType }),
    contentType
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY environment variable is not set');
      throw new Error('GROQ_API_KEY is not configured. Please check your Supabase Edge Function Secrets.');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials are not properly configured');
      throw new Error('Supabase configuration is missing. Please check your Edge Function Secrets.');
    }

    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }
    
    console.log('Processing image...');
    
    // Initialize Supabase client with service role key for storage operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Generate a unique filename for the image using timestamp and random string
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const filename = `product_${timestamp}_${randomString}.jpg`;
    
    // Process the image
    const formattedImage = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    const { blob, contentType } = dataURItoBlob(formattedImage);
    
    // Upload the image to Supabase Storage
    console.log('Uploading image to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filename, blob, {
        contentType,
        upsert: true,
      });
    
    if (uploadError) {
      console.error('Error uploading to Supabase Storage:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }
    
    // Get public URL for the uploaded image
    const { data: publicURLData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    const imageUrl = publicURLData.publicUrl;
    console.log('Image uploaded successfully, public URL:', imageUrl);
    
    // Send request to Groq with the image URL
    console.log('Sending URL to Groq for analysis...');
    
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
            content: `Please analyze this product image and extract all text information. Focus on the product name, ingredients list, and any sustainability claims or certifications. The image URL is: ${imageUrl}`
          }
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error response:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || `HTTP status ${response.status}`}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format from Groq:', data);
      throw new Error('Invalid response format from Groq API');
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
