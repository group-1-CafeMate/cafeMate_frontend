import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, KeyRound, LogOut } from 'lucide-react';
import ResetPasswordModal from './ResetPasswordModal';

interface UserMenuProps {
  username: string | null;
  email: string | null;
  onLogout: () => void;
}

const UserMenu = ({ username, email, onLogout }: UserMenuProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout();
    setIsLogoutDialogOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="用戶選單"
      >
        <User className="h-5 w-5" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-2 text-sm font-medium text-gray-700">我的帳戶</div>
          <div className="border-t border-gray-200" />
          <div className="p-2">
            <div className="px-2 py-1 flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span className="truncate">{username || '使用者'}</span>
            </div>
            <div className="px-2 py-1 flex items-center gap-2 text-sm text-gray-700">
              <Mail className="h-4 w-4" />
              <span className="truncate">{email || 'No email'}</span>
            </div>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => {
                setIsResetPasswordOpen(true);
                setIsDropdownOpen(false);
              }}
              className="w-full px-2 py-1 text-left flex items-center gap-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              重設密碼
            </button>
            <button
              onClick={() => {
                setIsLogoutDialogOpen(true);
                setIsDropdownOpen(false);
              }}
              className="w-full px-2 py-1 text-left flex items-center gap-2 text-sm text-gray-700 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>
      )}

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />

      {isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <h3 className="text-lg font-medium mb-2">確認登出</h3>
            <p className="text-gray-500 mb-4">您確定要登出嗎？</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;