import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react-native';

export default function ConfirmEmailScreen() {
  const { resendConfirmationEmail } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendError('');
    setResendSuccess(false);
    setResendLoading(true);
    const { error } = await resendConfirmationEmail(email.trim());
    setResendLoading(false);
    if (error) {
      setResendError(error.message ?? 'Failed to resend email');
    } else {
      setResendSuccess(true);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.iconWrap}>
        <Mail size={56} color="#8B5CF6" />
      </View>
      <Text style={styles.title}>Confirm your email</Text>
      <Text style={styles.message}>
        We sent a confirmation link to
        {email ? <Text style={styles.email}> {email}</Text> : ' your email'}.
        Tap the link in that email to activate your account and sign in.
      </Text>
      <Text style={styles.note}>
        Opening the link will bring you back to the app and sign you in.
      </Text>

      {resendSuccess && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>Email sent! Check your inbox.</Text>
        </View>
      )}
      {resendError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{resendError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.resendButton, resendLoading && styles.buttonDisabled]}
        onPress={handleResend}
        disabled={resendLoading || !email.trim()}
      >
        <Text style={styles.resendButtonText}>
          {resendLoading ? 'Sending…' : 'Resend confirmation email'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/login')}
      >
        <ArrowLeft size={20} color="#8B5CF6" />
        <Text style={styles.backButtonText}>Back to sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  email: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  errorText: {
    color: '#C00',
    fontSize: 14,
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
