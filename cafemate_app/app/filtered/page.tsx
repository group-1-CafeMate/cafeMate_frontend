"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Cafe {
  cafe_id: string;
  name: string;
  image_url: string;
  rating: number;
  open_hour: string[];
  distance: number;
  labels: string[];
  gmap_link: string;
}

const FilteredPage = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const options = [
    "適合讀書",
    "不限時",
    "有插座",
    "提供WiFi",
    "營業中",
    "可帶寵物",
  ];

  const cafesPerPage = 6;
  const totalPages = Math.min(
    Math.ceil((filteredCafes?.length || 0) / cafesPerPage),
    3
  );

  const mockCafes: Cafe[] = [
    // 測試數據
    {
      cafe_id: "1",
      name: "Cafe Americana",
      image_url: "/api/placeholder/400/320",
      rating: 4.5,
      open_hour: ["Mon-Fri 9:00-18:00", "Sat-Sun 10:00-17:00"],
      distance: 0.8,
      labels: ["quiet", "wifi", "power-outlet"],
      gmap_link: "https://maps.app.goo.gl/1tSF6Sz7WZ5VSZrm9",
    },
    // 更多模擬數據...
  ];

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

  const getCurrentPageCafes = () => {
    const startIndex = (currentPage - 1) * cafesPerPage;
    return filteredCafes?.slice(startIndex, startIndex + cafesPerPage) || [];
  };

  const isPerfectMatch = (cafeLabels: string[]) => {
    if (!selectedOptions || !cafeLabels) return false;
    return selectedOptions.every((option) => cafeLabels.includes(option));
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const options = queryParams.get("options")?.split(",") || [];
    const query = queryParams.get("query") || "";

    setSelectedOptions(options);
    setInputValue(query);
    setTimeout(() => {
      const sortedCafes = mockCafes.sort(
        (a, b) =>
          b.labels.filter((label) => options.includes(label)).length -
          a.labels.filter((label) => options.includes(label)).length
      );
      setFilteredCafes(sortedCafes);
      setIsLoading(false);
    }, 1000);
  }, [mockCafes]);

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

        {/* Unselected Options */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {options
            .filter((option) => !selectedOptions.includes(option))
            .map((option) => (
              <div
                key={option}
                className="flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all bg-gray-200 text-gray-700 border-gray-300"
                onClick={() => toggleOption(option)}
              >
                {option}
              </div>
            ))}
        </div>

        {/* Filtered Cafes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {getCurrentPageCafes().map((cafe) => (
            <div
              key={cafe.cafe_id}
              className="bg-white rounded-lg shadow-lg p-4 relative"
            >
              {isPerfectMatch(cafe.labels) && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
                  Perfectly Matches Your Requirements
                </div>
              )}
              <img
                src={cafe.image_url}
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
                href={cafe.gmap_link}
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
            </div>
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
