"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>,
})

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

const RecentEarthquakes = () => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [filteredEarthquakes, setFilteredEarthquakes] = useState<Earthquake[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [magnitudeFilter, setMagnitudeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState("day")

  const fetchEarthquakeData = (period: string) => {
    setLoading(true)
    let url = ""

    switch (period) {
      case "day":
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
        break
      case "week":
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
        break
      case "month":
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
        break
      default:
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setEarthquakes(data.features)
        setFilteredEarthquakes(data.features)
        setLoading(false)
      })
      .catch((error) => {
        setError("Error fetching earthquake data. Please try again later.")
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchEarthquakeData(timePeriod)
  }, [timePeriod])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleMagnitudeFilterChange = (value: string) => {
    setMagnitudeFilter(value)
  }

  useEffect(() => {
    let results = earthquakes.filter((earthquake) =>
      earthquake.properties.place.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (magnitudeFilter !== "all") {
      results = results.filter((earthquake) => {
        const magnitude = earthquake.properties.mag
        if (magnitudeFilter === "minor") return magnitude < 4.0
        if (magnitudeFilter === "light") return magnitude >= 4.0 && magnitude < 5.0
        if (magnitudeFilter === "moderate") return magnitude >= 5.0 && magnitude < 6.0
        if (magnitudeFilter === "strong") return magnitude >= 6.0
        return true
      })
    }

    setFilteredEarthquakes(results)
  }, [earthquakes, searchTerm, magnitudeFilter])

  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value)
  }

  const downloadCSV = () => {
    const headers = ["Magnitude", "Location", "Time", "Latitude", "Longitude", "Depth"]
    const csvContent =
      headers.join(",") +
      "\n" +
      filteredEarthquakes
        .map((quake) =>
          [
            quake.properties.mag,
            `"${quake.properties.place.replace(/"/g, '""')}"`,
            new Date(quake.properties.time).toLocaleString(),
            quake.geometry.coordinates[1], // latitude
            quake.geometry.coordinates[0], // longitude
            quake.geometry.coordinates[2], // depth
          ].join(","),
        )
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "filtered_earthquakes.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Recent Earthquakes
      </motion.h1>

      <Tabs defaultValue="day" onValueChange={handleTimePeriodChange} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="day">Last 24 Hours</TabsTrigger>
          <TabsTrigger value="week">Last 7 Days</TabsTrigger>
          <TabsTrigger value="month">Last 30 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Earthquake Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full rounded-md overflow-hidden">
              {!loading && <MapComponent earthquakes={filteredEarthquakes} />}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Earthquakes{" "}
              {timePeriod === "day"
                ? "in the Last 24 Hours"
                : timePeriod === "week"
                  ? "in the Last 7 Days"
                  : "in the Last 30 Days"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by location..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select onValueChange={handleMagnitudeFilterChange} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by magnitude" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Magnitudes</SelectItem>
                    <SelectItem value="minor">Minor (&lt; 4.0)</SelectItem>
                    <SelectItem value="light">Light (4.0 - 4.9)</SelectItem>
                    <SelectItem value="moderate">Moderate (5.0 - 5.9)</SelectItem>
                    <SelectItem value="strong">Strong (6.0+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={downloadCSV} className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
            {loading ? (
              <p>Loading earthquake data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Magnitude</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEarthquakes.map((earthquake) => (
                      <TableRow key={earthquake.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${
                                earthquake.properties.mag >= 6
                                  ? "bg-red-500"
                                  : earthquake.properties.mag >= 5
                                    ? "bg-orange-500"
                                    : earthquake.properties.mag >= 4
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }`}
                            />
                            {earthquake.properties.mag.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{earthquake.properties.place}</TableCell>
                        <TableCell>{new Date(earthquake.properties.time).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RecentEarthquakes


