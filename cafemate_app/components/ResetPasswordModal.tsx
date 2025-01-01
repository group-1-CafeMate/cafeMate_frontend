import React, { useEffect, useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import API from 'src/constants/api';
import { getUserUid } from './GetUid';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal = ({ isOpen, onClose }: ResetPasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uidIsLoading, setUidIsLoading] = useState(true);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    setUidIsLoading(true);
    const uid = getUserUid();
    if (uid) {
      // Since this is a modal for resetting password, we don't need to fetch user data here
      // We just need to verify that we have a valid UID
      setError('');
    } else {
      setError('使用者身份驗證失敗');
    }
    setUidIsLoading(false);
  }, []);

  const handleResetPassword = async () => {
    if (!currentPassword || !newPassword) {
      setError('請輸入所有必填欄位');
      setSuccess('');
      return;
    }

    const uid = getUserUid(); // Get UID here
    if (!uid) {
      setError('使用者身份驗證失敗');
      setSuccess('');
      return;
    }
  
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
  
      const response = await fetch(API.User.ResetPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          old_password: currentPassword,
          new_password: newPassword,
        }),
        credentials: 'include',
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccess('密碼已成功重設');
        setError('');
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(data.message || '重設密碼失敗');
        setSuccess('');
      }
    } catch (err: unknown) {
      setSuccess('');
      if (err instanceof Error) {
        setError(`網絡錯誤: ${err.message}`);
      } else {
        setError('網絡錯誤，請稍後再試！');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-5 w-5 text-gray-800" />
          <h3 className="text-lg font-medium">重設密碼</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目前密碼
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 outline-none transition-colors"
                placeholder="請輸入目前密碼"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新密碼
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 outline-none transition-colors"
                placeholder="請輸入新密碼"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="mt-4 p-2 bg-green-50 text-green-600 text-sm rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleResetPassword}
            disabled={isLoading || !currentPassword || !newPassword}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '處理中...' : '確認'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;