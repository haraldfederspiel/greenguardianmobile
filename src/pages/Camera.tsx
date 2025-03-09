
import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CameraPage: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const clearImage = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const analyzeProduct = () => {
    setIsProcessing(true);
    
    // Simulate product analysis
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Product analyzed",
        description: "Results ready. View alternatives for more sustainable options.",
      });
      // In a real app, we would navigate to the comparison page with the analyzed product
    }, 2500);
  };

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Analyze Product</h1>
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
    </div>
  );
};

export default CameraPage;
