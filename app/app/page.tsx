"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Recorder from "recorder-js"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

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

const categories: CategoryType[] = [
  { id: "all", name: "All Notes", icon: <FileText className="w-4 h-4" /> },
  { id: "tasks", name: "Tasks", icon: <CheckSquare className="w-4 h-4" /> },
  { id: "reminders", name: "Reminders", icon: <Bell className="w-4 h-4" /> },
  { id: "meetings", name: "Meetings", icon: <Calendar className="w-4 h-4" /> },
]

function NoteTakingApp() {
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.AudioContext)();
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log('Microphone permission granted'))
        .catch(err => console.error('Error accessing microphone:', err));
    }
    
    return () => {
      if (recorder) {
        recorder.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [recorder]);

  const toggleRecording = async () => {
    if (isRecording) {
      if (recorder) {
        const { blob } = await recorder.stop();
        setIsRecording(false);
        
        const audioBlob = blob;
        const formData = new FormData();
        formData.append('audio', audioBlob, `recording-${Date.now()}.wav`);
        
        setIsProcessing(true);
        try {
          const response = await axios.post('/api/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          
          if (response.data.text) {
            setTranscribedText(response.data.text);
            setInput(prev => prev + (prev ? '\n' : '') + response.data.text);
            toast({
              title: "Transcription complete",
              description: "Your audio has been transcribed successfully.",
            });
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Transcription failed",
            description: "There was an error transcribing your audio.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const newRecorder = new Recorder(audioContextRef.current);
      await newRecorder.init(stream);
      newRecorder.start();
      setRecorder(newRecorder);
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      toast({
        title: "Recording failed",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }

  const handleSaveNote = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      });
      return;
    }

    const newNote: NoteType = {
      id: Date.now().toString(),
      title: title.trim(),
      content: input.trim(),
      type: activeCategory === "all" ? "note" : activeCategory.slice(0, -1) as NoteType["type"],
      createdAt: new Date(),
      tags: selectedTags,
      isFavorite: false
    };

    setNotes(prev => [newNote, ...prev]);
    setTitle("");
    setInput("");
    setSelectedTags([]);
    setShowEmptyState(false);
    
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`w-64 border-r border-border/50 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notes</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu className="w-4 h-4" />
              </Button>
            </div>
            
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            
            <Button className="w-full" onClick={() => setShowEmptyState(false)}>
              <Plus className="w-4 h-4 mr-2" /> New Note
            </Button>

            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="w-full">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 flex-1"
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <ScrollArea className="h-[calc(100vh-280px)]">
              {notes.length > 0 ? (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <Card
                      key={note.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedNote === note.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedNote(note.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium truncate flex-1 pr-2">{note.title}</h3>
                          {note.isFavorite ? (
                            <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap line-clamp-2">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
            </ScrollArea>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {showEmptyState ? (
              <div className="flex flex-col items-center justify-center h-[80vh] text-center">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-bold mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-4">Create your first note to get started</p>
                <Button onClick={() => setShowEmptyState(false)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Note
                </Button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <Input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Palette className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6">
                        <Tag className="w-3 h-3 mr-1" /> Add Tag
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60" align="start">
                      <div className="flex gap-2">
                        <Input
                          placeholder="New tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTag.trim()) {
                              setSelectedTags(prev => [...new Set([...prev, newTag.trim()])]);
                              setNewTag('');
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (newTag.trim()) {
                              setSelectedTags(prev => [...new Set([...prev, newTag.trim()])]);
                              setNewTag('');
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <Textarea
                  ref={textareaRef}
                  placeholder="Start typing your note..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px]"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={toggleRecording}
                      disabled={isProcessing}
                      variant={isRecording ? "destructive" : "default"}
                    >
                      {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    {isProcessing && <span className="text-sm text-muted-foreground">Processing audio...</span>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleSaveNote}>
                      <Save className="w-4 h-4 mr-2" /> Save Note
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteTakingApp;

const noteMap: Record<string, NoteType> = {};

type TranscriptionResponse = Record<string, any>;
