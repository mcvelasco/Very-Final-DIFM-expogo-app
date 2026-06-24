/**
 * components/NoteCard.tsx
 * Displays a single note with edit and delete actions.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Note } from '../services/notesService';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

/**
 * NoteCard renders a rounded card with:
 * - Note content (truncated to 3 lines in list view)
 * - Formatted timestamp
 * - Edit and Delete action buttons
 */
export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [deleting, setDeleting] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  /** Format ISO timestamp into a human-readable string */
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /** Show a confirmation dialog before deleting */
  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'This note will be permanently deleted. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            // Fade out the card before removing it from the list
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              onDelete(note.id);
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      {/* Note body */}
      <Text style={styles.content} numberOfLines={3}>
        {note.content}
      </Text>

      {/* Footer: timestamp + actions */}
      <View style={styles.footer}>
        <View style={styles.dateRow}>
          <MaterialIcons name="access-time" size={13} color="#9CA3AF" />
          <Text style={styles.date}>{formatDate(note.updated_at || note.created_at)}</Text>
        </View>

        <View style={styles.actions}>
          {/* Edit button */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onEdit(note)}
            disabled={deleting}
          >
            <MaterialIcons name="edit" size={18} color="#2563EB" />
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            style={[styles.iconBtn, styles.deleteBtn]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
});
