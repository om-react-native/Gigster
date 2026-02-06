import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, MapPin, DollarSign, Clock } from 'lucide-react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoResume {
  id: string;
  employee_id: string;
  video_url: string;
  title: string;
  description: string;
  views_count: number;
  likes_count: number;
  employee_profile: {
    id: string;
    position_type: string;
    years_experience: number;
    hourly_rate_min: number;
    hourly_rate_max: number;
    skills: string[];
    profile: {
      full_name: string;
      location: string;
      avatar_url: string;
    };
  };
  is_liked?: boolean;
}

export default function DiscoverScreen() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_resumes')
        .select(`
          *,
          employee_profile:employee_profiles!inner(
            id,
            position_type,
            years_experience,
            hourly_rate_min,
            hourly_rate_max,
            skills,
            profile:profiles!inner(
              full_name,
              location,
              avatar_url
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (user && data) {
        const { data: likes } = await supabase
          .from('likes')
          .select('video_resume_id')
          .eq('employer_id', user.id);

        const likedVideoIds = new Set(likes?.map(l => l.video_resume_id) || []);

        const videosWithLikes = data.map(video => ({
          ...video,
          is_liked: likedVideoIds.has(video.id),
        }));

        setVideos(videosWithLikes);
      } else {
        setVideos(data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId: string, employeeId: string) => {
    if (!user) return;

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    try {
      if (video.is_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('employer_id', user.id)
          .eq('video_resume_id', videoId);

        await supabase.rpc('decrement_likes', { video_id: videoId });
      } else {
        await supabase
          .from('likes')
          .insert({
            employer_id: user.id,
            video_resume_id: videoId,
            employee_id: employeeId,
          });

        await supabase.rpc('increment_likes', { video_id: videoId });
      }

      setVideos(prev =>
        prev.map(v =>
          v.id === videoId
            ? {
                ...v,
                is_liked: !v.is_liked,
                likes_count: v.is_liked ? v.likes_count - 1 : v.likes_count + 1,
              }
            : v
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const renderVideo = ({ item }: { item: VideoResume }) => {
    const profile = item.employee_profile.profile;
    const rateRange = item.employee_profile.hourly_rate_min && item.employee_profile.hourly_rate_max
      ? `$${item.employee_profile.hourly_rate_min}-${item.employee_profile.hourly_rate_max}/hr`
      : 'Rate not specified';

    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.placeholderText}>Video Player</Text>
          <Text style={styles.placeholderSubtext}>
            {item.title}
          </Text>
        </View>

        <View style={styles.overlay}>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.position}>{item.employee_profile.position_type}</Text>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Clock size={16} color="#FFFFFF" />
                <Text style={styles.detailText}>
                  {item.employee_profile.years_experience} years
                </Text>
              </View>
              <View style={styles.detailItem}>
                <DollarSign size={16} color="#FFFFFF" />
                <Text style={styles.detailText}>{rateRange}</Text>
              </View>
            </View>

            {profile.location && (
              <View style={styles.locationRow}>
                <MapPin size={16} color="#FFFFFF" />
                <Text style={styles.locationText}>{profile.location}</Text>
              </View>
            )}

            {item.employee_profile.skills.length > 0 && (
              <View style={styles.skillsContainer}>
                {item.employee_profile.skills.slice(0, 3).map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id, item.employee_id)}
            >
              <Heart
                size={32}
                color={item.is_liked ? '#A78BFA' : '#FFFFFF'}
                fill={item.is_liked ? '#A78BFA' : 'transparent'}
              />
              <Text style={styles.actionText}>{item.likes_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading talent...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Video Resumes Yet</Text>
        <Text style={styles.emptyText}>
          Check back soon to discover amazing talent!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          const index = Math.round(offsetY / SCREEN_HEIGHT);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#1A1A1A',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: '#999',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  position: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A78BFA',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
