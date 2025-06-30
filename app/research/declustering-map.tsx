"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DeclusteringMapProps {
  algorithm: string
  mainshocks?: any[]
  aftershocks?: any[]
}

export default function DeclusteringMap({ algorithm, mainshocks = [], aftershocks = [] }: DeclusteringMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Clean up previous map instance if it exists
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }

        // Make sure the map container exists
        const mapContainer = document.getElementById("decluster-map")
        if (!mapContainer) {
          console.error("Map container not found")
          return
        }

        // Create a new map instance
        const map = L.map("decluster-map").setView([37.0902, -95.7129], 4) // Center on US
        mapRef.current = map

        console.log("DeclusteringMap received data:", {
          algorithm,
          mainshocksLength: mainshocks?.length || 0,
          aftershocksLength: aftershocks?.length || 0,
          mainshocksSample: mainshocks?.slice(0, 2) || [],
          aftershocksSample: aftershocks?.slice(0, 2) || [],
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Use the real data passed from the parent component
        if (mainshocks && mainshocks.length > 0) {
          // Add mainshocks
          mainshocks.forEach((mainshock) => {
            // Add mainshock marker
            const mainshockMarker = L.marker([mainshock.latitude, mainshock.longitude], {
              icon: L.divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: #ff0000; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6],
              }),
            })
              .addTo(map)
              .bindPopup(`
            <b>Mainshock</b><br>
            Magnitude: ${mainshock.magnitude.toFixed(1)}<br>
            Depth: ${mainshock.depth.toFixed(1)} km<br>
            Time: ${new Date(mainshock.time).toLocaleString()}
          `)
          })

          // Add aftershocks
          if (aftershocks && aftershocks.length > 0) {
            aftershocks.forEach((aftershock) => {
              // Add aftershock marker (faded)
              L.circleMarker([aftershock.latitude, aftershock.longitude], {
                radius: 3,
                color: "#8884d8",
                fillColor: "#8884d8",
                fillOpacity: 0.3,
                opacity: 0.3,
              })
                .addTo(map)
                .bindPopup(`
              <b>Aftershock</b><br>
              Magnitude: ${aftershock.magnitude.toFixed(1)}<br>
              Depth: ${aftershock.depth.toFixed(1)} km<br>
              Time: ${new Date(aftershock.time).toLocaleString()}
            `)
            })
          }

          // Fit the map to the markers
          const allPoints = [...mainshocks, ...aftershocks]
          if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints.map((point) => [point.latitude, point.longitude]))
            map.fitBounds(bounds, { padding: [50, 50] })
          }
        } else {
          // If no real data is available, show a message on the map
          // Instead of using a custom control, add a simple overlay div
          const noDataDiv = L.DomUtil.create("div", "no-data-message")
          noDataDiv.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; 
                 background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
              <div style="font-weight: bold;">No Earthquake Data Available</div>
              <div>Please adjust your search parameters or check the console for debugging information.</div>
              <div style="font-size: 0.8em; margin-top: 5px;">Algorithm: ${algorithm}, Mainshocks: ${mainshocks?.length || 0}, Aftershocks: ${aftershocks?.length || 0}</div>
            </div>
          `
          mapContainer.appendChild(noDataDiv)
        }

        // Add a legend
        const legend = L.control({ position: "bottomright" })
        legend.onAdd = () => {
          const div = L.DomUtil.create("div", "info legend")
          div.innerHTML = `
          <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 5px; font-weight: bold;">Legend</div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #ff0000; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px; border: 2px solid white;"></div>
              <span>Mainshock</span>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="background-color: #8884d8; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px; opacity: 0.3;"></div>
              <span>Removed Aftershock</span>
            </div>
          </div>
        `
          return div
        }
        legend.addTo(map)

        // Add algorithm info
        const info = L.control({ position: "topright" })
        info.onAdd = () => {
          const div = L.DomUtil.create("div", "info")
          div.innerHTML = `
          <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="font-weight: bold;">${algorithm.toUpperCase()} Declustering</div>
            <div>Mainshocks: ${mainshocks ? mainshocks.length : 0}</div>
            <div>Aftershocks removed: ${aftershocks ? aftershocks.length : 0}</div>
          </div>
        `
          return div
        }
        info.addTo(map)

        // Set map as ready
        setMapReady(true)
      } catch (error) {
        console.error("Error initializing map:", error)
      }

      // Cleanup function
      return () => {
        try {
          if (mapRef.current) {
            mapRef.current.remove()
            mapRef.current = null
          }
          // Also remove any custom overlays we added
          const mapContainer = document.getElementById("decluster-map")
          const noDataMessage = mapContainer?.querySelector(".no-data-message")
          if (noDataMessage && mapContainer) {
            mapContainer.removeChild(noDataMessage)
          }
        } catch (error) {
          console.error("Error cleaning up map:", error)
        }
      }
    }
  }, [algorithm, mainshocks, aftershocks])

  // Custom download function that uses html2canvas
  const handleDownloadMap = () => {
    if (mapRef.current) {
      try {
        import("html2canvas")
          .then((html2canvas) => {
            const mapElement = document.getElementById("decluster-map")
            if (mapElement) {
              html2canvas
                .default(mapElement, {
                  useCORS: true,
                  scale: 2,
                  logging: false,
                  allowTaint: true,
                  backgroundColor: null,
                })
                .then((canvas) => {
                  const link = document.createElement("a")
                  link.download = `decluster-map-${new Date().toISOString().split("T")[0]}.png`
                  link.href = canvas.toDataURL("image/png")
                  link.click()
                })
            }
          })
          .catch((err) => {
            console.error("Error using html2canvas:", err)
            alert("Failed to download map. Please try again.")
          })
      } catch (error) {
        console.error("Error downloading map:", error)
        alert("Failed to download map. Please try again.")
      }
    } else {
      alert("Map is not ready yet. Please try again in a moment.")
    }
  }

  // Add a download button to the map
  return (
    <div className="relative h-full w-full">
      <div id="decluster-map" style={{ height: "100%", width: "100%" }} />
      <div className="absolute top-2 right-2 z-[1000]">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadMap}
          className="bg-white bg-opacity-80 hover:bg-opacity-100"
          disabled={!mapReady}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Map
        </Button>
      </div>
    </div>
  )
}
