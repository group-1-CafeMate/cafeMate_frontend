"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import API from "src/constants/api";


const Splide = dynamic(() => import("@splidejs/react-splide").then((mod) => mod.Splide), { ssr: false });
const SplideSlide = dynamic(() => import("@splidejs/react-splide").then((mod) => mod.SplideSlide), { ssr: false });

const getCookie = (name: string) => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith(name));
  return cookie ? cookie.split('=')[1] : null;
};

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("homepage");
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [popularCafes, setPopularCafes] = useState([]);
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

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setError(null);
        },
        (err) => {
          setError(err.message);
        }
      );
    }
  }, []);

  const handleSearch = () => {
    const searchQuery = [...selectedOptions, inputValue].join(", ");
    console.log("搜尋條件:", searchQuery);
  };

  useEffect(() => {
    const fetchNearbyCafes = async () => {

      const baseUrl = API.Cafe.GetCafes;
      const query = location
        ? `?latitude=${location.latitude}&longitude=${location.longitude}`
        : "";


      const response = await fetch(baseUrl + query, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      console.log(data);
      setNearbyCafes(data["cafes"]);
    };

    const fetchPopularCafes = async () => {

      const baseUrl = API.Cafe.GetTopCafe;
      const query = location
        ? `?latitude=${location.latitude}&longitude=${location.longitude}`
        : "";

      const response = await fetch(baseUrl + query, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      console.log(data);
      setPopularCafes(data["cafes"]);
    };

    fetchNearbyCafes();
    fetchPopularCafes();
  }, [location]);

  return (
    <div className="min-h-screen bg-[#dfdad5] text-[#563517]">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <button
            className={`${activeTab === "homepage" ? "underline" : ""} hover: underline`}
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

      {/* Search Bar */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          告訴我們你的需求，我們將幫你找到最佳的咖啡廳！
        </h1>
        <div className="flex justify-center items-center space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {options.map((option) => (
            <div
              key={option}
              className={`flex items - center justify - center px - 4 py - 2 rounded - full cursor - pointer transition - all ${selectedOptions.includes(option)
                ? "bg-green-500 text-white border-green-500"
                : "bg-gray-200 text-gray-700 border-gray-300"
                } `}
              onClick={() => setSelectedOptions((prev) =>
                prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
              )}
            >
              {selectedOptions.includes(option) && <span className="mr-2">✔️</span>}
              {option}
            </div>
          ))}
        </div>
      </div>

      {/* Location Info */}
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

      {/* Nearby Cafes Carousel */}
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
          {nearbyCafes && nearbyCafes.length > 0 ? (
            nearbyCafes.map((cafe, index) => (
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
            ))
          ) : (
            <div className="text-center p-4">正在載入咖啡廳資料...</div>
          )}
        </Splide>
      </div>

      {/* Popular Cafes Carousel */}
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
          {popularCafes && popularCafes.length > 0 ? (
            popularCafes.map((cafe, index) => (
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
            ))
          ) : (
            <div className="text-center p-4">正在載入熱門咖啡廳資料...</div>
          )}

        </Splide>
      </div>
    </div>
  );
};

export default HomePage;
