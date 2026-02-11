import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { Banner } from '@/types';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const BANNER_HEIGHT = 160;

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanners = banners.filter(b => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % activeBanners.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, activeBanners.length]);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_WIDTH);
    setActiveIndex(index);
  };

  if (activeBanners.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {activeBanners.map((banner, index) => (
          <View key={banner.id} style={styles.bannerWrapper}>
            <Image
              source={{ uri: banner.image }}
              style={styles.bannerImage}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            >
              <View style={styles.textContainer}>
                <Animated.Text style={styles.title}>{banner.title}</Animated.Text>
                <Animated.Text style={styles.subtitle}>{banner.subtitle}</Animated.Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
      
      {activeBanners.length > 1 && (
        <View style={styles.pagination}>
          {activeBanners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  bannerWrapper: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  textContainer: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});
