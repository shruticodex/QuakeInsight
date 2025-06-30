"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ClusteringFeature() {
  const clusteringTypes = [
    {
      id: "dbscan",
      title: "DBSCAN Clustering",
      description:
        "Density-Based Spatial Clustering of Applications with Noise (DBSCAN) is a density-based clustering algorithm that groups together points that are closely packed in space.",
      methodology:
        "DBSCAN works by identifying core points (points with many neighbors), border points (points with fewer neighbors but near a core point), and noise points (isolated points). It connects core points that are within a specified distance (epsilon) of each other, forming clusters without requiring a predefined number of clusters.",
      applications:
        "Particularly effective for earthquake clustering as it can identify clusters of arbitrary shapes and sizes. It naturally handles noise (isolated earthquakes) and doesn't require specifying the number of clusters in advance, which is ideal for earthquake data where the number of distinct seismic sequences is unknown.",
      image: "/cl1_imresizer.png?height=300&width=500",
    },
    {
      id: "kmeans",
      title: "K-means Clustering",
      description:
        "K-means is a partitioning method that divides the earthquake dataset into K distinct, non-overlapping clusters based on spatial proximity.",
      methodology:
        "The algorithm works by iteratively assigning each earthquake to the nearest cluster centroid, then recalculating the centroids based on the mean position of all points in each cluster. This process continues until the centroids stabilize or a maximum number of iterations is reached.",
      applications:
        "Useful for quickly identifying major earthquake clusters when the approximate number of clusters is known. Can help identify regions with similar seismic characteristics. The simplicity and efficiency of K-means make it suitable for large earthquake datasets.",
      image: "/cl2_imresizer.png?height=300&width=500",
    },
    {
      id: "fuzzy",
      title: "Fuzzy C-means Clustering",
      description:
        "An extension of K-means that allows earthquakes to belong to multiple clusters with varying degrees of membership, reflecting the often ambiguous boundaries between seismic zones.",
      methodology:
        "Unlike K-means where each point belongs to exactly one cluster, Fuzzy C-means assigns membership values to each point for each cluster. These membership values indicate the degree to which a point belongs to different clusters, with the sum of memberships for each point equaling 1.",
      applications:
        "Particularly valuable for understanding transition zones between different seismic regions. Provides a more nuanced view of earthquake clustering, especially in complex tectonic environments where sharp boundaries between clusters may not exist. Helps identify earthquakes that may be influenced by multiple seismic processes.",
      image: "/cl3_imresizer.png?height=300&width=500",
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
          Earthquake Clustering
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground text-center max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Sophisticated algorithms to identify and analyze groups of earthquakes that are closely related in time and
          space
        </motion.p>
      </div>

      <Tabs defaultValue="dbscan" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          {clusteringTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.title.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {clusteringTypes.map((type) => (
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
                    Experience this clustering algorithm with real earthquake data from the USGS or upload your own
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

