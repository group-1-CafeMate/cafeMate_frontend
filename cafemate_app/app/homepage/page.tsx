"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import API from "src/constants/api";
import { label_options } from "src/constants/label_options";
import { getUserUid } from "components/GetUid";
import MapView from "components/MapView";
import MapSearchBar, { SearchFilters } from "components/MapSearchBar";
import renderStars from "components/Star";
import { mockCafes } from "src/constants/mockData";
import AuthButton from "components/AuthButton";
import UserMenu from "components/UserMenu";
import AuthModal from "components/AuthModal";

// 开发模式标志 - 设置为 true 使用模拟数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && true; // 改为 true 启用模拟数据

interface Cafe {
  cafe_id: string;
  name: string;
  rating: number;
  latitude: number;
  longitude: number;
  open_hour?: {
    day_of_week: string;
    open_time: string;
    close_time: string;
  }[];
  gmap_link?: string;
  distance?: number;
  images_urls: string[];
  isOpenNow?: boolean;
  address?: string;
}

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const uid = getUserUid();
    if (uid) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
        },
        (err) => {
          console.log(err.message);
        }
      );
    }
  }, []);

  const handleSearch = async (filters: SearchFilters) => {
    const queryParams = new URLSearchParams();

    if (filters.station) {
      queryParams.append("station", filters.station);
    }

    Object.entries(filters.selectedOptions).forEach(([label, isSelected]) => {
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

    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API.Cafe.GetFilteredCafe}?${queryParams.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.cafes || !Array.isArray(data.cafes)) {
        throw new Error("Invalid data format");
      }
      
      const cafesWithOpenStatus = data.cafes.map((cafe: Cafe) => ({
        ...cafe,
        isOpenNow: cafe.open_hour ? checkIsOpen(cafe.open_hour) : false,
      }));
      setFilteredCafes(cafesWithOpenStatus);
    } catch (error) {
      console.error("Error filtering cafes:", error);
      setError("搜尋失敗，請稍後再試");
      // 搜索失败时保持当前显示的咖啡厅
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    setFilteredCafes(allCafes);
  };

  const handleCafeClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
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
      setIsLoading(true);
      setError(null);
      
      // 如果使用模拟数据
      if (USE_MOCK_DATA) {
        setTimeout(() => {
          const cafesWithOpenStatus = mockCafes.map((cafe) => ({
            ...cafe,
            isOpenNow: cafe.open_hour ? checkIsOpen(cafe.open_hour) : false,
          }));
          setAllCafes(cafesWithOpenStatus);
          setFilteredCafes(cafesWithOpenStatus);
          setIsLoading(false);
        }, 500); // 模拟网络延迟
        return;
      }
      
      try {
        const response = await fetch(API.Cafe.GetCafes, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.cafes || !Array.isArray(data.cafes)) {
          throw new Error("Invalid data format");
        }

        const cafesWithOpenStatus = data.cafes.map((cafe: Cafe) => ({
          ...cafe,
          isOpenNow: cafe.open_hour ? checkIsOpen(cafe.open_hour) : false,
        }));
        setAllCafes(cafesWithOpenStatus);
        setFilteredCafes(cafesWithOpenStatus);
      } catch (error) {
        console.error("Error fetching cafes:", error);
        const errorMessage = error instanceof Error ? error.message : "無法載入咖啡廳資料";
        setError(`${errorMessage}。請檢查網路連接或稍後再試。提示：可以在代碼中將 USE_MOCK_DATA 設為 true 使用模擬數據測試。`);
        // 使用模拟数据作为后备
        setAllCafes([]);
        setFilteredCafes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCafes();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    const userId = getUserUid();
    if (!userId) return;

    try {
      const response = await fetch(`${API.User.GetUserInfo}${userId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUsername(data.username);
        setEmail(data.email);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
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

      if (response.ok) {
        document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUsername(null);
        setEmail(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAuthSuccess = () => {
    fetchUserData();
  };

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
      <div className="h-screen flex flex-col bg-[#dfdad5]">
      {/* Auth Button in top right corner */}
      <div className="absolute top-4 right-4 z-20">
        {username ? (
          <UserMenu
            username={username}
            email={email}
            onLogout={handleLogout}
          />
        ) : (
          <AuthButton
            onSignIn={() => {
              setAuthMode("signin");
              setShowAuthModal(true);
            }}
            onSignUp={() => {
              setAuthMode("signup");
              setShowAuthModal(true);
            }}
          />
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
          {error && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          )}
          
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#563517] mx-auto mb-4"></div>
                <p className="text-gray-600">載入地圖中...</p>
              </div>
            </div>
          ) : (
            <>
              <MapView 
                cafes={filteredCafes} 
                onCafeClick={handleCafeClick}
                selectedCafe={selectedCafe}
              />
              <MapSearchBar 
              onSearch={handleSearch} 
              onClear={handleClearFilters}
            />
            {isSearching && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-white px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#563517]"></div>
                  <span className="text-sm">搜尋中...</span>
                </div>
              </div>
            )}
            {filteredCafes.length === 0 && !isLoading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-lg shadow-xl p-8 max-w-md">
                <div className="text-center">
                  <div className="text-6xl mb-4">☕</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">沒有找到咖啡廳</h3>
                  <p className="text-gray-600 mb-4">
                    {error 
                      ? "無法載入咖啡廳資料" 
                      : "請嘗試調整搜尋條件或清除篩選"}
                  </p>
                  {error && (
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-[#563517] text-white px-6 py-2 rounded-lg hover:bg-[#724e2c] transition-colors"
                    >
                      重新載入
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Cafe Detail Card - 底部彈出 */}
        {selectedCafe && (
          <div 
            className="absolute bottom-0 left-0 w-96 max-h-[70vh] bg-white shadow-2xl overflow-y-auto z-30 rounded-t-2xl animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-2xl">
            <h3 className="text-xl font-bold text-[#563517]">咖啡廳詳情</h3>
            <button
              onClick={() => setSelectedCafe(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {selectedCafe.images_urls.length > 0 && (
              <img
                src={selectedCafe.images_urls[0]}
                alt={selectedCafe.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <h4 className="text-2xl font-bold mb-2">{selectedCafe.name}</h4>

            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  selectedCafe.isOpenNow
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {selectedCafe.isOpenNow ? "營業中" : "未營業"}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">評分</div>
              <div>{renderStars(selectedCafe.rating)}</div>
            </div>

            {selectedCafe.address && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">地址</div>
                <div className="text-sm">{selectedCafe.address}</div>
              </div>
            )}

            <Link
              href={`/cafeinfo/${selectedCafe.cafe_id}`}
              className="block w-full bg-[#563517] text-white text-center px-6 py-3 rounded-lg hover:bg-[#724e2c] transition-colors"
            >
              查看完整資訊
            </Link>
          </div>
          </div>
        )}
      </div>
    </div>

    <style jsx>{`
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `}</style>
    </>
  );
};

export default HomePage;
