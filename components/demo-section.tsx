"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

export default function DemoSection() {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Simulate voice recording with typing animation
      const text = "This is a demo of how Lumo transcribes your voice into beautifully formatted notes."
      let index = 0

      const interval = setInterval(() => {
        if (index < text.length) {
          setInput((prev) => prev + text[index])
          index++
        } else {
          clearInterval(interval)
          setIsRecording(false)
        }
      }, 50)
    }
  }

  const handleSubmit = () => {
    if (input.trim()) {
      setNotes([...notes, input])
      setInput("")
      toast({
        title: "Note saved!",
        description: "Your note has been successfully saved.",
      })
    }
  }

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See it in Action</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try out our interactive demo to experience how Lumo works
          </p>
        </div>

        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
        >
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Interactive Demo</CardTitle>
              <CardDescription>Type or use the microphone to see how Lumo captures your thoughts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="mb-4">
                    <div className="relative">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What's on your mind today?"
                        className={`min-h-[200px] resize-none p-4 ${isRecording ? "typing-animation" : ""}`}
                      />
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <Button
                          size="icon"
                          variant={isRecording ? "destructive" : "outline"}
                          onClick={toggleRecording}
                          className={isRecording ? "pulse" : ""}
                        >
                          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </Button>
                        <Button size="icon" variant="default" onClick={handleSubmit} disabled={!input.trim()}>
                          <Send size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l border-border/50 pl-4">
                  <h3 className="text-sm font-medium mb-3">Saved Notes</h3>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {notes.length > 0 ? (
                      notes.map((note, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <p className="text-sm line-clamp-2">{note}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No notes yet. Start typing or use the microphone!</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
