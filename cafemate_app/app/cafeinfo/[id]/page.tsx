"use client";
import renderStars from "components/Star";
import { Clock, Coffee, Dog, Info, Instagram, Map, MapPin, MessageCircle, Power, Timer, Wifi } from "lucide-react";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import API from "src/constants/api";

interface CafeInfo {
  cafe_id: string;
  name: string;
  phone: string;
  addr: string;
  rating: number;
  open_hour: { day_of_week: string; open_time: string; close_time: string }[];
  distance?: number;
  labels?: string[];
  work_and_study_friendly: boolean;
  time_unlimit: boolean;
  socket: boolean;
  pets_allowed: boolean;
  wiFi: boolean;
  info: string;
  comment: string;
  ig_link: string;
  gmap_link: string;
  image_url?: string;
  images_urls: string[];
}

interface PageParams {
  params: Promise<{ id: string }>;
}

const CafeInfoPage = ({ params }: PageParams) => {
  const { id } = use(params);

  const [cafe, setCafe] = useState<CafeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCafe = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        console.log('Fetching cafe with ID:', id);
        const response = await fetch(`${API.Cafe.GetCafe}?cafe_id=${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error("無法取得咖啡店資訊");
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "無法取得咖啡店資訊");
        }

        setCafe(data.cafe);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "發生未知錯誤");
        console.error('Error fetching cafe:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCafe();
  }, [id]);

  const Tag = ({
    icon,
    label,
    active,
  }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
  }) => (
    <div
      className={`flex items-center space-x-2 ${active ? "text-[#563517]" : "text-gray-400"}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );

  const MarkdownContent = ({ content }: { content: string }) => (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#dfdad5] flex justify-center items-center">
        <div className="text-[#563517] text-2xl">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#dfdad5] flex flex-col justify-center items-center text-red-500">
        <p className="text-2xl">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          重新整理
        </button>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="w-full min-h-screen bg-[#dfdad5] flex justify-center items-center">
        <div className="text-[#563517] text-2xl">無法顯示咖啡店資訊。</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#dfdad5] text-[#563517]">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <Link href="/homepage">
            <span className="text-[#563517] hover:underline cursor-pointer">首頁</span>
          </Link>
          <span className="text-[#563517]">/</span>
          <span className="text-[#563517]">{cafe.name}</span>
        </div>

        {/* Cafe Name, Rating, and Basic Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {/* Left side - Cafe info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold">{cafe.name}</h1>
                {renderStars(cafe.rating)}
              </div>
              <div className="flex items-center space-x-6 text-gray-600">
                {cafe.gmap_link && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{cafe.addr}</span>
                  </div>
                )}
                {cafe.distance !== undefined && (
                  <div className="bg-[#724e2c] text-white px-3 py-1 rounded">
                    {cafe.distance.toFixed(1)}km 距離您
                  </div>
                )}
              </div>
              {cafe.phone && (
                <div className="text-gray-600">
                  電話：{cafe.phone}
                </div>
              )}
            </div>

            {/* Right side - Social links */}
            <div className="flex flex-row md:flex-col gap-4 items-start">
              {cafe.ig_link && (
                <Link
                  href={cafe.ig_link}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="hidden sm:inline">Instagram</span>
                </Link>
              )}
              {cafe.gmap_link && (
                <Link
                  href={cafe.gmap_link}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white hover:opacity-90 transition-opacity"
                >
                  <Map className="w-5 h-5" />
                  <span className="hidden sm:inline">Google Maps</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-wrap gap-4">
            <Tag
              icon={<Coffee className="w-5 h-5" />}
              label="適合讀書"
              active={cafe.work_and_study_friendly}
            />
            <Tag
              icon={<Timer className="w-5 h-5" />}
              label="不限時"
              active={cafe.time_unlimit}
            />
            <Tag
              icon={<Power className="w-5 h-5" />}
              label="有插座"
              active={cafe.socket}
            />
            <Tag
              icon={<Dog className="w-5 h-5" />}
              label="可帶寵物"
              active={cafe.pets_allowed}
            />
            <Tag
              icon={<Wifi className="w-5 h-5" />}
              label="提供WiFi"
              active={cafe.wiFi}
            />
          </div>
        </div>

        {/* Image Gallery */}
        {cafe.images_urls && cafe.images_urls.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cafe.images_urls.map((url, index) => (
                <div key={index} className="relative aspect-w-16 aspect-h-9">
                  <img
                    src={url}
                    alt={`${cafe.name} - Image ${index + 1}`}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stacked Info Sections */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Opening Hours */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#563517]" />
              <h3 className="font-semibold">營業時間</h3>
            </div>
            <ul className="space-y-1 text-gray-600">
              {["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"].map((day, index) => {
                const hour = cafe.open_hour.find(h => h.day_of_week === day);
                return (
                  <li key={index}>
                    {hour ? `${hour.day_of_week}: ${hour.open_time} - ${hour.close_time}` : `${day}: 休息`}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Information */}
          {cafe.info && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-[#563517]" />
                <h3 className="font-semibold">資訊</h3>
              </div>
              <div className="text-gray-600">
                <MarkdownContent content={cafe.info} />
              </div>
            </div>
          )}

          {/* Overall Customer Feedback */}
          {cafe.comment && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-[#563517]" />
                <h3 className="font-semibold">客戶反饋</h3>
              </div>
              <div className="text-gray-600">
                <MarkdownContent content={cafe.comment} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeInfoPage;