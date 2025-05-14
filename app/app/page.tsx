"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Send,
  Bold,
  Italic,
  List,
  Heading,
  Save,
  Menu,
  X,
  ChevronLeft,
  FileText,
  Bell,
  Clock,
  Tag,
  Search,
  Plus,
  Calendar,
  LinkIcon,
  CheckSquare,
  Star,
  StarOff,
  Trash2,
  Settings,
  HelpCircle,
  Share2,
  Download,
  Upload,
  Palette,
  Code,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type NoteType = {
  id: string
  title: string
  content: string
  type: "note" | "task" | "reminder" | "meeting"
  createdAt: Date
  tags: string[]
  isFavorite: boolean
  color?: string
}

type CategoryType = {
  id: string
  name: string
  icon: React.ReactNode
}

export default function NoteTakingApp() {
  const [input, setInput] = useState("")
  const [title, setTitle] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [notes, setNotes] = useState<NoteType[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showEmptyState, setShowEmptyState] = useState(true)
  const [availableTags, setAvailableTags] = useState<string[]>([
    "work",
    "personal",
    "ideas",
    "important",
    "design",
    "meeting",
    "todo",
  ])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const categories: CategoryType[] = [
    { id: "all", name: "All Notes", icon: <FileText size={18} /> },
    { id: "favorites", name: "Favorites", icon: <Star size={18} /> },
    { id: "tasks", name: "Tasks", icon: <CheckSquare size={18} /> },
    { id: "reminders", name: "Reminders", icon: <Bell size={18} /> },
    { id: "meetings", name: "Meetings", icon: <Calendar size={18} /> },
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Fetch notes from API
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes')
        
        if (!response.ok) {
          throw new Error('Failed to fetch notes')
        }
        
        const data = await response.json()
        
        if (data.notes && data.notes.length > 0) {
          // Transform API notes to match our NoteType format
          const formattedNotes: NoteType[] = data.notes.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            type: note.content.includes('- ') ? 'task' : 'note',
            createdAt: new Date(note.createdAt),
            tags: note.tags || [],
            isFavorite: note.isFavorite || false,
            color: note.color,
          }))
          
          setNotes(formattedNotes)
          setShowEmptyState(false)
        } else {
          // If no notes found, use sample notes for demo purposes
          const sampleNotes: NoteType[] = [
            {
              id: "1",
              title: "Meeting with Design Team",
              content: "# Meeting with Design Team\n\nDiscuss the new UI components and color palette for the mobile app.",
              type: "meeting",
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
              tags: ["design", "mobile"],
              isFavorite: true,
              color: "#FFD700",
            },
            {
              id: "2",
              title: "Shopping List",
              content: "- Buy groceries\n- Call mom\n- Schedule dentist appointment",
              type: "task",
              createdAt: new Date(Date.now() - 172800000), // 2 days ago
              tags: ["personal"],
              isFavorite: false,
            },
            {
              id: "3",
              title: "Quarterly Report Reminder",
              content: "Remember to send the quarterly report by Friday.",
              type: "reminder",
              createdAt: new Date(Date.now() - 259200000), // 3 days ago
              tags: ["work"],
              isFavorite: false,
            },
            {
              id: "4",
              title: "App Feature Ideas",
              content:
                "# New Feature Ideas\n\n1. **Dark mode toggle**\n2. *Voice commands*\n3. Collaborative editing\n4. Export to PDF",
              type: "note",
              createdAt: new Date(Date.now() - 345600000), // 4 days ago
              tags: ["ideas", "development"],
              isFavorite: true,
            },
          ]
          
          setNotes(sampleNotes)
          setShowEmptyState(false)
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
        // Use sample notes as fallback
        const sampleNotes: NoteType[] = [
          {
            id: "1",
            title: "Meeting with Design Team",
            content: "# Meeting with Design Team\n\nDiscuss the new UI components and color palette for the mobile app.",
            type: "meeting",
            createdAt: new Date(Date.now() - 86400000),
            tags: ["design", "mobile"],
            isFavorite: true,
            color: "#FFD700",
          },
          {
            id: "2",
            title: "Shopping List",
            content: "- Buy groceries\n- Call mom\n- Schedule dentist appointment",
            type: "task",
            createdAt: new Date(Date.now() - 172800000),
            tags: ["personal"],
            isFavorite: false,
          },
        ]
        
        setNotes(sampleNotes)
        setShowEmptyState(false)
        
        toast({
          title: "Could not load notes",
          description: "Using sample notes instead.",
          variant: "destructive"
        })
      }
    }
    
    fetchNotes()
  }, [])

  const filteredNotes = notes.filter((note) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by category
    let matchesCategory = true
    if (activeCategory === "favorites") {
      matchesCategory = note.isFavorite
    } else if (activeCategory === "tasks") {
      matchesCategory = note.type === "task"
    } else if (activeCategory === "reminders") {
      matchesCategory = note.type === "reminder"
    } else if (activeCategory === "meetings") {
      matchesCategory = note.type === "meeting"
    }

    return matchesSearch && matchesCategory
  })

  // Initialize media recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Request microphone permissions when component mounts
    if (typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log('Microphone permission granted'))
        .catch(err => console.error('Error accessing microphone:', err))
    }
  }, [])

  const [isProcessing, setIsProcessing] = useState(false)

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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Create form data for API request
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')
        
        try {
          // Send to transcription API
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })
          
          const data = await response.json()
          
          if (response.ok) {
            setInput(data.text)
            
            // Set a title based on the content
            if (!title) {
              setTitle("Voice Note - " + new Date().toLocaleTimeString())
            }
            
            toast({
              title: "Voice transcription complete",
              description: "Your voice has been transcribed successfully.",
              className: "bg-primary/20 border-primary",
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
        const newNote: NoteType = {
          id: Date.now().toString(),
          title: title || "Untitled Note",
          content: input,
          type: input.includes("- ") ? "task" : "note",
          createdAt: new Date(),
          tags: selectedTags,
          isFavorite: false,
        }

        // Save note to API
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newNote.title,
            content: newNote.content,
            tags: newNote.tags,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save note')
        }

        // Update local state
        setNotes((prev) => [newNote, ...prev])
        setInput("")
        setTitle("")
        setSelectedTags([])
        setShowEmptyState(false)

        toast({
          title: "Note saved!",
          description: "Your note has been successfully saved.",
          className: "bg-primary/20 border-primary",
        })

        // Show the note slide-in animation
        setTimeout(() => {
          const noteElement = document.getElementById(`note-${newNote.id}`)
          if (noteElement) {
            noteElement.classList.add("note-slide-in")
          }
        }, 100)
      } catch (error) {
        console.error('Error saving note:', error)
        toast({
          title: "Failed to save note",
          description: error instanceof Error ? error.message : "There was an error saving your note.",
          variant: "destructive"
        })
      }
    }
  }

  const formatText = (format: string) => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selectedText = input.substring(start, end)
    let formattedText = ""
    let cursorPosition = 0

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        cursorPosition = 2
        break
      case "italic":
        formattedText = `*${selectedText}*`
        cursorPosition = 1
        break
      case "heading":
        formattedText = `# ${selectedText}`
        cursorPosition = 2
        break
      case "list":
        formattedText = `- ${selectedText}`
        cursorPosition = 2
        break
      case "checkbox":
        formattedText = `- [ ] ${selectedText}`
        cursorPosition = 6
        break
      case "code":
        formattedText = `\`${selectedText}\``
        cursorPosition = 1
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        cursorPosition = selectedText.length + 3
        break
    }

    const newText = input.substring(0, start) + formattedText + input.substring(end)
    setInput(newText)

    // Set cursor position after formatting
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start + cursorPosition, start + cursorPosition + selectedText.length)
      }
    }, 0)
  }

  const getIconForNoteType = (type: string) => {
    switch (type) {
      case "meeting":
        return <Clock className="h-4 w-4 text-blue-400" />
      case "task":
        return <CheckSquare className="h-4 w-4 text-green-400" />
      case "reminder":
        return <Bell className="h-4 w-4 text-red-400" />
      default:
        return <FileText className="h-4 w-4 text-primary" />
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const toggleFavorite = (id: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, isFavorite: !note.isFavorite } : note)))

    const note = notes.find((n) => n.id === id)
    if (note) {
      toast({
        title: note.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `"${note.title}" has been ${note.isFavorite ? "removed from" : "added to"} your favorites.`,
        className: "bg-primary/20 border-primary",
      })
    }
  }

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id)

    if (noteToDelete) {
      setNotes(notes.filter((note) => note.id !== id))

      if (selectedNote === id) {
        setSelectedNote(null)
      }

      toast({
        title: "Note deleted",
        description: `"${noteToDelete.title}" has been deleted.`,
        className: "bg-destructive/20 border-destructive",
      })
    }
  }

  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])

      if (!availableTags.includes(newTag)) {
        setAvailableTags([...availableTags, newTag])
      }

      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const selectTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const renderNoteContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      // Simple markdown rendering
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold mt-0 mb-4">
            {line.substring(2)}
          </h1>
        )
      } else if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-bold mt-0 mb-3">
            {line.substring(3)}
          </h2>
        )
      } else if (line.startsWith("- [ ] ")) {
        return (
          <div key={i} className="flex items-start mb-2">
            <input type="checkbox" className="mr-2 mt-1" />
            <span>{line.substring(6)}</span>
          </div>
        )
      } else if (line.startsWith("- ")) {
        return (
          <div key={i} className="flex items-start mb-2">
            <span className="mr-2">•</span>
            <span>{line.substring(2)}</span>
          </div>
        )
      } else if (line.includes("**") || line.includes("*")) {
        return (
          <p
            key={i}
            className="mb-2"
            dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>"),
            }}
          />
        )
      } else {
        return (
          <p key={i} className="mb-2">
            {line}
          </p>
        )
      }
    })
  }

  const EmptyState = () => (
    <div className="empty-state">
      <FileText size={64} className="text-muted-foreground mb-4 opacity-50" />
      <h3 className="text-xl font-medium mb-2">No notes yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start by creating your first note. You can type directly or use the microphone for voice-to-text.
      </p>
      <Button
        onClick={() => textareaRef.current?.focus()}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Create Your First Note
      </Button>
    </div>
  )

  const SearchEmptyState = () => (
    <div className="empty-state">
      <Search size={64} className="text-muted-foreground mb-4 opacity-50" />
      <h3 className="text-xl font-medium mb-2">No matching notes</h3>
      <p className="text-muted-foreground mb-6">
        No notes match your current search or filters. Try adjusting your criteria.
      </p>
      <Button
        onClick={() => {
          setSearchQuery("")
          setActiveCategory(null)
        }}
        variant="outline"
      >
        Clear Filters
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-border/20 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span className="text-xl font-bold text-primary font-heading">Lumo</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary search-animation"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "All changes saved" })}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Palette className="h-4 w-4 mr-2" />
                    Change Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-10 bg-background/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside
          className={`md:w-72 flex-shrink-0 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="sticky top-20">
            <div className="mb-6">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
                onClick={() => {
                  setSelectedNote(null)
                  textareaRef.current?.focus()
                }}
              >
                <Plus size={18} className="mr-2" />
                New Note
              </Button>

              <div className="space-y-1 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      activeCategory === category.id
                        ? "bg-secondary text-foreground"
                        : "hover:bg-secondary/50 text-muted-foreground"
                    }`}
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                  >
                    <span className="mr-3">{category.icon}</span>
                    <span>{category.name}</span>
                    {category.id === "all" && (
                      <span className="ml-auto bg-secondary/50 text-xs rounded-full px-2 py-0.5">{notes.length}</span>
                    )}
                    {category.id === "favorites" && (
                      <span className="ml-auto bg-secondary/50 text-xs rounded-full px-2 py-0.5">
                        {notes.filter((note) => note.isFavorite).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Tags</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Add Tag</h4>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="New tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addTag()
                              }
                            }}
                          />
                          <Button onClick={addTag}>Add</Button>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Available Tags</h5>
                          <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                              <button key={tag} className="tag-pill" onClick={() => selectTag(tag)}>
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      className={`tag-pill ${searchQuery === tag ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="text-lg font-medium mb-3 font-heading">My Notes</h2>

              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || activeCategory ? (
                    <p>No notes match your current filters</p>
                  ) : (
                    <p>No notes yet. Create your first note!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                  {filteredNotes.map((note) => (
                    <div
                      id={`note-${note.id}`}
                      key={note.id}
                      className={`p-3 rounded-md transition-all duration-200 cursor-pointer sidebar-item-hover note-card ${
                        selectedNote === note.id ? "bg-secondary" : "bg-secondary/30"
                      }`}
                      style={note.color ? { borderLeft: `3px solid ${note.color}` } : {}}
                      onClick={() => setSelectedNote(selectedNote === note.id ? null : note.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          {getIconForNoteType(note.type)}
                          <span className="text-xs text-muted-foreground ml-2">{formatDate(note.createdAt)}</span>
                        </div>
                        <button
                          className="text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(note.id)
                          }}
                        >
                          {note.isFavorite ? (
                            <Star size={14} className="fill-primary text-primary" />
                          ) : (
                            <StarOff size={14} />
                          )}
                        </button>
                      </div>
                      <h3 className="text-sm font-medium mb-1 line-clamp-1">{note.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {note.content.replace(/[#*[\]]/g, "").trim()}
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className={`flex-1 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          {selectedNote ? (
            <div className="note-expand">
              <Card className="border border-border/50 bg-card/50 backdrop-blur-sm mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getIconForNoteType(notes.find((n) => n.id === selectedNote)?.type || "note")}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formatDate(notes.find((n) => n.id === selectedNote)?.createdAt || new Date())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const note = notes.find((n) => n.id === selectedNote)
                          if (note) {
                            toggleFavorite(note.id)
                          }
                        }}
                      >
                        {notes.find((n) => n.id === selectedNote)?.isFavorite ? (
                          <Star size={18} className="fill-primary text-primary" />
                        ) : (
                          <Star size={18} />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Share2 size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export as Markdown
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const note = notes.find((n) => n.id === selectedNote)
                          if (note) {
                            deleteNote(note.id)
                          }
                        }}
                      >
                        <Trash2 size={18} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedNote(null)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-4">{notes.find((n) => n.id === selectedNote)?.title}</h2>

                  <div className="max-w-none text-foreground note-content">
                    {renderNoteContent(notes.find((n) => n.id === selectedNote)?.content || "")}
                  </div>

                  {notes.find((n) => n.id === selectedNote)?.tags.length ? (
                    <div className="flex flex-wrap gap-1 mt-6">
                      {notes
                        .find((n) => n.id === selectedNote)
                        ?.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary flex items-center"
                          >
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                    </div>
                  ) : null}

                  <div className="mt-8 pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Last edited: {formatDate(notes.find((n) => n.id === selectedNote)?.createdAt || new Date())}
                    </span>
                    <Button variant="outline" size="sm">
                      <Palette size={14} className="mr-2" />
                      Change Color
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {showEmptyState && notes.length === 0 ? (
                <EmptyState />
              ) : filteredNotes.length === 0 && (searchQuery || activeCategory) ? (
                <SearchEmptyState />
              ) : (
                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm mb-6">
                  <CardContent className="p-4">
                    <Input
                      placeholder="Title"
                      className="text-lg font-medium border-none bg-transparent px-0 mb-2 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="flex items-center space-x-1 mb-4 overflow-x-auto py-2 floating-toolbar">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="toolbar-button"
                        onClick={() => formatText("heading")}
                        title="Heading"
                      >
                        <Heading size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="toolbar-button"
                        onClick={() => formatText("bold")}
                        title="Bold"
                      >
                        <Bold size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="toolbar-button"
                        onClick={() => formatText("italic")}
                        title="Italic"
                      >
                        <Italic size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="toolbar-button"
                        onClick={() => formatText("list")}
                        title="Bullet List"
                      >
                        <List size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="toolbar-button"
                        onClick={() => formatText("checkbox")}
                        title="Checkbox"
                      >
                        <CheckSquare size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="toolbar-button"
                        onClick={() => formatText("code")}
                        title="Code"
                      >
                        <Code size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="toolbar-button"
                        onClick={() => formatText("link")}
                        title="Link"
                      >
                        <Link2 size={18} />
                      </Button>
                    </div>

                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What's on your mind today?"
                        className={`min-h-[300px] resize-none p-4 text-lg bg-background/30 ${isRecording ? "typing-animation" : ""}`}
                      />

                      {selectedTags.length > 0 && (
                        <div className="absolute bottom-16 left-4 right-4 flex flex-wrap gap-1 py-2">
                          {selectedTags.map((tag) => (
                            <div key={tag} className="tag-pill flex items-center">
                              <span>{tag}</span>
                              <button
                                className="ml-1 text-muted-foreground hover:text-primary"
                                onClick={() => removeTag(tag)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Tag size={18} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-64">
                            <div className="space-y-4">
                              <h4 className="font-medium">Add Tags</h4>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="New tag..."
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      addTag()
                                    }
                                  }}
                                />
                                <Button onClick={addTag} size="sm">
                                  Add
                                </Button>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-2">Available Tags</h5>
                                <div className="flex flex-wrap gap-2">
                                  {availableTags.map((tag) => (
                                    <button
                                      key={tag}
                                      className={`tag-pill ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : ""}`}
                                      onClick={() => (selectedTags.includes(tag) ? removeTag(tag) : selectTag(tag))}
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          size="icon"
                          variant={isRecording ? "destructive" : "outline"}
                          onClick={toggleRecording}
                          className={isRecording ? "pulse" : ""}
                        >
                          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </Button>
                        <Button
                          size="icon"
                          variant="default"
                          onClick={handleSubmit}
                          disabled={!input.trim()}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Send size={18} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent notes section */}
              {!showEmptyState && notes.length > 0 && !searchQuery && !activeCategory && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 font-heading">Recent Notes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.slice(0, 3).map((note) => (
                      <Card
                        key={note.id}
                        className="border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 note-card"
                        style={note.color ? { borderLeft: `3px solid ${note.color}` } : {}}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {getIconForNoteType(note.type)}
                              <span className="text-xs text-muted-foreground ml-2">{formatDate(note.createdAt)}</span>
                            </div>
                            {note.isFavorite && <Star size={14} className="fill-primary text-primary" />}
                          </div>
                          <h3 className="text-sm font-medium mb-1 line-clamp-1">{note.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {note.content.replace(/[#*[\]]/g, "").trim()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full text-xs"
                            onClick={() => setSelectedNote(note.id)}
                          >
                            View Note
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
