# daintree-wayfinder
Vercel-ready Next.js map preview with MapLibre GL - interactive route visualization with waypoint management
data.currentp.coords.accuracynavigator.geolocationWayfinderLive.jsx// WayfinderLive.jsx

import React, {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";

import WayfinderMap from "./WayfinderMap";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  CloudRain,
  Navigation,
  ShieldAlert,
  RefreshCw
} from "lucide-react";

const ROUTE = [
  {
    name: "Daintree Ferry",
    lat: -16.2497,
    lng: 145.4008,
    instruction:
      "Board the ferry and continue north."
  },
  {
    name: "Cow Bay",
    lat: -16.2206,
    lng: 145.4244,
    instruction:
      "Drive beneath the rainforest canopy."
  },
  {
    name: "Thornton Beach",
    lat: -16.1651,
    lng: 145.4406,
    instruction:
      "Scenic coastal lookout ahead."
  },
  {
    name: "Cooper Creek",
    lat: -16.1192,
    lng: 145.4516,
    instruction:
      "Cross Cooper Creek bridge."
  },
  {
    name: "Cape Tribulation",
    lat: -16.0871,
    lng: 145.4620,
    instruction:
      "Destination reached."
  }
];

export default function WayfinderLive() {
  const [nodeIndex, setNodeIndex] =
    useState(0);

  const [audioEnabled,
    setAudioEnabled] =
    useState(true);

  const [isSimulating,
    setIsSimulating] =
    useState(false);

  const [gps,
    setGps] =
    useState(null);

  const [weather,
    setWeather] =
    useState(null);

  const [
    mapProvider,
    setMapProvider
  ] = useState("osm");

  const current =
    ROUTE[nodeIndex];

  useEffect(() => {
    if (!navigator.geolocation)
      return;

    const watch =
      navigator.geolocation.watchPosition(
        p => {
          setGps({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy:
              p.coords.accuracy
          });
        }
      );

    return () =>
      navigator.geolocation
        .clearWatch(watch);
  }, []);

  useEffect(() => {
    const fetchWeather =
      async () => {

      try {

        const r =
          await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${current.lat}&longitude=${current.lng}&current=temperature_2m`
          );

        const data =
          await r.json();

        setWeather(
          data.current
        );

      } catch {}
    };

    fetchWeather();

  }, [nodeIndex]);

  return (
    <div className="
      min-h-screen
      bg-slate-950
      text-white
    ">
      
      <header
        className="
        p-4
        border-b
        border-slate-800
      "
      >
        <h1 className="
          text-xl
          font-bold
        ">
          Wayfinder Live
        </h1>
      </header>

      <div
        className="
          grid
          lg:grid-cols-12
          gap-4
          p-4
        "
      >
        <div
          className="
            lg:col-span-8
          "
        >
          <WayfinderMap
            route={ROUTE}
            currentNode={current}
            gps={gps}
            provider={
              mapProvider
            }
          />
        </div>

        <div
          className="
          lg:col-span-4
          space-y-4
        "
        >
          <div
            className="
            bg-slate-900
            rounded-2xl
            p-4
          "
          >
            <h3>
              Navigation
            </h3>

            <p className="mt-2">
              {
                current.instruction
              }
            </p>

            {weather && (
              <p className="mt-2">
                Temp:
                {" "}
                {
                  weather.temperature_2m
                }
                °C
              </p>
            )}
          </div>

          <div
            className="
              bg-slate-900
              p-4
              rounded-2xl
            "
          >
            <div
              className="
              flex
              gap-2
              flex-wrap
            "
            >
              <button
                onClick={() =>
                  setIsSimulating(
                    !isSimulating
                  )
                }
              >
                {
                  isSimulating
                    ? <Pause />
                    : <Play />
                }
              </button>

              <button
                onClick={() =>
                  setAudioEnabled(
                    !audioEnabled
                  )
                }
              >
                {
                  audioEnabled
                    ? <Volume2 />
                    : <VolumeX />
                }
              </button>

              <button>
                <CloudRain />
              </button>

              <button>
                <ShieldAlert />
              </button>

              <button>
                <RefreshCw />
              </button>
            </div>
          </div>

          <div
            className="
            bg-slate-900
            rounded-2xl
            p-4
          "
          >
            <select
              value={
                mapProvider
              }
              onChange={
                e =>
                  setMapProvider(
                    e.target.value
                  )
              }
            >
              <option value="osm">
                OpenStreetMap
              </option>

              <option value="google">
                Google Maps
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
hazard.namehazard.idgps.accuracyhttps://www.openstreetmap.org/export/embed.htmlhttps://www.google.com/maps/embed/v1/directionsWayfinderMap.jsx<div
  className="
    grid
    lg:grid-cols-12
    gap-4
    p-4
  "
>
// WayfinderMap.jsx

import React from "react";

const HAZARDS = [
  {
    id: "cassowary",
    name: "Cassowary Zone",
    lat: -16.213,
    lng: 145.431
  },
  {
    id: "crocodile",
    name: "Crocodile Habitat",
    lat: -16.120,
    lng: 145.452
  }
];

export default function WayfinderMap({
  route,
  provider,
  gps
}) {

  const googleMapUrl =
    `https://www.google.com/maps/embed/v1/directions
    ?key=${import.meta.env.VITE_GOOGLE_KEY}
    &origin=-16.2497,145.4008
    &destination=-16.0871,145.4620
    &waypoints=
    -16.2206,145.4244|
    -16.1651,145.4406|
    -16.1192,145.4516`;

  const osmMapUrl =
    `https://www.openstreetmap.org/export/embed.html
    ?bbox=145.35,-16.30,145.50,-16.05
    &layer=mapnik`;

  return (
    <div
      className="
      relative
      h-[600px]
      rounded-3xl
      overflow-hidden
      border
      border-slate-800
      bg-slate-900
    "
    >
      {

      <div
        className="
        absolute
        top-4
        right-4
        bg-slate-950/90
        p-3
        rounded-xl
      "
      >
        <div>
          🟢 Start
        </div>

        <div>
          🔵 Scenic
        </div>

        <div>
          🟠 Hazard
        </div>

        <div>
          🟣 Destination
        </div>
      </div>

      <div
        className="
        absolute
        bottom-4
        left-4
        bg-slate-950/90
        p-3
        rounded-xl
      "
      >
        {gps && (
          <>
            <div>
              GPS Active
            </div>

            <div>
              {gps.lat}
            </div>

            <div>
              {gps.lng}
            </div>

            <div>
              ±
              {Math.round(
                gps.accuracy
              )}
              m
            </div>
          </>
        )}
      </div>

      <div
        className="
        absolute
        bottom-4
        right-4
        bg-slate-950/90
        p-3
        rounded-xl
      "
      >
        {HAZARDS.map(
          hazard => (
            <div
              key={hazard.id}
            >
              ⚠️ {hazard.name}
            </div>
          )
        )}
      </div>
    </div>
  );
}
stop.nameh.namegps.late.target.valuehttps://www.google.com/maps?q=-16.16,145.44&z=11&output=embedhttps://www.openstreetmap.org/export/embed.html?bbox=145.35,-16.30,145.50,-16.05&layer=mapnikhttps://api.open-meteo.com/v1/forecast?latitude=-16.16&longitude=145.44&current=temperature_2md.currentpos.coords.accuracyimport React, { useState, useEffect } from "react";
import {
  Map,
  Navigation,
  AlertTriangle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain
} from "lucide-react";

const ROUTE = [
  {
    name: "Daintree Ferry",
    lat: -16.2497,
    lng: 145.4008
  },
  {
    name: "Cow Bay",
    lat: -16.2206,
    lng: 145.4244
  },
  {
    name: "Thornton Beach",
    lat: -16.1651,
    lng: 145.4406
  },
  {
    name: "Cooper Creek",
    lat: -16.1192,
    lng: 145.4516
  },
  {
    name: "Cape Tribulation",
    lat: -16.0871,
    lng: 145.4620
  }
];

const HAZARDS = [
  {
    name: "Cassowary Zone",
    icon: "🦤"
  },
  {
    name: "Crocodile Habitat",
    icon: "🐊"
  }
];

export default function WayfinderLive() {
  const [gps, setGps] = useState(null);
  const [weather, setWeather] = useState(null);
  const [provider, setProvider] = useState("osm");
  const [audio, setAudio] = useState(true);
  const [simulating, setSimulating] =
    useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watch =
      navigator.geolocation.watchPosition(
        pos => {
          setGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy:
              Math.round(
                pos.coords.accuracy
              )
          });
        }
      );

    return () =>
      navigator.geolocation.clearWatch(
        watch
      );
  }, []);

  useEffect(() => {
    async function loadWeather() {
      try {
        const r =
          await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=-16.16&longitude=145.44&current=temperature_2m"
          );

        const d = await r.json();

        setWeather(
          d.current
        );
      } catch {}
    }

    loadWeather();
  }, []);

  const mapURL =
    provider === "google"
      ? `https://www.google.com/maps?q=-16.16,145.44&z=11&output=embed`
      : `https://www.openstreetmap.org/export/embed.html?bbox=145.35,-16.30,145.50,-16.05&layer=mapnik`;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">

      {/* Header */}

      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 p-4">
        <h1 className="font-bold text-lg">
          Wayfinder Live
        </h1>
      </header>

      {/* Map */}

      <section className="relative h-[45vh] sm:h-[55vh] lg:h-[70vh]">

        {mapURL}

        <div className="absolute top-3 left-3 bg-slate-900/95 rounded-xl p-3">
          <div className="text-xs">
            Destination
          </div>

          <div className="font-bold">
            Cape Tribulation
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 rounded-2xl p-4">
          <div className="text-xs text-slate-400">
            NEXT INSTRUCTION
          </div>

          <div className="font-bold">
            Continue north on Cape
            Tribulation Road
          </div>
        </div>

      </section>

      {/* Cards */}

      <div className="p-3 space-y-3">

        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold mb-2">
            GPS
          </h3>

          {gps ? (
            <>
              <p>
                Lat: {gps.lat}
              </p>

              <p>
                Lng: {gps.lng}
              </p>

              <p>
                Accuracy:
                {gps.accuracy}m
              </p>
            </>
          ) : (
            <p>
              Waiting for GPS...
            </p>
          )}
        </div>

        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold mb-2">
            Weather
          </h3>

          {weather && (
            <p>
              {weather.temperature_2m}
              °C
            </p>
          )}
        </div>

        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold mb-2">
            Map Provider
          </h3>

          <select
            value={provider}
            onChange={(e) =>
              setProvider(
                e.target.value
              )
            }
            className="bg-slate-800 rounded p-2 w-full"
          >
            <option value="osm">
              OpenStreetMap
            </option>

            <option value="google">
              Google Maps
            </option>
          </select>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold mb-2">
            Route Markers
          </h3>

          {ROUTE.map(stop => (
            <div
              key={stop.name}
              className="text-sm py-1"
            >
              📍 {stop.name}
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold mb-2">
            Hazard Layer
          </h3>

          {HAZARDS.map(h => (
            <div
              key={h.name}
              className="text-sm py-1"
            >
              {h.icon} {h.name}
            </div>
          ))}
        </div>

      </div>

      {/* Floating Controls */}

      <div
        className="
        fixed
        right-4
        bottom-24
        flex
        flex-col
        gap-2
        z-50
      "
      >
        <button
          onClick={() =>
            setSimulating(
              !simulating
            )
          }
          className="bg-emerald-500 p-3 rounded-full"
        >
          {simulating
            ? <Pause size={20} />
            : <Play size={20} />}
        </button>

        <button
          onClick={() =>
            setAudio(!audio)
          }
          className="bg-slate-800 p-3 rounded-full"
        >
          {audio
            ? <Volume2 size={20} />
            : <VolumeX size={20} />}
        </button>

        <button
          className="
          bg-slate-800
          p-3
          rounded-full
        "
        >
          <CloudRain size={20}/>
        </button>
      </div>

      {/* Mobile Bottom Nav */}

      <nav
        className="
        fixed
        bottom-0
        left-0
        right-0
        lg:hidden
        bg-slate-950
        border-t
        border-slate-800
        z-50
      "
      >
        <div className="grid grid-cols-4">

          <button className="p-4 flex flex-col items-center">
            <Map size={18}/>
            <span className="text-xs">
              Map
            </span>
          </button>

          <button className="p-4 flex flex-col items-center">
            <Navigation size={18}/>
            <span className="text-xs">
              Route
            </span>
          </button>

          <button className="p-4 flex flex-col items-center">
            <AlertTriangle size={18}/>
            <span className="text-xs">
              Alerts
            </span>
          </button>

          <button className="p-4 flex flex-col items-center">
            <Volume2 size={18}/>
            <span className="text-xs">
              Guide
            </span>
          </button>

        </div>
      </nav>
    </div>
  );
}
Matt opens dashboard
↓
Face ID
↓
Signed device credential
↓
Access granted
