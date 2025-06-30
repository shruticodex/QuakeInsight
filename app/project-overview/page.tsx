"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProjectOverview() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const teamMembers = [
    {
      name: "Shruti",
      role: "B.Tech CS III Year",
      image: "/shruti.png?height=400&width=400",
      //description: "Expert in earthquake prediction models with 15 years of research experience.",
    },
    {
      name: "Riddhi Kumari",
      role: "B.Tech CS III Year",
      image: "/riddhi.png?height=400&width=400",
      //description: "Specializes in developing AI models for seismic data analysis.",
    },
    {
      name: "Aditi Raj",
      role: "B.Tech CS III Year",
      image: "/aditi.png?height=400&width=400",
      //description: "Expert in processing and analyzing large-scale seismic datasets.",
    },
    {
      name: "Shubhi Upadhyay",
      role: "B.Tech CS III Year",
      image: "/shubhi.png?height=400&width=400",
      //description: "Responsible for developing and maintaining the web platform and APIs.",
    },
  ]

  const galleryImages = [
    {
      src: "myanmar.png",
      alt: "Team brainstorming session",
      caption: "Myanmar earthquake-26 Janauary,2001(Magnitude-6.9)",
    },
    {
      src: "japan.png",
      alt: "Data analysis workshop",
      caption: "Japan earthquake-11 March,2011(Magnitude-9.0)",
    },
    {
      src: "nepal.png",
      alt: "Team coding session",
      caption: "Nepal earthquake-22 February,25 April,2015(Magnitude-7.8)",
    },
    {
      src: "smriti.png",
      alt: "Project presentation",
      caption: "Smritivan earthquake memorial museum,Gujarat",
    },
    {
      src: "turkey.png",
      alt: "Field research",
      caption: "Turkey earthquake-6 February,2023(Magnitude-7.8)",
    },
    {
      src: "bhuj.png",
      alt: "Team meeting",
      caption: "Bhuj earthquake-26 January,2001(Magnitude-7.7)",
    },
    {
      src: "haiti.jpg",
      alt: "Development setup",
      caption: "Haiti earthquake-12 January,2010(Magnitude-7.0)",
    },
    {
      src: "nz.jpg",
      alt: "Testing phase",
      caption: "New Zealand earthquake-22 January,2011(Magnitude-6.2)",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-gradient"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Project Overview
      </motion.h1>

      <Tabs defaultValue="purpose" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="purpose">Project Purpose</TabsTrigger>
          <TabsTrigger value="team">Our Team</TabsTrigger>
        </TabsList>

        <TabsContent value="purpose">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Why QuakeInsight?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    QuakeInsight was created to bridge the gap between traditional earthquake monitoring and the power
                    of modern machine learning. While conventional methods rely on historical data and geological
                    models, they often fall short in providing real-time insights and predictive accuracy.
                  </p>
                  <p className="text-muted-foreground">
                    Our platform harnesses advanced AI-driven analytics to transform how we understand seismic activity.
                    By processing vast amounts of real-time seismic data, QuakeInsight identifies patterns, and
                    correlations that might be overlooked by traditional approaches.
                  </p>
                  <p className="text-muted-foreground">
                    More than just a monitoring tool, QuakeInsight is a comprehensive earthquake intelligence
                    system—offering real-time analysis, predictive modeling, and risk assessment. With the fusion of
                    machine learning, seismological expertise, and interactive visualization tools, we aim to empower
                    researchers, policymakers, and communities with actionable insights to mitigate risks and enhance
                    preparedness.
                  </p>
                  <p className="text-muted-foreground">
                    In a world where seconds can mean the difference between safety and disaster, QuakeInsight turns
                    data into foresight—because early awareness saves lives.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="grid gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <Image
                  src="/statistic1.jpg?height=600&width=800"
                  alt="Seismic monitoring station"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <Image
                  src="/statistic2.jpg?height=600&width=800"
                  alt="Data analysis dashboard"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Project Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  QuakeInsight aims to make a significant impact in several key areas:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Early Warning Systems: Improving prediction accuracy for potential seismic events</li>
                  <li>Research Advancement: Providing tools for deeper analysis of seismic patterns</li>
                  <li>Public Safety: Enhancing emergency response through better data analysis</li>
                  <li>Global Collaboration: Creating a platform for researchers worldwide to share and analyze data</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="team">
          <div className="space-y-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="relative h-[200px] mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={member.image || "/shruti.png"}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                      <p className="text-primary font-medium mb-2">{member.role}</p>
                      <p className="text-muted-foreground">{member.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[400px] rounded-lg overflow-hidden">
                    {galleryImages.map((image, index) => (
                      <motion.div
                        key={index}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                          <p className="text-center">{image.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full mx-1 ${
                          index === currentImageIndex ? "bg-primary" : "bg-gray-300"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our team is dedicated to advancing the field of seismology through innovative technology and
                    research. We believe that by combining expertise in seismology, machine learning, and data science,
                    we can create more accurate and reliable earthquake prediction systems that will help save lives and
                    protect communities worldwide.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

