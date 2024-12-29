"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import {
  Star,
  MapPin,
  Clock,
  Info,
  MessageCircle,
  Wifi,
  Coffee,
  Timer,
  Power,
  Dog,
} from "lucide-react";

interface CafeInfo {
  cafe_id: string;
  name: string;
  phone: string;
  addr: string;
  rating: number;
  open_hour: string[];
  distance: number;
  labels: string[];
  work_and_study_friendly: boolean;
  time_unlimit: boolean;
  socket: boolean;
  pets_allowed: boolean;
  wiFi: boolean;
  info: string;
  comment: string[];
  ig_link: string;
  gmap_link: string;
  image_url: string;
  images_urls: string[];
}

const CafeInfoPage = () => {
  const [cafe, setCafe] = useState<CafeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCafe = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/cafe/"); // 替換為實際 API 路徑
        if (!response.ok) {
          throw new Error("Failed to fetch cafe data");
        }
        const data: CafeInfo = await response.json();
        setCafe(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCafe();
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, index) => {
        const isFullStar = index < Math.floor(rating);
        const isHalfStar =
          !isFullStar && index === Math.floor(rating) && rating % 1 >= 0.5;

        return (
          <span key={index} className="relative inline-block">
            <Star
              className={`w-5 h-5 ${
                isFullStar
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
            {isHalfStar && (
              <Star
                className="w-5 h-5 absolute top-0 left-0 fill-yellow-400 text-yellow-400"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </span>
        );
      })}
      <span className="ml-2 text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );

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

  return (
    <div className="w-full min-h-screen bg-[#dfdad5] text-[#563517]">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Cafe Name, Rating, and Basic Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <Link href={cafe.ig_link} target="_blank">
                  <h1 className="text-3xl font-bold hover:text-[#6f4827]">
                    {cafe.name}
                  </h1>
                </Link>
                {renderStars(cafe.rating)}
              </div>
              <div className="flex items-center space-x-6 text-gray-600">
                <Link
                  href={cafe.gmap_link}
                  target="_blank"
                  className="flex items-center space-x-2 hover:text-blue-600"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{cafe.addr}</span>
                </Link>
                <div className="bg-[#724e2c] text-white px-3 py-1 rounded">
                  {cafe.distance.toFixed(1)}km away from you
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cafe.images_urls.map((url, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-4">
              <div className="aspect-w-16 aspect-h-9 relative">
                <Image
                  src={url}
                  alt={`${cafe.name} - Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stacked Info Sections */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Opening Hours */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#563517]" />
              <h3 className="font-semibold">Opening Hours</h3>
            </div>
            <ul className="space-y-1 text-gray-600">
              {cafe.open_hour.map((hour, index) => (
                <li key={index}>{hour}</li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-[#563517]" />
              <h3 className="font-semibold">Information</h3>
            </div>
            <p className="text-gray-600">{cafe.info}</p>
          </div>

          {/* Overall Customer Feedback */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-[#563517]" />
              <h3 className="font-semibold">Overall Customer Feedback</h3>
            </div>
            <p className="text-gray-600">{cafe.comment.join(" ")}</p>
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-wrap gap-4">
            <Tag
              icon={<Coffee />}
              label="適合讀書"
              active={cafe.work_and_study_friendly}
            />
            <Tag icon={<Timer />} label="不限時" active={cafe.time_unlimit} />
            <Tag icon={<Power />} label="有插座" active={cafe.socket} />
            <Tag icon={<Dog />} label="可帶寵物" active={cafe.pets_allowed} />
            <Tag icon={<Wifi />} label="提供WiFi" active={cafe.wiFi} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeInfoPage;
