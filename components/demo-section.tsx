"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function DemoSection() {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTag, setCurrentTag] = useState<string>("") 
  const sectionRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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

  useEffect(() => {
    // Request microphone permissions when component mounts
    if (typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log('Microphone permission granted'))
        .catch(err => console.error('Error accessing microphone:', err))
    }
  }, [])

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
      return
    }

    try {
      setIsRecording(true)
      audioChunksRef.current = []

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      // Handle recording stop event
      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        
        // Create form data for API request
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')
        
        try {
          // Send to transcription API
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })
          
          const data = await response.json()
          
          if (response.ok) {
            setInput(data.text)
            toast({
              title: "Transcription complete",
              description: "Your voice has been transcribed successfully.",
            })
          } else {
            throw new Error(data.error || 'Transcription failed')
          }
        } catch (error) {
          console.error('Transcription error:', error)
          toast({
            title: "Transcription failed",
            description: error instanceof Error ? error.message : "An error occurred during transcription",
            variant: "destructive"
          })
        } finally {
          setIsProcessing(false)
          
          // Stop all tracks on the stream
          stream.getTracks().forEach(track => track.stop())
        }
      }
      
      // Start recording
      mediaRecorder.start()
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      })
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsRecording(false)
      toast({
        title: "Recording failed",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async () => {
    if (input.trim()) {
      try {
        // Create a new note with the current tag
        const newNote = {
          content: input,
          tag: currentTag || 'general'
        }
        
        // In a real app, we would save to the API here
        // const response = await fetch('/api/notes', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newNote),
        // })
        // const data = await response.json()
        
        // For the demo, just update the local state
        setNotes([...notes, input])
        setInput("")
        setCurrentTag("")
        
        toast({
          title: "Note saved!",
          description: "Your note has been successfully saved with tag: " + (currentTag || 'general'),
        })
      } catch (error) {
        console.error('Error saving note:', error)
        toast({
          title: "Failed to save note",
          description: "There was an error saving your note.",
          variant: "destructive"
        })
      }
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
                        disabled={isProcessing}
                      />
                      <div className="absolute top-4 right-4">
                        {isProcessing && (
                          <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-md">
                            <span className="animate-pulse mr-2">●</span>
                            <span className="text-xs">Processing...</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-16 left-4 right-4">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          placeholder="Add a tag (optional)"
                          className="text-sm"
                          disabled={isProcessing || isRecording}
                        />
                      </div>
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <Button
                          variant={isRecording ? "destructive" : "outline"}
                          onClick={toggleRecording}
                          className={isRecording ? "pulse" : ""}
                        >
                          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </Button>
                        <Button variant="default" size="lg" onClick={() => {}}>
                          Demo Button
                        </Button>
                        <Button variant="default" onClick={handleSubmit} disabled={!input.trim()}>
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
