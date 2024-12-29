"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import API from "src/constants/api";

interface Cafe {
  cafe_id: string;
  name: string;
  image_url: string;
  rating: number;
  open_hour: string[];
  distance: number;
  labels: string[];
  gmap_link: string;
  ig_post_cnt: number;
}

const HotSearchPage = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cafesPerPage = 6;
  const totalPages = 1;

  useEffect(() => {
    const fetchTopCafes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API.Cafe.GetTopCafe, {
          method: "GET",
          credentials: "include",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
        });

        if (!response.ok) {
          throw new Error("Failed to load cafes");
        }

        const data = await response.json();
        setCafes(data.cafes || []);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message || "An error occurred");
        setIsLoading(false);
      }
    };

    fetchTopCafes();
  }, []);

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
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <button className="text-gray-400 hover:underline">Filtered</button>
          <button className="underline hover:underline">Hot Search</button>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">How to use it</h2>
        <div className="bg-[#6f4827] text-white p-4 rounded-lg">
          熱門推薦 Hot Search 讓你在漫無目的時能快速找到喜歡的咖啡廳，CafeMate
          將根據IG上的標註地點貼文總數量，
          排出熱門排行榜，讓你迅速搭上現正流行的咖啡廳熱潮！
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.slice(0, cafesPerPage).map((cafe, index) => (
            <Link href={`/cafe/${cafe.cafe_id}`} key={cafe.cafe_id}>
              <div className="bg-white rounded-lg shadow-lg p-4 relative transform transition-transform hover:scale-105">
                {/* Only show Top badge for top 3 */}
                {index < 3 && (
                  <div className="absolute top-2 left-2 bg-red-600 bg-opacity-80 text-white text-opacity-100 px-3 py-1 rounded-lg text-sm">
                    Top {index + 1}
                  </div>
                )}
                <img
                  src={cafe.image_url}
                  alt={cafe.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{cafe.name}</h3>
                  <span className="text-sm text-gray-600">
                    ⭐ {cafe.rating.toFixed(1)}
                  </span>
                </div>
                <a
                  href={cafe.gmap_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mb-2 inline-block"
                >
                  View on Google Maps
                </a>
                <p className="mb-2">🕒 {cafe.open_hour.join(", ")}</p>
                <p className="mb-2">🏷️ {cafe.labels.join(", ")}</p>
                <p className="font-bold mb-2">
                  📸 IG上有 {cafe.ig_post_cnt.toLocaleString()} 個地點標註！
                </p>
                <div className="absolute bottom-4 right-4 bg-[#724e2c] text-white px-3 py-1 rounded">
                  {cafe.distance.toFixed(1)}km away from you
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Display Total Pages */}
        <div className="flex justify-center mt-6">
          <span>Total Pages: {totalPages}</span>
        </div>
      </div>
    </div>
  );
};

export default HotSearchPage;
