
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

// Helper function to extract ingredients from various formats
const parseIngredientsFromResponse = (result: string): string[] => {
  // Clean up the string to handle various formats
  const cleanResult = result.trim();
  let ingredients: string[] = [];

  // Check if there's a JSON array in the response
  const jsonMatch = cleanResult.match(/\[.*\]/s);
  if (jsonMatch) {
    try {
      // Try to parse as JSON
      const parsedIngredients = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsedIngredients)) {
        return parsedIngredients.map(i => i.trim());
      }
    } catch (e) {
      console.log("JSON parsing failed, will try other methods:", e);
    }
  }

  // If no valid JSON found, try other methods
  if (cleanResult.includes("ingredient")) {
    // Split by lines and filter out non-ingredient lines
    const lines = cleanResult.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.toLowerCase().includes("here is") && !line.toLowerCase().includes("ingredient list"));
    
    // Remove numbering, bullets or other list markers
    ingredients = lines.map(line => {
      return line.replace(/^(\d+\.|\*|-|\•|\–)\s+/g, '').trim();
    });
  } else {
    // Just split by commas or line breaks if no clear structure
    ingredients = cleanResult.split(/[,\n]/).map(i => i.trim()).filter(i => i);
  }

  return ingredients;
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
    console.log('Uploading image to Supabase Storage bucket: aiforgood...');
    
    // Create the storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(bucket => bucket.name === 'aiforgood')) {
      console.log('Creating aiforgood bucket...');
      await supabase.storage.createBucket('aiforgood', {
        public: true,
      });
    }
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('aiforgood')
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
      .from('aiforgood')
      .getPublicUrl(filename);
    
    const imageUrl = publicURLData.publicUrl;
    console.log('Image uploaded successfully, public URL:', imageUrl);
    
    // Send request to Groq with the image URL
    console.log('Sending URL to Groq for ingredient extraction...');
    
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
            content: 'You are an OCR specialist that reads text from product images and extracts ingredient lists. Return only the list of ingredients as a JSON array of strings in this format: ["ingredient 1", "ingredient 2", "ingredient 3"]. Do not include any explanatory text, just the array.'
          },
          {
            role: 'user',
            content: `Please analyze this product image and extract only the list of ingredients. The image URL is: ${imageUrl}`
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
    console.log('Ingredient extraction result:', result);

    // Parse ingredients using our helper function
    const ingredients = parseIngredientsFromResponse(result);
    console.log('Parsed ingredients:', ingredients);
    
    if (ingredients.length === 0) {
      console.warn('No ingredients could be extracted from the response');
    }

    // Now, query the "Ingredient list and score" table for each ingredient
    console.log('Querying "Ingredient list and score" table for ingredient scores...');
    
    let totalScore = 0;
    let matchedIngredients = 0;
    const ingredientScores = [];
    
    for (const ingredient of ingredients) {
      // Skip empty ingredients or those that are likely not actual ingredients
      if (!ingredient || ingredient.length < 2 || 
          ingredient.toLowerCase().includes('ingredient') || 
          ingredient.toLowerCase().includes('list')) {
        continue;
      }
      
      // Use SQL LIKE query to find approximate matches, case insensitive
      const { data: scoreData, error: scoreError } = await supabase
        .from('Ingredient list and score')
        .select('Score, "Ingredient Name"')
        .ilike('Ingredient Name', `%${ingredient}%`)
        .limit(1);
      
      if (scoreError) {
        console.error(`Error querying score for ingredient ${ingredient}:`, scoreError);
        continue;
      }
      
      if (scoreData && scoreData.length > 0 && scoreData[0].Score !== null) {
        console.log(`Found score for "${ingredient}": ${scoreData[0].Score}`);
        totalScore += scoreData[0].Score;
        matchedIngredients++;
        ingredientScores.push({
          ingredient,
          score: scoreData[0].Score,
          matchedWith: scoreData[0]['Ingredient Name']
        });
      } else {
        console.log(`No score found for ingredient "${ingredient}"`);
        ingredientScores.push({
          ingredient,
          score: null,
          matchedWith: null
        });
      }
    }
    
    // Calculate average score if there are any matched ingredients
    const averageScore = matchedIngredients > 0 ? Math.round(totalScore / matchedIngredients) : null;
    console.log(`Average sustainability score: ${averageScore !== null ? averageScore : 'N/A'} (based on ${matchedIngredients} of ${ingredients.length} ingredients)`);

    return new Response(JSON.stringify({ 
      ingredients,
      averageScore,
      matchedIngredients,
      totalIngredients: ingredients.length,
      ingredientScores
    }), {
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
