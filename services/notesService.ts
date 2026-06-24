/**
 * services/notesService.ts
 * CRUD operations for the notes table in Supabase.
 * All operations are scoped to the authenticated user via Row Level Security.
 */

import { supabase } from './supabase';

/** Shape of a note record from the database */
export interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/** Input when creating or updating a note */
export interface NoteInput {
  content: string;
}

/**
 * Fetch all notes belonging to the currently authenticated user.
 * Sorted newest-first.
 */
export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Note[];
}

/**
 * Create a new note for the authenticated user.
 * @param input - Object containing the note content
 */
export async function createNote(input: NoteInput): Promise<Note> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      content: input.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Note;
}

/**
 * Update the content of an existing note.
 * @param id - UUID of the note to update
 * @param input - Object containing the updated content
 */
export async function updateNote(id: string, input: NoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({
      content: input.content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Note;
}

/**
 * Permanently delete a note by its ID.
 * @param id - UUID of the note to delete
 */
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
