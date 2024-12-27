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
    } catch (err) {
      setError("網絡錯誤，請稍後再試！");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg-color">
      <div className="flex flex-wrap bg-white rounded-lg shadow-lg w-full max-w-4xl">
        {/* 左側區塊 */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center rounded-l-lg"
          style={{
            backgroundImage: "url('/images/cafe-background.jpg')", // 背景圖片
          }}
        >
          <div className="p-8 h-full flex flex-col justify-center items-center bg-black bg-opacity-50 text-white text-center">
            <h1 className="text-3xl font-bold mb-4">
              We haven&apos;t met before right?
            </h1>
            <p className="mb-4">Then you should try us!</p>
            <p className="mb-8">
              CafeMate 是台北和新北地區的咖啡好幫手！
            </p>
            <Button
              label="SIGN UP"
              onClick={() => alert("Sign Up Clicked")} // 點擊後的回應
              variant="solid"
            />
          </div>
        </div>

        {/* 右側區塊 */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-8">
            歡迎回到 Cafemate
          </h2>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault(); // 阻止表單預設提交行為
              handleSignIn(); // 呼叫登入函數
            }}
          >
            <div>
              <label htmlFor="username" className="block text-foreground">
                USERNAME
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter username" // 提示使用者輸入使用者名稱
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-accent-color py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // 更新使用者名
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-foreground">
                PASSWORD
              </label>
              <input
                type="password"
                id="password"
                placeholder="********" // 提示使用者輸入密碼
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-accent-color py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // 更新密碼
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>} {/* 顯示錯誤訊息 */}
            <div className="text-right">
              <a href="#" className="text-sm text-gray-500 hover:underline">
                忘記密碼？
              </a>
            </div>
            <div className="mt-4">
              <Button label="SIGN IN" variant="solid" className="bg-accent-color" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
