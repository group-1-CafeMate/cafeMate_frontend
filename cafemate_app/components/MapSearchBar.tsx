"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { mrtLines } from "src/constants/mrtStations";
import { label_options } from "src/constants/label_options";

interface MapSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export interface SearchFilters {
  station?: string;
  searchText?: string;
  selectedOptions: { [key: string]: boolean };
}

const MapSearchBar = ({ onSearch, onClear }: MapSearchBarProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStation, setSelectedStation] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: boolean }>({});
  const [activeHotPreset, setActiveHotPreset] = useState<string | null>(null);

  const onSearchRef = useRef(onSearch);
  const skipNextSearchRef = useRef(true);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    onSearchRef.current({
      station: selectedStation || undefined,
      searchText: searchText || undefined,
      selectedOptions,
    });
  }, [selectedStation, searchText, selectedOptions]);

  const hotSearchPresets = [
    {
      id: "study_power",
      label: "不限時 + 有插座",
      options: ["不限時", "有插座"],
    },
    {
      id: "study_wifi",
      label: "適合讀書 + 提供WiFi",
      options: ["適合讀書", "提供WiFi"],
    },
    {
      id: "pet_friendly",
      label: "寵物友善 + 提供WiFi",
      options: ["寵物咖啡廳", "提供WiFi"],
    },
  ];

  const handleClear = () => {
    setSelectedStation("");
    setSearchText("");
    setSelectedOptions({});
    setActiveHotPreset(null);
    skipNextSearchRef.current = true;
    onClear();
  };

  const handleOptionToggle = (option: string) => {
    setActiveHotPreset(null);
    setSelectedOptions((prev) => {
      const next = { ...prev };
      if (next[option]) {
        delete next[option];
      } else {
        next[option] = true;
      }
      return next;
    });
  };

  const handleHotPresetToggle = (presetId: string) => {
    const preset = hotSearchPresets.find((item) => item.id === presetId);
    if (!preset) return;

    if (activeHotPreset === presetId) {
      setActiveHotPreset(null);
      setSelectedOptions((prev) => {
        const next = { ...prev };
        preset.options.forEach((option) => {
          delete next[option];
        });
        return next;
      });
      return;
    }

    setActiveHotPreset(presetId);
    setSelectedOptions((prev) => {
      const next = { ...prev };
      preset.options.forEach((option) => {
        next[option] = true;
      });
      return next;
    });
  };

  const activeFiltersCount = (selectedStation ? 1 : 0) + (searchText ? 1 : 0) + Object.values(selectedOptions).filter(Boolean).length;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
      {/* 搜索框 */}
      <div className="bg-white rounded-2xl shadow-2xl backdrop-blur-md bg-opacity-95 border border-gray-100">
        <div className="flex items-center gap-2 p-4">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setActiveHotPreset(null);
              setSearchText(e.target.value);
            }}
            placeholder="搜尋咖啡廳名稱..."
            className="flex-1 outline-none text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400"
          />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl hover:bg-gray-50 transition-all relative ${
              activeFiltersCount > 0 ? "bg-blue-50" : ""
            }`}
          >
            <SlidersHorizontal size={20} className={activeFiltersCount > 0 ? "text-blue-600" : "text-gray-600"} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {(selectedStation || searchText || activeFiltersCount > 0) && (
            <button
              onClick={handleClear}
              className="p-2.5 rounded-xl hover:bg-gray-50 transition-all"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="border-t border-gray-100 p-4 bg-gray-50 bg-opacity-50 rounded-b-2xl">
            <div className="text-sm font-semibold mb-3 text-gray-700">熱門搜尋</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {hotSearchPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleHotPresetToggle(preset.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeHotPreset === preset.id
                      ? "bg-gradient-to-r from-[#563517] to-[#724e2c] text-white shadow-md scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="text-sm font-semibold mb-3 text-gray-700">捷運站</div>
            <select
              value={selectedStation}
              onChange={(e) => {
                setActiveHotPreset(null);
                setSelectedStation(e.target.value);
              }}
              className="w-full mb-4 p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部捷運站</option>
              {Object.entries(mrtLines).map(([line, stations]) => (
                <optgroup key={line} label={line}>
                  {stations.map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="text-sm font-semibold mb-3 text-gray-700">篩選條件</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(label_options).map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionToggle(option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedOptions[option]
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {selectedOptions[option] && <span className="mr-1.5">✓</span>}
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 已选择的标签 */}
      {(selectedStation || searchText || activeFiltersCount > 0) && !showFilters && (
        <div className="mt-2 bg-white rounded-xl shadow-lg p-3 flex flex-wrap gap-2 backdrop-blur-md bg-opacity-90">
          {searchText && (
            <span className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 font-medium border border-purple-200">
              🔍 {searchText}
            </span>
          )}
          {selectedStation && (
            <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 font-medium border border-blue-200">
              🚇 {selectedStation}
            </span>
          )}
          {Object.entries(selectedOptions)
            .filter(([_, selected]) => selected)
            .map(([option]) => (
              <span
                key={option}
                className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium border border-green-200"
              >
                {option}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
