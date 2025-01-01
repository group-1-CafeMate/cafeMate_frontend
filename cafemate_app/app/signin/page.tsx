"use client";

import Button from "components/Button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import API from "src/constants/api";
import { Eye, EyeOff } from 'lucide-react';

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (isLoading) return;

    setError("");
    setSuccessMessage("");

    if (!username) {
      setError("請先提供使用者名稱！");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("寄送郵件中...");

    try {
      const response = await fetch(API.User.ForgotPassword, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("新密碼已發送至您的電子郵件！");
        setTimeout(() => {
          setIsForgotPassword(false);
          setSuccessMessage("");
        }, 3000);
      } else {
        setError(data.message || "發送失敗，請確認用戶名稱是否正確！");
        setSuccessMessage("");
      }
    } catch (error) {
      setError("網路錯誤，請稍後再試！");
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError("");
    try {
      const response = await fetch(API.User.LogIn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.status === 200) {
        // 登入成功，儲存 uid 進cookie
        document.cookie = `uid=${data.uid}; path=/; max-age=${3600 * 12}`; // Set cookie for 12 hours
        router.push("/homepage");
      } else {
        setError(data.message || "登入失敗");
      }
    } catch {
      setError("網路錯誤，請稍後再試！");
    }
  };

  return (
    <div className="bg-main-bg-color flex justify-center items-center py-12 px-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg max-w-5xl w-full min-h-screen">
        {/* 左側區塊 */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex flex-col justify-between"
          style={{
            backgroundImage: "url('/images/cafe-background.jpg')",
          }}
        >
          <div className="p-8 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white text-center h-full">
            <h1 className="text-3xl font-bold mb-4">
              We haven&apos;t met before right?
            </h1>
            <p className="mb-4">Then you should try us!</p>
            <p className="mb-8">
              CafeMate is your coffee buddy in Taipei and New Taipei City! Share
              your preferences, and we will find the perfect café nearby. Smart,
              personal, and made for coffee lovers like！
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                label="SIGN UP"
                onClick={() => router.push("/signup")}
                variant="solid"
              />
            </div>
          </div>
        </div>

        {/* 右側區塊 */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-6">
            歡迎回到 Cafemate
          </h2>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <div>
              <label htmlFor="username" className="block text-foreground">
                USERNAME
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-accent-color py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-foreground">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="********"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-accent-color py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-500 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setError("");
                  setSuccessMessage("");
                  setIsForgotPassword(true);
                }}
              >
                忘記密碼？
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                label="SIGN IN"
                variant="solid"
                className="bg-accent-color"
                onClick={handleSignIn}
              />
            </div>
          </form>

          {/* 忘記密碼彈窗 */}
          {isForgotPassword && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                <h3 className="text-lg font-bold mb-4">忘記密碼</h3>
                <p className="text-sm text-gray-600 mb-4">
                  請提供您的使用者名稱，我們將寄送新密碼至您的信箱
                </p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {successMessage && (
                  <p className="text-green-500 text-sm mb-4">
                    {successMessage}
                  </p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      if (!isLoading) {
                        setIsForgotPassword(false);
                        setError("");
                        setSuccessMessage("");
                      }
                    }}
                    className={`text-gray-500 hover:underline ${
                      isLoading ? "opacity-50" : ""
                    }`}
                  >
                    取消
                  </button>
                  <Button
                    label={isLoading ? "處理中..." : "發送重設連結"}
                    variant="solid"
                    onClick={handleForgotPassword}
                    className={isLoading ? "opacity-50" : ""}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
