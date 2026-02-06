import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  LogOut,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Briefcase,
  Trash2,
} from 'lucide-react-native';
import { router } from 'expo-router';

interface EmployeeProfile {
  position_type: string;
  years_experience: number;
  availability: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  skills: string[];
  certifications: string[];
}

interface EmployerProfile {
  business_name: string;
  business_type: string;
  website: string;
  description: string;
}

export default function ProfileScreen() {
  const { user, profile, userType, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeProfile, setEmployeeProfile] =
    useState<EmployeeProfile | null>(null);
  const [employerProfile, setEmployerProfile] =
    useState<EmployerProfile | null>(null);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
  });

  useEffect(() => {
    if (user && userType) {
      fetchExtendedProfile();
    }
  }, [user, userType]);

  const fetchExtendedProfile = async () => {
    if (!user) return;

    try {
      if (userType === 'employee') {
        const { data, error } = await supabase
          .from('employee_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setEmployeeProfile(data);
      } else {
        const { data, error } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setEmployerProfile(data);
      }
    } catch (error) {
      console.error('Error fetching extended profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Delete user data from database (cascade will handle related records)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Sign out the user
      await signOut();

      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.',
        [{ text: 'OK', onPress: () => router.replace('/welcome') }]
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>

        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {userType === 'employee' ? 'Employee' : 'Employer'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <TouchableOpacity
            onPress={() => (editing ? handleSave() : setEditing(true))}
            disabled={loading}
          >
            <Text style={styles.editButton}>
              {loading ? 'Saving...' : editing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Mail size={20} color="#8B5CF6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Phone size={20} color="#8B5CF6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  placeholder="Add phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile?.phone || 'Not provided'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color="#8B5CF6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                  placeholder="Add location"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile?.location || 'Not provided'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoRowColumn}>
            <View style={styles.iconContainer}>
              <Text style={styles.bioIcon}>Bio</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>About</Text>
              {editing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bio: text })
                  }
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile?.bio || 'Not provided'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {userType === 'employee' && employeeProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Briefcase size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Position</Text>
                <Text style={[styles.infoValue, styles.capitalize]}>
                  {employeeProfile.position_type}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Clock size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>
                  {employeeProfile.years_experience} years
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <DollarSign size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Desired Rate</Text>
                <Text style={styles.infoValue}>
                  ${employeeProfile.hourly_rate_min}-$
                  {employeeProfile.hourly_rate_max}/hr
                </Text>
              </View>
            </View>

            {employeeProfile.skills.length > 0 && (
              <View style={styles.skillsSection}>
                <Text style={styles.infoLabel}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {employeeProfile.skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {userType === 'employer' && employerProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Briefcase size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Business Name</Text>
                <Text style={styles.infoValue}>
                  {employerProfile.business_name || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.bioIcon}>Type</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Business Type</Text>
                <Text style={[styles.infoValue, styles.capitalize]}>
                  {employerProfile.business_type}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#8B5CF6" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <View style={styles.dangerCard}>
          <Text style={styles.dangerDescription}>
            Once you delete your account, there is no going back. Please be
            certain.
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>
              {loading ? 'Deleting...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
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
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  badgeContainer: {
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  badgeText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    padding: 24,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowColumn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bioIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  skillsSection: {
    paddingTop: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  skillText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  dangerSection: {
    padding: 24,
    paddingTop: 8,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 12,
  },
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerDescription: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
