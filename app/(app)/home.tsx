/**
 * app/(app)/home.tsx
 * Main screen: mic button, notes list, floating add button.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, TextInput,
  Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { getNotes, createNote, deleteNote, Note } from '../../services/notesService';
import MicButton from '../../components/MicButton';
import NoteCard from '../../components/NoteCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load notes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleRefresh = () => { setRefreshing(true); fetchNotes(); };

  const handleTranscription = async (text: string) => {
    if (!text.trim()) return;
    try {
      setSavingNote(true);
      const note = await createNote({ content: text });
      setNotes((prev) => [note, ...prev]);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save your voice note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) {
      Alert.alert('Empty Note', 'Please write something before saving.');
      return;
    }
    try {
      setAddingNote(true);
      const note = await createNote({ content: newNoteText.trim() });
      setNotes((prev) => [note, ...prev]);
      setNewNoteText('');
      setShowAddModal(false);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save your note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleEdit = (note: Note) => {
    router.push({ pathname: '/(app)/edit', params: { id: note.id, content: note.content } });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      Alert.alert('Delete Failed', err.message || 'Could not delete the note.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const displayName =
    (user?.user_metadata?.full_name as string)?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1D4ED8', '#2563EB']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hi, {displayName} 👋</Text>
            <Text style={styles.subGreeting}>What shall we capture today?</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
        <View style={styles.micContainer}>
          <MicButton onTranscription={handleTranscription} disabled={savingNote} />
          {savingNote && <Text style={styles.savingText}>Saving your note…</Text>}
        </View>
      </LinearGradient>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Notes</Text>
          <Text style={styles.noteCount}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NoteCard note={item} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing} onRefresh={handleRefresh}
                tintColor="#2563EB" colors={['#2563EB']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="note-add" size={56} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No notes yet</Text>
                <Text style={styles.emptyBody}>
                  Tap the microphone to record a voice note, or press{' '}
                  <Text style={{ fontWeight: '700' }}>+</Text> to type one.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)} activeOpacity={0.85}>
        <LinearGradient
          colors={['#2563EB', '#3B82F6']} style={styles.fabGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Note Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAddModal(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Note</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Write your note here…"
              placeholderTextColor="#9CA3AF"
              multiline autoFocus
              value={newNoteText} onChangeText={setNewNoteText}
              maxLength={2000}
            />
            <Text style={styles.charCount}>{newNoteText.length}/2000</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setNewNoteText(''); setShowAddModal(false); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, addingNote && { opacity: 0.6 }]}
                onPress={handleAddNote} disabled={addingNote}
              >
                <LinearGradient
                  colors={['#2563EB', '#3B82F6']} style={styles.saveBtnGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {addingNote ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Note</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  micContainer: { alignItems: 'center', marginTop: 20 },
  savingText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  listContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  noteCount: { fontSize: 13, color: '#6B7280' },
  loader: { marginTop: 48 },
  listContent: { paddingBottom: 100 },
  emptyState: { alignItems: 'center', marginTop: 64, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptyBody: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  fab: {
    position: 'absolute', right: 20, bottom: 28,
    borderRadius: 28, overflow: 'hidden',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  fabGradient: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB',
    padding: 14, fontSize: 15, color: '#111827', minHeight: 120, textAlignVertical: 'top',
  },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 6, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  saveBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  saveBtnGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
