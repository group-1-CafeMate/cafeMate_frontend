"use client";

import renderStars from "components/Star";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import API from "src/constants/api";
import { label_options } from "src/constants/label_options";
import { mrtLines } from "src/constants/mrtStations";
import getCookie from "src/getCookies";
interface Cafe {
  cafe_id: string;
  name: string;
  rating: number; //新增評分
  open_hour: {
    day_of_week: string;
    open_time: string;
    close_time: string;
  }[]; // 新增營業時間
  gmap_link?: string;
  distance: number; //新增與用戶距離
  images_urls: string[];
  isOpenNow?: boolean; // 是否營業
}
const HomePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("homepage");
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [displayedCafes, setDisplayedCafes] = useState<Cafe[]>([]);
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cafesPerPage = 3; // 每頁顯示卡片數量
  const totalPages = Math.min(Math.ceil(allCafes.length / cafesPerPage), 3); // 總頁數3頁
  const [username, setUsername] = useState<string | null>(null); // State to store username
  const userId = getCookie("uid"); // Get the user ID from cookies

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setError(null);
        },
        (err) => {
          console.log(err.message);
        }
      );
    }
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (selectedStation) {
      queryParams.append("station", selectedStation);
    }

    // selectedOptions.forEach((opt) => {
    //   const key = label_options[opt as keyof typeof label_options];
    //   if (key !== "") {
    //     queryParams.append(key, "true");
    //   }
    // });

    // 透過 Object.entries() 取得物件的 key-value pair
    Object.entries(selectedOptions).forEach(([label, isSelected]) => {
      if (isSelected) {
        const key = label_options[label as keyof typeof label_options];
        if (key) {
          queryParams.append(key, "true");
        }
      }
    });

    if (location) {
      queryParams.append("latitude", location.latitude.toString());
      queryParams.append("longitude", location.longitude.toString());
    }

    router.push(`/filtered?${queryParams.toString()}`);
  };

  // 檢查咖啡廳是否營業中
  const checkIsOpen = (
    openHours: { day_of_week: string; open_time: string; close_time: string }[]
  ): boolean => {
    const now = new Date();
    const currentDay = `星期${["日", "一", "二", "三", "四", "五", "六"][now.getDay()]}`;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    return openHours.some((schedule) => {
      if (schedule.day_of_week === currentDay) {
        const { open_time, close_time } = schedule;
        // 檢查是否為「休息」
        if (open_time === "休息" || close_time === "休息") return false;
        return currentTime >= open_time && currentTime <= close_time;
      }
      return false;
    });
  };

  useEffect(() => {
    const fetchAllCafes = async () => {
      const response = await fetch(API.Cafe.GetCafes, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      const cafesWithOpenStatus = data.cafes.map((cafe: Cafe) => ({
        ...cafe,
        isOpenNow: checkIsOpen(cafe.open_hour), // 判斷是否營業
      }));

      setAllCafes(cafesWithOpenStatus);
    };

    fetchAllCafes();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * cafesPerPage;
    const endIndex = startIndex + cafesPerPage;
    const newDisplayedCafes = allCafes.slice(startIndex, endIndex);
    setDisplayedCafes(newDisplayedCafes);
  }, [currentPage, allCafes]);

  // 處理篩選條件選擇
  const handleOptionSelect = (option: string) => {
    setSelectedOptions((prev) => {
      const newOptions = {
        ...prev,
        [option]: !prev[option],
      };

      // 更新輸入框的值
      const selectedOptions = Object.entries(newOptions)
        .filter(([_, isSelected]) => isSelected)
        .map(([label]) => label);

      setInputValue(selectedOptions.join(" "));

      return newOptions;
    });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(API.User.LogOut, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.status === 200) {
        // alert(data.message); // Show success message
        router.push("/signin"); // Redirect to signin page
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during logout");
    }
  };

  // Fetch user data after login
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API.User.GetUserInfo}?uid=${userId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success" && data.data.username) {
        setUsername(data.data.username); // Set the username from the response
      } else {
        console.error(data.message); // Handle error message
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData(); // Fetch user data on component mount
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#dfdad5] text-[#563517]">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center px-6 sm:px-8 py-4 bg-[#563517] text-white text-lg">
        <div className="flex space-x-6">
          <button
            className={`${activeTab === "homepage" ? "underline" : ""} hover:underline text-lg`}
            onClick={() => setActiveTab("homepage")}
          >
            首頁
          </button>
          <Link href="/hotsearch">
            <button className="hover:underline text-lg">熱門推薦</button>
          </Link>
        </div>
        <button
          className="bg-white text-[#563517] px-5 py-2 rounded text-lg transition-colors duration-200 hover:bg-[#c5a782] hover:text-white"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
      {/* Search Section */}
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-2xl font-bold text-center mb-4">
          告訴我們你的需求，我們將幫你找到最佳的咖啡廳！
        </h1>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          {/* MRT Station Selector */}
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full sm:w-1/5 p-2 border border-gray-400 rounded focus:outline-none text-lg"
          >
            <option value="">選擇捷運站</option>
            {Object.entries(mrtLines).map(([line, stations]) => (
              <optgroup key={line} label={line}>
                {stations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <input
            type="text"
            value={inputValue}
            readOnly
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full sm:w-2/5 p-2 border border-gray-400 rounded focus:outline-none text-lg"
            placeholder="點擊下方條件輸入你的需求..."
          />
          <button
            className="w-full sm:w-1/5 bg-[#563517] text-white px-6 py-2 rounded hover:bg-[#705636] text-lg transition-all duration-300"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
          {Object.keys(label_options).map((option) => (
            <div
              key={option}
              className={`flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all duration-300 text-lg transform hover:scale-105 ${selectedOptions[option]
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-200 text-gray-700 border-gray-300 hover:shadow-lg"
                }`}
              onClick={() => handleOptionSelect(option)}
            >
              {selectedOptions[option] && <span className="mr-2">✔️</span>}
              {option}
            </div>
          ))}
        </div>
      </div>

      {/* Cafes Section with Grid Layout */}
      <div className="bg-[#724e2c] text-white min-h-[70vh] flex flex-col justify-between">
        <div className="p-6 sm:p-8 flex-grow flex flex-col">
          <h2 className="text-2xl sm:text-2xl font-bold mb-4 text-center">
            嗨! {username ? username : "使用者"} 我們為你收集了這些咖啡廳：
          </h2>

          {/* Grid Layout for Cafe Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCafes.map((cafe: Cafe, index) => (
              <Link
                href={`/cafeinfo/${cafe.cafe_id}`}
                key={cafe.cafe_id}
                className="bg-white text-[#563517] p-6 rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              >
                {/* Cafe Image */}
                {cafe.images_urls.length > 0 ? (
                  <div className="w-full h-64 relative mb-4">
                    <img
                      src={cafe.images_urls[0]}
                      alt={cafe.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">無圖片</p>
                  </div>
                )}

                {/* Cafe Details */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    {/* Cafe Name */}
                    <h3 className="text-lg font-bold">{cafe.name}</h3>
                    {/* Open/Closed Tag */}
                    <span
                      className={`text-lg font-bold px-2 py-1 rounded whitespace-nowrap ${cafe.isOpenNow
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        }`}
                    >
                      {cafe.isOpenNow ? "營業中" : "未營業"}
                    </span>
                  </div>
                  {/* Star Rating */}
                  <span className="text-sm text-gray-600 block">
                    {renderStars(cafe.rating)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-3 space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-40"
          >
            上一頁
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-40"
          >
            下一頁
          </button>
        </div>

        <footer className="bg-[#5a401e] text-center py-3">
          <p className="text-sm">© 2024 CafeMate. All rights reserved.</p>
        </footer>

        <style jsx global>{`
          .splide__arrow {
            background: white;
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.2s;
            z-index: 10;
          }
          .splide__arrow:hover {
            background: #f8f8f8;
          }
          .splide__arrow--prev {
            left: -1.5rem;
          }
          .splide__arrow--next {
            right: -1.5rem;
          }
          .splide__track {
            overflow: visible;
            padding: 1rem 0;
          }
        `}</style>
      </div>
    </div>
  );
};

export default HomePage;
