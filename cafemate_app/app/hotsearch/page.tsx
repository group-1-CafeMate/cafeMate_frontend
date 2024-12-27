"use client";

import React, { useState, useEffect } from "react";

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

  // 模擬資料
  const mockCafes: Cafe[] = [
    {
      cafe_id: "1",
      name: "網美最愛咖啡",
      image_url: "/api/placeholder/400/320",
      rating: 4.8,
      open_hour: ["Mon-Sun 10:00-21:00"],
      distance: 0.5,
      labels: ["網美打卡", "寵物友善", "甜點"],
      gmap_link: "https://maps.google.com/?q=網美最愛咖啡",
      ig_post_cnt: 3865, // Top 1
    },
    {
      cafe_id: "2",
      name: "質感工業風咖啡",
      image_url: "/api/placeholder/400/320",
      rating: 4.6,
      open_hour: ["Mon-Sat 08:30-19:00"],
      distance: 1.2,
      labels: ["工業風", "手沖咖啡", "早午餐"],
      gmap_link: "https://maps.google.com/?q=質感工業風咖啡",
      ig_post_cnt: 2744, // Top 2
    },
    {
      cafe_id: "3",
      name: "文青書店咖啡",
      image_url: "/api/placeholder/400/320",
      rating: 4.7,
      open_hour: ["Tue-Sun 11:00-20:00"],
      distance: 0.8,
      labels: ["閱讀", "安靜", "手作甜點"],
      gmap_link: "https://maps.google.com/?q=文青書店咖啡",
      ig_post_cnt: 2156, // Top 3
    },
    {
      cafe_id: "4",
      name: "老宅改建咖啡",
      image_url: "/api/placeholder/400/320",
      rating: 4.5,
      open_hour: ["Wed-Mon 12:00-21:00"],
      distance: 1.5,
      labels: ["老宅", "下午茶", "婚紗攝影"],
      gmap_link: "https://maps.google.com/?q=老宅改建咖啡",
      ig_post_cnt: 1879,
    },
    {
      cafe_id: "5",
      name: "貓咪咖啡館",
      image_url: "/api/placeholder/400/320",
      rating: 4.4,
      open_hour: ["Mon-Sun 11:00-20:00"],
      distance: 2.0,
      labels: ["寵物咖啡", "貓咪", "甜點"],
      gmap_link: "https://maps.google.com/?q=貓咪咖啡館",
      ig_post_cnt: 1654,
    },
    {
      cafe_id: "6",
      name: "森林系咖啡",
      image_url: "/api/placeholder/400/320",
      rating: 4.3,
      open_hour: ["Mon-Sun 09:00-18:00"],
      distance: 2.5,
      labels: ["植物", "下午茶", "手沖咖啡"],
      gmap_link: "https://maps.google.com/?q=森林系咖啡",
      ig_post_cnt: 1432,
    },
  ];

  //   useEffect(() => {
  //     setIsLoading(true);
  //     try {
  //       // 模擬 API 延遲
  //       setTimeout(() => {
  //         // 根據 ig_post_cnt 排序
  //         const sortedCafes = [...mockCafes].sort(
  //           (a, b) => b.ig_post_cnt - a.ig_post_cnt
  //         );
  //         setCafes(sortedCafes);
  //         setIsLoading(false);
  //       }, 1000);
  //     } catch {
  //       setError("Failed to load cafes");
  //       setIsLoading(false);
  //     }
  //   }, [mockCafes]);

  //   if (isLoading) {
  //     return (
  //       <div className="min-h-screen bg-[#dfdad5] flex items-center justify-center">
  //         <div className="text-[#563517] text-xl">載入中...</div>
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <div className="min-h-screen bg-[#dfdad5] flex items-center justify-center">
  //         <div className="text-red-600 text-xl">{error}</div>
  //       </div>
  //     );
  //   }

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
          {mockCafes.slice(0, cafesPerPage).map((cafe, index) => (
            <div
              key={cafe.cafe_id}
              className="bg-white rounded-lg shadow-lg p-4 relative"
            >
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
