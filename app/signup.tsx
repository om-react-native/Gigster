import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, User } from 'lucide-react-native';
import { GoogleIcon, FacebookIcon } from '@/components/SocialIcons';

export default function SignUpScreen() {
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'employee' | 'employer' | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!userType) {
      setError('Please select if you are an employee or employer');
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      email.trim(),
      password,
      fullName.trim(),
      userType
    );

    setLoading(false);

    if (error) {
      setError(error.message || 'Failed to create account');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      setError(error.message ?? 'Google sign-in failed');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithFacebook();
    setLoading(false);
    if (error) {
      setError(error.message ?? 'Facebook sign-in failed');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Join Gigster</Text>
        <Text style={styles.subtitle}>Create your account to get started</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'employee' && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType('employee')}
          >
            <User
              size={32}
              color={userType === 'employee' ? '#8B5CF6' : '#666'}
            />
            <Text
              style={[
                styles.userTypeText,
                userType === 'employee' && styles.userTypeTextActive,
              ]}
            >
              Employee
            </Text>
            <Text style={styles.userTypeDescription}>Looking for work</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'employer' && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType('employer')}
          >
            <Briefcase
              size={32}
              color={userType === 'employer' ? '#8B5CF6' : '#666'}
            />
            <Text
              style={[
                styles.userTypeText,
                userType === 'employer' && styles.userTypeTextActive,
              ]}
            >
              Employer
            </Text>
            <Text style={styles.userTypeDescription}>Hiring talent</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.googleButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon size={20} />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.facebookButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleFacebookSignIn}
            disabled={loading}
          >
            <FacebookIcon size={20} />
            <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
              Facebook
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.back()}
        >
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.linkTextBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  userTypeButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginTop: 8,
  },
  userTypeTextActive: {
    color: '#8B5CF6',
  },
  userTypeDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    backgroundColor: '#FEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44',
  },
  errorText: {
    color: '#C00',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextBold: {
    fontWeight: '700',
    color: '#8B5CF6',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  facebookButtonText: {
    color: '#FFFFFF',
  },
});
