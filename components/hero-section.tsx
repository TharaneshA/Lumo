"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 hero-gradient -z-10" />
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.4] transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}

          >
            Transform the Way You Capture Your{" "}
            <span className="inline-block align-baseline text-cycle text-primary">
              <span>Notes</span>
              <span>Ideas</span>
              <span>Reminders</span>
              <span>Plans</span>
              <span>Meetings</span>
              <span>Tasks</span>
              <span>Projects</span>
              <span>Thoughts</span>
            </span>
          </h1>

          <p
            className={`text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            From notes to reminders, instantly capture everything on the go. Whether you're typing or speaking, we've
            got you covered.
          </p>

          <div
            className={`transition-all duration-700 delay-500 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            <Link href="/app">
              <Button
                size="lg"
                className="glow-effect bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
              >
                Start Capturing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex justify-center items-start p-1">
          <div className="w-1 h-2 bg-muted-foreground rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
