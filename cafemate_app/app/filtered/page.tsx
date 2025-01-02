"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

import renderStars from "components/Star";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import API from "src/constants/api";
import { label_options } from "src/constants/label_options";

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
  isOpenNow?: boolean;
}

const FilteredPage = () => {
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [inputValue, setInputValue] = useState<string>("");
  // const [remainingOptions, setRemainingOptions] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [tempSelectedOptions, setTempSelectedOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cafesPerPage = 6;
  const router = useRouter();

  const fetchFilteredCafes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
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
      if (selectedStation) {
        queryParams.append("metro_station_id", selectedStation.split(" ")[0]);
      }
      const baseUrl = API.Cafe.GetFilteredCafe;
      const fullUrl = `${baseUrl}?${queryParams.toString()}`;
      const response = await fetch(fullUrl, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // 添加營業狀態
        const cafesWithOpenStatus = data.cafes.map((cafe: Cafe) => ({
          ...cafe,
          isOpenNow: checkIsOpen(cafe.open_hour),
        }));
        cafesWithOpenStatus.sort((a: Cafe, b: Cafe) => {
          if (a.isOpenNow === b.isOpenNow) return 0;
          return a.isOpenNow ? -1 : 1; // 營業中優先
        });
        setFilteredCafes(cafesWithOpenStatus);
      } else {
        setError("無法獲取篩選結果，請稍後再試。");
      }
    } catch (error) {
      setError("無法獲取篩選結果，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
        },
        () => {
          console.warn("使用者未開啟定位功能");
          setLocation(null); // 使用者未開啟定位功能
        }
      );
    }
  }, []);

  useEffect(() => {
    setTempSelectedOptions({ ...selectedOptions });
  }, [selectedOptions]);

  useEffect(() => {
    if (
      Object.values(selectedOptions).some((value) => value) ||
      selectedStation
    ) {
      fetchFilteredCafes();
    }
  }, [selectedOptions, location, selectedStation]);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const newSelectedOptions: { [key: string]: boolean } = {};
    const station = searchParams.get("station");
    setSelectedStation(station);

    searchParams.forEach((value, key) => {
      if (value === "true") {
        const label = Object.entries(label_options).find(
          ([_, val]) => val === key
        )?.[0];
        if (label) {
          newSelectedOptions[label] = true;
        }
      }
    });

    setSelectedOptions(newSelectedOptions);
    updateInputValue(newSelectedOptions);
  }, [searchParams]);

  const updateInputValue = (options: { [key: string]: boolean }) => {
    const selectedOptions = Object.entries(options)
      .filter(([_, isSelected]) => isSelected)
      .map(([label]) => label);
    setInputValue(selectedOptions.join(" "));
  };
  const toggleTempOption = (option: string) => {
    setTempSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [option]: !prevOptions[option],
    }));
  };

  const getCurrentPageCafes = () => {
    const startIndex = (currentPage - 1) * cafesPerPage;
    const endIndex = startIndex + cafesPerPage;
    return filteredCafes.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredCafes.length / cafesPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#dfdad5] flex items-center justify-center">
        <div className="text-[#563517] text-2xl">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#dfdad5] flex items-center justify-center">
        <div className="text-red-600 text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfdad5] text-[#563517]">
      {/* Navigation */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          {/* 按鈕導航到首頁 */}
          <Link href="/homepage">
            <button className="underline hover:underline">首頁</button>
          </Link>
          {/* 按鈕導航到熱門推薦 */}
          <Link href="/hotsearch">
            <button className="text-gray-400 hover:underline">熱門推薦</button>
          </Link>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6">
          {selectedStation
            ? `依照 ${selectedStation} 篩選結果如下：`
            : "依照您目前位置篩選結果如下："}
        </h2>

        <div className="flex flex-col gap-4 mb-6">
          {/* Input field for selected options */}
          <p className="text-smㄙ text-gray-500">
            可以點擊下方條件重新選擇你的需求...
          </p>

          {/* Options container */}
          <div className="flex flex-wrap gap-3">
            {/* Selected options */}
            <div className="flex flex-wrap gap-3 flex-1 bg-white p-4 border border-[#9c6f44] rounded">
              {Object.entries(tempSelectedOptions)
                .filter(([_, isSelected]) => isSelected)
                .map(([option]) => (
                  <span
                    key={option}
                    className="bg-green-500 text-white px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-300 hover:bg-green-600"
                    onClick={() => toggleTempOption(option)}
                  >
                    {option} ×
                  </span>
                ))}
            </div>

            {/* Research Button */}
            <button
              onClick={() => {
                const hasChanged = Object.keys(tempSelectedOptions).some(
                  (key) => tempSelectedOptions[key] !== selectedOptions[key]
                );

                if (hasChanged) {
                  // 同步 tempSelectedOptions 到 selectedOptions
                  setSelectedOptions({ ...tempSelectedOptions });
                  // 觸發 API 呼叫
                  fetchFilteredCafes();
                  return;
                }
                console.log("篩選條件未變更，無需重新查詢");
              }}
              className="bg-[#563517] text-white px-8 py-4 rounded-lg hover:bg-[#6f4827] text-lg whitespace-nowrap transition-all duration-300"
            >
              再次查詢
            </button>
          </div>

          {/* Show all available options below */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(label_options)
              .filter(([option]) => !tempSelectedOptions[option])
              .map(([option]) => (
                <span
                  key={option}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-300 hover:bg-gray-300"
                  onClick={() => toggleTempOption(option)}
                >
                  {option}
                </span>
              ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {getCurrentPageCafes().map((cafe) => (
            <Link
              href={`/cafeinfo/${cafe.cafe_id}`}
              key={cafe.cafe_id}
              className="bg-white rounded-lg shadow-lg p-4 relative transform transition-transform hover:scale-105 h-[400px]"
            >
              {/* 固定圖片大小 */}
              <img
                src={cafe.image_url || "/images/placeholder-image.jpg"}
                alt={cafe.name}
                className="h-64 w-full object-cover rounded-lg mb-4"
              />
              {/* Cafe Details */}
              <div className="flex justify-between items-center mb-4">
                {/* Cafe Name */}
                <h3 className="text-lg font-bold">{cafe.name}</h3>
                {/* Open Status */}
                <span
                  className={`text-lg font-bold px-2 py-1 rounded whitespace-nowrap ${cafe.isOpenNow
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    }`}
                >
                  {cafe.isOpenNow ? "營業中" : "未營業"}
                </span>
              </div>

              {/* 星等評分 */}
              <div className="flex items-center text-sm text-gray-600 -mt-1">
                {renderStars(cafe.rating)}
              </div>

              <p className="text-sm text-gray-700">
                🏷️{" "}
                {
                  Object.entries(selectedOptions).filter(
                    ([_key, isSelected]) => isSelected
                  ).length
                }{" "}
                個符合篩選條件
              </p>

              {/* 距離 */}
              <div className="absolute bottom-4 right-4 bg-[#724e2c] text-white px-3 py-1 rounded text-sm">
                {cafe.distance.toFixed(1)}km away
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              <ChevronLeft />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <FilteredPage />
    </Suspense>
  );
}
