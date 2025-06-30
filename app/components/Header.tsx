"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "")
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" })
      } else {
        // If the element is not found, it might be on another page
        router.push(href)
      }
    } else {
      router.push(href)
    }
  }

  return (
    <motion.header
      className="bg-background text-foreground shadow-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <Image src="/banasthali-logo.png" alt="Banasthali Vidyapith Logo" width={40} height={40} />
          <Image src="/quakeinsight-logo.png" alt="QuakeInsight Logo" width={60} height={70} />
          
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-gradient">
            QuakeInsight
          </h1>
        </div>
        <nav className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            {[
              { name: "Home", href: "/" },
              { name: "Project Overview", href: "/project-overview" },
              { name: "Features", href: "/features" },
              { name: "Definitions", href: "/definitions" },
              { name: "Recent Earthquakes", href: "/recent-earthquakes" },
              { name: "Research", href: "/research" },
              { name: "Contact Us", href: "/contact" },
            ].map((item) => (
              <motion.li key={item.name} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full p-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </motion.header>
  )
}

