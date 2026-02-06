import { View, Text, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ size = 'large' }: LogoProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const sizeConfig = {
    small: {
      iconSize: 32,
      fontSize: 28,
      iconContainerSize: 48,
    },
    medium: {
      iconSize: 40,
      fontSize: 40,
      iconContainerSize: 64,
    },
    large: {
      iconSize: 48,
      fontSize: 64,
      iconContainerSize: 80,
    },
  };

  const config = sizeConfig[size];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: config.iconContainerSize,
            height: config.iconContainerSize,
            borderRadius: config.iconContainerSize / 2,
          },
          animatedIconStyle,
        ]}
      >
        <View style={styles.iconInner}>
          <Play
            size={config.iconSize}
            color="#FFFFFF"
            fill="#FFFFFF"
          />
        </View>
      </Animated.View>
      <Text style={[styles.text, { fontSize: config.fontSize }]}>Gigster</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconInner: {
    backgroundColor: '#8B5CF6',
    width: '85%',
    height: '85%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: -1,
  },
});
