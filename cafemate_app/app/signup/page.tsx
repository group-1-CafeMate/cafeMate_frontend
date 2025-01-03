"use client"; // 加在檔案的第一行

import Button from "components/Button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import API from "src/constants/api";
import { Eye, EyeOff } from "lucide-react"; // Import icons

const SignUp: React.FC = () => {
  const [username, setUsername] = useState(""); // 儲存使用者名稱
  const [email, setEmail] = useState(""); // 儲存電子郵件
  const [password, setPassword] = useState(""); // 儲存密碼
  const [error, setError] = useState(""); // 儲存錯誤訊息
  const [success, setSuccess] = useState(""); // 儲存成功訊息
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
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
        setSuccess("註冊成功！驗證信已發送到您的電子郵件！");
        setError("");

        // 發送驗證信
        await fetch(API.User.SendVerificationEmail, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: username, email }),
        });

        setTimeout(() => {
          router.push("/signin");
        }, 2000); // 延遲導航以便顯示成功訊息
      } else {
        setError(data.message || "註冊失敗");
        setSuccess("");
      }
    } catch (err) {
      setError("網絡錯誤，請稍後再試！");
      setSuccess("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg-color">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Create an Account
        </h2>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault(); // 阻止默認行為，避免表單觸發 GET 請求
            handleSignUp(); // 執行自定義註冊函式
          }}
          style={{
            minHeight: "400px", // 設定最小高度，避免內容不足時跑版
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle input type
                id="password"
                placeholder="********"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-input-focus-color py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
          {/* 顯示錯誤訊息 */}
          {success && <p className="text-green-500 text-sm">{success}</p>}{" "}
          {/* 顯示成功訊息 */}
          <div className="mt-4 flex justify-center">
            {/* 使用 flex 和 justify-center 屬性讓按鈕置中 */}
            <Button
              label="Let's get started"
              onClick={() => alert("Sign Up Clicked")}
              variant="solid"
              className="bg-button-bg-color hover:bg-button-hover-bg-color"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-md">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/signin")}
                className="text-input-focus-color cursor-pointer hover:underline"
              >
                Sign In
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
