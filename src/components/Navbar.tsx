import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, MenuItem, Button, Avatar } from '@mui/material';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/identify', label: '识别植物' },
    { path: '/history', label: '历史记录' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-primary-600 text-xl font-bold">GreenIdentify</span>
          </Link>
          
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            {user ? (
              <div>
                <Button
                  onClick={handleMenu}
                  className="text-gray-600 hover:text-primary-600"
                  startIcon={
                    <Avatar
                      sx={{ width: 32, height: 32 }}
                      className="bg-primary-600"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                >
                  {user.name}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                    个人资料
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                </Menu>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                登录
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50"
            >
              <span className="sr-only">打开菜单</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* 半透明背景 */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            {/* 菜单内容 */}
            <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-lg font-semibold text-primary-600">菜单</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-primary-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.path
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="pt-4 mt-4 border-t">
                      <div className="flex items-center px-4 py-2 space-x-3">
                        <Avatar
                          sx={{ width: 32, height: 32 }}
                          className="bg-primary-600"
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <span className="text-gray-900 font-medium">{user.name}</span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 mt-2 rounded-md text-base font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                      >
                        个人资料
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                      >
                        退出登录
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 mt-4 text-center rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    登录
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
