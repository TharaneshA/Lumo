"use client"

import { useEffect, useRef } from "react"
import { Mic, Bell, FileText, Cloud } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 },
    )

    if (featureRefs.current) {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref)
      })
    }

    return () => {
      if (featureRefs.current) {
        featureRefs.current.forEach((ref) => {
          if (ref) observer.unobserve(ref)
        })
      }
    }
  }, [])

  const features = [
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Voice-to-Text Transcription",
      subtitle: "Capture your ideas hands-free",
      description: "Simply speak your thoughts, and our tool will instantly transcribe and organize them beautifully.",
    },
    {
      icon: <Bell className="h-10 w-10 text-primary" />,
      title: "Smart Reminders & Task Management",
      subtitle: "Never forget a thing again",
      description: "Set reminders for meetings, deadlines, and personal tasks with ease.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Real-Time Markdown Formatting",
      subtitle: "Organize with Style",
      description: "Your notes automatically format in sleek Markdown style, making your work organized and beautiful.",
    },
    {
      icon: <Cloud className="h-10 w-10 text-primary" />,
      title: "Effortless Storage & Organization",
      subtitle: "All your thoughts in one place",
      description: "Save, categorize, and review your notes from any device, anytime.",
    },
  ]

  return (
    <section id="features" ref={sectionRef} className="py-20 md:py-32 features-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designed to make capturing and organizing your thoughts effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (featureRefs.current[index] = el)}
              className="fade-in"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className="h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="mb-4 p-2 rounded-full w-16 h-16 flex items-center justify-center bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-primary font-medium">{feature.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
