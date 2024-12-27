"use client"; // 加在檔案的第一行

import Button from "components/Button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import API from "src/constants/api";

const SignIn = () => {
  const [username, setUsername] = useState(""); // 儲存使用者名稱
  const [password, setPassword] = useState(""); // 儲存密碼
  const [error, setError] = useState(""); // 儲存錯誤訊息
  const router = useRouter();
  // 發送登入請求的函數
  const handleSignIn = async () => {
    try {
      // 向後端發送 POST 請求
      const response = await fetch(API.User.Login, {
        method: "POST", // HTTP 請求方法
        headers: {
          "Content-Type": "application/json", // 設定內容類型為 JSON
        },
        body: JSON.stringify({ username, password }), // 將使用者名稱與密碼轉為 JSON 傳送
      });

      const data = await response.json(); // 解析後端回應的 JSON

      if (response.ok) {
        // 可以在這裡執行跳轉頁面或儲存全域狀態的操作
        router.push("/homepage");
      } else {
        setError(data.message || "登入失敗");
      }
    } catch {
      setError("網絡錯誤，請稍後再試！");
    }
  };

  return (
    <div className="bg-main-bg-color flex justify-center items-center py-12 px-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg max-w-5xl w-full h-[600px]">
        {/* 左側區塊 */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex flex-col justify-between"
          style={{
            backgroundImage: "url('/images/cafe-background.jpg')",
          }}
        >
          <div className="p-8 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white text-center h-full">
            {/* 左側內容 */}
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
                onClick={() => alert("Sign Up Clicked")}
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
              <input
                type="password"
                id="password"
                placeholder="********"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-accent-color py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="text-right">
              <a href="#" className="text-sm text-gray-500 hover:underline">
                忘記密碼？
              </a>
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
        </div>
      </div>
    </div>
  );
};
export default SignIn;
