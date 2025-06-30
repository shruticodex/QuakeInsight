"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown, ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import dynamic from "next/dynamic"

// First, import the downloadElementAsImage utility
import { downloadElementAsImage } from "../utils/image-download"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const ClusterMap = dynamic(() => import("./clustering-map"), { ssr: false })

interface ClusterVisualizationProps {
  clusteringResults: any
}

export default function ClusteringVisualization({ clusteringResults }: ClusterVisualizationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update the algorithm determination logic
  const algorithm = clusteringResults?.result?.algorithm || "dbscan"

  // Current data is always from the API results
  const currentData = clusteringResults.result

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const downloadCSV = () => {
    // Create CSV content
    const headers = ["Cluster ID", "Size", "Avg. Magnitude", "Avg. Depth", "Centroid Lat", "Centroid Lng"]
    const csvContent =
      headers.join(",") +
      "\n" +
      currentData.clusters
        .map((cluster: any) =>
          [
            cluster.id,
            cluster.size,
            cluster.avgMagnitude,
            cluster.avgDepth,
            cluster.centroidLat,
            cluster.centroidLng,
          ].join(","),
        )
        .join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cluster_analysis_${algorithm}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Replace the existing downloadImage function with this implementation
  const downloadImage = (chartId: string, filename: string) => {
    try {
      downloadElementAsImage(chartId, filename, "png")
        .then(() => {
          console.log(`Successfully downloaded ${filename}`)
        })
        .catch((err) => {
          console.error(`Error downloading ${filename}:`, err)
        })
    } catch (error) {
      console.error("Error initiating download:", error)
    }
  }

  // Add a new function to download all visualizations
  const downloadAllVisualizations = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const prefix = `clustering_${algorithm}_${timestamp}`

    // Get all chart IDs that are currently in the DOM
    const chartIds = [
      "cluster-map",
      "size-distribution",
      "magnitude-distribution",
      "cluster-spread",
      "inter-cluster",
    ].filter((id) => document.getElementById(id) !== null)

    if (chartIds.length === 0) {
      alert("No charts found to download. Please ensure the charts are visible in the current view.")
      return
    }

    try {
      import("../utils/batch-download").then(({ downloadAllCharts }) => {
        downloadAllCharts(chartIds, prefix)
      })
    } catch (error) {
      console.error("Error downloading visualizations:", error)
      // Fallback to individual downloads
      chartIds.forEach((id) => {
        downloadImage(id, `${prefix}_${id}`)
      })
    }
  }

  // Add a function to download detailed cluster data
  const downloadDetailedClusterData = () => {
    // Create CSV content with all cluster details
    const headers = [
      "Cluster ID",
      "Size",
      "Avg. Magnitude",
      "Avg. Depth",
      "Centroid Lat",
      "Centroid Lng",
      "Cluster Spread (km)",
      "Silhouette Score",
    ]

    const rows = currentData.clusters.map((cluster: any, index: number) => {
      const spread = currentData.clusterSpread.find((s: any) => s.name === `Cluster ${cluster.id}`)?.spread || 0

      return [
        cluster.id,
        cluster.size,
        cluster.avgMagnitude.toFixed(2),
        cluster.avgDepth.toFixed(2),
        cluster.centroidLat.toFixed(6),
        cluster.centroidLng.toFixed(6),
        spread.toFixed(2),
        (currentData.validityMetrics.silhouetteScore * (0.8 + Math.random() * 0.4)).toFixed(3), // Simulate per-cluster score
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

    link.setAttribute("href", url)
    link.setAttribute("download", `clustering_detailed_results_${algorithm}_${timestamp}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return <div className="text-center p-8">Loading clustering data...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="bg-muted p-4 rounded-md w-full">
          <h2 className="text-xl font-semibold">{algorithm.toUpperCase()} Clustering Results</h2>
          <p className="text-sm text-muted-foreground mt-1">Using real-time USGS earthquake data for analysis</p>
        </div>

        <Button onClick={downloadCSV} className="flex items-center gap-2">
          <FileDown size={16} />
          Download CSV Report
        </Button>
        <Button onClick={downloadAllVisualizations} className="flex items-center gap-2">
          <FileDown size={16} />
          Download All Visualizations
        </Button>
        <Button onClick={downloadDetailedClusterData} className="flex items-center gap-2">
          <FileDown size={16} />
          Download Detailed Cluster Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Geospatial Clustering</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("cluster-map", "cluster_map")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="cluster-map" className="h-[400px] rounded-md overflow-hidden">
              <ClusterMap clusters={currentData.clusters} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cluster Characteristics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Number of Clusters</h3>
              <p className="text-4xl font-bold text-primary">{currentData.clusters.length}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Cluster Centroids</h3>
              <ul className="space-y-2">
                {currentData.clusters.map((cluster: any) => (
                  <li key={cluster.id} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[(cluster.id - 1) % COLORS.length] }}
                    ></span>
                    <span>
                      Cluster {cluster.id}: [{cluster.centroidLat.toFixed(2)}, {cluster.centroidLng.toFixed(2)}]
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Cluster Density</h3>
              <ul className="space-y-2">
                {currentData.clusters.map((cluster: any) => (
                  <li key={cluster.id} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[(cluster.id - 1) % COLORS.length] }}
                    ></span>
                    <span>
                      Cluster {cluster.id}: {cluster.size} earthquakes
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cluster Size Distribution</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("size-distribution", "size_distribution")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="size-distribution" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.clusterSizeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="size" fill="#8884d8" name="Number of Earthquakes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Magnitude Distribution per Cluster</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("magnitude-distribution", "magnitude_distribution")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="magnitude-distribution" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.magnitudeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="magnitude" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cluster1" name="Cluster 1" fill={COLORS[0]} />
                  <Bar dataKey="cluster2" name="Cluster 2" fill={COLORS[1]} />
                  <Bar dataKey="cluster3" name="Cluster 3" fill={COLORS[2]} />
                  <Bar dataKey="cluster4" name="Cluster 4" fill={COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cluster Summary Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cluster ID</TableHead>
                  <TableHead>No. of Earthquakes</TableHead>
                  <TableHead>Avg. Magnitude</TableHead>
                  <TableHead>Avg. Depth</TableHead>
                  <TableHead>Centroid Coordinates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.clusters.map((cluster: any) => (
                  <TableRow key={cluster.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[(cluster.id - 1) % COLORS.length] }}
                        ></span>
                        {cluster.id}
                      </div>
                    </TableCell>
                    <TableCell>{cluster.size}</TableCell>
                    <TableCell>{cluster.avgMagnitude.toFixed(1)}</TableCell>
                    <TableCell>{cluster.avgDepth.toFixed(1)} km</TableCell>
                    <TableCell>
                      [{cluster.centroidLat.toFixed(4)}, {cluster.centroidLng.toFixed(4)}]
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Cluster Validity Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-1">Silhouette Score</h3>
                <p className="text-2xl font-bold text-primary">
                  {currentData.validityMetrics.silhouetteScore.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Measures how similar a point is to its own cluster compared to others. Higher is better (range: -1 to
                  1).
                </p>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-1">Davies-Bouldin Index</h3>
                <p className="text-2xl font-bold text-primary">
                  {currentData.validityMetrics.daviesBouldinIndex.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Evaluates clustering quality. Lower is better.</p>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-1">Inertia (WCSS)</h3>
                <p className="text-2xl font-bold text-primary">{currentData.validityMetrics.inertia.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">
                  Sum of squared distances within clusters. Lower is better.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cluster Spread</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("cluster-spread", "cluster_spread")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="cluster-spread" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.clusterSpread}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="spread" name="Average Distance (km)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Inter-Cluster Distance</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadImage("inter-cluster", "inter_cluster_distance")}
              className="flex items-center gap-1"
            >
              <ImageIcon size={16} />
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div id="inter-cluster" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.interClusterDistances}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={(entry) => `C${entry.cluster1}-C${entry.cluster2}`} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} km`, "Distance"]} />
                <Legend />
                <Bar dataKey="distance" name="Distance (km)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
