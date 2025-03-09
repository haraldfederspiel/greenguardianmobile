
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Copy, Share2, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const CameraPage: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productInfo, setProductInfo] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setProductInfo(null);
        setAlternatives(null);
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
    setProductInfo(null);
    setAlternatives(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    if (productInfo) {
      navigator.clipboard.writeText(productInfo)
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: "Product information copied to clipboard",
          });
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          toast({
            title: "Failed to copy",
            description: "Could not copy to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  const shareProductInfo = async () => {
    if (productInfo && navigator.share) {
      try {
        await navigator.share({
          title: 'Product Analysis',
          text: productInfo,
        });
        toast({
          title: "Shared successfully",
          description: "Product information has been shared",
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          title: "Sharing failed",
          description: "Could not share product information",
          variant: "destructive",
        });
      }
    } else {
      copyToClipboard();
    }
  };

  const analyzeProduct = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Sending image to analyze-product function...');
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { image: capturedImage },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to analyze image');
      }
      
      console.log('Received response from analyze-product:', data);
      
      if (!data || !data.result) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from analysis service');
      }
      
      setProductInfo(data.result);
      
      if (data.alternatives) {
        console.log('Setting alternatives data:', data.alternatives);
        setAlternatives(data.alternatives);
        
        // Ensure we have a valid alternatives object to store in localStorage
        const validatedAlternatives = typeof data.alternatives === 'string' 
          ? JSON.parse(data.alternatives) 
          : data.alternatives;
          
        // Store in localStorage with validation
        try {
          localStorage.setItem('productComparison', JSON.stringify(validatedAlternatives));
          console.log('Successfully stored alternatives in localStorage');
        } catch (storageError) {
          console.error('Error storing data in localStorage:', storageError);
          // Try to store a simplified version if the full object is too large
          try {
            const simplifiedData = {
              original: validatedAlternatives.original,
              alternatives: validatedAlternatives.alternatives ? 
                [validatedAlternatives.alternatives[0]] : [],
              comparison: validatedAlternatives.comparison
            };
            localStorage.setItem('productComparison', JSON.stringify(simplifiedData));
            console.log('Stored simplified alternatives in localStorage');
          } catch (fallbackError) {
            console.error('Failed to store even simplified data:', fallbackError);
          }
        }
      } else {
        console.warn('No alternatives data received from analysis');
      }
      
      setShowResultModal(true);
      
      toast({
        title: "Product analyzed",
        description: "Analysis complete. View product information and sustainable alternatives.",
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

  const viewAlternatives = () => {
    if (alternatives) {
      navigate('/compare/1');
    } else {
      toast({
        description: "No sustainable alternatives were found for this product.",
        variant: "destructive",
      });
      navigate('/compare/1');
    }
    setShowResultModal(false);
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
              Take a photo of a product<br />to analyze its sustainability
            </p>
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
                "Analyze Product"
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

      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5 text-green-600" />
              Product Analysis Results
            </DialogTitle>
            <DialogDescription>
              Detailed information about your product
            </DialogDescription>
          </DialogHeader>
          
          {productInfo && (
            <div className="mt-2 p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800 whitespace-pre-line">
                {productInfo}
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-start flex flex-col gap-4 mt-4">
            <div className="flex flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={copyToClipboard}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={shareProductInfo}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            
            <div className="flex flex-row w-full gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                onClick={() => setShowResultModal(false)}
              >
                Close
              </Button>
              <Button 
                type="button" 
                variant="default" 
                size="sm" 
                className="flex-1 bg-green-500 hover:bg-green-600" 
                onClick={viewAlternatives}
              >
                View Sustainable Alternatives
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CameraPage;
