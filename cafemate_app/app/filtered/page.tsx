"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import API from "src/constants/api";

interface Cafe {
  cafe_id: string;
  name: string;
  image_url: string | null;
  rating: number;
  open_hour: string[];
  distance: number;
  labels: string[];
  gmap_link?: string;
}

const FilteredPage = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [remainingOptions, setRemainingOptions] = useState<string[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cafesPerPage = 9;
  const router = useRouter();

  const fetchFilteredCafes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 取得目前網址的query params
      const currentParams = new URLSearchParams(window.location.search);
      const baseUrl = API.Cafe.GetFilteredCafe;
      const fullUrl = `${baseUrl}?${currentParams.toString()}`;
      console.log(fullUrl);
      const response = await fetch(fullUrl, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setFilteredCafes(data.cafes);
      } else {
        setError("無法獲取篩選結果，請稍後再試。");
      }
    } catch (error) {
      setError("無法獲取篩選結果，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOptions.length > 0) {
      fetchFilteredCafes();
    }
  }, [selectedOptions]);

  useEffect(() => {
    const params = new URLSearchParams(router.query as Record<string, string>);
    const selected = Array.from(params.keys());
    setSelectedOptions(selected);
    setRemainingOptions((prev) =>
      prev.filter((option) => !selected.includes(option))
    );
  }, [router.asPath]);

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
      setRemainingOptions([...remainingOptions, option]);
    } else {
      setSelectedOptions([...selectedOptions, option]);
      setRemainingOptions(remainingOptions.filter((o) => o !== option));
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
      {/* Navigation */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <button className="underline hover:underline">Filtered</button>
          <button className="text-gray-400 hover:underline">Hot Search</button>
        </div>
      </div>

      {/* Results Header */}
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6">篩選結果如下：</h2>

        {/* 已選條件框 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3 flex-1 bg-white p-4 border border-gray-400 rounded min-h-[56px]">
            {selectedOptions.map((option) => (
              <span
                key={option}
                className="bg-[#6f4827] text-white px-4 py-2 rounded-full text-lg cursor-pointer hover:bg-[#7d553a]"
                onClick={() => toggleOption(option)}
              >
                {option} ×
              </span>
            ))}
          </div>
          {/* Research Button */}
          <button
            onClick={fetchFilteredCafes}
            className="bg-[#563517] text-white px-8 py-4 rounded-lg hover:bg-[#6f4827] text-lg"
          >
            再次查詢
          </button>
        </div>

        {/* 未選條件 */}
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
