/**
 * app/(auth)/register.tsx
 * Registration screen — creates a new Supabase account.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const redirectUrl = 'doitforme://';
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          redirectTo: redirectUrl,
          emailRedirectTo: redirectUrl,
          data: { full_name: name.trim() },
        },
      });

      if (error) {
        Alert.alert('Registration Failed', error.message);
        return;
      }

      if (data.session) {
        router.replace('/(app)/home');
        return;
      }

      Alert.alert(
        'Account Created!',
        `A confirmation email has been sent to ${email.trim().toLowerCase()}. Please check your inbox or spam folder and tap the link to finish registration.`,
        [{ text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1D4ED8', '#2563EB', '#3B82F6']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="person-add" size={36} color="#2563EB" />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Join Do It For Me today</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input} placeholder="Jane Smith"
                  placeholderTextColor="#9CA3AF" value={name}
                  onChangeText={setName} autoCapitalize="words" returnKeyType="next"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input} placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input} placeholder="Min. 6 characters"
                  placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword}
                  secureTextEntry={!showPassword} returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                confirmPassword.length > 0 && password !== confirmPassword && styles.inputError,
              ]}>
                <MaterialIcons name="lock-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input} placeholder="Repeat your password"
                  placeholderTextColor="#9CA3AF" value={confirmPassword}
                  onChangeText={setConfirmPassword} secureTextEntry={!showPassword}
                  returnKeyType="done" onSubmitEditing={handleRegister}
                />
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.btnDisabled]}
              onPress={handleRegister} disabled={loading} activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#2563EB', '#3B82F6']} style={styles.registerBtnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerBtnText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.loginLinkHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  headerGradient: { paddingTop: 20, paddingBottom: 48, alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: 20, left: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerContent: { alignItems: 'center', marginTop: 16 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  appName: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40, marginTop: -24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 24, elevation: 6,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 12,
  },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 4 },
  registerBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  registerBtnGradient: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  btnDisabled: { opacity: 0.6 },
  loginLink: { marginTop: 18, alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: '#6B7280' },
  loginLinkHighlight: { color: '#2563EB', fontWeight: '700' },
});
