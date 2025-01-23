import React, { useEffect, useState } from 'react';
import { PlantIdentificationResult } from '../types/plant';
import { PlantCareInfo } from '../types/plantCare';
import { PLANT_ENDPOINTS } from '../api/config';
import { getAuthHeader } from '../api/config';
import axios from 'axios';
import { LocalFlorist, Opacity, WbSunny, Thermostat, Info } from '@mui/icons-material';

interface PlantResultProps {
  result: PlantIdentificationResult | null;
  loading: boolean;
  error: string | null;
}

const PlantResult: React.FC<PlantResultProps> = ({ result, loading, error }) => {
  const [careInfo, setCareInfo] = useState<PlantCareInfo | null>(null);
  const [careLoading, setCareLoading] = useState(false);
  const [careError, setcareError] = useState<string | null>(null);

  const fetchCareInfo = async (plantInfo: { commonName: string; scientificName: string; description?: string }) => {
    try {
      setCareLoading(true);
      setcareError(null);

      const response = await axios.post(
        PLANT_ENDPOINTS.care,
        plantInfo,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data) {
        setCareInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching care info:', error);
      setcareError(error instanceof Error ? error.message : '获取养护信息失败');
    } finally {
      setCareLoading(false);
    }
  };

  useEffect(() => {
    if (result?.scientificName) {
      fetchCareInfo({
        commonName: result.commonName || result.scientificName,
        scientificName: result.scientificName,
        description: result.description,
      });
    }
  }, [result]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-4 text-center">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
        <p className="text-red-700">
          <span className="font-semibold">错误：</span>
          {error}
        </p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">识别结果</h2>
          <p className="mt-2 text-sm text-gray-500">
            识别准确率: {(result.probability * 100).toFixed(1)}%
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：图片 */}
          <div>
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={result.images[0]}
                alt="植物图片"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-semibold text-xl">
                  {result.commonName}
                </h3>
                <p className="text-white/80 text-sm italic">
                  {result.scientificName}
                </p>
              </div>
            </div>
          </div>

          {/* 右侧：植物信息 */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-2">
                <LocalFlorist className="w-5 h-5 mr-2 text-primary-600" />
                植物分类
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.taxonomy).map(([key, value]) => (
                  value && (
                    <div key={key} className="bg-white rounded p-2 text-sm">
                      <span className="text-gray-500">{key}: </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {careInfo && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <Info className="w-5 h-5 mr-2 text-primary-600" />
                    养护建议
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <WbSunny className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">光照要求</p>
                        <p className="text-sm text-gray-600">{careInfo.light.description}</p>
                        {careInfo.light.tips && careInfo.light.tips.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                            {careInfo.light.tips.map((tip, index) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Opacity className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">浇水要求</p>
                        <p className="text-sm text-gray-600">{careInfo.water.description}</p>
                        {careInfo.water.tips && careInfo.water.tips.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                            {careInfo.water.tips.map((tip, index) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Thermostat className="w-5 h-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">温度要求</p>
                        <p className="text-sm text-gray-600">{careInfo.temperature.description}</p>
                        {careInfo.temperature.tips && careInfo.temperature.tips.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                            {careInfo.temperature.tips.map((tip, index) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {result.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-2">
                      <Info className="w-5 h-5 mr-2 text-primary-600" />
                      植物描述
                    </h3>
                    <p className="text-sm text-gray-600">{result.description}</p>
                  </div>
                )}
              </div>
            )}

            {careLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">正在获取养护信息...</p>
              </div>
            )}

            {careError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{careError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantResult;
