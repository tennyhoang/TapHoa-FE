'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OptimizeRouteResponse } from '@/services/driver.service';

type LatLng = [number, number];

function FitBounds({ positions }: { positions: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 14);
    }
  }, [map, JSON.stringify(positions)]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function makeHubIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;background:#ef4444;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function makeStopIcon(n: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;background:#3b82f6;border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.3)">${n}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

interface Props {
  result: OptimizeRouteResponse;
  warehouseLabel?: string;
}

export function RouteMap({ result, warehouseLabel = 'Kho xuất phát' }: Props) {
  const hubPos: LatLng | null =
    result.hubLat != null && result.hubLng != null
      ? [result.hubLat, result.hubLng]
      : null;

  const stopPositions: (LatLng | null)[] = result.stops.map(s =>
    s.lat != null && s.lng != null ? [s.lat, s.lng] : null,
  );

  const validStopPos = stopPositions.filter((p): p is LatLng => p != null);

  const allPositions: LatLng[] = [
    ...(hubPos ? [hubPos] : []),
    ...validStopPos,
  ];

  const polylinePoints: LatLng[] = hubPos
    ? [hubPos, ...validStopPos, hubPos]
    : validStopPos;

  if (allPositions.length === 0) return null;

  return (
    <MapContainer
      center={allPositions[0]}
      zoom={13}
      style={{ height: '360px', width: '100%', borderRadius: '12px', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={allPositions} />

      {hubPos && (
        <Marker position={hubPos} icon={makeHubIcon()}>
          <Popup>
            <p className="font-semibold text-sm">{warehouseLabel}</p>
          </Popup>
        </Marker>
      )}

      {result.stops.map((stop, i) => {
        const pos = stopPositions[i];
        if (!pos) return null;
        return (
          <Marker key={stop.originalIndex} position={pos} icon={makeStopIcon(stop.stopNumber)}>
            <Popup>
              <p className="font-semibold text-sm">Điểm {stop.stopNumber}</p>
              <p className="text-xs text-gray-600 mt-0.5">{stop.address}</p>
            </Popup>
          </Marker>
        );
      })}

      {polylinePoints.length >= 2 && (
        <Polyline
          positions={polylinePoints}
          color="#7c3aed"
          weight={3}
          opacity={0.7}
          dashArray="8,6"
        />
      )}
    </MapContainer>
  );
}
