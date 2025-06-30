"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import ClusteringVisualization from "./clustering-visualization"
import DeclusteringVisualization from "./declustering-visualization"
import MagnitudePredictionVisualization from "./magnitude-prediction-visualization"
import EDAVisualization from "./eda-visualization"
import { Maximize2, Minimize2 } from "lucide-react"

const Map = dynamic(() => import("../components/Map"), { ssr: false })

export default function Research() {
  const [dataSource, setDataSource] = useState("")
  const [analysisType, setAnalysisType] = useState("")
  const [subType, setSubType] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [parameters, setParameters] = useState({
    startTime: "",
    endTime: "",
    minLongitude: "",
    maxLongitude: "",
    minLatitude: "",
    maxLatitude: "",
    minMagnitude: "",
    maxMagnitude: "", // Added maxMagnitude parameter
    minDepth: "",
    maxDepth: "",
    eventType: "earthquake", // This is now fixed to "earthquake"
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const resultContainerRef = useRef<HTMLDivElement>(null)

  const handleDataSourceChange = (value: string) => {
    setDataSource(value)
    setAnalysisType("")
    setSubType("")
    setShowForm(false)
    setResult(null)
  }

  const handleAnalysisTypeChange = (value: string) => {
    setAnalysisType(value)
    setSubType("")
    setShowForm(false)
    setResult(null)
  }

  const handleSubTypeChange = (value: string) => {
    setSubType(value)
    setShowForm(value !== "")
    setResult(null)
  }

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, [e.target.name]: e.target.value })
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append("dataSource", dataSource)
      formData.append("analysisType", analysisType)
      formData.append("subType", subType)

      const usgsParameters = {
        ...parameters,
        startTime: parameters.startTime
          ? new Date(parameters.startTime).toISOString()
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: parameters.endTime ? new Date(parameters.endTime).toISOString() : new Date().toISOString(),
        eventType: "earthquake", // Always set to earthquake
      }
      formData.append("parameters", JSON.stringify(usgsParameters))

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error || `HTTP error! status: ${response.status}`)
        } catch (parseError) {
          // If parsing fails, use the raw text
          throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}...`)
        }
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({ error: error instanceof Error ? error.message : "An unknown error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const analysisOptions = {
    EDA: [
      "Longitude vs Latitude with Map",
      "Mainshock Highlight",
      "Cumulative Plot",
      "Lambda Plot",
      "Gutenberg Richter Law",
      "Omori Law",
      "Longitude/Latitude vs Time",
      "Longitude vs Latitude vs Time with Depth",
      "Longitude vs Latitude vs Magnitude",
    ],
    "Earthquake Magnitude Prediction": [
      "Linear Regression Prediction",
      "SVM Prediction",
      "Naive Bayes Prediction",
      "Random Forest Prediction",
      "LSTM",
    ],
    "Earthquake Clustering": ["DBSCAN", "K-means", "Fuzzy C-means"],
    "Earthquake Declustering": ["DBSCAN", "NND Algorithm", "Gruenthal Declustering Algorithm", "Reasenberg Algorithm"],
  }

  const renderResult = () => {
    if (!result || result.error) return null

    switch (result.analysisType) {
      case "EDA":
        return <EDAVisualization edaResults={result} />
      case "Earthquake Magnitude Prediction":
        return <MagnitudePredictionVisualization predictionResults={result} />
      case "Earthquake Clustering":
        return <ClusteringVisualization clusteringResults={result} />
      case "Earthquake Declustering":
        return <DeclusteringVisualization declusteringResults={result} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-gradient"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Research and Development
      </motion.h1>

      <div className={`grid grid-cols-1 ${isFullScreen ? "" : "md:grid-cols-2"} gap-8`}>
        {!isFullScreen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mb-8 hover-lift">
              <CardHeader>
                <CardTitle>Select Data Source</CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleDataSourceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USGS">USGS (Real-time data fetch using API)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <AnimatePresence>
              {dataSource && (
                <motion.div
                  key="dataSource"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="mb-8 hover-lift">
                    <CardHeader>
                      <CardTitle>Select Analysis Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select onValueChange={handleAnalysisTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an analysis type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EDA">EDA</SelectItem>
                          <SelectItem value="Earthquake Magnitude Prediction">
                            Earthquake Magnitude Prediction
                          </SelectItem>
                          <SelectItem value="Earthquake Clustering">Earthquake Clustering</SelectItem>
                          <SelectItem value="Earthquake Declustering">Earthquake Declustering</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {analysisType && (
                <motion.div
                  key="analysisType"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="mb-8 hover-lift">
                    <CardHeader>
                      <CardTitle>
                        {analysisType === "Earthquake Magnitude Prediction"
                          ? "Select Prediction Algorithm"
                          : analysisType === "Earthquake Clustering"
                            ? "Select Clustering Algorithm"
                            : analysisType === "Earthquake Declustering"
                              ? "Select Declustering Algorithm"
                              : "Select Analysis Type"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select onValueChange={handleSubTypeChange}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Choose ${analysisType === "EDA" ? "an analysis type" : "an algorithm"}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {analysisOptions[analysisType as keyof typeof analysisOptions].map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {showForm && (
                <motion.div
                  key="showForm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Enter Parameters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <Input
                          type="datetime-local"
                          name="startTime"
                          placeholder="Start Time"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="datetime-local"
                          name="endTime"
                          placeholder="End Time"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="minLongitude"
                          placeholder="Minimum Longitude"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="maxLongitude"
                          placeholder="Maximum Longitude"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="minLatitude"
                          placeholder="Minimum Latitude"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="maxLatitude"
                          placeholder="Maximum Latitude"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="minMagnitude"
                          placeholder="Minimum Magnitude"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="maxMagnitude"
                          placeholder="Maximum Magnitude"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="minDepth"
                          placeholder="Minimum Depth"
                          onChange={handleParameterChange}
                        />
                        <Input
                          type="number"
                          name="maxDepth"
                          placeholder="Maximum Depth"
                          onChange={handleParameterChange}
                        />
                        <Button type="submit" className="col-span-2 hover-lift" disabled={loading}>
                          {loading ? "Processing..." : "Submit"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={isFullScreen ? "w-full" : "md:col-span-2 lg:col-span-1"}
          ref={resultContainerRef}
        >
          {result && (
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{result.error ? "Error" : "Analysis Results"}</CardTitle>
                  <Button variant="outline" size="icon" onClick={toggleFullScreen} className="ml-2">
                    {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    <span className="sr-only">{isFullScreen ? "Exit Full Screen" : "Full Screen"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {result.error ? <p className="text-red-500">{result.error}</p> : renderResult()}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

