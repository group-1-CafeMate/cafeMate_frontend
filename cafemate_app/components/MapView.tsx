"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  GeoJSONSource,
  Map as MapLibreMap,
  MapMouseEvent,
  Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Cafe {
  cafe_id: string;
  name: string;
  rating: number;
  latitude: number;
  longitude: number;
  address?: string;
  images_urls: string[];
  isOpenNow?: boolean;
  open_hour?: {
    day_of_week: string;
    open_time: string;
    close_time: string;
  }[];
  distance?: number;
  gmap_link?: string;
}

interface MapViewProps {
  cafes: Cafe[];
  onCafeClick?: (cafe: Cafe) => void;
  selectedStation?: string;
  selectedCafe?: Cafe | null;
}

type CafeStatus = "open" | "closed" | "unknown";

type CafeFeatureProperties = {
  cafe_id: string;
  name: string;
  rating: number;
  address?: string;
  status: CafeStatus;
  gmap_link?: string;
  distance?: number;
};

type CafeFeature = GeoJSON.Feature<GeoJSON.Point, CafeFeatureProperties> & {
  id: string;
};

type CafeFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  CafeFeatureProperties
>;

const BASE_STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const SOURCE_ID = "cafes-source";
const LAYER_UNCLUSTERED = "cafes-unclustered";
const LAYER_CLUSTERS = "cafes-clusters";
const LAYER_CLUSTER_COUNT = "cafes-cluster-count";

const INITIAL_CENTER: [number, number] = [121.5654, 25.033];
const INITIAL_ZOOM = 13;

const WATER_COLOR = "#9fd3f0";
const MOUNTAIN_COLOR = "#b7d3a6";

const COLOR_SELECTED = "#f59e0b";
const COLOR_OPEN = "#10b981";
const COLOR_CLOSED = "#6b7280";
const COLOR_UNKNOWN = "#94a3b8";

function isValidLngLat(lng: number, lat: number): boolean {
  if (Number.isNaN(lng) || Number.isNaN(lat)) return false;
  if (lng === 0 || lat === 0) return false;
  if (Math.abs(lng) < 0.001 || Math.abs(lat) < 0.001) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat < -90 || lat > 90) return false;
  return true;
}

function getCafeStatus(cafe: Cafe): CafeStatus {
  if (cafe.isOpenNow === true) return "open";
  if (cafe.isOpenNow === false) return "closed";
  return "unknown";
}

function buildCafeGeoJson(cafes: Cafe[]): CafeFeatureCollection {
  const features: CafeFeature[] = [];

  for (const cafe of cafes) {
    const lng = cafe.longitude;
    const lat = cafe.latitude;

    if (lng == null || lat == null) continue;
    if (!isValidLngLat(lng, lat)) continue;

    features.push({
      type: "Feature",
      id: cafe.cafe_id,
      properties: {
        cafe_id: cafe.cafe_id,
        name: cafe.name,
        rating: cafe.rating,
        address: cafe.address,
        status: getCafeStatus(cafe),
        gmap_link: cafe.gmap_link,
        distance: cafe.distance,
      },
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
    });
  }

  return { type: "FeatureCollection", features };
}

function enhanceBaseMapPalette(map: MapLibreMap): void {
  const style = map.getStyle();
  if (!style?.layers?.length) return;

  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const isWater = /water|ocean|river|lake/.test(id);
    const isMountain = /landcover|terrain|hillshade|mountain/.test(id);

    try {
      if (isWater) {
        if (layer.type === "fill") map.setPaintProperty(layer.id, "fill-color", WATER_COLOR);
        if (layer.type === "line") map.setPaintProperty(layer.id, "line-color", WATER_COLOR);
        if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", WATER_COLOR);
      }
      if (isMountain) {
        if (layer.type === "fill") map.setPaintProperty(layer.id, "fill-color", MOUNTAIN_COLOR);
        if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", MOUNTAIN_COLOR);
      }
    } catch {
      // Ignore layers that don't support these paint properties.
    }
  }
}

