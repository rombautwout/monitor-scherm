
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';

interface Note {
  id: number;
  content: string;
  timestamp: string;
  author: string;
}

const initialNotes: Note[] = [
  {
    id: 1,
    content: 'Team meeting scheduled for Friday at 10am to discuss the new project timeline.',
    timestamp: '05/01/2025, 14:32',
    author: 'Sarah'
  },
  {
    id: 2,
    content: 'Server maintenance will be performed tonight between 2-4am. Some services may experience downtime.',
    timestamp: '05/01/2025, 11:15',
    author: 'Mike'
  }
];

const NotesBoard = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const addNote = () => {
    if (newNote.trim()) {
      const now = new Date();
      const note: Note = {
        id: Date.now(),
        content: newNote,
        timestamp: now.toLocaleString(),
        author: user?.username || 'You'
      };
      setNotes([note, ...notes]);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-primary">Team Notes</CardTitle>
        {!isAddingNote && user && (
          <Button size="sm" variant="outline" className="h-8" onClick={() => setIsAddingNote(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Note
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAddingNote && user && (
          <div className="mb-4 p-3 border rounded-md bg-muted/20">
            <Textarea 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type your note here..."
              className="min-h-[100px] mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={addNote}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <div className="flex gap-1 text-xs text-muted-foreground mb-1">
                  <span>{note.author}</span>
                  <span>•</span>
                  <span>{note.timestamp}</span>
                </div>
                {user && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesBoard;
