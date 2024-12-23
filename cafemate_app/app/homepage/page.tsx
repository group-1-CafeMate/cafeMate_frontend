"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("homepage");
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [nearbyCafes, setNearbyCafes] = useState<any[]>([]);
  const [popularCafes, setPopularCafes] = useState<any[]>([]);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = [
    "適合讀書",
    "不限時",
    "有插座",
    "提供WiFi",
    "營業中",
    "可帶寵物",
  ];

  // 處理搜尋框的變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 更新選項
  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // 處理搜尋邏輯
  const handleSearch = () => {
    const searchQuery = [...selectedOptions, inputValue].join(", ");
    console.log("搜尋條件:", searchQuery);
  };

  // 獲取使用者定位
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setError(null);
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("您的瀏覽器不支援定位功能");
    }
  };

  useEffect(() => {
    getLocation(); // 自動嘗試獲取定位
  }, []);

  // 模擬後端 API 請求
  const fetchNearbyCafes = async () => {
    const response = await fetch("/api/nearby-cafes");
    const data = await response.json();
    setNearbyCafes(data);
  };

  const fetchPopularCafes = async () => {
    const response = await fetch("/api/popular-cafes");
    const data = await response.json();
    setPopularCafes(data);
  };

  useEffect(() => {
    fetchNearbyCafes();
    fetchPopularCafes();
  }, []);

  return (
    <div className="min-h-screen bg-[#dfdad5] text-[#563517]">
      {/* 第一區塊：Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <button
            className={`${
              activeTab === "homepage" ? "underline" : ""
            } hover:underline`}
            onClick={() => setActiveTab("homepage")}
          >
            Homepage
          </button>
          <Link href="/hotsearch">
            <button className="hover:underline">Hot Search</button>
          </Link>
        </div>
        <button className="bg-white text-[#563517] px-4 py-2 rounded hover:bg-gray-200">
          Log Out
        </button>
      </div>

      {/* 第二區塊：Search Bar */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          告訴我們你的需求，我們將幫你找到最佳的咖啡廳！
        </h1>
        <div className="flex justify-center items-center space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-2/3 p-3 border border-gray-400 rounded focus:outline-none"
            placeholder="輸入你的需求..."
          />
          <button
            className="bg-[#563517] text-white px-4 py-2 rounded hover:bg-[#705636]"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {/* Checkboxes */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {options.map((option) => (
            <div
              key={option}
              className={`flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all ${
                selectedOptions.includes(option)
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-200 text-gray-700 border-gray-300"
              }`}
              onClick={() => toggleOption(option)}
            >
              {selectedOptions.includes(option) && (
                <span className="mr-2">✔️</span>
              )}
              {option}
            </div>
          ))}
        </div>
      </div>

      {/* 使用者定位 */}
      <div className="p-4 bg-gray-100 text-center">
        {location ? (
          <p>
            您的定位：緯度 {location.latitude}, 經度 {location.longitude}
          </p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>正在嘗試獲取您的定位...</p>
        )}
      </div>

      {/* 第三區塊：捷運站附近的熱門咖啡廳 Carousel */}
      <div className="p-8 bg-[#563517] text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          捷運站附近的熱門咖啡廳
        </h2>
        <Splide
          options={{
            type: "slide",
            perPage: 3,
            gap: "1rem",
            arrows: true,
            pagination: false,
            breakpoints: {
              991: { perPage: 2 },
              767: { perPage: 1 },
            },
          }}
        >
          {nearbyCafes.map((cafe, index) => (
            <SplideSlide key={index}>
              <div className="bg-white text-[#563517] p-4 rounded-lg shadow-md">
                <Image
                  src={cafe.imageUrl}
                  alt={cafe.name}
                  width={500}
                  height={300}
                />
                <h3 className="text-lg font-semibold mt-4">{cafe.name}</h3>
                <p className="text-sm text-gray-600">{cafe.description}</p>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>

      {/* 第四區塊：熱門關鍵字的咖啡廳 Carousel */}
      <div className="p-8 bg-[#dfdad5]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          熱門關鍵字的咖啡廳
        </h2>
        <Splide
          options={{
            type: "slide",
            perPage: 3,
            gap: "1rem",
            arrows: true,
            pagination: false,
            breakpoints: {
              991: { perPage: 2 },
              767: { perPage: 1 },
            },
          }}
        >
          {popularCafes.map((cafe, index) => (
            <SplideSlide key={index}>
              <div className="bg-white text-[#563517] p-4 rounded-lg shadow-md">
                <Image
                  src={cafe.imageUrl}
                  alt={cafe.name}
                  width={500}
                  height={300}
                />
                <h3 className="text-lg font-semibold mt-4">{cafe.name}</h3>
                <p className="text-sm text-gray-600">{cafe.description}</p>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </div>
  );
};

export default HomePage;
