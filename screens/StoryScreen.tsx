import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const storyParts = [
  "نحن قوم أعزَّنا الله بالإسلام، فمهما ابتغينا العزَّة في غيره أذلَّنا الله",
  "يُعدّ الحسن بن الهيثم (965-1040م)، المعروف في الغرب باسم 'Alhazen'، أحد أعظم العلماء في التاريخ، ورائدًا في علم البصريات والمنهج العلمي.",
  "وُلد في البصرة وأمضى حياته في بغداد والقاهرة، حيث غيّر مسار العلوم بإسهاماته الخالدة.",
  "يُلقَّب بـ'أبي البصريات' بفضل كتابه 'كتاب المناظر'، الذي وضع فيه أسس علم البصريات الحديث.",
  "قدّم التفسير الصحيح للرؤية، مؤكدًا أن العين تتلقى الضوء من الأجسام، وليس العكس كما كان سائدًا في عصره.",
  "كان ابن الهيثم أول من طبّق المنهج العلمي القائم على التجربة والملاحظة قبل غاليليو بستة قرون.",
  "قولته الشهيرة: 'من طلب الحقيقة فليبدأ بالشك' أصبحت أساسًا للبحث العلمي.",
  "إرث ابن الهيثم ليس مجرد صفحات من التاريخ، بل هو شعلة تنير طريقنا نحو استعادة الريادة العلمية."
];

export default function StoryScreen({ navigation }: any) {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fadeInText();
  }, [currentPartIndex]);

  const fadeInText = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (currentPartIndex < storyParts.length - 1) {
      setCurrentPartIndex(prev => prev + 1);
    } else {
      navigation.replace('Home');
    }
  };

  const handleSkip = () => {
    navigation.replace('Home');
  };  const { width: screenWidth } = useWindowDimensions();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        {storyParts.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentPartIndex && styles.progressDotActive
            ]}
          />
        ))}
      </View>
    );
  };

  const renderGeometricPattern = () => {
    return (
      <Animated.View style={[styles.geometricPattern, { transform: [{ rotate: spin }] }]}>
        <MaterialCommunityIcons name="hexagon-outline" size={300} color="rgba(255,255,255,0.05)" />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2e4a4f', '#101110bc']}
        style={styles.gradient}
      >
        {renderGeometricPattern()}
        <View style={styles.contentContainer}>          {renderProgressDots()}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <MaterialIcons name="skip-next" size={24} color="#fff" />
            <Text style={styles.skipText}>تخطي</Text>
          </TouchableOpacity>

          <Animated.Text style={[styles.storyText, { opacity: fadeAnim }]}>
            {storyParts[currentPartIndex]}
          </Animated.Text>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentPartIndex === storyParts.length - 1 ? 'ابدأ' : 'التالي'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    zIndex: 2,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  geometricPattern: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -150,
    marginTop: -150,
    opacity: 0.5,
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  storyText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});