function ensureCafeSourceAndLayers(map: MapLibreMap): void {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterRadius: 60,
      clusterMaxZoom: 16,
      // This enables feature-state by stable ids
      promoteId: "cafe_id",
    });
  }

  if (!map.getLayer(LAYER_CLUSTERS)) {
    map.addLayer({
      id: LAYER_CLUSTERS,
      type: "circle",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#8B4513",
        "circle-opacity": 0.9,
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "point_count"],
          10,
          18,
          50,
          28,
          150,
          36,
        ],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 3,
      },
    });
  }

  if (!map.getLayer(LAYER_CLUSTER_COUNT)) {
    map.addLayer({
      id: LAYER_CLUSTER_COUNT,
      type: "symbol",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["to-string", ["get", "point_count"]],
        "text-size": 13,
        "text-font": ["Open Sans Bold", "Noto Sans Regular"],
      },
      paint: {
        "text-color": "#ffffff",
      },
    });
  }

  if (!map.getLayer(LAYER_UNCLUSTERED)) {
    // Outer circle (border effect)
    map.addLayer({
      id: LAYER_UNCLUSTERED,
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11,
          10,
          15,
          16
        ],
        "circle-color": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          COLOR_SELECTED,
          ["==", ["get", "status"], "open"],
          COLOR_OPEN,
          ["==", ["get", "status"], "closed"],
          COLOR_CLOSED,
          COLOR_UNKNOWN,
        ],
        "circle-opacity": [
          "case",
          ["==", ["get", "status"], "closed"],
          0.7,
          1
        ],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Inner circle (hollow effect)
    map.addLayer({
      id: LAYER_UNCLUSTERED + "-inner",
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11,
          5,
          15,
          8
        ],
        "circle-color": "#ffffff",
        "circle-opacity": 1,
      },
    });

    // Hover/Selected scaling layer
    map.addLayer({
      id: LAYER_UNCLUSTERED + "-scale",
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11,
          [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            12,
            ["boolean", ["feature-state", "hover"], false],
            11,
            0
          ],
          15,
          [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            19,
            ["boolean", ["feature-state", "hover"], false],
            17.5,
            0
          ]
        ],
        "circle-color": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          COLOR_SELECTED,
          ["==", ["get", "status"], "open"],
          COLOR_OPEN,
          ["==", ["get", "status"], "closed"],
          COLOR_CLOSED,
          COLOR_UNKNOWN,
        ],
        "circle-opacity": [
          "case",
          ["==", ["get", "status"], "closed"],
          0.7,
          1
        ],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Inner circle for scaled markers
    map.addLayer({
      id: LAYER_UNCLUSTERED + "-scale-inner",
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11,
          [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            6,
            ["boolean", ["feature-state", "hover"], false],
            5.5,
            0
          ],
          15,
          [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            9.5,
            ["boolean", ["feature-state", "hover"], false],
            8.75,
            0
          ]
        ],
        "circle-color": "#ffffff",
        "circle-opacity": 1,
      },
    });
  }
}

function setCafeSourceData(map: MapLibreMap, data: CafeFeatureCollection): void {
  const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
  if (!source) return;
  source.setData(data);
}

function clearSelectedFeatureState(map: MapLibreMap, prevId: string | null): void {
  if (!prevId) return;
  try {
    map.setFeatureState({ source: SOURCE_ID, id: prevId }, { selected: false });
  } catch {
    // If feature not present, ignore.
  }
}

function setSelectedFeatureState(map: MapLibreMap, nextId: string | null): void {
  if (!nextId) return;
  try {
    map.setFeatureState({ source: SOURCE_ID, id: nextId }, { selected: true });
  } catch {
    // If feature not present, ignore.
  }
}

function formatStatusText(status: CafeStatus): string {
  if (status === "open") return "Open";
  if (status === "closed") return "Closed";
  return "Unknown";
}

function createCafePopupHtml(props: CafeFeatureProperties): string {
  const rating = Number.isFinite(props.rating) ? props.rating.toFixed(1) : "N/A";
  const statusText = formatStatusText(props.status);

  const addressLine = props.address
    ? `<div style="margin-top:6px; font-size:12px; color:#6b7280;">${props.address}</div>`
    : "";

  const distanceLine =
    typeof props.distance === "number"
      ? `<div style="margin-top:6px; font-size:12px; color:#6b7280;">Distance: ${Math.round(props.distance)} m</div>`
      : "";

  return `
    <div style="padding:12px; min-width:220px;">
      <div style="margin:0 0 8px 0; font-weight:800; font-size:16px; color:#111827;">${props.name}</div>
      <div style="display:flex; gap:10px; align-items:center;">
        <div style="font-size:12px; font-weight:700; color:#111827;">Rating: ${rating}</div>
        <div style="font-size:12px; font-weight:700; color:#111827;">Status: ${statusText}</div>
      </div>
      ${addressLine}
      ${distanceLine}
      <div style="margin-top:10px; font-size:12px; color:#6b7280;">Click to view details</div>
    </div>
  `;
}

function findCafeById(cafes: Cafe[], cafeId: string): Cafe | undefined {
  return cafes.find((c) => c.cafe_id === cafeId);
}

