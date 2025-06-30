"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function EDAFeature() {
  const edaTypes = [
    {
      id: "map",
      title: "Longitude vs Latitude (Map)",
      description:
        "Interactive scatter plot map of earthquake locations with color-coded points based on magnitude and hover tooltips showing detailed information.",
      methodology:
        "This visualization uses Leaflet.js to create an interactive map where each earthquake is represented as a point. The color of each point corresponds to the magnitude of the earthquake, making it easy to identify stronger events at a glance.",
      applications:
        "Useful for identifying geographic patterns in seismic activity, such as fault lines or tectonic plate boundaries. Researchers can quickly assess the spatial distribution of earthquakes in a region.",
      image: "/eda1_imresizer.png?height=300&width=500",
    },
    {
      id: "mainshock",
      title: "Mainshock Highlight",
      description:
        "Visualization that highlights the mainshock (largest event) and its aftershocks, with a magnitude vs. time graph showing aftershock decay.",
      methodology:
        "The algorithm identifies the earthquake with the highest magnitude as the mainshock and classifies subsequent events within a certain spatial and temporal window as aftershocks. The decay pattern is visualized to show how aftershock frequency diminishes over time.",
      applications:
        "Essential for studying aftershock sequences and their relationship to the mainshock. Helps in understanding the energy release patterns following major earthquakes and in forecasting aftershock hazards.",
      image: "/eda2_imresizer.png?height=300&width=500",
    },
    {
      id: "cumulative",
      title: "Cumulative Plot",
      description:
        "Line graph showing how the number of earthquakes increases over time, helping identify seismic activity trends.",
      methodology:
        "This plot accumulates the count of earthquakes over time, creating a step function that rises with each new event. Steeper slopes indicate periods of increased seismic activity.",
      applications:
        "Useful for identifying sudden jumps in activity that may indicate a mainshock followed by aftershocks, or for recognizing earthquake swarms. Also valuable for long-term monitoring of seismic rates in a region.",
      image: "/eda3_imresizer.png?height=300&width=500",
    },
    {
      id: "lambda",
      title: "Lambda Plot",
      description:
        "Lambda vs. Time plot showing the earthquake occurrence rate, visualizing time-dependent seismic activity changes.",
      methodology:
        "Lambda (λ) represents the rate of earthquake occurrences per unit time. This plot calculates the rate based on the time intervals between consecutive events and displays how this rate changes over time.",
      applications:
        "Helps in identifying periods of increased seismic activity and understanding the temporal clustering of earthquakes. Valuable for recognizing when a region is experiencing abnormal levels of activity.",
      image: "/eda4_imresizer.png?height=300&width=500",
    },
    {
      id: "gutenberg",
      title: "Gutenberg-Richter Law",
      description:
        "Logarithmic plot (logN vs. Magnitude) analyzing earthquake frequency distribution, with slope (b-value) indicating tectonic stress levels.",
      methodology:
        "This analysis plots the logarithm of the cumulative number of earthquakes (logN) against magnitude. The slope of this relationship, known as the b-value, is calculated using linear regression and provides insights into the relative abundance of large versus small earthquakes.",
      applications:
        "The b-value is a critical parameter in seismic hazard assessment. Lower b-values indicate a relatively higher proportion of larger magnitude events, which may suggest higher stress in the region. Temporal changes in b-value may precede major earthquakes in some cases.",
      image: "/eda5_imresizer.png?height=300&width=500",
    },
    {
      id: "omori",
      title: "Omori Law (Aftershock Decay)",
      description:
        "Aftershock count vs. Time plot showing how aftershocks decrease over time following Omori's decay law.",
      methodology:
        "Based on Omori's Law, which states that the frequency of aftershocks decreases roughly with the reciprocal of time since the mainshock. The plot fits the formula n(t) = K/(t+c)^p, where n(t) is the frequency of aftershocks, t is time, and K, c, and p are constants.",
      applications:
        "Essential for forecasting aftershock sequences following major earthquakes. Helps emergency managers and planners understand how long elevated seismic hazard might persist after a major event.",
      image: "/eda6_imresizer.png?height=300&width=500",
    },
    {
      id: "longlat-time",
      title: "Longitude/Latitude vs. Time",
      description:
        "3D scatter plot visualizing earthquake migration over time and identifying patterns like seismic swarms.",
      methodology:
        "This visualization plots earthquake locations (longitude and latitude) against time, creating a 3D representation that shows how seismic activity moves geographically over time.",
      applications:
        "Particularly useful for identifying migrating earthquake sequences, such as those that might occur during magma movement beneath volcanoes or along fault zones. Helps in understanding the spatio-temporal evolution of seismic sequences.",
      image: "/eda7_imresizer.png?height=300&width=500",
    },
    {
      id: "depth",
      title: "Longitude vs Latitude vs Time with Depth",
      description:
        "4D interactive plot with depth shown using color intensity or marker size, analyzing depth-dependent earthquake patterns.",
      methodology:
        "This visualization extends the 3D plot by adding depth as a fourth dimension, represented through color coding. Deeper earthquakes are typically shown in darker colors, while shallower ones use lighter hues.",
      applications:
        "Critical for understanding the three-dimensional structure of seismic zones, particularly in subduction regions where earthquakes occur at various depths. Helps identify patterns in how earthquakes distribute vertically in the Earth's crust and upper mantle.",
      image: "/eda8_imresizer.png?height=300&width=500",
    },
    {
      id: "magnitude",
      title: "Longitude vs Latitude vs Magnitude",
      description:
        "3D scatter plot with color-coded magnitude representation, identifying clusters of high-magnitude events.",
      methodology:
        "Similar to the basic map visualization but adds magnitude as a third dimension through color coding and/or marker size. Larger, more intensely colored markers represent higher magnitude events.",
      applications:
        "Helps identify regions that produce larger magnitude earthquakes, which is crucial for seismic hazard assessment. Also useful for recognizing spatial patterns in earthquake energy release.",
      image: "/eda9_imresizer.png?height=300&width=500",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/features">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Features
          </Button>
        </Link>
        <motion.h1
          className="text-4xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Exploratory Data Analysis (EDA)
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground text-center max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Comprehensive tools for analyzing earthquake data to uncover patterns, trends, and anomalies
        </motion.p>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 mb-8">
          {edaTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="text-xs md:text-sm">
              {type.title.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {edaTypes.map((type) => (
          <TabsContent key={type.id} value={type.id}>
            <Card>
              <CardHeader>
                <CardTitle>{type.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground mb-4">{type.description}</p>

                    <h3 className="text-lg font-semibold mb-2">Methodology</h3>
                    <p className="text-muted-foreground mb-4">{type.methodology}</p>

                    <h3 className="text-lg font-semibold mb-2">Applications</h3>
                    <p className="text-muted-foreground">{type.applications}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                      <Image
                        src={type.image || "/placeholder.svg"}
                        alt={`${type.title} visualization`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Example of {type.title} visualization
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Try It Yourself</h3>
                  <p className="text-muted-foreground mb-4">
                    Experience this analysis type with real earthquake data from the USGS or upload your own dataset.
                  </p>
                  <Link href="/research">
                    <Button>Go to Research Page</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

