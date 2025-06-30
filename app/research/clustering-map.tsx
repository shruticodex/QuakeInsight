"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ClusterMapProps {
  clusters: any[]
}

export default function ClusterMap({ clusters }: ClusterMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clean up previous map instance if it exists
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Create a new map instance
      const map = L.map("cluster-map").setView([37.0902, -95.7129], 4) // Center on US
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add cluster centroids and circles
      clusters.forEach((cluster, index) => {
        const color = COLORS[index % COLORS.length]

        // Add centroid marker
        const centroidMarker = L.marker([cluster.centroidLat, cluster.centroidLng])
          .addTo(map)
          .bindPopup(`
            <b>Cluster ${cluster.id} Centroid</b><br>
            Earthquakes: ${cluster.size}<br>
            Avg. Magnitude: ${cluster.avgMagnitude.toFixed(1)}<br>
            Avg. Depth: ${cluster.avgDepth.toFixed(1)} km
          `)

        // Add circle to represent cluster area
        // Size is proportional to the number of earthquakes
        const radius = Math.sqrt(cluster.size) * 20000 // Adjust scale as needed
        L.circle([cluster.centroidLat, cluster.centroidLng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          radius: radius,
        }).addTo(map)

        // Simulate some earthquake points within the cluster
        // In a real app, you would use actual earthquake coordinates
        for (let i = 0; i < Math.min(cluster.size, 20); i++) {
          // Random point within the cluster radius
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * radius
          const dx = (distance * Math.cos(angle)) / 111320 // Convert meters to degrees (approximate)
          const dy = (distance * Math.sin(angle)) / (111320 * Math.cos((cluster.centroidLat * Math.PI) / 180))

          const lat = cluster.centroidLat + dy
          const lng = cluster.centroidLng + dx

          L.circleMarker([lat, lng], {
            radius: 3,
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
          }).addTo(map)
        }
      })

      // Fit the map to the markers if there are clusters
      if (clusters.length > 0) {
        const bounds = L.latLngBounds(clusters.map((cluster) => [cluster.centroidLat, cluster.centroidLng]))
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
  }, [clusters])

  // Custom download function that uses html2canvas
  const handleDownloadMap = () => {
    if (mapRef.current) {
      try {
        import("html2canvas")
          .then((html2canvas) => {
            const mapElement = document.getElementById("cluster-map")
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
                  link.download = `cluster-map-${new Date().toISOString().split("T")[0]}.png`
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
      <div id="cluster-map" style={{ height: "100%", width: "100%" }} />
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
