"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Globe, Activity, ArrowRight } from "lucide-react"

interface Earthquake {
  id: string
  properties: {
    mag: number
    place: string
    time: number
  }
}

export default function Home() {
  const [recentEarthquakes, setRecentEarthquakes] = useState<Earthquake[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const sectionRefs = {
    "about-us": useRef<HTMLElement>(null),
    features: useRef<HTMLElement>(null),
    "recent-earthquakes": useRef<HTMLElement>(null),
    "earthquake-safety": useRef<HTMLElement>(null),
    "contact-us": useRef<HTMLElement>(null),
  }

  const slides = [
    { image: "/major-earthquake1.jpg", caption: "2011 Tohoku Earthquake and Tsunami, Japan" },
    { image: "/research-insight1.jpg", caption: "Seismic Wave Analysis" },
    { image: "/major-earthquake2.jpg", caption: "2010 Haiti Earthquake" },
    { image: "/research-insight2.jpg", caption: "Machine Learning Model for Earthquake Prediction" },
  ]

  useEffect(() => {
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
      .then((response) => response.json())
      .then((data) => {
        setRecentEarthquakes(data.features.slice(0, 5))
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching earthquake data:", error)
        setLoading(false)
      })

    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)

    const handleScroll = (e: MouseEvent) => {
      e.preventDefault()
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href")
      if (href && href.startsWith("#")) {
        const targetId = href.substring(1)
        const targetElement = document.getElementById(targetId)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" })
        }
      }
    }

    const links = document.querySelectorAll('a[href^="#"]')
    links.forEach((link) => {
      link.addEventListener("click", handleScroll as EventListener)
    })

    return () => {
      clearInterval(slideInterval)
      links.forEach((link) => {
        link.removeEventListener("click", handleScroll as EventListener)
      })
    }
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <motion.section
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-gradient">
            QuakeInsight
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Revolutionizing earthquake research and disaster preparedness through advanced machine learning and
            real-time monitoring.
          </p>
          <Link href="/research">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Start Analyzing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.section>

        <section id="about-us" ref={sectionRefs["about-us"]} className="mb-24">
          <h2 className="text-4xl font-bold mb-12 text-center text-primary">About Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="space-y-6 bg-white/10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-muted-foreground leading-relaxed">
                QuakeInsight combines cutting-edge technology with seismological research to provide real-time
                monitoring and analysis of earthquake data using machine learning techniques. Our system offers a
                comprehensive suite of tools for earthquake data visualization, magnitude prediction, clustering, and
                declustering, empowering researchers and analysts with powerful insights into seismic activities.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By leveraging advanced machine learning algorithms, we process vast amounts of seismic data from various
                sources, including real-time feeds from the USGS and historical datasets from the National Seismology
                Center of India.
              </p>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {["/major-earthquake1.jpg", "/major-earthquake2.jpg", "/research-insight1.jpg", "/research-insight2.jpg"].map((src, index) => (
                <motion.div key={index} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <Image
                    src={src || "/research-insight2.jpg"}
                    alt={`Earthquake image ${index + 1}`}
                    width={300}
                    height={200}
                    className="rounded-lg shadow-md object-cover w-full h-full transition-all duration-300 hover:shadow-xl"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="features" ref={sectionRefs.features} className="mb-24">
          <h2 className="text-4xl font-bold mb-12 text-center text-primary">Our Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Data Processing",
                description: "Access and analyze real-time earthquake data from global seismic networks.",
                icon: <Globe className="w-12 h-12 text-primary mb-4" />,
              },
              {
                title: "Advanced Analytics",
                description: "Perform EDA, Magnitude Prediction, Clustering, and Declustering using ML algorithms.",
                icon: <BarChart3 className="w-12 h-12 text-primary mb-4" />,
              },
              {
                title: "Interactive Visualizations",
                description: "Generate dynamic charts, maps, and 3D visualizations to understand seismic patterns.",
                icon: <Activity className="w-12 h-12 text-primary mb-4" />,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center h-full bg-white/10 backdrop-filter backdrop-blur-lg shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex flex-col items-center">
                      {feature.icon}
                      <span className="mt-2 text-xl">{feature.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="recent-earthquakes" ref={sectionRefs["recent-earthquakes"]} className="mb-24">
          <h2 className="text-4xl font-bold mb-12 text-center text-primary">Recent Earthquakes</h2>
          {loading ? (
            <p className="text-center text-xl text-muted-foreground">Loading recent earthquake data...</p>
          ) : (
            <motion.div
              className="overflow-x-auto bg-white/10 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary/80 text-primary-foreground">
                    <th className="p-4 text-left">Magnitude</th>
                    <th className="p-4 text-left">Location</th>
                    <th className="p-4 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEarthquakes.map((quake, index) => (
                    <motion.tr
                      key={quake.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="p-4">{quake.properties.mag.toFixed(1)}</td>
                      <td className="p-4">{quake.properties.place}</td>
                      <td className="p-4">{new Date(quake.properties.time).toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </section>

        <section id="earthquake-safety" ref={sectionRefs["earthquake-safety"]} className="mb-24">
          <h2 className="text-4xl font-bold mb-12 text-center text-primary">Earthquake Safety</h2>
          <Tabs defaultValue="english" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="english" className="text-lg transition-all duration-200 hover:bg-primary/20">
                English
              </TabsTrigger>
              <TabsTrigger value="hindi" className="text-lg transition-all duration-200 hover:bg-primary/20">
                Hindi
              </TabsTrigger>
            </TabsList>
            <TabsContent value="english">
              <Card className="bg-white/10 backdrop-filter backdrop-blur-lg shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Safety Tips (English)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Drop, Cover, and Hold On during shaking</li>
                    <li>Stay away from windows and potential falling objects</li>
                    <li>If you're in bed, stay there and protect your head with a pillow</li>
                    <li>If you're outdoors, move to an open area away from buildings and trees</li>
                    <li>Be prepared for aftershocks</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="hindi">
              <Card className="bg-white/10 backdrop-filter backdrop-blur-lg shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl">सुरक्षा टिप्स (Hindi)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>कंपन के दौरान गिरें, ढकें और पकड़ें</li>
                    <li>खिड़कियों और संभावित गिरने वाली वस्तुओं से दूर रहें</li>
                    <li>यदि आप बिस्तर पर हैं, तो वहीं रहें और अपने सिर को तकिए से सुरक्षित रखें</li>
                    <li>यदि आप बाहर हैं, तो इमारतों और पेड़ों से दूर एक खुले क्षेत्र में जाएं</li>
                    <li>आफ्टरशॉक के लिए तैयार रहें</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  )
}

