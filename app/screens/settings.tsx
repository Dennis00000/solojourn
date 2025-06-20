import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 32 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="person-outline" size={20} color="#007AFF" style={styles.rowIcon} />
          <Text style={styles.rowText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="key-outline" size={20} color="#007AFF" style={styles.rowIcon} />
          <Text style={styles.rowText}>Change Password</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color="#007AFF" style={styles.rowIcon} />
          <Text style={styles.rowText}>Push Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="mail-outline" size={20} color="#007AFF" style={styles.rowIcon} />
          <Text style={styles.rowText}>Email Updates</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="lock-closed-outline" size={20} color="#007AFF" style={styles.rowIcon} />
          <Text style={styles.rowText}>Privacy Settings</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="information-circle-outline" size={20} color="#007AFF" style={styles.rowIcon} />
          <Text style={styles.rowText}>About Solo Journ</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 10,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 4,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowIcon: {
    marginRight: 16,
  },
  rowText: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  signOutButton: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F8D7DA',
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
}); 