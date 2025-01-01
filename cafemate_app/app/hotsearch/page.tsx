"use client";

import renderStars from "components/Star";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import API from "src/constants/api";

interface Cafe {
  cafe_id: string;
  name: string;
  image_url: string | null;
  rating: number;
  open_hour: {
    day_of_week: string;
    open_time: string;
    close_time: string;
  }[];
  distance: number;
  labels: string[];
  gmap_link?: string;
  isOpenNow?: boolean; // 是否營業中
  ig_post_count?: number; // IG post count
}
const HotSearchPage = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  const cafesPerPage = 6;
  const totalPages = 1;

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setError(null);
        },
        (err) => {
          console.warn(err.message);
          setLocation(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchTopCafes = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (location) {
          queryParams.append("latitude", location.latitude.toString());
          queryParams.append("longitude", location.longitude.toString());
        }
        const targetUrl = `${API.Cafe.GetTopCafe}?${queryParams.toString()}`;
        const response = await fetch(targetUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load cafes: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.cafes) {
          throw new Error("No cafe data received");
        }

        // 檢查營業狀態的邏輯
        const now = new Date();
        const currentDay = `星期${["日", "一", "二", "三", "四", "五", "六"][now.getDay()]}`;
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;

        const cafesWithOpenStatus = data.cafes.map((cafe: Cafe) => {
          const isOpenNow = cafe.open_hour.some((schedule) => {
            if (schedule.day_of_week === currentDay) {
              const { open_time, close_time } = schedule;
              if (open_time === "休息" || close_time === "休息") return false;
              return currentTime >= open_time && currentTime <= close_time;
            }
            return false;
          });

          return {
            ...cafe,
            isOpenNow, // 加入是否營業的屬性
          };
        });

        setCafes(cafesWithOpenStatus);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    };

    fetchTopCafes();
  }, [location]);

  const formatIGPostCount = (count: number | undefined): string => {
    if (count === undefined) return "N/A";
    return count.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#dfdad5]">
        <p className="text-lg">載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#dfdad5]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfdad5] text-[#563517]">
      {/* Navigation */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <Link href="/homepage">
            <button className="hover:bg-[#724e2c] px-4 py-2 rounded-lg transition-colors duration-300 text-lg">回首頁</button>
          </Link>
          <button className="hover:bg-[#724e2c] px-4 py-2 rounded-lg transition-colors duration-300 text-lg">
            熱門推薦
          </button>
        </div>
      </div>

      {/* Introduction */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">How to use it</h2>
        <div className="bg-[#6f4827] text-white p-6 rounded-lg">
          <p className="text-lg leading-relaxed">
            熱門推薦 Hot Search 讓你在漫無目的時能快速找到喜歡的咖啡廳，
            <br />
            CafeMate
            將根據IG上的標註地點貼文總數量，排出熱門排行榜，讓你迅速搭上現正流行的咖啡廳熱潮！
          </p>
        </div>
      </div>

      {/* Cafes List */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.slice(0, cafesPerPage).map((cafe, index) => (
            <Link href={`/cafeinfo/${cafe.cafe_id}`} key={cafe.cafe_id}>
              <div className="bg-white rounded-lg shadow-lg p-4 relative transform transition-transform hover:scale-105 h-[400px] flex flex-col">
                {index < 3 && (
                  <div className="absolute top-0 left-0 bg-red-600 bg-opacity-80 text-white px-4 py-3 rounded-tl-lg text-lg font-bold z-10">
                    Top {index + 1}
                  </div>
                )}
                <div className="relative w-full h-40 mb-4">
                  <img
                    src={cafe.image_url ?? ""}
                    alt={cafe.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-grow">
                  {/* Cafe name and open status */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold truncate">{cafe.name}</h3>
                    <span
                      className={`text-sm font-bold px-2 py-1 rounded whitespace-nowrap ${cafe.isOpenNow
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                        }`}
                    >
                      {cafe.isOpenNow ? "營業中" : "未營業"}
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <span className="text-sm">{renderStars(cafe.rating)}</span>
                  </div>
                  {/* Labels */}
                  <p className="text-sm text-gray-700 truncate">
                    🏷️ {cafe.labels.join(", ")}
                  </p>
                  {/* Instagram post count */}
                  <p className="text-sm font-bold mt-2">
                    📸 IG上有 {formatIGPostCount(cafe.ig_post_count)}{" "}
                    個地點標註！
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 bg-[#724e2c] text-white px-3 py-1 rounded text-sm">
                  {cafe.distance.toFixed(1)}km away from you
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <span className="text-sm">Total Pages: {totalPages}</span>
        </div>
      </div>
    </div>
  );
};

export default HotSearchPage;
