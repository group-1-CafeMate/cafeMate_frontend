"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Cafe {
  cafe_id: string;
  name: string;
  image_url: string;
  rating: number;
  distance: number;
  labels: string[];
  gmap_link: string;
  ig_post_cnt: number;
  addr: string;
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
        const response = await fetch("http://127.0.0.1:8000/cafes/top/", {
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

        setCafes(data.cafes);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    };

    fetchTopCafes();
  }, []);

  const formatIGPostCount = (count: number | undefined): string => {
    if (count === undefined) return "N/A";
    return count.toLocaleString();
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push("⭐"); // Full star
      } else if (i === fullStars && hasHalfStar) {
        stars.push("✭"); // Half star
      } else {
        stars.push("☆"); // Empty star
      }
    }
    return stars.join("");
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
      <div className="flex justify-between items-center px-6 py-4 bg-[#563517] text-white">
        <div className="flex space-x-6">
          <Link href="/homePage">
            <button className="text-gray-400 hover:underline">回首頁</button>
          </Link>
          <button className="underline hover:underline">熱門推薦</button>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">How to use it</h2>
        <div className="bg-[#6f4827] text-white p-6 rounded-lg">
          <p className="text-xl leading-relaxed">
            熱門推薦 Hot Search 讓你在漫無目的時能快速找到喜歡的咖啡廳，
            <br />
            CafeMate
            將根據IG上的標註地點貼文總數量，排出熱門排行榜，讓你迅速搭上現正流行的咖啡廳熱潮！
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.slice(0, cafesPerPage).map((cafe, index) => (
            <Link href={`/cafe/${cafe.cafe_id}`} key={cafe.cafe_id}>
              <div className="bg-white rounded-lg shadow-lg p-4 relative transform transition-transform hover:scale-105 h-[400px] flex flex-col">
                {index < 3 && (
                  <div className="absolute top-0 left-0 bg-red-600 bg-opacity-80 text-white text-opacity-70 px-4 py-3 rounded-tl-lg text-lg font-bold z-10">
                    Top {index + 1}
                  </div>
                )}
                <div className="relative w-full h-32 mb-4">
                  <img
                    src={cafe.image_url}
                    alt={cafe.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{cafe.name}</h3>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-lg">{renderStars(cafe.rating)}</span>
                    <span className="ml-2 text-lg font-bold">
                      {cafe.rating.toFixed(1)}
                    </span>
                  </div>
                  <a
                    href={cafe.gmap_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mb-2 block line-clamp-2"
                  >
                    📍 {cafe.addr}
                  </a>
                  <p className="mb-2 line-clamp-2">
                    🏷️ {cafe.labels.join(", ")}
                  </p>
                  <p className="font-bold mb-2">
                    📸 IG上有 {formatIGPostCount(cafe.ig_post_cnt)} 個地點標註！
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 bg-[#724e2c] text-white px-3 py-1 rounded">
                  {cafe.distance.toFixed(1)}km away from you
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <span>Total Pages: {totalPages}</span>
        </div>
      </div>
    </div>
  );
};

export default HotSearchPage;
