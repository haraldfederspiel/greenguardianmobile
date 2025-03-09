
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

// Helper function to safely parse JSON with error handling
const safeJsonParse = (jsonString: string) => {
  try {
    // Try to parse the JSON string directly
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Initial JSON parsing error:', error);
    
    try {
      // Try to extract valid JSON using regex
      const jsonRegex = /\{[\s\S]*\}/;
      const match = jsonString.match(jsonRegex);
      
      if (match) {
        // Clean the extracted JSON string
        let cleanJson = match[0]
          // Replace trailing commas before closing brackets
          .replace(/,\s*([\]}])/g, '$1')
          // Fix quotes in nested JSON
          .replace(/([^\\])"/g, '$1\\"')
          .replace(/\\\\"/g, '\\"')
          // Ensure proper quotes around property names
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
          
        return JSON.parse(cleanJson);
      }
    } catch (extractError) {
      console.error('Error extracting JSON:', extractError);
    }
    
    // If all parsing attempts fail, return a fallback structure
    console.log('Using fallback JSON structure');
    return {
      original: {
        name: "Product Name (Default)",
        brand: "Brand Name",
        price: "$10.99",
        sustainabilityScore: 40,
        image: "https://images.unsplash.com/photo-1580428456289-31892e500545",
        ingredients: ["ingredient 1", "ingredient 2", "ingredient 3"]
      },
      alternatives: [
        {
          name: "Eco-friendly Alternative",
          brand: "Green Brand",
          price: "$15.99",
          sustainabilityScore: 85,
          image: "https://images.unsplash.com/photo-1580428456289-31892e500545",
          ingredients: ["eco ingredient 1", "eco ingredient 2", "eco ingredient 3"]
        }
      ],
      comparison: {
        carbonFootprint: { original: 40, alternative: 85 },
        waterUsage: { original: 45, alternative: 88 },
        energyEfficiency: { original: 50, alternative: 90 },
        recyclability: { original: 30, alternative: 95 }
      }
    };
  }
};

