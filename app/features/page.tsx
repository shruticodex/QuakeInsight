"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Globe, Activity, Network } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Features() {
  const features = [
    {
      title: "Exploratory Data Analysis (EDA)",
      description:
        "Comprehensive analysis of earthquake data to uncover patterns, trends, and anomalies. Our EDA tools provide interactive visualizations and statistical summaries to help researchers gain deeper insights into seismic activities.",
      icon: <BarChart3 className="w-12 h-12 text-primary mb-4" />,
      link: "/features/eda",
    },
    {
      title: "Magnitude Prediction",
      description:
        "Utilizing advanced machine learning algorithms to predict earthquake magnitudes based on historical data and real-time seismic signals. This feature aids in early warning systems and risk assessment.",
      icon: <Activity className="w-12 h-12 text-primary mb-4" />,
      link: "/features/magnitude-prediction",
    },
    {
      title: "Earthquake Clustering",
      description:
        "Sophisticated clustering algorithms to identify and analyze groups of earthquakes that are closely related in time and space. This helps in understanding aftershock sequences and seismic swarms.",
      icon: <Globe className="w-12 h-12 text-primary mb-4" />,
      link: "/features/clustering",
    },
    {
      title: "Earthquake Declustering",
      description:
        "Advanced techniques to separate dependent events (aftershocks) from independent events (main shocks) in earthquake catalogs. This is crucial for assessing long-term seismic hazards and understanding tectonic processes.",
      icon: <Network className="w-12 h-12 text-primary mb-4" />,
      link: "/features/declustering",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        QuakeInsight Features
      </motion.h1>
      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full bg-white/10 backdrop-filter backdrop-blur-lg shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20 hover:translate-y-[-5px]">
              <CardHeader>
                <CardTitle className="flex flex-col items-center">
                  {feature.icon}
                  <span className="text-2xl">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">{feature.description}</p>
                <div className="flex justify-center">
                  <Link href={feature.link}>
                    <Button variant="outline" className="mt-4">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

