import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Video, MapPin, DollarSign, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';

export default function EmployeeHomeScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{profile?.full_name}!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Video size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Video Views</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <MapPin size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Profile Views</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/my-video')}
        >
          <View style={styles.actionIconContainer}>
            <Video size={28} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Create Video Resume</Text>
            <Text style={styles.actionDescription}>
              Record a video to showcase your skills and personality
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={styles.actionIconContainer}>
            <DollarSign size={28} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Update Your Profile</Text>
            <Text style={styles.actionDescription}>
              Keep your experience and availability up to date
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/messages')}
        >
          <View style={styles.actionIconContainer}>
            <Calendar size={28} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Check Messages</Text>
            <Text style={styles.actionDescription}>
              View messages from interested employers
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>Pro Tip</Text>
        <Text style={styles.tipText}>
          A great video resume is 30-60 seconds long and shows your personality!
          Talk about your experience, what you love about hospitality, and what makes you unique.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipContainer: {
    margin: 24,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