// Extract ingredients from text
const extractIngredients = (text: string): string[] => {
  // Look for ingredients list in the text
  const ingredientsRegex = /ingredients:?.*?:(.*?)(?:\n\n|\n[A-Z]|$)/si;
  const match = text.match(ingredientsRegex);
  
  if (match && match[1]) {
    // Split by common ingredient separators and clean up
    return match[1]
      .split(/[,•*\n-]/)
      .map(i => i.trim())
      .filter(i => i.length > 0 && !i.match(/^\d+%$/) && !i.match(/^contains/i));
  }
  
  // If no structured list found, try to extract from the whole text
  const allWords = text.split(/[\s,\n-]+/);
  const possibleIngredients = allWords
    .filter(word => 
      word.length > 3 && 
      !word.match(/^\d/) && 
      !["the", "and", "with", "from", "contains", "may", "product"].includes(word.toLowerCase())
    )
    .slice(0, 10); // Limit to 10 potential ingredients
  
  return possibleIngredients;
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
    
    // Create storage bucket if it doesn't exist
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'aiforgood')) {
        console.log('Creating aiforgood bucket...');
        await supabase.storage.createBucket('aiforgood', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
      }
    } catch (error) {
      console.error('Error checking/creating bucket:', error);
      // Continue anyway, might already exist
    }
    
    // Upload the image to Supabase Storage
    console.log('Uploading image to Supabase Storage bucket: aiforgood...');
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
    
    // First, analyze the product from the image
    console.log('Sending URL to Groq for product analysis...');
    
    const analyzeResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    if (!analyzeResponse.ok) {
      const errorData = await analyzeResponse.json();
      console.error('Groq API error response:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || `HTTP status ${analyzeResponse.status}`}`);
    }
    
    const analyzeData = await analyzeResponse.json();
    
    if (!analyzeData || !analyzeData.choices || !analyzeData.choices[0] || !analyzeData.choices[0].message) {
      console.error('Unexpected response format from Groq:', analyzeData);
      throw new Error('Invalid response format from Groq API');
    }
    
    const productInfo = analyzeData.choices[0].message.content;
    console.log('Product analysis completed successfully');
    
    // Extract product name and brand from the product info text
    let productName = "Unknown Product";
    let brandName = "Unknown Brand";
    let productPrice = "$10.99";
    
    // Try to extract product name
    const nameMatch = productInfo.match(/Product Name:?\s*([^\n]+)/i) || 
                     productInfo.match(/Name:?\s*([^\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      productName = nameMatch[1].trim();
    }
    
    // Try to extract brand
    const brandMatch = productInfo.match(/Brand:?\s*([^\n]+)/i);
    if (brandMatch && brandMatch[1]) {
      brandName = brandMatch[1].trim();
    }
    
    // Try to extract price
    const priceMatch = productInfo.match(/Price:?\s*([^\n]+)/i) || 
                      productInfo.match(/\$\d+\.\d+/);
    if (priceMatch && priceMatch[1]) {
      productPrice = priceMatch[1].trim();
    } else if (priceMatch) {
      productPrice = priceMatch[0];
    }
    
    // Extract ingredients list from the product info text
    const ingredientsList = extractIngredients(productInfo);
    console.log('Extracted ingredients:', ingredientsList);

    // Now, use the product info and ingredients to find sustainable alternatives
    console.log('Finding sustainable alternatives...');
    
    const alternativesResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            content: `You are a sustainability expert who helps users find eco-friendly alternatives to products.
            
            Based on the ingredients list provided, suggest a more sustainable alternative product that uses similar but more environmentally friendly ingredients. Be VERY CAREFUL to format your response as valid JSON without any errors, trailing commas, or other syntax issues.
            
            Format your response EXACTLY using the following structure:
            {
              "original": {
                "name": "${productName}",
                "brand": "${brandName}",
                "price": "${productPrice}",
                "image": "${imageUrl}",
                "sustainabilityScore": 60,
                "ingredients": ${JSON.stringify(ingredientsList)}
              },
              "alternatives": [
                {
                  "name": "Alternative Product Name",
                  "brand": "Alternative Brand",
                  "price": "$XX.XX",
                  "sustainabilityScore": 85,
                  "image": "https://images.unsplash.com/photo-1580428456289-31892e500545",
                  "ingredients": ["eco-ingredient1", "eco-ingredient2", "..."]
                }
              ],
              "comparison": {
                "carbonFootprint": {
                  "original": 40,
                  "alternative": 85
                },
                "waterUsage": {
                  "original": 45,
                  "alternative": 88
                },
                "energyEfficiency": {
                  "original": 50,
                  "alternative": 90
                },
                "recyclability": {
                  "original": 30,
                  "alternative": 95
                }
              }
            }`
          },
          {
            role: 'user',
            content: `Based on this product information: "${productName}" by "${brandName}" with ingredients ${JSON.stringify(ingredientsList)}, 
            
            Please suggest a more sustainable alternative product with similar ingredients but better environmental metrics. Keep in mind that the alternative should serve the same purpose and offer similar benefits.
            
            The full product analysis is: ${productInfo}
            
            ONLY respond with properly formatted JSON according to the structure provided. Do not include any text outside of the JSON object. Check carefully for any JSON syntax errors before submitting your response.`
          }
        ],
        max_tokens: 1536,
      }),
    });

    if (!alternativesResponse.ok) {
      const errorData = await alternativesResponse.json();
      console.error('Groq API error response for alternatives:', errorData);
      throw new Error(`Groq API error for alternatives: ${errorData.error?.message || `HTTP status ${alternativesResponse.status}`}`);
    }
    
    const alternativesData = await alternativesResponse.json();
    
    if (!alternativesData || !alternativesData.choices || !alternativesData.choices[0] || !alternativesData.choices[0].message) {
      console.error('Unexpected response format from Groq for alternatives:', alternativesData);
      throw new Error('Invalid response format from Groq API for alternatives');
    }
    
    const alternativesInfo = alternativesData.choices[0].message.content;
    console.log('Alternatives analysis raw response:', alternativesInfo);

    // Parse the alternatives as JSON using our safe parser
    let alternativesJson = safeJsonParse(alternativesInfo);
    console.log('Successfully parsed alternatives JSON:', alternativesJson);
    
    // Add unique IDs to each product for referencing
    alternativesJson.original.id = "original";
    alternativesJson.alternatives.forEach((alt, index) => {
      alt.id = `alternative-${index + 1}`;
    });
    
    // Make sure all percentage values are in range 0-100
    const normalizePercentages = (comparison) => {
      Object.keys(comparison).forEach(key => {
        if (typeof comparison[key].original === 'number' && comparison[key].original < 1) {
          comparison[key].original = Math.round(comparison[key].original * 100);
        }
        if (typeof comparison[key].alternative === 'number' && comparison[key].alternative < 1) {
          comparison[key].alternative = Math.round(comparison[key].alternative * 100);
        }
      });
      return comparison;
    };
    
    if (alternativesJson.comparison) {
      alternativesJson.comparison = normalizePercentages(alternativesJson.comparison);
    }

    // Return both product info and alternatives
    return new Response(JSON.stringify({ 
      result: productInfo,
      alternatives: alternativesJson
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
