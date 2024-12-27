"use client"; // 加在檔案的第一行

import Button from "components/Button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import API from "src/constants/api";

const SignUp: React.FC = () => {
  const [username, setUsername] = useState(""); // 儲存使用者名稱
  const [email, setEmail] = useState(""); // 儲存電子郵件
  const [password, setPassword] = useState(""); // 儲存密碼
  const [error, setError] = useState(""); // 儲存錯誤訊息
  const [success, setSuccess] = useState(""); // 儲存成功訊息
  const router = useRouter();
  // 發送註冊請求的函數
  const handleSignUp = async () => {
    try {
      // 向後端發送 POST 請求
      const response = await fetch(API.User.SignUp, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }), // 傳送使用者資料
      });

      const data = await response.json(); // 解析後端回應的 JSON

      if (response.ok) {
        setSuccess("註冊成功！歡迎加入！");
        setError(""); // 清除錯誤訊息
        router.push("/signin");
      } else {
        setError(data.message || "註冊失敗");
        setSuccess(""); // 清除成功訊息
      }
    } catch (err) {
      setError("網絡錯誤，請稍後再試！");
      setSuccess("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg-color">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Create an Account</h2>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault(); // 阻止默認行為，避免表單觸發 GET 請求
            handleSignUp(); // 執行自定義註冊函式
          }}
        >
          <div>
            <label htmlFor="username" className="block text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="e.g. Howard"
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-input-focus-color py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // 更新使用者
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="e.g. howard.thurman@gmail.com"
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-input-focus-color py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // 更新電子郵件
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-input-focus-color py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // 更新密碼
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>} {/* 顯示錯誤訊息 */}
          {success && <p className="text-green-500 text-sm">{success}</p>} {/* 顯示成功訊息 */}
          <div className="mt-4">
            <Button
              label="Let's get started"
              onClick={() => alert("Sign Up Clicked")}
              variant="solid"
              className="bg-button-bg-color hover:bg-button-hover-bg-color"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
