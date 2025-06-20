import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Search,
  MapPin,
  Star,
  Filter,
  Bed,
  Coffee,
  Camera,
  Shield,
  Users,
  Heart,
} from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface POI {
  id: string;
  name: string;
  category: 'accommodation' | 'food' | 'activity' | 'safety';
  location: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  price?: string;
  soloFriendly: boolean;
  addedBy: string;
}

const mockPOIs: POI[] = [
  {
    id: '1',
    name: 'The Solo Traveler Hostel',
    category: 'accommodation',
    location: 'Bangkok, Thailand',
    rating: 4.8,
    reviews: 324,
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Safe, clean hostel with great community areas for solo travelers',
    price: '$12/night',
    soloFriendly: true,
    addedBy: 'Emma Chen',
  },
  {
    id: '2',
    name: 'Mama\'s Local Kitchen',
    category: 'food',
    location: 'Hanoi, Vietnam',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Authentic Vietnamese cuisine, very welcoming to solo diners',
    soloFriendly: true,
    addedBy: 'Marcus Silva',
  },
  {
    id: '3',
    name: 'Hidden Temple Trek',
    category: 'activity',
    location: 'Ubud, Bali',
    rating: 4.7,
    reviews: 89,
    image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Peaceful hiking trail to secluded temple, perfect for solo reflection',
    soloFriendly: true,
    addedBy: 'Sofia Rodriguez',
  },
  {
    id: '4',
    name: 'Safe Night Market',
    category: 'food',
    location: 'Taipei, Taiwan',
    rating: 4.6,
    reviews: 267,
    image: 'https://images.pexels.com/photos/4148997/pexels-photo-4148997.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Well-lit night market with friendly vendors, safe for solo evening visits',
    soloFriendly: true,
    addedBy: 'Alex Journey',
  },
];

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

const categories = [
  { id: 'all', name: 'All', icon: MapPin, color: '#0EA5E9' },
  { id: 'accommodation', name: 'Stay', icon: Bed, color: '#10B981' },
  { id: 'food', name: 'Food', icon: Coffee, color: '#F59E0B' },
  { id: 'activity', name: 'Activities', icon: Camera, color: '#8B5CF6' },
  { id: 'safety', name: 'Safety', icon: Shield, color: '#EF4444' },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pois, setPois] = useState<POI[]>(mockPOIs);

  const filteredPOIs = pois.filter(poi => {
    const matchesSearch = poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poi.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || poi.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation': return Bed;
      case 'food': return Coffee;
      case 'activity': return Camera;
      case 'safety': return Shield;
      default: return MapPin;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accommodation': return '#10B981';
      case 'food': return '#F59E0B';
      case 'activity': return '#8B5CF6';
      case 'safety': return '#EF4444';
      default: return '#0EA5E9';
    }
  };

  const POICard = ({ poi }: { poi: POI }) => {
    const IconComponent = getCategoryIcon(poi.category);
    const categoryColor = getCategoryColor(poi.category);

    return (
      <TouchableOpacity style={styles.poiCard}>
        <Image source={{ uri: poi.image }} style={styles.poiImage} />
        
        <View style={styles.poiContent}>
          <View style={styles.poiHeader}>
            <View style={styles.categoryBadge}>
              <IconComponent size={12} color={categoryColor} />
            </View>
            {poi.soloFriendly && (
              <View style={styles.soloFriendlyBadge}>
                <Users size={12} color="#10B981" />
                <Text style={styles.soloFriendlyText}>Solo Friendly</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.poiName} numberOfLines={1}>{poi.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.poiLocation}>{poi.location}</Text>
          </View>
          
          <Text style={styles.poiDescription} numberOfLines={2}>
            {poi.description}
          </Text>
          
          <View style={styles.poiFooter}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{poi.rating}</Text>
              <Text style={styles.reviews}>({poi.reviews} reviews)</Text>
            </View>
            {poi.price && (
              <Text style={styles.price}>{poi.price}</Text>
            )}
          </View>
          
          <Text style={styles.addedBy}>Added by {poi.addedBy}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaViewRN style={styles.container}>
      {/* Fixed Header */}
      <SafeAreaViewRN edges={['top']} style={styles.fixedHeader}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </SafeAreaViewRN>
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, cities, experiences..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  isSelected && { backgroundColor: category.color + '15', borderColor: category.color },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <IconComponent 
                  size={14}
                  color={isSelected ? category.color : '#64748B'} 
                />
                <Text style={[
                  styles.categoryText,
                  isSelected && { color: category.color, fontWeight: '600' }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {/* Interactive Map */}
        <View style={styles.mapSectionContainer}>
          <Text style={styles.mapLabel}>🌍 Interactive Map</Text>
          <Text style={styles.mapSubtext}>Tap pins to see details</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 20,
              longitude: 0,
              latitudeDelta: 100,
              longitudeDelta: 100,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {/* Example markers for POIs */}
            {filteredPOIs.map((poi) => (
              <Marker
                key={poi.id}
                coordinate={{
                  latitude: 20 + Math.random() * 40 - 20, // Placeholder: randomize for demo
                  longitude: Math.random() * 360 - 180,
                }}
                title={poi.name}
                description={poi.location}
              />
            ))}
          </MapView>
        </View>
        {/* Top Travelers */}
        <View style={{ marginTop: 24, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0EA5E9' }}>Top Travelers</Text>
            <Ionicons name="trending-up" size={16} color="#0EA5E9" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginTop: 12 }}>
            {topTravelers.map((traveler) => (
              <View key={traveler.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginRight: 16, alignItems: 'center', width: 130, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <View style={{ position: 'relative', marginBottom: 8 }}>
                  <Image source={{ uri: traveler.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                  {traveler.isPremium && (
                    <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#1F2937', borderRadius: 8, padding: 2, minWidth: 14, minHeight: 14, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="trophy-outline" size={8} color="#FFD700" />
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginBottom: 4 }}>{traveler.name}</Text>
                <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '500' }}>{traveler.badge}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#F59E0B' }}>{traveler.rating}</Text>
                </View>
                <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>{traveler.countries} countries</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        {/* POI List */}
        <ScrollView style={styles.poiList} showsVerticalScrollIndicator={false}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {selectedCategory === 'all' ? 'All Places' : categories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={styles.resultCount}>{filteredPOIs.length} results</Text>
          </View>
          
          {filteredPOIs.map((poi) => (
            <POICard key={poi.id} poi={poi} />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaViewRN>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginRight: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  mapSectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    paddingTop: 12,
    alignItems: 'center',
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  mapSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
  },
  poiList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultCount: {
    fontSize: 14,
    color: '#64748B',
  },
  poiCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  poiImage: {
    width: '100%',
    height: 160,
  },
  poiContent: {
    padding: 16,
  },
  poiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    padding: 6,
    borderRadius: 8,
  },
  soloFriendlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  soloFriendlyText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#10B981',
  },
  poiName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  poiLocation: {
    fontSize: 14,
    color: '#64748B',
  },
  poiDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
  },
  poiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviews: {
    fontSize: 12,
    color: '#64748B',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  addedBy: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  scrollContent: {
    marginTop: 72, // height of header
    flex: 1,
  },
});