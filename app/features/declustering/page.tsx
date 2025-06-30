"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function DeclusteringFeature() {
  const declusteringTypes = [
    {
      id: "dbscan",
      title: "DBSCAN Declustering",
      description:
        "An adaptation of the DBSCAN clustering algorithm for earthquake declustering, which identifies and separates mainshocks from their associated aftershocks.",
      methodology:
        "The algorithm first applies DBSCAN to identify clusters of earthquakes that are close in space and time. Within each cluster, the earthquake with the largest magnitude is designated as the mainshock, while the others are classified as aftershocks. Isolated events that don't belong to any cluster are considered independent events.",
      applications:
        "Particularly effective for identifying aftershock sequences in complex seismic environments. The density-based approach allows it to handle clusters of irregular shapes and varying densities, making it suitable for real earthquake sequences that don't follow simple patterns.",
      image: "/dec1_imresizer.png?height=300&width=500",
    },
    {
      id: "nnd",
      title: "Nearest Neighbor Distance (NND) Algorithm",
      description:
        "A statistical approach that identifies aftershocks based on their spatial and temporal proximity to larger events.",
      methodology:
        "The NND algorithm calculates the distance (in both space and time) between each earthquake and its nearest neighbor of larger magnitude. It then uses statistical analysis to determine which events are likely to be aftershocks based on their unusually close proximity to larger events compared to the background seismicity rate.",
      applications:
        "Provides a statistically rigorous method for declustering that adapts to the characteristics of the specific earthquake catalog being analyzed. Particularly useful for creating declustered catalogs for seismic hazard assessment, where independent events need to be identified accurately.",
      image: "/dec2_imresizer.png?height=300&width=500",
    },
    {
      id: "gruenthal",
      title: "Gruenthal Declustering Algorithm",
      description:
        "A window-based method that uses magnitude-dependent space and time windows to identify aftershocks.",
      methodology:
        "The Gruenthal algorithm defines space and time windows around each earthquake, with the size of these windows scaling with the magnitude of the event. Any smaller earthquake falling within these windows of a larger event is classified as an aftershock. The algorithm processes events chronologically, ensuring that once an event is classified as an aftershock, it cannot later be identified as a mainshock.",
      applications:
        "Widely used in seismic hazard assessment due to its straightforward implementation and effectiveness. The magnitude-dependent windows make it adaptable to different tectonic settings and earthquake sizes.",
      image: "/dec3_imresizer.png?height=300&width=500",
    },
    {
      id: "reasenberg",
      title: "Reasenberg Algorithm",
      description:
        "A physics-based approach that models aftershock sequences based on stress transfer principles and Omori's law of aftershock decay.",
      methodology:
        "The Reasenberg algorithm identifies aftershocks by considering how each earthquake changes the stress field in its vicinity. It incorporates Omori's law to account for the temporal decay of aftershock rates and uses an interaction radius that scales with magnitude. The algorithm builds clusters iteratively, allowing aftershocks to have their own subsequent aftershocks.",
      applications:
        "Particularly valuable for understanding the physical processes driving aftershock sequences. The physics-based approach makes it suitable for studying how earthquakes trigger each other through stress transfer, providing insights beyond simple statistical declustering.",
      image: "/dec4_imresizer.png?height=300&width=500",
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
          Earthquake Declustering
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground text-center max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Advanced techniques to separate dependent events (aftershocks) from independent events (main shocks) in
          earthquake catalogs
        </motion.p>
      </div>

      <Tabs defaultValue="dbscan" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          {declusteringTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.id === "nnd" ? "NND" : type.title.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {declusteringTypes.map((type) => (
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
                    <p className="text-sm text-muted-foreground mt-2 text-center">Example of {type.title} results</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Try It Yourself</h3>
                  <p className="text-muted-foreground mb-4">
                    Experience this declustering algorithm with real earthquake data from the USGS or upload your own
                    dataset.
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