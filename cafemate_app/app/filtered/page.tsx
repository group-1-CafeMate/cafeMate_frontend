"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// interface 是 TypeScript 用來定義物件結構的工具，幫助描述這些物件應該包含的屬性和屬性類型。
interface Cafe {
  cafe_id: string;
  name: string;
  image_url: string | null;
  rating: number;
  open_hour: string[];
  distance: number;
  labels: string[];
  gmap_link?: string; // optional link，"?"代表是可選
}

const FilteredPage = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // useState 管理狀態，確保篩選標籤、當前頁面等數據即時更新。
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const options = [
    "work_and_study_friendly",
    "time_unlimit",
    "socket",
    "wifi",
    "pets_allowed",
  ];

  const cafesPerPage = 6;
  const totalPages = Math.ceil((filteredCafes?.length || 0) / cafesPerPage);

  const getCurrentPageCafes = () => {
    const startIndex = (currentPage - 1) * cafesPerPage;
    return filteredCafes.slice(startIndex, startIndex + cafesPerPage) || [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const fetchCafes = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 構建 query string
      const queryParams = new URLSearchParams();
      selectedOptions.forEach((option) => {
        queryParams.append(option, "true");
      });

      // 從 API 獲取數據
      const response = await fetch(
        `http://localhost:8000/cafes/filter/?latitude=24.9878632&longitude=121.5748555`
      );

      if (response.ok) {
        const data = await response.json();
        setFilteredCafes(data.cafes || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch cafes");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect 用來選擇篩選標籤時自動重新載入咖啡廳資料。
  // 運作邏輯：
  // 當 selectedOptions 發生變化時，觸發 fetchCafes，重新向後端請求篩選的數據。
  useEffect(() => {
    fetchCafes();
  }, [selectedOptions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#dfdad5] flex items-center justify-center">
        <div className="text-[#563517] text-xl">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#dfdad5] flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfdad5] text-[#563517]">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <button className="underline hover:underline">Filtered</button>
          <button className="text-gray-400 hover:underline">Hot Search</button>
        </div>
      </div>

      {/* Results Header */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Here are your results:</h2>

        {/* Display Selected Options */}
        <div className="mb-6">
          <h3 className="text-lg font-medium">Selected Labels:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedOptions.map((option, index) => (
              <span
                key={index}
                className="bg-[#6f4827] text-white px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() => toggleOption(option)}
              >
                {option}
              </span>
            ))}
          </div>
        </div>

        {/* Input Box for Adding Options */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-2/3 p-3 border border-gray-400 rounded focus:outline-none"
            placeholder="輸入你的需求..."
          />
        </div>

        {/* Filtered Cafes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {getCurrentPageCafes().map((cafe) => (
            <Link
              href={`/cafeinfo/${cafe.cafe_id}`}
              key={cafe.cafe_id}
              className="bg-white rounded-lg shadow-lg p-4 relative transform transition-transform hover:scale-105"
            >
              <img
                src={cafe.image_url || "/placeholder-image.jpg"}
                alt={cafe.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />

              {/* Cafe name with rating */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">{cafe.name}</h3>
                <span className="text-sm text-gray-600">
                  ⭐ {cafe.rating.toFixed(1)}
                </span>
              </div>

              {/* Display location as a link */}
              <a
                href={cafe.gmap_link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline mb-2 inline-block"
              >
                View on Google Maps
              </a>

              <p>🕒 {cafe.open_hour.join(", ")}</p>
              <p>🏷️ {cafe.labels.length} 個符合標籤</p>
              <div className="absolute bottom-4 right-4 bg-[#724e2c] text-white px-3 py-1 rounded">
                {cafe.distance.toFixed(1)}km away from you
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
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
