import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/options';

// In a real application, this would be a database
// For this demo, we'll use the in-memory store from the main notes route
declare global {
  var notesStore: Record<string, any[]>;
}

// Initialize the global store if it doesn't exist
if (!global.notesStore) {
  global.notesStore = {};
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const noteId = params.id;
    
    // Get user's notes
    const userNotes = global.notesStore[userId] || [];
    
    // Find the specific note
    const note = userNotes.find(note => note.id === noteId);
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: `Failed to fetch note: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const noteId = params.id;
    const { title, content, tags, isFavorite } = await request.json();
    
    // Get user's notes
    const userNotes = global.notesStore[userId] || [];
    
    // Find the note index
    const noteIndex = userNotes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    // Update the note
    const updatedNote = {
      ...userNotes[noteIndex],
      title: title !== undefined ? title : userNotes[noteIndex].title,
      content: content !== undefined ? content : userNotes[noteIndex].content,
      tags: tags !== undefined ? tags : userNotes[noteIndex].tags,
      isFavorite: isFavorite !== undefined ? isFavorite : userNotes[noteIndex].isFavorite,
      updatedAt: new Date().toISOString()
    };
    
    // Replace the old note with the updated one
    userNotes[noteIndex] = updatedNote;
    global.notesStore[userId] = userNotes;
    
    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: `Failed to update note: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const noteId = params.id;
    
    // Get user's notes
    const userNotes = global.notesStore[userId] || [];
    
    // Filter out the note to delete
    const updatedNotes = userNotes.filter(note => note.id !== noteId);
    
    if (updatedNotes.length === userNotes.length) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    // Update the store
    global.notesStore[userId] = updatedNotes;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: `Failed to delete note: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}