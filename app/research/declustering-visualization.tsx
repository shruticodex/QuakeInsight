"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown, ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Area,
} from "recharts"
import dynamic from "next/dynamic"

// First, import the downloadElementAsImage utility
import { downloadElementAsImage } from "../utils/image-download"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const DeclusteringMap = dynamic(() => import("./declustering-map"), { ssr: false })

interface DeclusteringVisualizationProps {
  declusteringResults: any
}

export default function DeclusteringVisualization({ declusteringResults }: DeclusteringVisualizationProps) {
  const [selectedView, setSelectedView] = useState("map")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update the algorithm determination logic
  const algorithm = declusteringResults?.result?.algorithm || "dbscan"

  // Current data is always from the API results
  const currentData = declusteringResults.result

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const downloadCSV = () => {
    // Create CSV content
    const headers = ["Metric", "Before Declustering", "After Declustering"]
    const rows = [
      ["Total Earthquakes", currentData.beforeDeclustering.totalEvents, currentData.afterDeclustering.totalEvents],
      ["Mainshocks", currentData.beforeDeclustering.mainshocks, currentData.afterDeclustering.mainshocks],
      ["Aftershocks", currentData.beforeDeclustering.aftershocks, currentData.afterDeclustering.aftershocks],
      ["Average Magnitude", currentData.beforeDeclustering.avgMagnitude, currentData.afterDeclustering.avgMagnitude],
      ["Average Depth (km)", currentData.beforeDeclustering.avgDepth, currentData.afterDeclustering.avgDepth],
      ["b-Value", currentData.beforeDeclustering.bValue, currentData.afterDeclustering.bValue],
      ["Mean Time Gap (days)", currentData.beforeDeclustering.meanTimeGap, currentData.afterDeclustering.meanTimeGap],
    ]

    const csvContent = headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `declustering_results_${algorithm}.csv`)
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

  // Update the downloadAllVisualizations function to check which charts are currently visible

  // Add a new function to download all visualizations
  const downloadAllVisualizations = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const prefix = `declustering_${algorithm}_${timestamp}`

    // Create a queue of download operations
    const allChartIds = [
      "decluster-map",
      "temporal-plot",
      "magnitude-distribution",
      "depth-distribution",
      "nnd-distribution",
    ]

    // Filter to only include charts that exist in the DOM
    const chartIds = allChartIds.filter((id) => document.getElementById(id) !== null)

    if (chartIds.length === 0) {
      alert("No charts found to download. Please ensure charts are visible.")
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

  // Add a function to download data as CSV
  const downloadFullDataCSV = () => {
    // Create CSV content with all available data
    const headers = ["Metric", "Before Declustering", "After Declustering", "Change (%)"]

    const metrics = [
      ["Total Earthquakes", currentData.beforeDeclustering.totalEvents, currentData.afterDeclustering.totalEvents],
      ["Mainshocks", currentData.beforeDeclustering.mainshocks, currentData.afterDeclustering.mainshocks],
      ["Aftershocks", currentData.beforeDeclustering.aftershocks, currentData.afterDeclustering.aftershocks],
      [
        "Average Magnitude",
        currentData.beforeDeclustering.avgMagnitude.toFixed(2),
        currentData.afterDeclustering.avgMagnitude.toFixed(2),
      ],
      [
        "Average Depth (km)",
        currentData.beforeDeclustering.avgDepth.toFixed(1),
        currentData.afterDeclustering.avgDepth.toFixed(1),
      ],
      ["b-Value", currentData.beforeDeclustering.bValue.toFixed(2), currentData.afterDeclustering.bValue.toFixed(2)],
      [
        "Mean Time Gap (days)",
        currentData.beforeDeclustering.meanTimeGap.toFixed(2),
        currentData.afterDeclustering.meanTimeGap.toFixed(2),
      ],
    ]

    // Calculate percentage changes
    const rows = metrics.map((row) => {
      const before = Number.parseFloat(row[1])
      const after = Number.parseFloat(row[2])
      const percentChange = before !== 0 ? (((after - before) / before) * 100).toFixed(1) + "%" : "N/A"
      return [...row, percentChange]
    })

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

    link.setAttribute("href", url)
    link.setAttribute("download", `declustering_full_report_${algorithm}_${timestamp}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate percentage of removed aftershocks
  const percentageRemoved = (
    (currentData.beforeDeclustering.aftershocks / currentData.beforeDeclustering.totalEvents) *
    100
  ).toFixed(1)

  // Calculate mainshock to aftershock ratio
  const mainshockToAftershockRatio = (
    currentData.beforeDeclustering.mainshocks / currentData.beforeDeclustering.aftershocks
  ).toFixed(2)

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
    return <div className="text-center p-8">Loading declustering data...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="bg-muted p-4 rounded-md w-full">
          <h2 className="text-xl font-semibold">
            {algorithm === "dbscan"
              ? "DBSCAN"
              : algorithm === "nnd"
                ? "NND Algorithm"
                : algorithm === "gruenthal"
                  ? "Gruenthal Algorithm"
                  : "Reasenberg Algorithm"}{" "}
            Declustering Results
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Using real-time USGS earthquake data for analysis</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={downloadCSV} className="flex items-center gap-2">
            <FileDown size={16} />
            Download CSV
          </Button>
          <Button onClick={downloadFullDataCSV} variant="outline" className="flex items-center gap-2">
            <FileDown size={16} />
            Full Report
          </Button>
          <Button onClick={downloadAllVisualizations} variant="secondary" className="flex items-center gap-2">
            <ImageIcon size={16} />
            Download All Images
          </Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="map">Map Visualization</TabsTrigger>
          <TabsTrigger value="comparison">Before/After Comparison</TabsTrigger>
          <TabsTrigger value="statistics">Statistics & Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Declustered Event Visualization</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("decluster-map", "declustered_map")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="decluster-map" className="h-[400px] rounded-md overflow-hidden">
                  <DeclusteringMap
                    algorithm={algorithm}
                    mainshocks={currentData.mainshocks || []}
                    aftershocks={currentData.aftershocks || []}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Declustering Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Events Removed</h3>
                  <p className="text-4xl font-bold text-primary">
                    {currentData.beforeDeclustering.aftershocks.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{percentageRemoved}% of total events</p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Mainshocks Retained</h3>
                  <p className="text-4xl font-bold text-primary">
                    {currentData.afterDeclustering.mainshocks.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mainshock to aftershock ratio: 1:{mainshockToAftershockRatio}
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Average Magnitude Change</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {currentData.beforeDeclustering.avgMagnitude.toFixed(1)}
                    </span>
                    <span className="text-lg">→</span>
                    <span className="text-2xl font-bold text-primary">
                      {currentData.afterDeclustering.avgMagnitude.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Temporal Declustering Plot</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadImage("temporal-plot", "temporal_declustering")}
                  className="flex items-center gap-1"
                >
                  <ImageIcon size={16} />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="temporal-plot" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={currentData.cumulativeEvents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: "Days", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Cumulative Events", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="before" name="Before Declustering" fill="#8884d8" stroke="#8884d8" />
                    <Line type="monotone" dataKey="after" name="After Declustering" stroke="#ff7300" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Magnitude Distribution</CardTitle>
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
                      <Bar dataKey="before" name="Before Declustering" fill="#8884d8" />
                      <Bar dataKey="after" name="After Declustering" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Depth Distribution</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("depth-distribution", "depth_distribution")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="depth-distribution" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData.depthDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="depth" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="before" name="Before Declustering" fill="#8884d8" />
                      <Bar dataKey="after" name="After Declustering" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Declustering Summary Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Before Declustering</TableHead>
                      <TableHead>After Declustering</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Earthquakes</TableCell>
                      <TableCell>{currentData.beforeDeclustering.totalEvents.toLocaleString()}</TableCell>
                      <TableCell>{currentData.afterDeclustering.totalEvents.toLocaleString()}</TableCell>
                      <TableCell className="text-red-500">
                        {(
                          ((currentData.afterDeclustering.totalEvents - currentData.beforeDeclustering.totalEvents) /
                            currentData.beforeDeclustering.totalEvents) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mainshocks</TableCell>
                      <TableCell>{currentData.beforeDeclustering.mainshocks.toLocaleString()}</TableCell>
                      <TableCell>{currentData.afterDeclustering.mainshocks.toLocaleString()}</TableCell>
                      <TableCell>0%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Aftershocks and Foreshocks</TableCell>
                      <TableCell>{currentData.beforeDeclustering.aftershocks.toLocaleString()}</TableCell>
                      <TableCell>{currentData.afterDeclustering.aftershocks.toLocaleString()}</TableCell>
                      <TableCell className="text-red-500">-100%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Average Magnitude</TableCell>
                      <TableCell>{currentData.beforeDeclustering.avgMagnitude.toFixed(2)}</TableCell>
                      <TableCell>{currentData.afterDeclustering.avgMagnitude.toFixed(2)}</TableCell>
                      <TableCell className="text-green-500">
                        +
                        {(
                          ((currentData.afterDeclustering.avgMagnitude - currentData.beforeDeclustering.avgMagnitude) /
                            currentData.beforeDeclustering.avgMagnitude) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Average Depth (km)</TableCell>
                      <TableCell>{currentData.beforeDeclustering.avgDepth.toFixed(1)}</TableCell>
                      <TableCell>{currentData.afterDeclustering.avgDepth.toFixed(1)}</TableCell>
                      <TableCell className="text-green-500">
                        +
                        {(
                          ((currentData.afterDeclustering.avgDepth - currentData.beforeDeclustering.avgDepth) /
                            currentData.beforeDeclustering.avgDepth) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">b-Value</TableCell>
                      <TableCell>{currentData.beforeDeclustering.bValue.toFixed(2)}</TableCell>
                      <TableCell>{currentData.afterDeclustering.bValue.toFixed(2)}</TableCell>
                      <TableCell className="text-green-500">
                        +
                        {(
                          ((currentData.afterDeclustering.bValue - currentData.beforeDeclustering.bValue) /
                            currentData.beforeDeclustering.bValue) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mean Time Gap (days)</TableCell>
                      <TableCell>{currentData.beforeDeclustering.meanTimeGap.toFixed(2)}</TableCell>
                      <TableCell>{currentData.afterDeclustering.meanTimeGap.toFixed(2)}</TableCell>
                      <TableCell className="text-green-500">
                        +
                        {(
                          ((currentData.afterDeclustering.meanTimeGap - currentData.beforeDeclustering.meanTimeGap) /
                            currentData.beforeDeclustering.meanTimeGap) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Declustering Validity Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Goodness-of-Fit (GOF)</h3>
                  <p className="text-2xl font-bold text-primary">
                    {currentData.validityMetrics.goodnessOfFit.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Measures how well the declustering model fits the data. Higher is better.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Statistical Significance</h3>
                  <p className="text-2xl font-bold text-primary">
                    {currentData.validityMetrics.statisticalSignificance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Confidence level that the declustering results are not due to random chance.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Cluster Purity</h3>
                  <p className="text-2xl font-bold text-primary">
                    {currentData.validityMetrics.clusterPurity.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    How well the declustered data isolates mainshocks. Higher is better.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Nearest Neighbor Distance Distribution</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("nnd-distribution", "nnd_distribution")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="nnd-distribution" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData.nndDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="distance" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Events" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Algorithm-Specific Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              {algorithm === "dbscan" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Noise Points</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.noisePoints.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Events removed as noise</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Core Points</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.corePoints.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Central points in clusters</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Border Points</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.borderPoints.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Points on the edge of clusters</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md col-span-1 md:col-span-2">
                    <h3 className="font-semibold mb-2">Epsilon (ε)</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.algorithmSpecific.eps} km</p>
                    <p className="text-sm text-muted-foreground">Maximum distance between points in a cluster</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">MinPts</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.algorithmSpecific.minPts}</p>
                    <p className="text-sm text-muted-foreground">Minimum points to form a cluster</p>
                  </div>
                </div>
              )}

              {algorithm === "nnd" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Threshold Distance</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.thresholdDistance} km
                    </p>
                    <p className="text-sm text-muted-foreground">Distance threshold for clustering</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Threshold Time</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.thresholdTime} days
                    </p>
                    <p className="text-sm text-muted-foreground">Time window for clustering</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Eta Value</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.algorithmSpecific.etaValue}</p>
                    <p className="text-sm text-muted-foreground">Scaling parameter for distance calculation</p>
                  </div>
                </div>
              )}

              {algorithm === "gruenthal" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Space Window</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.algorithmSpecific.spaceWindowKm} km</p>
                    <p className="text-sm text-muted-foreground">Spatial window for clustering</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Time Window</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.timeWindowDays} days
                    </p>
                    <p className="text-sm text-muted-foreground">Temporal window for clustering</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Cluster Stability</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.clusterStability.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Measure of cluster persistence</p>
                  </div>
                </div>
              )}

              {algorithm === "reasenberg" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Foreshocks Identified</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.foreshocksIdentified.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Events identified as foreshocks</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Aftershocks Identified</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.algorithmSpecific.aftershocksIdentified.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Events identified as aftershocks</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">p-Value</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.algorithmSpecific.pValue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Omori law decay parameter</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">c-Value</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.algorithmSpecific.cValue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Omori law time offset parameter</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
