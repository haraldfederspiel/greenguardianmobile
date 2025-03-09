
import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Logo from '../components/Logo';
import { supabase } from '@/integrations/supabase/client';
import SustainabilityScore from '@/components/SustainabilityScore';

const CameraPage: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [sustainabilityScore, setSustainabilityScore] = useState<number | null>(null);
  const [ingredientScores, setIngredientScores] = useState<Array<{
    ingredient: string;
    score: number | null;
    matchedWith: string | null;
  }> | null>(null);
  const [matchStats, setMatchStats] = useState<{
    matched: number;
    total: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setIngredients(null);
        setSustainabilityScore(null);
        setIngredientScores(null);
        setMatchStats(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    setIngredients(null);
    setSustainabilityScore(null);
    setIngredientScores(null);
    setMatchStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const analyzeProduct = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { image: capturedImage },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to analyze image');
      }
      
      if (!data || !data.ingredients) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from analysis service');
      }
      
      setIngredients(data.ingredients);
      setSustainabilityScore(data.averageScore);
      setIngredientScores(data.ingredientScores);
      setMatchStats({
        matched: data.matchedIngredients,
        total: data.totalIngredients
      });
      
      toast({
        title: "Analysis complete",
        description: data.averageScore !== null 
          ? `Extracted ${data.ingredients.length} ingredients with an average sustainability score of ${data.averageScore}.` 
          : `Extracted ${data.ingredients.length} ingredients, but no sustainability scores were found.`,
      });
    } catch (error) {
      console.error('Error analyzing product:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "There was an error analyzing the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <header className="mb-6 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Logo size={28} />
          <h1 className="text-2xl font-bold">Analyze Product</h1>
        </div>
        <p className="text-neutral-500">Take a photo or upload an image</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {capturedImage ? (
          <div className="relative w-full max-w-xs">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={capturedImage} 
                alt="Captured product" 
                className="w-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = 'https://images.unsplash.com/photo-1580428456289-31892e500545?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Fallback image
                }}
              />
            </div>
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-10 w-full max-w-xs flex flex-col items-center">
            <div className="bg-neutral-100 rounded-full p-4 mb-4">
              <Camera size={36} className="text-neutral-500" />
            </div>
            <p className="text-neutral-600 text-center mb-6">
              Take a photo of a product<br />to analyze its ingredients
            </p>
          </div>
        )}

        {sustainabilityScore !== null && (
          <div className="mt-6 flex flex-col items-center">
            <h3 className="font-medium text-green-800 mb-2">Sustainability Score</h3>
            <SustainabilityScore score={sustainabilityScore} size="lg" showLabel={true} />
            {matchStats && (
              <p className="text-sm text-neutral-500 mt-2">
                Based on {matchStats.matched} of {matchStats.total} ingredients
              </p>
            )}
          </div>
        )}

        {ingredients && ingredients.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl w-full max-w-xs">
            <h3 className="font-medium text-green-800 mb-2">Ingredients List</h3>
            <div className="text-sm text-green-700">
              <ul className="list-disc pl-5 space-y-1">
                {ingredients.map((ingredient, index) => {
                  const scoreInfo = ingredientScores?.find(s => s.ingredient === ingredient);
                  return (
                    <li key={index} className="flex items-start justify-between">
                      <span>{ingredient}</span>
                      {scoreInfo?.score !== null && scoreInfo?.score !== undefined && (
                        <span className={`ml-2 font-medium ${
                          scoreInfo.score >= 75 ? 'text-green-600' : 
                          scoreInfo.score >= 50 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {scoreInfo.score}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col w-full max-w-xs space-y-4">
          {capturedImage ? (
            <button 
              onClick={analyzeProduct}
              disabled={isProcessing}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Analyzing...
                </>
              ) : (
                "Extract Ingredients"
              )}
            </button>
          ) : (
            <>
              <button 
                onClick={triggerCameraCapture}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 flex items-center justify-center"
              >
                <Camera size={18} className="mr-2" />
                Take Photo
              </button>
              
              <button 
                onClick={triggerFileUpload}
                className="border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                <Upload size={18} className="mr-2" />
                Upload Image
              </button>
            </>
          )}
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={cameraInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
    </div>
  );
};

export default CameraPage;