const MapView = ({ cafes, onCafeClick, selectedCafe }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  const cafeGeoJson = useMemo(() => buildCafeGeoJson(cafes), [cafes]);

  // Initialize map (once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "bottom-right"
    );

    const onLoad = () => {
      setMapLoaded(true);
      enhanceBaseMapPalette(map);
      ensureCafeSourceAndLayers(map);
      setCafeSourceData(map, cafeGeoJson);

      // Keep palette adjustments even when style updates internal tiles/layers
      map.on("styledata", () => enhanceBaseMapPalette(map));
    };

    map.on("load", onLoad);

    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;

      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data when cafes changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    ensureCafeSourceAndLayers(map);
    setCafeSourceData(map, cafeGeoJson);

    // Re-apply selected state after data update
    const nextSelectedId = selectedCafe?.cafe_id ?? null;
    clearSelectedFeatureState(map, selectedIdRef.current);
    selectedIdRef.current = nextSelectedId;
    setSelectedFeatureState(map, nextSelectedId);
  }, [cafeGeoJson, mapLoaded, selectedCafe?.cafe_id]);

  // Pan to selected cafe
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCafe) return;

    const cardWidthPx = 384;
    const offsetX = cardWidthPx / 2;

    map.flyTo({
      center: [selectedCafe.longitude, selectedCafe.latitude],
      zoom: 16,
      duration: 1000,
      offset: [offsetX, 0],
    });
  }, [selectedCafe]);

  // Map click handlers (clusters + cafes)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const handleClusterClick = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_CLUSTERS] });
      if (!features.length) return;

      const clusterFeature = features[0];
      const clusterId = clusterFeature.properties?.cluster_id;
      const coordinates = (clusterFeature.geometry as any)?.coordinates as [number, number] | undefined;

      if (clusterId == null || !coordinates) return;

      const source = map.getSource(SOURCE_ID) as any;
      if (!source?.getClusterExpansionZoom) return;

      source.getClusterExpansionZoom(clusterId, (err: unknown, zoom: number) => {
        if (err) return;
        map.easeTo({ center: coordinates, zoom });
      });
    };

    const handleCafeClick = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_UNCLUSTERED] });
      if (!features.length) return;

      const feature = features[0] as any;
      const props = feature.properties as CafeFeatureProperties | undefined;
      if (!props?.cafe_id) return;

      // Update selected state
      clearSelectedFeatureState(map, selectedIdRef.current);
      selectedIdRef.current = props.cafe_id;
      setSelectedFeatureState(map, props.cafe_id);

      // Popup
      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({
        offset: 18,
        closeButton: false,
        className: "custom-popup",
      })
        .setLngLat((feature.geometry as any).coordinates)
        .setHTML(createCafePopupHtml(props))
        .addTo(map);

      // Callback
      const cafe = findCafeById(cafes, props.cafe_id);
      if (cafe) onCafeClick?.(cafe);
    };

    const handleMapClick = (e: MapMouseEvent) => {
      // Try cafe first, then cluster
      const cafeFeatures = map.queryRenderedFeatures(e.point, { layers: [LAYER_UNCLUSTERED] });
      if (cafeFeatures.length) {
        handleCafeClick(e);
        return;
      }

      const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: [LAYER_CLUSTERS] });
      if (clusterFeatures.length) {
        handleClusterClick(e);
        return;
      }

      // Clicked empty space
      popupRef.current?.remove();
      popupRef.current = null;
    };

    let hoveredCafeId: string | null = null;

    const handleMouseMove = (e: MapMouseEvent) => {
      const cafeFeatures = map.queryRenderedFeatures(e.point, { layers: [LAYER_UNCLUSTERED] });
      const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: [LAYER_CLUSTERS] });
      
      const hit = cafeFeatures.length > 0 || clusterFeatures.length > 0;
      map.getCanvas().style.cursor = hit ? "pointer" : "";

      // Handle cafe hover state
      if (cafeFeatures.length > 0) {
        const feature = cafeFeatures[0] as any;
        const cafeId = feature.properties?.cafe_id;
        
        if (cafeId && cafeId !== hoveredCafeId) {
          // Remove hover from previous cafe
          if (hoveredCafeId) {
            map.setFeatureState(
              { source: SOURCE_ID, id: hoveredCafeId },
              { hover: false }
            );
          }
          
          // Add hover to current cafe
          hoveredCafeId = cafeId;
          map.setFeatureState(
            { source: SOURCE_ID, id: cafeId },
            { hover: true }
          );
        }
      } else if (hoveredCafeId) {
        // Clear hover when not over any cafe
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredCafeId },
          { hover: false }
        );
        hoveredCafeId = null;
      }
    };

    map.on("click", handleMapClick);
    map.on("mousemove", handleMouseMove);

    return () => {
      if (hoveredCafeId) {
        try {
          map.setFeatureState(
            { source: SOURCE_ID, id: hoveredCafeId },
            { hover: false }
          );
        } catch {
          // Ignore if feature not found
        }
      }
      map.off("click", handleMapClick);
      map.off("mousemove", handleMouseMove);
      map.getCanvas().style.cursor = "";
    };
  }, [cafes, mapLoaded, onCafeClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      <style jsx global>{`
        .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }

        .maplibregl-popup-tip {
          border-top-color: white !important;
        }

        .maplibregl-ctrl-group {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
        }

        .maplibregl-ctrl-group button {
          width: 32px !important;
          height: 32px !important;
        }

        .maplibregl-ctrl-group button:hover {
          background-color: #f3f4f6 !important;
        }

        .maplibregl-ctrl-attrib {
          background-color: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 4px !important;
          padding: 2px 8px !important;
          font-size: 11px !important;
        }

        .maplibregl-map {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default MapView;
