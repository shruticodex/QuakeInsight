"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface MapProps {
  data: any[]
  subType: string
  showControls?: boolean
  showScale?: boolean
}

export default function Map({ data, subType, showControls = false, showScale = false }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clean up previous map instance if it exists
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Create a new map instance
      const map = L.map("map", {
        zoomControl: showControls,
        attributionControl: true,
      }).setView([0, 0], 2)

      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add scale control if requested
      if (showScale) {
        L.control.scale({ position: "bottomleft", imperial: false }).addTo(map)
      }

      // Add markers for each earthquake based on the subType
      if (subType === "Mainshock Highlight") {
        // For mainshock highlight, use different colors for mainshock and aftershocks
        data.forEach((event) => {
          const markerColor = event.isMainshock ? "#FF5722" : event.isAftershock ? "#4CAF50" : "#2196F3"
          const markerSize = event.isMainshock ? 12 : Math.max(6, event.magnitude * 1.5)

          const marker = L.circleMarker([event.latitude, event.longitude], {
            radius: markerSize,
            fillColor: markerColor,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          })

          let popupContent = `
            <div style="font-family: system-ui, sans-serif; padding: 4px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${event.isMainshock ? "Mainshock" : event.isAftershock ? "Aftershock" : "Foreshock"}</div>
              <div><b>Time:</b> ${new Date(event.time).toLocaleString()}</div>
              <div><b>Magnitude:</b> ${event.magnitude.toFixed(2)}</div>
              <div><b>Depth:</b> ${event.depth.toFixed(2)} km</div>
              <div><b>Coordinates:</b> ${event.latitude.toFixed(4)}°N, ${event.longitude.toFixed(4)}°E</div>
          `

          if (event.distanceFromMainshock) {
            popupContent += `<div><b>Distance from Mainshock:</b> ${event.distanceFromMainshock.toFixed(1)} km</div>`
          }

          popupContent += `</div>`

          marker.bindPopup(popupContent)
          marker.addTo(map)
        })
      } else if (subType === "Longitude vs Latitude vs Time with Depth") {
        // Color-code by depth
        data.forEach((event) => {
          const marker = L.circleMarker([event.latitude, event.longitude], {
            radius: event.size || 5,
            fillColor: event.color || getDepthColor(event.depth),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          })

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px;">
              <div style="font-weight: bold; margin-bottom: 4px;">Earthquake Details</div>
              <div><b>Time:</b> ${new Date(event.time).toLocaleString()}</div>
              <div><b>Magnitude:</b> ${event.magnitude.toFixed(2)}</div>
              <div><b>Depth:</b> ${event.depth.toFixed(2)} km</div>
              <div><b>Coordinates:</b> ${event.latitude.toFixed(4)}°N, ${event.longitude.toFixed(4)}°E</div>
            </div>
          `)

          marker.addTo(map)
        })
      } else if (subType === "Longitude vs Latitude vs Magnitude") {
        // Color-code by magnitude
        data.forEach((event) => {
          const marker = L.circleMarker([event.latitude, event.longitude], {
            radius: event.size || Math.max(3, event.magnitude * 1.5),
            fillColor: event.color || getMagnitudeColor(event.magnitude),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          })

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px;">
              <div style="font-weight: bold; margin-bottom: 4px;">Earthquake Details</div>
              <div><b>Time:</b> ${new Date(event.time).toLocaleString()}</div>
              <div><b>Magnitude:</b> ${event.magnitude.toFixed(2)}</div>
              <div><b>Depth:</b> ${event.depth.toFixed(2)} km</div>
              <div><b>Coordinates:</b> ${event.latitude.toFixed(4)}°N, ${event.longitude.toFixed(4)}°E</div>
            </div>
          `)

          marker.addTo(map)
        })
      } else {
        // Default map visualization
        data.forEach((event) => {
          // Use color and radius if provided, otherwise use defaults
          const radius = event.radius || Math.max(3, event.magnitude * 1.5)
          const fillColor = event.color || getMagnitudeColor(event.magnitude)

          const marker = L.circleMarker([event.latitude, event.longitude], {
            radius: radius,
            fillColor: fillColor,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          })

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px;">
              <div style="font-weight: bold; margin-bottom: 4px;">Earthquake Details</div>
              <div><b>Time:</b> ${new Date(event.time).toLocaleString()}</div>
              <div><b>Magnitude:</b> ${event.magnitude.toFixed(2)}</div>
              <div><b>Depth:</b> ${event.depth.toFixed(2)} km</div>
              <div><b>Coordinates:</b> ${event.latitude.toFixed(4)}°N, ${event.longitude.toFixed(4)}°E</div>
            </div>
          `)

          marker.addTo(map)
        })
      }

      // Add a legend
      const legend = L.control({ position: "bottomright" })
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend")
        let legendContent =
          '<div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">'

        if (subType === "Mainshock Highlight") {
          legendContent += `
            <div style="margin-bottom: 5px; font-weight: bold;">Legend</div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #FF5722; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Mainshock</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #4CAF50; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Aftershock</span>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="background-color: #2196F3; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Foreshock</span>
            </div>
          `
        } else if (subType === "Longitude vs Latitude vs Time with Depth") {
          legendContent += `
            <div style="margin-bottom: 5px; font-weight: bold;">Depth Legend</div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #ffffcc; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Shallow (&lt;10 km)</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #a1dab4; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Medium-shallow (10-30 km)</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #41b6c4; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Medium (30-70 km)</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #2c7fb8; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Medium-deep (70-150 km)</span>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="background-color: #253494; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>Deep (&gt;150 km)</span>
            </div>
          `
        } else {
          legendContent += `
            <div style="margin-bottom: 5px; font-weight: bold;">Magnitude Legend</div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #1a9850; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>M &lt; 2.0</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #91cf60; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>M 2.0-2.9</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #d9ef8b; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>M 3.0-3.9</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #fee08b; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>M 4.0-4.9</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background-color: #fc8d59; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>M 5.0-5.9</span>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="background-color: #d73027; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
              <span>M ≥ 6.0</span>
            </div>
          `
        }

        legendContent += "</div>"
        div.innerHTML = legendContent
        return div
      }
      legend.addTo(map)

      // Fit the map to the markers
      if (data.length > 0) {
        const bounds = L.latLngBounds(data.map((event) => [event.latitude, event.longitude]))
        map.fitBounds(bounds, { padding: [50, 50] })
      }

      // Set map as ready
      setMapReady(true)

      // Cleanup function
      return () => {
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
      }
    }
  }, [data, subType, showControls, showScale])

  // Helper function to get color based on magnitude
  function getMagnitudeColor(magnitude: number) {
    if (magnitude < 2) return "#1a9850" // green
    if (magnitude < 3) return "#91cf60" // light green
    if (magnitude < 4) return "#d9ef8b" // yellow-green
    if (magnitude < 5) return "#fee08b" // yellow
    if (magnitude < 6) return "#fc8d59" // orange
    return "#d73027" // red
  }

  // Helper function to get color based on depth
  function getDepthColor(depth: number) {
    if (depth < 10) return "#ffffcc" // shallow - light yellow
    if (depth < 30) return "#a1dab4" // medium-shallow - light green
    if (depth < 70) return "#41b6c4" // medium - teal
    if (depth < 150) return "#2c7fb8" // medium-deep - blue
    return "#253494" // deep - dark blue
  }

  // Custom download function that uses html2canvas as a fallback
  const handleDownloadMap = () => {
    if (mapRef.current) {
      try {
        // Try using the leaflet.bigimage plugin
        import("html2canvas")
          .then((html2canvas) => {
            const mapElement = document.getElementById("map")
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
                  link.download = `earthquake-map-${new Date().toISOString().split("T")[0]}.png`
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
      <div id="map" style={{ height: "100%", width: "100%" }} />
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
