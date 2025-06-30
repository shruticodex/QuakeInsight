"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"


const definitions = [
    {
      term: "Earthquake",
      definition:
        "A sudden and violent shaking of the ground, sometimes causing great destruction, as a result of movements within the earth's crust or volcanic action.",
      image: "/earthquake.jpg",
    },
    {
      term: "Magnitude",
      definition:
        "A measure of the energy released by an earthquake, typically expressed using the Richter scale or moment magnitude scale.",
      image: "/magnitude.jpg",
    },
    {
      term: "Epicenter",
      definition: "The point on the earth's surface vertically above the focus (hypocenter) of an earthquake.",
      image: "/epicenter.jpg",
    },
    {
      term: "Seismograph",
      definition: "An instrument that measures and records details of earthquakes, such as force and duration.",
      image: "/seismograph.jpg",
    },
    {
      term: "Aftershock",
      definition: "A smaller earthquake that follows a larger earthquake in the same area.",
      image: "/aftershock.jpg",
    },
    {
      term: "Fault",
      definition:
        "A fracture or zone of fractures between two blocks of rock in the earth's crust, along which earthquakes can occur.",
      image: "/fault.jpg",
    },
    {
      term: "Seismic Wave",
      definition:
        "Waves of energy that travel through the Earth's layers, and are the main source of damage in earthquakes.",
      image: "/seismic wave.jpg",
    },
    {
      term: "Liquefaction",
      definition:
        "A phenomenon in which the strength and stiffness of soil is reduced by earthquake shaking or other rapid loading.",
      image: "/liquefaction.jpg",
    },
    {
      term: "Tectonic Plates",
      definition:
        "The large, thin plates that make up the Earth's surface and move relative to one another, causing earthquakes at their boundaries.",
      image: "/tectonicplates.jpg",
    },
    {
      term: "Richter Scale",
      definition:
        "A numerical scale for expressing the magnitude of an earthquake on the basis of seismograph oscillations. The more destructive earthquakes typically have magnitudes between about 5.5 and 8.9.",
      image: "/richterscale.jpg",
    },
    {
      term: "P-waves",
      definition:
        "Primary waves, the fastest type of seismic wave. They are compressional waves that can travel through solids and liquids.",
      image: "/pwaves.jpg",
    },
    {
      term: "S-waves",
      definition: "Secondary waves, slower than P-waves. They are shear waves that can only travel through solids.",
      image: "/swaves.jpg",
    },
    {
      term: "Subduction Zone",
      definition:
        "An area where two tectonic plates meet and one slides beneath the other, often causing deep earthquakes and volcanic activity.",
      image: "/subduction zone.jpg",
    },
    {
      term: "Seismic Hazard",
      definition:
        "The probability of an earthquake occurring in a given geographic area, within a given window of time, and with ground motion intensity exceeding a given threshold.",
      image: "/seismic hazard.jpg",
    },
    {
      term: "Moment Magnitude Scale",
      definition:
        "A more accurate measure of the total energy released by an earthquake, which has largely replaced the Richter scale for medium and larger earthquakes.",
      image: "/moment magnitude scale.jpg",
    },
  ]

export default function Definitions() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDefinitions = definitions.filter(
    (def) =>
      def.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.definition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Earthquake Terminology</h1>
      <div className="max-w-md mx-auto mb-8">
        <Input
          type="text"
          placeholder="Search definitions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredDefinitions.map((def, index) => (
          <motion.div
            key={def.term}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{def.term}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{def.definition}</p>
                <Image
                  src={def.image || "/placeholder.svg"}
                  alt={`Illustration for ${def.term}`}
                  width={300}
                  height={200}
                  className="rounded-lg"
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

