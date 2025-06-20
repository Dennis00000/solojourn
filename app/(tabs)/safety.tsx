import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Shield, Phone, TriangleAlert as AlertTriangle, MapPin, Users, FileText, ChevronRight, ExternalLink, Flag, Heart, Clock, Globe } from 'lucide-react-native';
import { SafeAreaView as SafeAreaViewSafeAreaContext } from 'react-native-safe-area-context';

interface SafetyTip {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'communication' | 'health' | 'money';
}

interface EmergencyContact {
  country: string;
  police: string;
  medical: string;
  fire: string;
}

const safetyTips: SafetyTip[] = [
  {
    id: '1',
    title: 'Share Your Itinerary',
    description: 'Always share your travel plans with someone you trust. Include accommodation details, transportation, and planned activities.',
    category: 'communication',
  },
  {
    id: '2',
    title: 'Keep Emergency Contacts Handy',
    description: 'Save local emergency numbers and embassy contacts in your phone. Consider downloading offline maps.',
    category: 'communication',
  },
  {
    id: '3',
    title: 'Trust Your Instincts',
    description: 'If something doesn\'t feel right, remove yourself from the situation. Your safety is more important than being polite.',
    category: 'general',
  },
  {
    id: '4',
    title: 'Secure Your Valuables',
    description: 'Use hotel safes, money belts, and avoid displaying expensive items. Keep backup copies of important documents.',
    category: 'money',
  },
];

const emergencyContacts: EmergencyContact[] = [
  { country: 'Thailand', police: '191', medical: '1669', fire: '199' },
  { country: 'Japan', police: '110', medical: '119', fire: '119' },
  { country: 'United Kingdom', police: '999', medical: '999', fire: '999' },
  { country: 'Australia', police: '000', medical: '000', fire: '000' },
];

const regionTips = [
  {
    region: 'Southeast Asia',
    tips: ['Stay hydrated and protect against mosquitoes', 'Respect local customs and dress codes', 'Be cautious with street food initially'],
  },
  {
    region: 'Europe',
    tips: ['Watch for pickpockets in tourist areas', 'Keep emergency cash in euros', 'Validate public transport tickets'],
  },
  {
    region: 'Latin America',
    tips: ['Learn basic Spanish/Portuguese phrases', 'Use official taxis or ride-sharing apps', 'Keep a low profile with valuables'],
  },
];

export default function SafetyScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleEmergencyCall = (number: string, country: string) => {
    Alert.alert(
      'Emergency Call',
      `Call ${number} for emergency services in ${country}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log(`Calling ${number}`) },
      ]
    );
  };

  const handleReportUser = () => {
    Alert.alert(
      'Report User or Content',
      'This will help us keep the community safe. Please provide details about the issue.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Opening report form') },
      ]
    );
  };

  const CategoryButton = ({ title, icon: IconComponent, isSelected, onPress }: {
    title: string;
    icon: any;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.categoryButton, isSelected && styles.selectedCategoryButton]}
      onPress={onPress}
    >
      <IconComponent 
        size={18} 
        color={isSelected ? '#FFFFFF' : '#64748B'} 
      />
      <Text style={[
        styles.categoryButtonText,
        isSelected && styles.selectedCategoryButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const SafetyTipCard = ({ tip }: { tip: SafetyTip }) => (
    <View style={styles.tipCard}>
      <Text style={styles.tipTitle}>{tip.title}</Text>
      <Text style={styles.tipDescription}>{tip.description}</Text>
    </View>
  );

  const EmergencyContactCard = ({ contact }: { contact: EmergencyContact }) => (
    <View style={styles.emergencyCard}>
      <View style={styles.emergencyHeader}>
        <Globe size={18} color="#EF4444" />
        <Text style={styles.countryName}>{contact.country}</Text>
      </View>
      <View style={styles.emergencyNumbers}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => handleEmergencyCall(contact.police, contact.country)}
        >
          <Shield size={16} color="#EF4444" />
          <Text style={styles.emergencyLabel}>Police</Text>
          <Text style={styles.emergencyNumber}>{contact.police}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => handleEmergencyCall(contact.medical, contact.country)}
        >
          <Heart size={16} color="#EF4444" />
          <Text style={styles.emergencyLabel}>Medical</Text>
          <Text style={styles.emergencyNumber}>{contact.medical}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => handleEmergencyCall(contact.fire, contact.country)}
        >
          <AlertTriangle size={16} color="#EF4444" />
          <Text style={styles.emergencyLabel}>Fire</Text>
          <Text style={styles.emergencyNumber}>{contact.fire}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <SafeAreaViewSafeAreaContext edges={['top']} style={styles.fixedHeader}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Safety</Text>
        </View>
      </SafeAreaViewSafeAreaContext>
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Emergency Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Phone size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Call Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleReportUser}>
              <Flag size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <MapPin size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Share Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Tips Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            <CategoryButton
              title="All"
              icon={Shield}
              isSelected={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
            />
            <CategoryButton
              title="Communication"
              icon={Phone}
              isSelected={selectedCategory === 'communication'}
              onPress={() => setSelectedCategory('communication')}
            />
            <CategoryButton
              title="General"
              icon={Users}
              isSelected={selectedCategory === 'general'}
              onPress={() => setSelectedCategory('general')}
            />
            <CategoryButton
              title="Money"
              icon={FileText}
              isSelected={selectedCategory === 'money'}
              onPress={() => setSelectedCategory('money')}
            />
          </ScrollView>

          <View style={styles.tipsContainer}>
            {safetyTips
              .filter(tip => selectedCategory === 'all' || tip.category === selectedCategory)
              .map((tip) => (
                <SafetyTipCard key={tip.id} tip={tip} />
              ))}
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts by Country</Text>
          {emergencyContacts.map((contact, index) => (
            <EmergencyContactCard key={index} contact={contact} />
          ))}
        </View>

        {/* Regional Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regional Safety Guidelines</Text>
          {regionTips.map((region, index) => (
            <View key={index} style={styles.regionCard}>
              <View style={styles.regionHeader}>
                <MapPin size={18} color="#0EA5E9" />
                <Text style={styles.regionName}>{region.region}</Text>
              </View>
              {region.tips.map((tip, tipIndex) => (
                <View key={tipIndex} style={styles.regionTip}>
                  <Text style={styles.regionTipText}>• {tip}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Community Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Guidelines</Text>
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesText}>
              Our community is built on trust and mutual respect. We verify all users to ensure authentic connections between solo travelers.
            </Text>
            <TouchableOpacity style={styles.guidelinesButton}>
              <Text style={styles.guidelinesButtonText}>Read Full Guidelines</Text>
              <ChevronRight size={16} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  reportButton: {
    padding: 8,
  },
  scrollContent: {
    marginTop: 72, // height of header
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  tipsContainer: {
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emergencyNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyLabel: {
    fontSize: 11,
    color: '#7F1D1D',
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  regionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  regionTip: {
    marginBottom: 6,
  },
  regionTipText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guidelinesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    marginBottom: 16,
  },
  guidelinesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guidelinesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
});