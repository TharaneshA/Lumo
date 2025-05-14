import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';

// In a real application, this would be a database
// For this demo, we'll use a global in-memory store
declare global {
  var notesStore: Record<string, any[]>;
}

// Initialize the global store if it doesn't exist
if (!global.notesStore) {
  global.notesStore = {};
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');
    
    // Get user's notes
    const userNotes = global.notesStore[userId] || [];
    
    // Filter by tag if provided
    const filteredNotes = tag 
      ? userNotes.filter(note => note.tags.includes(tag))
      : userNotes;
      
    return NextResponse.json({ notes: filteredNotes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: `Failed to fetch notes: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { title, content, tags } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Create a new note
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    };
    
    // Initialize user's notes array if it doesn't exist
    if (!global.notesStore[userId]) {
      global.notesStore[userId] = [];
    }
    
    // Add the new note
    global.notesStore[userId].push(newNote);
    
    return NextResponse.json({ note: newNote });
  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json(
      { error: `Failed to save note: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}