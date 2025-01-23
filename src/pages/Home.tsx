import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const features = [
    {
      title: '即时识别',
      description: '使用先进的AI技术，快速准确地识别植物。',
      icon: '🔍',
    },
    {
      title: '详细信息',
      description: '获取植物护理、特征和生长条件的全面信息。',
      icon: '📚',
    },
    {
      title: '保存追踪',
      description: '记录已识别的植物，建立您的个人收藏。',
      icon: '📱',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
              发现身边的
              <br />
              植物世界
            </h1>
            <p className="mt-8 text-xl text-gray-600 leading-relaxed">
              使用相机或照片即时识别植物、花卉和树木，
              <br className="hidden sm:block" />
              获取关于它们的护理、特征等详细信息。
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                to="/identify"
                className="transform transition-all duration-300 inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:translate-y-[-2px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                开始识别
              </Link>
              <Link
                to="/history"
                className="transform transition-all duration-300 inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl text-primary-600 bg-white border-2 border-primary-100 hover:border-primary-200 hover:bg-primary-50 hover:translate-y-[-2px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                查看历史
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
            探索特色功能
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg border border-primary-100/50 hover:border-primary-200"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-green-100 text-primary-600">
                    <span className="text-3xl transform transition-transform group-hover:scale-110 duration-300">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 relative">
          <div className="bg-gradient-to-r from-primary-600 to-green-600 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              准备好开始了吗？
            </h2>
            <p className="text-xl text-primary-50 mb-8 max-w-2xl mx-auto">
              立即加入我们，开启您的植物探索之旅！让我们一起发现大自然的奥秘。
            </p>
            <Link
              to="/identify"
              className="transform transition-all duration-300 inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl text-primary-600 bg-white hover:bg-primary-50 hover:translate-y-[-2px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              立即体验
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
