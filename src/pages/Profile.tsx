import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import axios from 'axios';
import { USER_ENDPOINTS } from '../api/config';
import { getAuthHeader } from '../api/config';
import { format } from 'date-fns';

interface UserStats {
  totalIdentifications: number;
  lastIdentification: string | null;
  plantFamilies: number;
  commonPlants: Array<{
    commonName: string;
    _count: {
      commonName: number;
    }
  }>;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 如果用户未登录，重定向到登录页面
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(USER_ENDPOINTS.stats, {
          headers: getAuthHeader()
        });
        setStats(response.data);
      } catch (err) {
        setError('获取统计信息失败');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现更新用户信息的功能
    setMessage({ type: 'success', text: '个人信息已更新' });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-primary-100 mx-auto flex items-center justify-center">
                <span className="text-4xl">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <button className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700">
                <span className="sr-only">更换头像</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">账号设置</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      邮箱
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      昵称
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">会员状态</h3>
                <div className="mt-4">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-primary-800">
                      您当前是 <strong>免费用户</strong>
                    </p>
                    <button type="button" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      升级到专业版
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">使用统计</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {loading ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-primary-600">加载中...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-primary-600">{error}</p>
                    </div>
                  ) : stats ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-primary-600">{stats.totalIdentifications}</p>
                      <p className="text-sm text-gray-500">总识别次数</p>
                    </div>
                  ) : null}

                  {loading ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-primary-600">加载中...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-primary-600">{error}</p>
                    </div>
                  ) : stats ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-primary-600">{stats.plantFamilies}</p>
                      <p className="text-sm text-gray-500">识别的植物科属</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                保存更改
              </button>
            </div>
          </form>
        </div>
      </div>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setMessage(null)}
          severity={message?.type}
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;
