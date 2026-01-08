import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

interface AuthButtonProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const AuthButton = ({ onSignIn, onSignUp }: AuthButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition-all shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center"
        aria-label="登入選單"
      >
        <User className="h-5 w-5 text-gray-700" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <button
              onClick={() => {
                onSignIn();
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              登入
            </button>
            <button
              onClick={() => {
                onSignUp();
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors mt-1"
            >
              註冊
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
