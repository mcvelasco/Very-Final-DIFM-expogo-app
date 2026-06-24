/**
 * app/edit.tsx
 * Edit an existing note — loads content from route params,
 * lets the user modify it, and saves back to Supabase.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateNote } from '../services/notesService';

export default function EditScreen() {
  // Route params injected by expo-router
  const { id, content: initialContent } = useLocalSearchParams<{
    id: string;
    content: string;
  }>();

  const [content, setContent] = useState(initialContent || '');
  const [saving, setSaving] = useState(false);

  /** Save updated note to Supabase */
  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Note', 'A note cannot be empty. Please write something.');
      return;
    }

    if (content.trim() === initialContent?.trim()) {
      // Nothing changed — just go back
      router.back();
      return;
    }

    try {
      setSaving(true);
      await updateNote(id, { content: content.trim() });
      router.back();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /** Warn user if they try to discard unsaved changes */
  const handleBack = () => {
    if (content.trim() !== initialContent?.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Going back will lose them.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={['#1D4ED8', '#2563EB']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Note</Text>
        {/* Spacer to centre the title */}
        <View style={{ width: 38 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editor card */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Note Content</Text>
            <TextInput
              style={styles.input}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              placeholder="Write your note here…"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
              maxLength={5000}
            />
            <Text style={styles.charCount}>{content.length}/5000</Text>
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              style={styles.saveBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={handleBack}>
            <Text style={styles.cancelBtnText}>Discard</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 23,
    minHeight: 220,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveDisabled: { opacity: 0.6 },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
});
