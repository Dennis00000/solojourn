import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  X,
  Check,
  Zap,
  MapPin,
  Shield,
  Users,
  Camera,
  MessageCircle,
  Star,
  Globe,
  Bookmark,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { router } from 'expo-router';

interface PremiumFeature {
  icon: any;
  title: string;
  description: string;
  color: string;
}

const premiumFeatures: PremiumFeature[] = [
  {
    icon: MapPin,
    title: 'Advanced Map Features',
    description: 'Access exclusive POIs, offline maps, and route planning tools',
    color: '#10B981',
  },
  {
    icon: Shield,
    title: 'Priority Safety Support',
    description: '24/7 emergency assistance and verified traveler network',
    color: '#EF4444',
  },
  {
    icon: Users,
    title: 'Premium Community',
    description: 'Connect with verified premium travelers and exclusive groups',
    color: '#8B5CF6',
  },
  {
    icon: Camera,
    title: 'Unlimited Content',
    description: 'Upload unlimited photos, videos, and create detailed itineraries',
    color: '#F59E0B',
  },
  {
    icon: MessageCircle,
    title: 'Priority Messaging',
    description: 'Send unlimited messages and get priority response times',
    color: '#0EA5E9',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    description: 'Track your travel stats, engagement metrics, and growth insights',
    color: '#EC4899',
  },
];

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    savings: null,
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$79.99',
    period: '/year',
    savings: 'Save 33%',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$199.99',
    period: 'one-time',
    savings: 'Best Value',
    popular: false,
  },
];

const testimonials = [
  {
    id: '1',
    name: 'Emma Chen',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
    text: 'Premium features made my solo travels so much safer and more organized. The offline maps saved me countless times!',
    location: 'Digital Nomad',
  },
  {
    id: '2',
    name: 'Marcus Silva',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
    text: 'The premium community is incredible. I\'ve made lifelong friends and travel partners through verified connections.',
    location: 'Adventure Seeker',
  },
];

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const FeatureCard = ({ feature }: { feature: PremiumFeature }) => {
    const IconComponent = feature.icon;
    return (
      <View style={styles.featureCard}>
        <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
          <IconComponent size={24} color={feature.color} />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
      </View>
    );
  };

  const PlanCard = ({ plan }: { plan: typeof plans[0] }) => {
    const isSelected = selectedPlan === plan.id;
    return (
      <TouchableOpacity
        style={[styles.planCard, isSelected && styles.selectedPlanCard]}
        onPress={() => setSelectedPlan(plan.id)}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.savings && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>{plan.savings}</Text>
            </View>
          )}
        </View>
        <View style={styles.planPricing}>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planPeriod}>{plan.period}</Text>
        </View>
        <View style={styles.planSelector}>
          <View style={[styles.radioButton, isSelected && styles.selectedRadioButton]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
    <View style={styles.testimonialCard}>
      <View style={styles.testimonialHeader}>
        <Image source={{ uri: testimonial.avatar }} style={styles.testimonialAvatar} />
        <View style={styles.testimonialInfo}>
          <Text style={styles.testimonialName}>{testimonial.name}</Text>
          <Text style={styles.testimonialLocation}>{testimonial.location}</Text>
          <View style={styles.testimonialRating}>
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.testimonialText}>{testimonial.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SoloJourn Premium</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#0EA5E9', '#0284C7', '#0369A1']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.crownContainer}>
              <Crown size={48} color="#FFD700" />
            </View>
            <Text style={styles.heroTitle}>Unlock Premium Travel</Text>
            <Text style={styles.heroSubtitle}>
              Join thousands of verified solo travelers with exclusive features and priority support
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>50K+</Text>
                <Text style={styles.heroStatLabel}>Premium Members</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>4.9★</Text>
                <Text style={styles.heroStatLabel}>App Rating</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>180+</Text>
                <Text style={styles.heroStatLabel}>Countries</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <Text style={styles.sectionSubtitle}>
            Everything you need for safe, connected, and memorable solo travel
          </Text>
          {premiumFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </View>

        {/* Comparison Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free vs Premium</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonFeature}>Feature</Text>
              <Text style={styles.comparisonColumn}>Free</Text>
              <Text style={styles.comparisonColumn}>Premium</Text>
            </View>
            
            {[
              { feature: 'Basic Posts & Stories', free: true, premium: true },
              { feature: 'Community Forum Access', free: true, premium: true },
              { feature: 'Safety Resources', free: true, premium: true },
              { feature: 'Advanced Map Features', free: false, premium: true },
              { feature: 'Unlimited Photo Uploads', free: false, premium: true },
              { feature: 'Priority Support', free: false, premium: true },
              { feature: 'Verified Network Access', free: false, premium: true },
              { feature: 'Offline Maps', free: false, premium: true },
            ].map((item, index) => (
              <View key={index} style={styles.comparisonRow}>
                <Text style={styles.comparisonFeatureText}>{item.feature}</Text>
                <View style={styles.comparisonCell}>
                  {item.free ? (
                    <Check size={16} color="#10B981" />
                  ) : (
                    <X size={16} color="#EF4444" />
                  )}
                </View>
                <View style={styles.comparisonCell}>
                  {item.premium ? (
                    <Check size={16} color="#10B981" />
                  ) : (
                    <X size={16} color="#EF4444" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <Text style={styles.sectionSubtitle}>
            Start your premium journey with a plan that fits your travel style
          </Text>
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Travelers Say</Text>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {[
              {
                question: 'Can I cancel my subscription anytime?',
                answer: 'Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.',
              },
              {
                question: 'Is my payment information secure?',
                answer: 'Absolutely. We use industry-standard encryption and work with trusted payment processors to keep your information safe.',
              },
              {
                question: 'Do you offer refunds?',
                answer: 'We offer a 7-day money-back guarantee for all new premium subscriptions. Contact support if you\'re not satisfied.',
              },
            ].map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <View style={styles.ctaContent}>
          <Text style={styles.ctaPrice}>
            {plans.find(p => p.id === selectedPlan)?.price}
            <Text style={styles.ctaPeriod}>
              {plans.find(p => p.id === selectedPlan)?.period}
            </Text>
          </Text>
          <Text style={styles.ctaSubtext}>7-day free trial • Cancel anytime</Text>
        </View>
        <TouchableOpacity style={styles.ctaButton}>
          <LinearGradient
            colors={['#0EA5E9', '#0284C7']}
            style={styles.ctaButtonGradient}
          >
            <Crown size={20} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Start Premium Trial</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 32,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    fontFamily: 'Inter-Regular',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  comparisonTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  comparisonFeature: {
    flex: 2,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter-SemiBold',
  },
  comparisonColumn: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  comparisonFeatureText: {
    flex: 2,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  savingsBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  planPeriod: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  planSelector: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: '#0EA5E9',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  testimonialLocation: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  bottomCTA: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  ctaPeriod: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  ctaSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});