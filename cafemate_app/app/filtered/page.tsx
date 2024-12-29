"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
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

const CafeCard = ({ 
  cafe, 
  selectedOptions 
}: { 
  cafe: Cafe;
  selectedOptions: string[];
}) => {
  const stopPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cafe.gmap_link) {
      window.open(cafe.gmap_link, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 relative transform transition-transform hover:scale-105">
      <Link href={`/cafeinfo/${cafe.cafe_id}`} className="block">
        <img
          src={cafe.image_url || "/placeholder-image.jpg"}
          alt={cafe.name}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
        {selectedOptions.every((opt) => cafe.labels.includes(opt)) && (
          <div className="absolute top-0 left-0 bg-red-600 bg-opacity-80 text-white px-4 py-1 rounded-tl-lg">
            完全符合你的需求
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold">{cafe.name}</h3>
          <div className="flex items-center space-x-3">
            <span
              className={`text-lg font-bold px-3 py-1 rounded ${
                cafe.isOpenNow
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {cafe.isOpenNow ? "營業中" : "未營業"}
            </span>
            <span className="text-lg text-gray-600 font-bold">
              ⭐ {cafe.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={stopPropagation}
        className="text-blue-500 underline mb-2 block"
      >
        View on Google Maps
      </button>

      <p>🕒 {cafe.open_hour.join(", ")}</p>
      <p>🏷️ {cafe.labels.length} 個符合標籤</p>
      <div className="absolute bottom-4 right-4 bg-[#724e2c] text-white px-3 py-1 rounded">
        {cafe.distance.toFixed(1)}km away from you
      </div>
    </div>
  );
};

const FilteredPage = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [remainingOptions, setRemainingOptions] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
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

      selectedOptions.forEach((opt) => {
        queryParams.append(opt, "true");
      });
      if (location) {
        queryParams.append("latitude", location.latitude.toString());
        queryParams.append("longitude", location.longitude.toString());
      }
      const baseUrl = API.Cafe.GetFilteredCafe;
      const fullUrl = `${baseUrl}?${queryParams.toString()}`;
      const response = await fetch(fullUrl, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const cafesWithOpenStatus = data.cafes.map((cafe: Cafe) => ({
          ...cafe,
          isOpenNow: checkIsOpen(cafe.open_hour),
        }));
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
          setLocation(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (selectedOptions.length > 0) {
      fetchFilteredCafes();
    }
  }, [selectedOptions, location]);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const selected: string[] = [];
    const station = searchParams.get("station");
    setSelectedStation(station);

    searchParams.forEach((value, key) => {
      if (value === "true") {
        selected.push(key);
      }
    });

    setSelectedOptions(selected);

    setRemainingOptions(
      Object.keys(label_options).filter(
        (option) =>
          !selected.includes(
            label_options[option as keyof typeof label_options]
          )
      )
    );
  }, [searchParams]);

  const toggleOption = (option: string) => {
    const optionKey = label_options[option as keyof typeof label_options];

    if (selectedOptions.includes(optionKey)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== optionKey));
      setRemainingOptions((prev) => [...prev, option]);
    } else {
      setSelectedOptions([...selectedOptions, optionKey]);
      setRemainingOptions((prev) => prev.filter((o) => o !== option));
    }
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
    <div className="min-h-screen bg-[#dfdad5] text-[#563517] text-lg">
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <Link href="/homePage">
            <button className="underline hover:underline">首頁</button>
          </Link>
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

        <div className="flex items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3 flex-1 bg-white p-4 border border-gray-400 rounded min-h-[56px]">
            {selectedOptions.map((option) => {
              const label = Object.keys(label_options).find(
                (key) =>
                  label_options[key as keyof typeof label_options] === option
              );

              return (
                <span
                  key={option}
                  className="bg-[#6f4827] text-white px-4 py-2 rounded-full text-lg cursor-pointer hover:bg-[#7d553a]"
                  onClick={() => toggleOption(option)}
                >
                  {label} ×
                </span>
              );
            })}
          </div>

          <button
            onClick={fetchFilteredCafes}
            className="bg-[#563517] text-white px-8 py-4 rounded-lg hover:bg-[#6f4827] text-lg"
          >
            再次查詢
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {remainingOptions.map((option) => (
            <span
              key={option}
              className="bg-gray-200 text-[#563517] px-4 py-2 rounded-full text-lg cursor-pointer hover:bg-gray-300"
              onClick={() => toggleOption(option)}
            >
              {option}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {getCurrentPageCafes().map((cafe) => (
            <CafeCard 
              key={cafe.cafe_id} 
              cafe={cafe} 
              selectedOptions={selectedOptions}
            />
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

export default FilteredPage;