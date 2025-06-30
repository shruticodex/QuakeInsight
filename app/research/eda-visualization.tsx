"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, ImageIcon, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Cell,
  ComposedChart,
  Brush,
  Label,
} from "recharts"
import dynamic from "next/dynamic"
import { downloadElementAsImage } from "../utils/image-download"
import { Tooltip as TooltipUI } from "@/components/ui/tooltip"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import("../components/Map"), { ssr: false })

interface EDAVisualizationProps {
  edaResults: any
}

// Custom tooltip component for better data display
const CustomTooltip = ({ active, payload, label, labelFormatter, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{labelFormatter ? labelFormatter(label) : label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 my-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}: </span>
            <span className="font-medium">{formatter ? formatter(entry.value, entry.name) : entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function EDAVisualization({ edaResults }: EDAVisualizationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("linear")

  // Get the subType from the results
  const subType = edaResults?.subType || ""

  // Use real data from API
  const currentData = edaResults?.result || { data: [] }

  const downloadCSV = () => {
    if (!currentData.data || currentData.data.length === 0) return

    // Get all unique keys from the data
    const allKeys = new Set<string>()
    currentData.data.forEach((item: any) => {
      Object.keys(item).forEach((key) => allKeys.add(key))
    })

    // Filter out complex objects that can't be serialized to CSV
    const keys = Array.from(allKeys).filter(
      (key) => typeof currentData.data[0][key] !== "object" || currentData.data[0][key] === null,
    )

    // Create CSV header
    const header = keys.join(",")

    // Create CSV rows
    const rows = currentData.data
      .map((item: any) => {
        return keys
          .map((key) => {
            const value = item[key]
            // Format dates and handle special characters
            if (key === "time" || key === "formattedTime") {
              return `"${new Date(value).toISOString()}"`
            } else if (typeof value === "string") {
              return `"${value.replace(/"/g, '""')}"`
            } else {
              return value
            }
          })
          .join(",")
      })
      .join("\n")

    // Combine header and rows
    const csvContent = `${header}\n${rows}`

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `earthquake_${subType.toLowerCase().replace(/\s+/g, "_")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Use the downloadElementAsImage utility for image downloads
  const downloadImage = (chartId: string, filename: string) => {
    downloadElementAsImage(chartId, filename, "png")
  }

  // Add a function to download all visualizations
  const downloadAllVisualizations = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const prefix = `eda_${subType.toLowerCase().replace(/\s+/g, "_")}_${timestamp}`

    // Get all chart IDs that are currently in the DOM
    const possibleChartIds = [
      "map-visualization",
      "mainshock-map",
      "magnitude-time-scatter",
      "magnitude-time",
      "cumulative-plot",
      "lambda-plot",
      "gr-plot",
      "omori-plot-linear",
      "omori-plot-log",
      "longitude-time",
      "latitude-time",
      "3d-map",
    ]

    const chartIds = possibleChartIds.filter((id) => document.getElementById(id) !== null)

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
    return <div className="text-center p-8">Loading EDA data...</div>
  }

  // Add a button to download all visualizations
  const downloadAllButton = (
    <div className="mb-4 flex justify-end">
      <Button onClick={downloadAllVisualizations} variant="outline" className="flex items-center gap-2">
        <ImageIcon size={16} />
        Download All Charts
      </Button>
    </div>
  )

  // Format date for axis labels
  const formatDate = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) return "Invalid date"
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }

  // Format time for tooltips
  const formatTime = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) return "Invalid date"
    const date = new Date(timestamp)
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Add a helper function to validate timestamps
  const isValidTimestamp = (timestamp: number) => {
    return timestamp && !isNaN(timestamp) && timestamp > 0 && timestamp < Date.now() + 86400000 // Allow up to 1 day in the future
  }

  // Render different visualizations based on the subType
  const renderVisualization = () => {
    switch (subType) {
      case "Longitude vs Latitude with Map":
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Earthquake Locations</CardTitle>
                  <CardDescription>Geographic distribution of earthquake events</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadImage("map-visualization", "earthquake_map")}
                  className="flex items-center gap-1"
                >
                  <ImageIcon size={16} />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="map-visualization" className="h-[500px] rounded-md overflow-hidden">
                <Map data={currentData.data} subType={subType} showControls={true} showScale={true} />
              </div>
              <div className="mt-4 flex justify-between">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total earthquakes: <span className="font-medium">{currentData.data.length}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Magnitude range:{" "}
                    <span className="font-medium">
                      {Math.min(...currentData.data.map((d: any) => d.magnitude)).toFixed(1)} -
                      {Math.max(...currentData.data.map((d: any) => d.magnitude)).toFixed(1)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Depth range:{" "}
                    <span className="font-medium">
                      {Math.min(...currentData.data.map((d: any) => d.depth)).toFixed(1)} -
                      {Math.max(...currentData.data.map((d: any) => d.depth)).toFixed(1)} km
                    </span>
                  </p>
                </div>
                <Button onClick={downloadCSV} className="flex items-center gap-2">
                  <FileDown size={16} />
                  Download Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "Mainshock Highlight":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mainshock and Related Events Map</CardTitle>
                    <CardDescription>Spatial distribution of mainshock, foreshocks, and aftershocks</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("mainshock-map", "mainshock_map")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="mainshock-map" className="h-[400px] rounded-md overflow-hidden">
                  <Map
                    data={currentData.data.filter(
                      (event) => event.isMainshock || event.isAftershock || event.isForeshock,
                    )}
                    subType={subType}
                    showControls={true}
                    showScale={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mainshock Information</CardTitle>
                  <TooltipProvider>
                    <TooltipUI>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The mainshock is the largest magnitude event in the sequence</p>
                      </TooltipContent>
                    </TooltipUI>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-1 text-sm">Magnitude</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.mainshock.magnitude.toFixed(1)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-1 text-sm">Depth</h3>
                    <p className="text-2xl font-bold text-primary">{currentData.mainshock.depth.toFixed(1)} km</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-1 text-sm">Location</h3>
                    <p className="text-sm font-medium">
                      {currentData.mainshock.latitude.toFixed(4)}°N, {currentData.mainshock.longitude.toFixed(4)}°E
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-1 text-sm">Time</h3>
                    <p className="text-sm font-medium">{new Date(currentData.mainshock.time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#FF5722]"></div>
                      <span>Mainshock</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#2196F3]"></div>
                      <span>Foreshocks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#4CAF50]"></div>
                      <span>Aftershocks</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Earthquake Events Timeline</CardTitle>
                    <CardDescription>Magnitude vs. time showing mainshock and related events</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("magnitude-time-scatter", "magnitude_time_scatter")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="magnitude-time-scatter" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="time"
                        name="Time"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={formatDate}
                        scale="time"
                      >
                        <Label value="Time" position="insideBottom" offset={-40} />
                      </XAxis>
                      <YAxis type="number" dataKey="magnitude" name="Magnitude">
                        <Label value="Magnitude (ML)" angle={-90} position="insideLeft" offset={-30} />
                      </YAxis>
                      <Tooltip
                        content={
                          <CustomTooltip
                            formatter={(value: any) => [value.toFixed(2), ""]}
                            labelFormatter={formatTime}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <ReferenceLine
                        x={currentData.mainshock.time}
                        stroke="#FF5722"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{
                          value: "Mainshock",
                          position: "top",
                          fill: "#FF5722",
                          fontSize: 12,
                        }}
                      />
                      {/* Foreshocks - events before mainshock */}
                      <Scatter
                        name="Foreshocks"
                        data={currentData.data.filter(
                          (d: any) => isValidTimestamp(d.time) && d.time < currentData.mainshock.time && !d.isMainshock,
                        )}
                        fill="#2196F3"
                      >
                        {currentData.data
                          .filter(
                            (d: any) =>
                              isValidTimestamp(d.time) && d.time < currentData.mainshock.time && !d.isMainshock,
                          )
                          .map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill="#2196F3">
                              <circle r={Math.max(3, entry.magnitude * 1.2)} />
                            </Cell>
                          ))}
                      </Scatter>
                      {/* Aftershocks - events after mainshock */}
                      <Scatter
                        name="Aftershocks"
                        data={currentData.data.filter(
                          (d: any) => isValidTimestamp(d.time) && d.time > currentData.mainshock.time && !d.isMainshock,
                        )}
                        fill="#4CAF50"
                      >
                        {currentData.data
                          .filter(
                            (d: any) =>
                              isValidTimestamp(d.time) && d.time > currentData.mainshock.time && !d.isMainshock,
                          )
                          .map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill="#4CAF50">
                              <circle r={Math.max(3, entry.magnitude * 1.2)} />
                            </Cell>
                          ))}
                      </Scatter>
                      {/* Mainshock */}
                      <Scatter name="Mainshock" data={[currentData.mainshock]} fill="#FF5722">
                        <Cell fill="#FF5722">
                          <circle r={Math.max(6, currentData.mainshock.magnitude * 1.5)} />
                        </Cell>
                      </Scatter>
                      <Brush
                        dataKey="time"
                        height={30}
                        stroke="#8884d8"
                        tickFormatter={formatDate}
                        startIndex={0}
                        endIndex={Math.min(currentData.data.length - 1, 50)}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={downloadCSV} className="flex items-center gap-2">
                    <FileDown size={16} />
                    Download Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Magnitude vs Time After Mainshock</CardTitle>
                    <CardDescription>Decay pattern of aftershock magnitudes</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("magnitude-time", "magnitude_time")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="magnitude-time" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="timeSinceMainshock"
                        name="Days Since Mainshock"
                        label={{ value: "Days Since Mainshock", position: "insideBottom", offset: -20 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="magnitude"
                        name="Magnitude"
                        label={{ value: "Magnitude (ML)", angle: -90, position: "insideLeft", offset: -20 }}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            formatter={(value: any) => [value.toFixed(2), ""]}
                            //labelFormatter={(label: any) => `Days: ${label.toFixed(2)}`}
                            labelFormatter={(label: any) => 
                              typeof label === "number" ? `Days: ${label.toFixed(2)}` : "Days: N/A"
                            }
                          />
                        }
                      />
                      <Legend />
                      <Scatter
                        name="Aftershocks"
                        data={currentData.magnitudeTimeData.filter((d: any) => !d.isMainshock)}
                        fill="#8884d8"
                      />
                      <Scatter
                        name="Mainshock"
                        data={currentData.magnitudeTimeData.filter((d: any) => d.isMainshock)}
                        fill="#ff7300"
                      />
                      <ReferenceLine
                        y={currentData.mainshock.magnitude}
                        stroke="red"
                        strokeDasharray="3 3"
                        label={{
                          value: `M${currentData.mainshock.magnitude.toFixed(1)}`,
                          position: "right",
                          fill: "red",
                        }}
                      />
                      {/* Add Båth's law reference line (typically 1.2 magnitude units below mainshock) */}
                      <ReferenceLine
                        y={currentData.mainshock.magnitude - 1.2}
                        stroke="#FF9800"
                        strokeDasharray="3 3"
                        label={{
                          value: "Båth's Law",
                          position: "left",
                          fill: "#FF9800",
                        }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Båth's Law: Largest aftershock is typically ~1.2 magnitude units smaller than the mainshock</p>
                  </div>
                  <Button onClick={downloadCSV} className="flex items-center gap-2">
                    <FileDown size={16} />
                    Download Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "Cumulative Plot":
        // Find the mainshock (largest magnitude event) if it exists
        const mainshockEvent =
          currentData.data.length > 0
            ? currentData.data.reduce(
                (max, event) => (event.magnitude > max.magnitude ? event : max),
                currentData.data[0],
              )
            : null

        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cumulative Earthquake Count Over Time</CardTitle>
                  <CardDescription>Shows how earthquakes accumulate over the observation period</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadImage("cumulative-plot", "cumulative_plot")}
                  className="flex items-center gap-1"
                >
                  <ImageIcon size={16} />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="cumulative-plot" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={currentData.data} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      tickFormatter={formatDate}
                      scale="time"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                    >
                      <Label value="Date" position="insideBottom" offset={-20} />
                    </XAxis>
                    <YAxis
                      label={{ value: "Cumulative Count", angle: -90, position: "insideLeft", offset: -20 }}
                      domain={[0, "dataMax"]}
                    />
                    <Tooltip
                      content={
                        <CustomTooltip
                          labelFormatter={formatTime}
                          formatter={(value: number) => [value, "Cumulative Count"]}
                        />
                      }
                    />
                    <Legend />
                    <Line
                      type="stepAfter"
                      dataKey="cumulativeCount"
                      stroke="#8884d8"
                      name="Cumulative Earthquakes"
                      dot={false}
                      strokeWidth={2}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                    {mainshockEvent && (
                      <ReferenceLine
                        x={mainshockEvent.time}
                        stroke="red"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{
                          value: "Mainshock",
                          position: "top",
                          fill: "red",
                          fontSize: 12,
                        }}
                      />
                    )}
                    <Brush
                      dataKey="time"
                      height={30}
                      stroke="#8884d8"
                      tickFormatter={formatDate}
                      startIndex={0}
                      endIndex={currentData.data.length - 1}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total earthquakes: <span className="font-medium">{currentData.data.length}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Time range:{" "}
                    <span className="font-medium">
                      {new Date(currentData.data[0].time).toLocaleDateString()} -
                      {new Date(currentData.data[currentData.data.length - 1].time).toLocaleDateString()}
                    </span>
                  </p>
                  {mainshockEvent && (
                    <p className="text-sm text-muted-foreground">
                      Mainshock:{" "}
                      <span className="font-medium">
                        M{mainshockEvent.magnitude.toFixed(1)} on {new Date(mainshockEvent.time).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
                <Button onClick={downloadCSV} className="flex items-center gap-2">
                  <FileDown size={16} />
                  Download Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "Lambda Plot":
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Earthquake Occurrence Rate (Lambda) Over Time</CardTitle>
                  <CardDescription>Shows temporal variation in seismic activity rate</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadImage("lambda-plot", "lambda_plot")}
                  className="flex items-center gap-1"
                >
                  <ImageIcon size={16} />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="lambda-plot" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData.data} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      tickFormatter={formatDate}
                      scale="time"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                    >
                      <Label value="Date" position="insideBottom" offset={-20} />
                    </XAxis>
                    <YAxis label={{ value: "Lambda (events/hour)", angle: -90, position: "insideLeft", offset: -20 }} />
                    <Tooltip
                      content={
                        <CustomTooltip
                          labelFormatter={formatTime}
                          formatter={(value: number) => [value.toFixed(2), "Events per hour"]}
                        />
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="lambda"
                      stroke="#82ca9d"
                      name="Earthquake Rate"
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6, fill: "#82ca9d", stroke: "#fff" }}
                    />
                    {/* Add reference line for average rate */}
                    <ReferenceLine
                      y={
                        currentData.data.reduce((sum: number, item: any) => sum + item.lambda, 0) /
                        currentData.data.length
                      }
                      stroke="#ff7300"
                      strokeDasharray="3 3"
                      label={{
                        value: "Average Rate",
                        position: "right",
                        fill: "#ff7300",
                      }}
                    />
                    <Brush
                      dataKey="time"
                      height={30}
                      stroke="#82ca9d"
                      tickFormatter={formatDate}
                      startIndex={0}
                      endIndex={currentData.data.length - 1}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Average rate:{" "}
                    <span className="font-medium">
                      {(
                        currentData.data.reduce((sum: number, item: any) => sum + item.lambda, 0) /
                        currentData.data.length
                      ).toFixed(2)}{" "}
                      events/hour
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Max rate:{" "}
                    <span className="font-medium">
                      {Math.max(...currentData.data.map((d: any) => d.lambda)).toFixed(2)} events/hour
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quiet periods:{" "}
                    <span className="font-medium">
                      {currentData.data.filter((d: any) => d.lambda < 0.5).length} time intervals
                    </span>
                  </p>
                </div>
                <Button onClick={downloadCSV} className="flex items-center gap-2">
                  <FileDown size={16} />
                  Download Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )

        case "Gutenberg Richter Law":
          return (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gutenberg-Richter Law Analysis</CardTitle>
                    <CardDescription>
                      Log(N) vs Magnitude relationship for earthquake frequency
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("gr-plot", "gutenberg_richter_plot")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
        
              <CardContent>
                <div id="gr-plot" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 40, right: 30, bottom: 60, left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="magnitude"
                        name="Magnitude"
                        domain={["dataMin", "dataMax"]}
                        label={{
                          value: "Magnitude (ML)",
                          position: "insideBottom",
                          offset: -10,
                          style: { fill: "#555", fontSize: 12 },
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="logN"
                        name="Log(N)"
                        label={{
                          value: "Log₁₀(Cumulative Number)",
                          angle: -90,
                          position: "insideLeft",
                          offset: -10,
                          style: { fill: "#555", fontSize: 12 },
                        }}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            formatter={(value: any) =>
                              typeof value === "number" ? [value.toFixed(2), ""] : ["N/A", ""]
                            }
                            labelFormatter={(label: any) =>
                              typeof label === "number" ? `Magnitude: ${label.toFixed(1)}` : "Magnitude: N/A"
                            }
                          />
                        }
                      />
                      <Legend />
                      <Scatter
                        name="Frequency Distribution"
                        data={currentData.data}
                        fill="#8884d8"
                        shape="circle"
                      />
                      {currentData.bValue && (
                        <Line
                          name={`G-R Trend Line (b-value = ${
                            typeof currentData.bValue === "number"
                              ? currentData.bValue.toFixed(2)
                              : "N/A"
                          })`}
                          data={currentData.data.map((d: any) => ({
                            magnitude: d.magnitude,
                            logN:
                              currentData.data[0].logN -
                              currentData.bValue * (d.magnitude - currentData.data[0].magnitude),
                          }))}
                          type="monotone"
                          dataKey="logN"
                          stroke="#ff7300"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      )}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
        
                <div className="mt-6 flex justify-between flex-wrap gap-4">
                  <div className="flex flex-col space-y-3 max-w-md">
                    {/* b-value */}
                    <div className="text-sm text-muted-foreground flex items-center">
                      b-value:
                      <span className="ml-1 font-medium">
                        {typeof currentData.bValue === "number"
                          ? currentData.bValue.toFixed(2)
                          : "N/A"}
                      </span>
                      <TooltipProvider>
                        <TooltipUI>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                              <Info className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs text-sm">
                              The b-value describes the relative frequency of small to large earthquakes.
                              Typical values range from 0.8 to 1.2. Higher values indicate more small quakes.
                            </div>
                          </TooltipContent>
                        </TooltipUI>
                      </TooltipProvider>
                    </div>
        
                    {/* a-value */}
                    <div className="text-sm text-muted-foreground flex items-center">
                      a-value:
                      <span className="ml-1 font-medium">
                        {typeof currentData.data[0]?.logN === "number"
                          ? currentData.data[0].logN.toFixed(2)
                          : "N/A"}
                      </span>
                      <TooltipProvider>
                        <TooltipUI>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                              <Info className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs text-sm">
                              The a-value represents the overall seismicity level of the region.
                            </div>
                          </TooltipContent>
                        </TooltipUI>
                      </TooltipProvider>
                    </div>
        
                    {/* Magnitude completeness */}
                    <div className="text-sm text-muted-foreground">
                      Magnitude completeness:{" "}
                      <span className="font-medium">
                        {typeof Math.min(...currentData.data.map((d: any) => d.magnitude)) === "number"
                          ? Math.min(...currentData.data.map((d: any) => d.magnitude)).toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
        
                  {/* Download button */}
                  <Button onClick={downloadCSV} className="flex items-center gap-2">
                    <FileDown size={16} />
                    Download Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )        

      case "Omori Law":
            return (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Omori Law (Aftershock Decay)</CardTitle>
                      <CardDescription>Shows how aftershock frequency decreases over time</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(`omori-plot-${activeTab}`, "omori_law_plot")}
                      className="flex items-center gap-1"
                    >
                      <ImageIcon size={16} />
                      Save
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="linear" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="linear">Linear Scale</TabsTrigger>
                      <TabsTrigger value="log">Log-Log Scale</TabsTrigger>
                    </TabsList>
    
                    <TabsContent value="linear">
                      <div id="omori-plot-linear" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={currentData.data} margin={{ top: 20, right: 30, bottom: 60, left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="day"
                              label={{ value: "Days After Mainshock", position: "insideBottom", offset: -40 }}
                            />
                            <YAxis
                              label={{ value: "Number of Aftershocks", angle: -90, position: "insideLeft", offset: -30 }}
                            />
                            <Tooltip
                              content={
                                <CustomTooltip
                                  formatter={(value: any) => [value, "Aftershocks"]}
                                  labelFormatter={(label: any) => `Day ${label}`}
                                />
                              }
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />
                            <Bar
                              dataKey="count"
                              name="Aftershocks"
                              fill="#8884d8"
                              animationDuration={1000}
                              animationEasing="ease-in-out"
                            />
                            {/* Add theoretical Omori curve if parameters are available */}
                            {currentData.omoriParams && (
                              <Line
                                name="Omori's Law Fit"
                                data={currentData.data.map((d: any) => ({
                                  day: d.day,
                                  count:
                                    currentData.omoriParams.K /
                                    Math.pow(d.day + currentData.omoriParams.c, currentData.omoriParams.p),
                                }))}
                                type="monotone"
                                dataKey="count"
                                stroke="#ff7300"
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
    
                    <TabsContent value="log">
                      <div id="omori-plot-log" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              dataKey="logDay"
                              name="Log(Days)"
                              label={{ value: "Log₁₀(Days After Mainshock)", position: "insideBottom", offset: -40 }}
                            />
                            <YAxis
                              type="number"
                              dataKey="logCount"
                              name="Log(Count)"
                              label={{ value: "Log₁₀(Aftershock Count)", angle: -90, position: "insideLeft", offset: -30 }}
                            />
                            <Tooltip
                              content={
                                //<CustomTooltip
                                  //formatter={(value: any) => [value.toFixed(2), ""]}
                                  //labelFormatter={(label: any) => `Log₁₀(Days): ${label.toFixed(2)}`}
                                ///>
                                <CustomTooltip
                                  formatter={(value: any) =>
                                    typeof value === "number" ? [value.toFixed(2), ""] : ["N/A", ""]
                                  }
                                  labelFormatter={(label: any) =>
                                    typeof label === "number" ? `Log₁₀(Days): ${label.toFixed(2)}` : "Log₁₀(Days): N/A"
                                  }
                                />
    
                              }
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />
                            <Scatter name="Aftershock Decay" data={currentData.data} fill="#8884d8" shape="circle" />
                            {/* Add Omori's law trend line if parameters are available */}
                            {currentData.omoriParams && (
                              <Line
                                name="Omori's Law Fit"
                                data={currentData.data.map((d: any) => ({
                                  logDay: d.logDay,
                                  logCount:
                                    Math.log10(currentData.omoriParams.K) -
                                    currentData.omoriParams.p *
                                      Math.log10(Math.pow(10, d.logDay) + currentData.omoriParams.c),
                                }))}
                                type="monotone"
                                dataKey="logCount"
                                stroke="#ff7300"
                                strokeWidth={2}
                                dot={false}
                                activeDot={false}
                              />
                            )}
                            {/* Add equation annotation */}
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
    
                  <div className="mt-4 flex justify-between">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Mainshock magnitude:{" "}
                        <span className="font-medium">{currentData.mainshock?.magnitude.toFixed(1) || "N/A"}</span>
                      </p>
                      {currentData.omoriParams && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            p-value: <span className="font-medium">{currentData.omoriParams.p.toFixed(2)}</span>
                            <TooltipProvider>
                              <TooltipUI>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                    <Info className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span className="max-w-xs">
                                    The p-value controls the decay rate. Higher values indicate faster decay. Typical values
                                    range from 0.9 to 1.5.
                                  </span>
                                </TooltipContent>
                              </TooltipUI>
                            </TooltipProvider>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            c-value: <span className="font-medium">{currentData.omoriParams.c.toFixed(2)}</span>
                            <TooltipProvider>
                              <TooltipUI>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                    <Info className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    The c-value is a time offset parameter that prevents singularity at t=0. It can be
                                    related to the completeness of the catalog immediately after the mainshock.
                                  </p>
                                </TooltipContent>
                              </TooltipUI>
                            </TooltipProvider>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            K-value: <span className="font-medium">{currentData.omoriParams.K?.toFixed(2) || "N/A"}</span>
                          </p>
                        </>
                      )}
                    </div>
                    <Button onClick={downloadCSV} className="flex items-center gap-2">
                      <FileDown size={16} />
                      Download Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )             

      case "Longitude/Latitude vs Time":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Longitude vs Time</CardTitle>
                    <CardDescription>Shows east-west migration of seismic activity</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("longitude-time", "longitude_time")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="longitude-time" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tickFormatter={formatDate}
                        scale="time"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        label={{ value: "Date", position: "insideBottom", offset: -40 }}
                      />
                      <YAxis
                        dataKey="longitude"
                        label={{ value: "Longitude (°E)", angle: -90, position: "insideLeft", offset: -30 }}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            labelFormatter={formatTime}
                            formatter={(value: any) => [value.toFixed(4), ""]}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Scatter
                        name="Earthquakes"
                        data={currentData.data.filter((d) => isValidTimestamp(d.time))}
                        fill="#8884d8"
                      >
                        {currentData.data
                          .filter((d) => isValidTimestamp(d.time))
                          .map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={getMagnitudeColor(entry.magnitude)} />
                          ))}
                      </Scatter>
                      <Brush
                        dataKey="time"
                        height={30}
                        stroke="#8884d8"
                        tickFormatter={formatDate}
                        startIndex={0}
                        endIndex={Math.min(currentData.data.length - 1, 50)}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Latitude vs Time</CardTitle>
                    <CardDescription>Shows north-south migration of seismic activity</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("latitude-time", "latitude_time")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="latitude-time" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tickFormatter={formatDate}
                        scale="time"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        label={{ value: "Date", position: "insideBottom", offset: -40 }}
                      />
                      <YAxis
                        dataKey="latitude"
                        label={{ value: "Latitude (°N)", angle: -90, position: "insideLeft", offset: -30 }}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            labelFormatter={formatTime}
                            formatter={(value: any) => [value.toFixed(4), ""]}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Scatter
                        name="Earthquakes"
                        data={currentData.data.filter((d) => isValidTimestamp(d.time))}
                        fill="#82ca9d"
                      >
                        {currentData.data
                          .filter((d) => isValidTimestamp(d.time))
                          .map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={getMagnitudeColor(entry.magnitude)} />
                          ))}
                      </Scatter>
                      <Brush
                        dataKey="time"
                        height={30}
                        stroke="#82ca9d"
                        tickFormatter={formatDate}
                        startIndex={0}
                        endIndex={Math.min(currentData.data.length - 1, 50)}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium">Magnitude:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1a9850" }}></div>
                    <span className="text-xs">M &lt; 2.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#91cf60" }}></div>
                    <span className="text-xs">M 2.0-2.9</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#d9ef8b" }}></div>
                    <span className="text-xs">M 3.0-3.9</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fee08b" }}></div>
                    <span className="text-xs">M 4.0-4.9</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fc8d59" }}></div>
                    <span className="text-xs">M 5.0-5.9</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#d73027" }}></div>
                    <span className="text-xs">M ≥ 6.0</span>
                  </div>
                </div>
                <Button onClick={downloadCSV} className="flex items-center gap-2">
                  <FileDown size={16} />
                  Download Data
                </Button>
              </div>
            </div>
          </div>
        )

      case "Longitude vs Latitude vs Time with Depth":
      case "Longitude vs Latitude vs Magnitude":
        // These are 3D/4D visualizations that would typically use a 3D library
        // For simplicity, we'll show a 2D map with color coding
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {subType === "Longitude vs Latitude vs Time with Depth"
                        ? "Earthquake Locations with Depth"
                        : "Earthquake Locations with Magnitude"}
                    </CardTitle>
                    <CardDescription>
                      {subType === "Longitude vs Latitude vs Time with Depth"
                        ? "Spatial distribution of earthquakes colored by depth"
                        : "Spatial distribution of earthquakes colored by magnitude"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage("3d-map", "3d_visualization")}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon size={16} />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="3d-map" className="h-[500px] rounded-md overflow-hidden">
                  <Map data={currentData.data} subType={subType} showControls={true} showScale={true} />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Color Legend</h3>
                  <div className="flex flex-wrap gap-4">
                    {subType === "Longitude vs Latitude vs Time with Depth" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#ffffcc" }}></div>
                          <span className="text-sm">Shallow (&lt;10 km)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#a1dab4" }}></div>
                          <span className="text-sm">Medium-shallow (10-30 km)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#41b6c4" }}></div>
                          <span className="text-sm">Medium (30-70 km)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#2c7fb8" }}></div>
                          <span className="text-sm">Medium-deep (70-150 km)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#253494" }}></div>
                          <span className="text-sm">Deep (&gt;150 km)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#1a9850" }}></div>
                          <span className="text-sm">M &lt; 2.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#91cf60" }}></div>
                          <span className="text-sm">M 2.0-2.9</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#d9ef8b" }}></div>
                          <span className="text-sm">M 3.0-3.9</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#fee08b" }}></div>
                          <span className="text-sm">M 4.0-4.9</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#fc8d59" }}></div>
                          <span className="text-sm">M 5.0-5.9</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#d73027" }}></div>
                          <span className="text-sm">M ≥ 6.0</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Total earthquakes: <span className="font-medium">{currentData.data.length}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Time range:{" "}
                      <span className="font-medium">
                        {new Date(Math.min(...currentData.data.map((d: any) => d.time))).toLocaleDateString()} -
                        {new Date(Math.max(...currentData.data.map((d: any) => d.time))).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <Button onClick={downloadCSV} className="flex items-center gap-2">
                    <FileDown size={16} />
                    Download Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="text-center p-8">
            <p>No visualization available for this analysis type.</p>
          </div>
        )
    }
  }

  // Helper function to get color based on magnitude
  function getMagnitudeColor(magnitude: number) {
    if (magnitude < 2) return "#1a9850" // green
    if (magnitude < 3) return "#91cf60" // light green
    if (magnitude < 4) return "#d9ef8b" // yellow-green
    if (magnitude < 5) return "#fee08b" // yellow
    if (magnitude < 6) return "#fc8d59" // orange
    return "#d73027" // red
  }

  return (
    <div className="space-y-6">
      {downloadAllButton}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="bg-muted p-4 rounded-md w-full">
          <h2 className="text-xl font-semibold">{subType} Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">Using real-time USGS earthquake data for analysis</p>
        </div>
      </div>

      {renderVisualization()}
    </div>
  )
}
