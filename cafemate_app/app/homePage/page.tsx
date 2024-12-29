"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import API from "src/constants/api";

const Splide = dynamic(
  () => import("@splidejs/react-splide").then((mod) => mod.Splide),
  { ssr: false }
);
const SplideSlide = dynamic(
  () => import("@splidejs/react-splide").then((mod) => mod.SplideSlide),
  { ssr: false }
);

// Removed unused getCookie function

interface Cafe {
  cafe_id: string; // 咖啡廳的唯一 ID
  name: string; // 咖啡廳名稱
  image_url: string | null; // 圖片 URL，允許為 null
  gmap_link?: string; // Google Maps 鏈接（可選）
  addr: string; // 咖啡廳地址
}
const HomePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("homepage");
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = {
    "適合讀書": "work_and_study_friendly",
    "不限時": "time_unlimit",
    "有插座": "socket",
    "提供WiFi": "wifi",
    "營業中": "", // 營業中在由咖啡廳openhour在前端判斷
    "可帶寵物": "pets_allowed",
  };

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
    // 构建查询字符串
    const queryParams = new URLSearchParams();

    // 添加选定的筛选条件
    selectedOptions.forEach((opt) => {
      const key = options[opt as keyof typeof options];
      if (key !== "") {
        queryParams.append(key, "true");
      }
    });

    // 如果有地理位置，添加经纬度
    if (location) {
      queryParams.append("latitude", location.latitude.toString());
      queryParams.append("longitude", location.longitude.toString());
    }

    // 导航到 FilteredPage
    router.push(`/filtered?${queryParams.toString()}`);
  };

  useEffect(() => {
    const fetchNearbyCafes = async () => {
      const baseUrl = API.Cafe.GetCafes;
      const query = location
        ? `?latitude=${location.latitude}&longitude=${location.longitude}`
        : "";

      const response = await fetch(baseUrl + query, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      setNearbyCafes(data["cafes"]);
    };

    fetchNearbyCafes();
  }, [location]);

  // 處理篩選條件選擇
  const handleOptionSelect = (option: string) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];

    setSelectedOptions(newSelectedOptions);
    // 更新輸入框的值，將所有選中的選項用空格分隔
    setInputValue(newSelectedOptions.join(" "));
  };

  const mrtLines = {
    "1 號線 文湖線": [
      "BR01動物園",
      "BR02木柵",
      "BR03萬芳社區",
      "BR04萬芳醫院",
      "BR05辛亥",
      "BR06麟光",
      "BR07六張犁",
      "BR08科技大樓",
      "BR09大安",
      "BR10忠孝復興",
      "BR11南京復興",
      "BR12中山國中",
      "BR13松山機場",
      "BR14大直",
      "BR15劍南路",
      "BR16西湖",
      "BR17港墘",
      "BR18文德",
      "BR19內湖",
      "BR20大湖公園",
      "BR21葫洲",
      "BR22東湖",
      "BR23南港軟體園區",
      "BR24南港展覽館",
    ],
    "2 號線 淡水信義線": [
      "R02象山",
      "R03台北101/世貿",
      "R04信義安和",
      "R05大安",
      "R06大安森林公園",
      "R07東門",
      "R08中正紀念堂",
      "R09台大醫院",
      "R10台北車站",
      "R11中山",
      "R12雙連",
      "R13民權西路",
      "R14圓山",
      "R15劍潭",
      "R16士林",
      "R17芝山",
      "R18明德",
      "R19石牌",
      "R20唭哩岸",
      "R21奇岩",
      "R22北投",
      "R22A新北投",
      "R23復興崗",
      "R24忠義",
      "R25關渡",
      "R26竹圍",
      "R27紅樹林",
      "R28淡水",
    ],
    "3 號線 松山新店線": [
      "G01新店",
      "G02新店區公所",
      "G03七張",
      "G03A小碧潭",
      "G04大坪林",
      "G05景美",
      "G06萬隆",
      "G07公館",
      "G08台電大樓",
      "G09古亭",
      "G10中正紀念堂",
      "G11小南門",
      "G12西門",
      "G13北門",
      "G14中山",
      "G15松江南京",
      "G16南京復興",
      "G17台北小巨蛋",
      "G18南京三民",
      "G19松山",
    ],
    "4 號線 中和新蘆線": [
      "O01南勢角",
      "O02景安",
      "O03永安市場",
      "O04頂溪",
      "O05古亭",
      "O06東門",
      "O07忠孝新生",
      "O08松江南京",
      "O09行天宮",
      "O10中山國小",
      "O11民權西路",
      "O12大橋頭",
      "O13台北橋",
      "O14菜寮",
      "O15三重",
      "O16先嗇宮",
      "O17頭前庄",
      "O18新莊",
      "O19輔大",
      "O20丹鳳",
      "O21迴龍",
      "O50三重國小",
      "O51三和國中",
      "O52徐匯中學",
      "O53三民高中",
      "O54蘆洲",
    ],
    "5 號線 板南線": [
      "BL01頂埔",
      "BL02永寧",
      "BL03土城",
      "BL04海山",
      "BL05亞東醫院",
      "BL06府中",
      "BL07板橋",
      "BL08新埔",
      "BL09江子翠",
      "BL10龍山寺",
      "BL11西門",
      "BL12台北車站",
      "BL13善導寺",
      "BL14忠孝新生",
      "BL15忠孝復興",
      "BL16忠孝敦化",
      "BL17國父紀念館",
      "BL18市政府",
      "BL19永春",
      "BL20後山埤",
      "BL21昆陽",
      "BL22南港",
      "BL23南港展覽館",
    ],
  };

  return (
    <div className="min-h-screen bg-[#dfdad5] text-[#563517]">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center px-6 sm:px-8 py-4 bg-[#563517] text-white text-lg">
        <div className="flex space-x-6">
          <button
            className={`${activeTab === "homepage" ? "underline" : ""} hover:underline text-lg`}
            onClick={() => setActiveTab("homepage")}
          >
            Homepage
          </button>
          <Link href="/hotsearch">
            <button className="hover:underline text-lg">Hot Search</button>
          </Link>
        </div>
        <button className="bg-white text-[#563517] px-6 py-3 rounded hover:bg-gray-200 text-lg">
          Log Out
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-8 sm:p-12 md:p-16 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
          告訴我們你的需求，我們將幫你找到最佳的咖啡廳！
        </h1>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full sm:w-2/3 p-4 border border-gray-400 rounded focus:outline-none text-lg"
            placeholder="點擊下方條件輸入你的需求..."
          />
          <button
            className="w-full sm:w-auto bg-[#563517] text-white px-8 py-4 rounded hover:bg-[#705636] text-lg transition-all duration-300"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8">
          {Object.keys(options).map((option) => (
            <div
              key={option}
              className={`flex items-center justify-center px-6 py-4 rounded-full cursor-pointer transition-all duration-300 text-lg transform hover:scale-110 ${selectedOptions.includes(option)
                ? "bg-green-500 text-white border-green-500"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:shadow-lg"
                }`}
              onClick={() => handleOptionSelect(option)}
            >
              {selectedOptions.includes(option) && (
                <span className="mr-2">✔️</span>
              )}
              {option}
            </div>
          ))}
        </div>
      </div>

      {/* Location Info */}
      <div className="p-4 bg-gray-100 text-center text-lg">
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

      {/* Cafes Section with Carousel */}
      <div className="bg-[#724e2c] text-white min-h-screen flex flex-col justify-between">
        <div className="p-8 sm:p-12 flex-grow flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold">
              捷運站附近的熱門咖啡廳
            </h2>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="p-3 rounded text-[#563517] text-lg w-full sm:w-64"
            >
              <option value="">請選擇捷運站</option>
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
          </div>

          <div className="splide-container relative flex-grow">
            <Splide
              options={{
                type: "slide",
                perPage: 3,
                gap: "2rem",
                arrows: true,
                pagination: false,
                breakpoints: {
                  1024: { perPage: 2 },
                  640: { perPage: 1 },
                },
              }}
            >
              {nearbyCafes && nearbyCafes.length > 0 ? (
                nearbyCafes.map((cafe: Cafe, index) => (
                  <SplideSlide key={index}>
                    <div className="bg-white text-[#563517] p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                      {/* 圖片區塊 */}
                      {cafe.image_url && (
                        <div className="aspect-w-16 aspect-h-9 relative">
                          <Image
                            src={cafe.image_url}
                            alt={cafe.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                        </div>
                      )}

                      {/* 名稱與地址 */}
                      <h3 className="text-xl font-semibold mt-4">
                        {cafe.name}
                      </h3>
                      <p className="text-lg text-gray-600">{cafe.addr}</p>

                      {/* Google Map 鏈接 */}
                      {cafe.gmap_link && (
                        <a
                          href={cafe.gmap_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline text-sm mt-2 inline-block"
                        >
                          查看地圖
                        </a>
                      )}
                    </div>
                  </SplideSlide>
                ))
              ) : (
                <div className="text-center p-4 text-lg">
                  正在載入咖啡廳資料...
                </div>
              )}
            </Splide>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="bg-[#5a401e] text-center py-4">
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
