"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
  ScatterChart,
  Scatter,
  Line,
  ComposedChart,
  ReferenceLine,
  Area,
  Cell,
} from "recharts"

// First, import the downloadElementAsImage utility
import { downloadElementAsImage } from "../utils/image-download"

interface MagnitudePredictionVisualizationProps {
  predictionResults: any
}

export default function MagnitudePredictionVisualization({ predictionResults }: MagnitudePredictionVisualizationProps) {
  const [confidenceLevel, setConfidenceLevel] = useState(95)
  const [selectedFeatures, setSelectedFeatures] = useState({
    depth: true,
    latitude: true,
    longitude: true,
    time: true,
    pastMagnitudes: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update the algorithm determination logic
  const algorithm = predictionResults?.result?.algorithm || "linear"

  // Use real data from API if available
  const useRealData = predictionResults?.result?.predictions && predictionResults.result.predictions.length > 0

  // Current data is always from the API results
  const currentData = predictionResults.result

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Calculate confidence interval based on user selection
  const zScore = confidenceLevel === 95 ? 1.96 : confidenceLevel === 90 ? 1.645 : confidenceLevel === 99 ? 2.576 : 1.96
  const adjustedPredictions = currentData.predictions.map((pred: any) => ({
    ...pred,
    lowerBound: pred.predicted - zScore * (currentData.metrics.rmse / 2),
    upperBound: pred.predicted + zScore * (currentData.metrics.rmse / 2),
  }))

  // Filter features based on user selection
  const filteredFeatureImportance = currentData.featureImportance.filter((feature: any) => {
    const featureName = feature.feature.toLowerCase().replace(" ", "")
    return selectedFeatures[featureName as keyof typeof selectedFeatures]
  })

  const downloadCSV = () => {
    // Create CSV content
    const headers = ["ID", "Time", "Actual Magnitude", "Predicted Magnitude", "Error", "Lower Bound", "Upper Bound"]
    const csvContent =
      headers.join(",") +
      "\n" +
      currentData.predictions
        .map((pred: any) =>
          [
            pred.id,
            pred.time,
            pred.actual.toFixed(2),
            pred.predicted.toFixed(2),
            pred.error.toFixed(2),
            pred.lowerBound.toFixed(2),
            pred.upperBound.toFixed(2),
          ].join(","),
        )
        .join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `magnitude_predictions_${algorithm}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadModelSummary = () => {
    // Create model summary content
    const summaryContent = `
Model Summary Report
===================
Algorithm: ${getAlgorithmFullName(algorithm)}
Date: ${new Date().toLocaleString()}

Performance Metrics
------------------
Mean Absolute Error (MAE): ${currentData.metrics.mae.toFixed(2)}
Root Mean Squared Error (RMSE): ${currentData.metrics.rmse.toFixed(2)}
R² Score: ${currentData.metrics.r2.toFixed(2)}
Mean Absolute Percentage Error (MAPE): ${currentData.metrics.mape.toFixed(1)}%

Residual Statistics
------------------
Mean: ${currentData.residualStats.mean.toFixed(2)}
Standard Deviation: ${currentData.residualStats.std.toFixed(2)}
Minimum: ${currentData.residualStats.min.toFixed(2)}
Maximum: ${currentData.residualStats.max.toFixed(2)}

Feature Importance
-----------------
${currentData.featureImportance
  .map((feature: any) => `${feature.feature}: ${(feature.importance * 100).toFixed(1)}%`)
  .join("\n")}

Hyperparameters
--------------
${Object.entries(currentData.hyperparameters)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

Prediction Summary
-----------------
Number of Predictions: ${currentData.predictions.length}
Confidence Level: ${confidenceLevel}%
`

    // Create and download the file
    const blob = new Blob([summaryContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `model_summary_${algorithm}.txt`)
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
    const prefix = `prediction_${algorithm}_${timestamp}`

    // Get all chart IDs that are currently in the DOM
    const chartIds = [
      "scatter-plot",
      "time-series",
      "feature-importance",
      "residual-plot",
      "error-distribution",
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

  // Add a function to download detailed prediction results
  const downloadDetailedResults = () => {
    // Create CSV content with all prediction details
    const headers = [
      "ID",
      "Time",
      "Actual Magnitude",
      "Predicted Magnitude",
      "Error",
      "Lower Bound",
      "Upper Bound",
      "Depth",
      "Latitude",
      "Longitude",
    ]

    const rows = currentData.predictions.map((pred: any) => [
      pred.id,
      new Date(pred.time).toISOString(),
      pred.actual.toFixed(2),
      pred.predicted.toFixed(2),
      pred.error.toFixed(2),
      pred.lowerBound.toFixed(2),
      pred.upperBound.toFixed(2),
      pred.depth.toFixed(2),
      pred.latitude.toFixed(4),
      pred.longitude.toFixed(4),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

    link.setAttribute("href", url)
    link.setAttribute("download", `prediction_detailed_results_${algorithm}_${timestamp}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getAlgorithmFullName = (algorithm: string) => {
    const names: Record<string, string> = {
      linear: "Linear Regression",
      svm: "Support Vector Machine",
      naive: "Naïve Bayes",
      random: "Random Forest",
      lstm: "Long Short-Term Memory (LSTM)",
    }
    return names[algorithm] || algorithm
  }

  const handleFeatureChange = (feature: string) => {
    setSelectedFeatures({
      ...selectedFeatures,
      [feature]: !selectedFeatures[feature as keyof typeof selectedFeatures],
    })
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
    return <div className="text-center p-8">Loading prediction data...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="bg-muted p-4 rounded-md w-full">
          <h2 className="text-xl font-semibold">{getAlgorithmFullName(algorithm)} Prediction Results</h2>
          <p className="text-sm text-muted-foreground mt-1">Using real-time USGS earthquake data for analysis</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={downloadCSV} className="flex items-center gap-2">
            <FileDown size={16} />
            Download CSV
          </Button>
          <Button onClick={downloadDetailedResults} variant="outline" className="flex items-center gap-2">
            <FileDown size={16} />
            Detailed Results
          </Button>
          <Button onClick={downloadModelSummary} variant="outline" className="flex items-center gap-2">
            <FileDown size={16} />
            Model Summary
          </Button>
          <Button onClick={downloadAllVisualizations} variant="secondary" className="flex items-center gap-2">
            <ImageIcon size={16} />
            Download All Images
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Predicted vs Actual Magnitude</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("scatter-plot", "predicted_vs_actual")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="scatter-plot" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="actual"
                    name="Actual Magnitude"
                    domain={[2, 8]}
                    label={{ value: "Actual Magnitude", position: "insideBottom", offset: -10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="predicted"
                    name="Predicted Magnitude"
                    domain={[2, 8]}
                    label={{ value: "Predicted Magnitude", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value: any) => [value.toFixed(2), ""]}
                    labelFormatter={(label) => `Actual: ${label.toFixed(2)}`}
                  />
                  <Scatter name="Predictions" data={currentData.predictions} fill="#8884d8" />
                  <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Mean Absolute Error (MAE)</h3>
              <p className="text-4xl font-bold text-primary">{currentData.metrics.mae.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                Average absolute difference between predicted and actual magnitudes
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Root Mean Squared Error (RMSE)</h3>
              <p className="text-4xl font-bold text-primary">{currentData.metrics.rmse.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Square root of the average of squared differences</p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">R² Score</h3>
              <p className="text-4xl font-bold text-primary">{currentData.metrics.r2.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Proportion of variance explained by the model</p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Mean Absolute Percentage Error (MAPE)</h3>
              <p className="text-4xl font-bold text-primary">{currentData.metrics.mape.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">
                Average percentage difference between predicted and actual values
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Magnitude Prediction Over Time</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("time-series", "prediction_time_series")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="time-series" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={adjustedPredictions.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" label={{ value: "Event ID", position: "insideBottom", offset: -10 }} />
                  <YAxis label={{ value: "Magnitude", angle: -90, position: "insideLeft" }} domain={[2, 8]} />
                  <Tooltip formatter={(value: any) => [value.toFixed(2), ""]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    fill="#8884d8"
                    stroke="none"
                    fillOpacity={0.2}
                    name={`${confidenceLevel}% Confidence Interval`}
                  />
                  <Area type="monotone" dataKey="lowerBound" fill="#8884d8" stroke="none" fillOpacity={0} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#ff7300"
                    name="Actual Magnitude"
                    dot={{ r: 4 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8884d8"
                    name="Predicted Magnitude"
                    dot={{ r: 4 }}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <Label className="mb-2 block">Confidence Level: {confidenceLevel}%</Label>
              <Slider
                defaultValue={[95]}
                min={80}
                max={99}
                step={1}
                onValueChange={(value) => setConfidenceLevel(value[0])}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Feature Importance</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("feature-importance", "feature_importance")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="feature-importance" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredFeatureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 0.5]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="feature" width={120} />
                  <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, "Importance"]} />
                  <Legend />
                  <Bar dataKey="importance" name="Importance">
                    {filteredFeatureImportance.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="depth"
                  checked={selectedFeatures.depth}
                  onCheckedChange={() => handleFeatureChange("depth")}
                />
                <Label htmlFor="depth">Depth</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="latitude"
                  checked={selectedFeatures.latitude}
                  onCheckedChange={() => handleFeatureChange("latitude")}
                />
                <Label htmlFor="latitude">Latitude</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="longitude"
                  checked={selectedFeatures.longitude}
                  onCheckedChange={() => handleFeatureChange("longitude")}
                />
                <Label htmlFor="longitude">Longitude</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="time"
                  checked={selectedFeatures.time}
                  onCheckedChange={() => handleFeatureChange("time")}
                />
                <Label htmlFor="time">Time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pastMagnitudes"
                  checked={selectedFeatures.pastMagnitudes}
                  onCheckedChange={() => handleFeatureChange("pastMagnitudes")}
                />
                <Label htmlFor="pastMagnitudes">Past Magnitudes</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Residual Analysis</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("residual-plot", "residual_analysis")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="residual-plot" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="predicted"
                    name="Predicted Magnitude"
                    label={{ value: "Predicted Magnitude", position: "insideBottom", offset: -10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="error"
                    name="Residual"
                    label={{ value: "Residual (Predicted - Actual)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value: any) => [value.toFixed(2), ""]}
                    labelFormatter={(label) => `Predicted: ${label.toFixed(2)}`}
                  />
                  <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                  <Scatter name="Residuals" data={currentData.predictions} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Residual Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mean</p>
                  <p className="font-medium">{currentData.residualStats.mean.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standard Deviation</p>
                  <p className="font-medium">{currentData.residualStats.std.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minimum</p>
                  <p className="font-medium">{currentData.residualStats.min.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maximum</p>
                  <p className="font-medium">{currentData.residualStats.max.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Error Distribution</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage("error-distribution", "error_distribution")}
                className="flex items-center gap-1"
              >
                <ImageIcon size={16} />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="error-distribution" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { range: "< -1.0", count: currentData.predictions.filter((p: any) => p.error < -1.0).length },
                    {
                      range: "-1.0 to -0.5",
                      count: currentData.predictions.filter((p: any) => p.error >= -1.0 && p.error < -0.5).length,
                    },
                    {
                      range: "-0.5 to 0",
                      count: currentData.predictions.filter((p: any) => p.error >= -0.5 && p.error < 0).length,
                    },
                    {
                      range: "0 to 0.5",
                      count: currentData.predictions.filter((p: any) => p.error >= 0 && p.error < 0.5).length,
                    },
                    {
                      range: "0.5 to 1.0",
                      count: currentData.predictions.filter((p: any) => p.error >= 0.5 && p.error < 1.0).length,
                    },
                    { range: "> 1.0", count: currentData.predictions.filter((p: any) => p.error >= 1.0).length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Predictions" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Error Analysis</h3>
              <p className="text-sm text-muted-foreground">
                The distribution of errors shows how the model's predictions deviate from actual values. A good model
                will have errors centered around zero with a narrow spread.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {Math.abs(currentData.residualStats.mean) < 0.05
                  ? "This model shows minimal bias with errors centered close to zero."
                  : currentData.residualStats.mean > 0
                    ? "This model tends to slightly overestimate magnitudes."
                    : "This model tends to slightly underestimate magnitudes."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Hyperparameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(currentData.hyperparameters).map(([key, value]) => (
              <div key={key} className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2 text-sm">{key}</h3>
                <p className="font-medium">{value as string}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
