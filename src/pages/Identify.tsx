import React, { useState, useCallback } from 'react';
import PlantResult from '../components/PlantResult';
import CameraCapture from '../components/CameraCapture';
import { identifyPlantWithPlantId } from '../services/plantIdService';
import type { PlantIdentificationResult } from '../services/plantService';
import { PhotoCamera, CloudUpload } from '@mui/icons-material';
import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

const Identify: React.FC = () => {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, {
        type: compressedFile.type
      });
    } catch (error) {
      console.warn('Image compression failed:', error);
      return file;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsIdentifying(true);
      setError(null);
      
      // Convert HEIC/HEIF format to JPEG
      let processedFile = file;
      if (file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const jpegBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          processedFile = new File([jpegBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg'
          });
        } catch (error) {
          console.error('Error converting HEIC to JPEG:', error);
          setError('无法转换 HEIC/HEIF 格式的图片，请尝试其他格式');
          setIsIdentifying(false);
          return;
        }
      }

      // 压缩图片
      processedFile = await compressImage(processedFile);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // 确保我们发送的是正确的 base64 格式
          const base64data = reader.result as string;
          // 移除 data:image/* 前缀
          const base64Clean = base64data.split(',')[1];
          const identificationResult = await identifyPlantWithPlantId(base64Clean);
          setResult(identificationResult);
        } catch (err: any) {
          setError(err.message || '识别植物时出错');
          console.error('Identification error:', err);
        } finally {
          setIsIdentifying(false);
        }
      };
      reader.readAsDataURL(processedFile);  // 读取转换后的文件
    } catch (err: any) {
      setError(err.message || '读取图片时出错');
      setIsIdentifying(false);
    }
  };

  const handleCameraCapture = useCallback(async (imageData: string) => {
    try {
      setIsIdentifying(true);
      setError(null);
      const identificationResult = await identifyPlantWithPlantId(imageData.split(',')[1]);
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
                      accept="image/*,.heic,.heif"
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
