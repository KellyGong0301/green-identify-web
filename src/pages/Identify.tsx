import React, { useState, useCallback } from 'react';
import PlantResult from '../components/PlantResult';
import CameraCapture from '../components/CameraCapture';
import { identifyPlantWithPlantId } from '../services/plantIdService';
import type { PlantIdentificationResult } from '../services/plantService';
import { PhotoCamera, CloudUpload } from '@mui/icons-material';

const Identify: React.FC = () => {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsIdentifying(true);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const identificationResult = await identifyPlantWithPlantId(base64data);
          setResult(identificationResult);
        } catch (err: any) {
          setError(err.message || '识别植物时出错');
          console.error('Identification error:', err);
        } finally {
          setIsIdentifying(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || '读取图片时出错');
      setIsIdentifying(false);
    }
  };

  const handleCameraCapture = useCallback(async (imageData: string) => {
    try {
      setIsIdentifying(true);
      setError(null);
      const identificationResult = await identifyPlantWithPlantId(imageData);
      setResult(identificationResult);
    } catch (err: any) {
      setError(err.message || '识别植物时出错');
      console.error('Identification error:', err);
    } finally {
      setIsIdentifying(false);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              识别植物
            </h1>
            
            {!result && !isIdentifying && (
              <div className="mt-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => setShowCamera(true)}
                    className="w-full sm:w-40 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-colors duration-200"
                  >
                    <PhotoCamera className="w-5 h-5 mr-2" />
                    拍照识别
                  </button>
                  
                  <label className="w-full sm:w-40 cursor-pointer">
                    <div className="inline-flex w-full items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-colors duration-200">
                      <CloudUpload className="w-5 h-5 mr-2" />
                      上传图片
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                
                <p className="text-gray-500 text-base max-w-md mx-auto">
                  上传植物图片或使用摄像头拍照，我们将帮助你识别植物并提供详细信息
                </p>
              </div>
            )}

            {isIdentifying && (
              <div className="py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">
                  正在识别植物...
                </p>
              </div>
            )}

            {error && (
              <div className="mt-6 mx-auto max-w-md">
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                  <p className="text-red-700">
                    <span className="font-semibold">错误：</span>
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {result && (
        <div className="mt-8">
          <PlantResult
            result={result}
            loading={isIdentifying}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default Identify;
