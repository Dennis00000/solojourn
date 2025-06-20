import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const topTravelers = [
  {
    id: '1',
    name: 'Alex Journey',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 4.9,
    countries: 47,
    badge: 'Explorer',
    isPremium: true,
  },
  {
    id: '2',
    name: 'Maya Explorer',
    avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 4.8,
    countries: 39,
    badge: 'Adventurer',
    isPremium: false,
  },
  {
    id: '3',
    name: 'Jake Wanderer',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 4.7,
    countries: 34,
    badge: 'Nomad',
    isPremium: true,
  },
];

export default function TopTravelersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Travelers</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {topTravelers.map(traveler => (
          <View key={traveler.id} style={styles.travelerCard}>
            <Image source={{ uri: traveler.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{traveler.name}</Text>
              <View style={styles.row}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.rating}>{traveler.rating}</Text>
                <Text style={styles.countries}>{traveler.countries} countries</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{traveler.badge}</Text></View>
                {traveler.isPremium && (
                  <Ionicons name="trophy-outline" size={14} color="#FFD700" style={{ marginLeft: 6 }} />
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Poppins-Bold',
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 13,
    color: '#F59E0B',
    marginLeft: 4,
    marginRight: 12,
    fontWeight: '500',
  },
  countries: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 12,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
}); 