"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Define the earthquake interface
interface Earthquake {
  id: string
  properties: {
    mag: number
    place: string
    time: number
  }
  geometry: {
    coordinates: [number, number, number] // [longitude, latitude, depth]
  }
}

interface MapComponentProps {
  earthquakes: Earthquake[]
}

export default function MapComponent({ earthquakes }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    // Fix Leaflet's default icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20, 0], 2)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(mapRef.current)

      markersRef.current = L.layerGroup().addTo(mapRef.current)
    }

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers()
    }

    // Add earthquake markers
    earthquakes.forEach((quake) => {
      const [longitude, latitude, depth] = quake.geometry.coordinates

      // Skip invalid coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        return
      }

      // Determine marker size and color based on magnitude
      const magnitude = quake.properties.mag
      const markerSize = Math.max(5, Math.min(12, magnitude * 2))

      let markerColor = "#4ade80" // green for small earthquakes
      if (magnitude >= 6) {
        markerColor = "#ef4444" // red for major earthquakes
      } else if (magnitude >= 5) {
        markerColor = "#f97316" // orange for moderate earthquakes
      } else if (magnitude >= 4) {
        markerColor = "#facc15" // yellow for light earthquakes
      }

      // Create circle marker
      const marker = L.circleMarker([latitude, longitude], {
        radius: markerSize,
        fillColor: markerColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      })

      // Add popup with earthquake information
      marker.bindPopup(`
        <div>
          <h3 class="font-bold">Magnitude ${magnitude.toFixed(1)}</h3>
          <p>${quake.properties.place}</p>
          <p>Time: ${new Date(quake.properties.time).toLocaleString()}</p>
          <p>Depth: ${depth.toFixed(1)} km</p>
          <p>Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</p>
        </div>
      `)

      if (markersRef.current) {
        marker.addTo(markersRef.current)
      }
    })

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [earthquakes])

  return <div id="map" className="h-full w-full" />
}
