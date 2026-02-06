import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Video, Play, Pause, RotateCw, X, Check } from 'lucide-react-native';

export default function MyVideoScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    checkExistingVideo();
  }, [user]);

  const checkExistingVideo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_resumes')
        .select('*')
        .eq('employee_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHasVideo(true);
        setVideoData({
          title: data.title,
          description: data.description || '',
        });
      }
    } catch (error) {
      console.error('Error checking video:', error);
    }
  };

  const handleStartRecording = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to record videos');
        return;
      }
    }
    setShowCamera(true);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleSaveVideo = () => {
    Alert.alert(
      'Video Feature Coming Soon',
      'Video recording and upload will be available in the next update. For now, you can complete your profile and explore the app!',
      [{ text: 'OK' }]
    );
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={toggleCameraFacing}
              >
                <RotateCw size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraFooter}>
              <View style={styles.recordingInfo}>
                {isRecording && (
                  <>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>00:15</Text>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={handleRecord}
              >
                {isRecording ? (
                  <Pause size={32} color="#FFFFFF" />
                ) : (
                  <View style={styles.recordButtonInner} />
                )}
              </TouchableOpacity>

              {isRecording && (
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={handleSaveVideo}
                >
                  <Check size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Video Resume</Text>
        <Text style={styles.subtitle}>
          Show employers who you really are with a video
        </Text>
      </View>

      {hasVideo ? (
        <View style={styles.section}>
          <View style={styles.videoPreviewContainer}>
            <View style={styles.videoPreview}>
              <Play size={48} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{videoData.title}</Text>
            <Text style={styles.videoDescription}>{videoData.description}</Text>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleStartRecording}
          >
            <Video size={20} color="#8B5CF6" />
            <Text style={styles.secondaryButtonText}>Record New Video</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Video size={64} color="#8B5CF6" />
            </View>
            <Text style={styles.emptyTitle}>No Video Resume Yet</Text>
            <Text style={styles.emptyText}>
              Create a 30-60 second video to introduce yourself to potential employers.
              Show your personality and tell them why you'd be great!
            </Text>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for a Great Video Resume:</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Keep it between 30-60 seconds</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Find good lighting and a quiet space</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Smile and be yourself!</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Talk about your experience and strengths</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Share what you love about hospitality</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartRecording}
          >
            <Video size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Start Recording</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  section: {
    padding: 24,
  },
  videoPreviewContainer: {
    marginBottom: 24,
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFooter: {
    alignItems: 'center',
    gap: 16,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  recordButtonActive: {
    backgroundColor: '#FF0000',
  },
  recordButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  checkButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
