import { BACKEND_URL } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useContacts, Card } from '@/lib/contacts-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, RotateCcw, Check, Camera, ImageIcon, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { useSubscription } from '@/lib/subscription-context';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Platform,
  StyleSheet,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

type ScanStep = 'capture-front' | 'capture-back' | 'processing' | 'review';

export default function ScanScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { addCard, findDuplicate } = useContacts();
  const { canScan, recordScan, scansUsed, scansLimit, isPro } = useSubscription();

  const colors = premiumColors(isDark);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Camera permission is loaded asynchronously

  const [step, setStep] = useState<ScanStep>('capture-front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Card> | null>(null);
  const [processing, setProcessing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  // --- Animation shared values ---
  // Scan line Y position
  const scanLinePos = useSharedValue(10);
  // Card frame pulse opacity
  const framePulse = useSharedValue(1);
  // Processing spinner rotation
  const spinValue = useSharedValue(0);
  // Save button glow pulse
  const savePulse = useSharedValue(0);

  // Start scan line + frame pulse animations on mount
  useEffect(() => {
    scanLinePos.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000 }),
        withTiming(160, { duration: 2000 })
      ),
      -1,
      true
    );
    framePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  // Step-dependent animations
  useEffect(() => {
    if (step === 'processing') {
      spinValue.value = 0;
      spinValue.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1
      );
    }
    if (step === 'review') {
      savePulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [step]);

  const scanLineAnimStyle = useAnimatedStyle(() => ({
    top: scanLinePos.value,
  }));

  const framePulseStyle = useAnimatedStyle(() => ({
    opacity: framePulse.value,
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${spinValue.value}deg` }],
  }));

  const savePulseStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + savePulse.value * 0.5,
    shadowRadius: 12 + savePulse.value * 10,
  }));

  useEffect(() => {
    if (params.mode === 'gallery') {
      pickFromGallery('front');
    }
  }, []);

  const pickFromGallery = async (side: 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const base64 = result.assets[0].base64 || '';
      if (side === 'front') {
        setFrontImage(`data:image/jpeg;base64,${base64}`);
        askForBackSide(base64);
      } else {
        setBackImage(`data:image/jpeg;base64,${base64}`);
        const frontBase64 = frontImage?.includes('base64,') ? frontImage.split('base64,')[1] : '';
        processImages(frontBase64, base64);
      }
    }
  };

  const askForBackSide = (frontBase64: string) => {
    Alert.alert(
      'Back Side',
      'Does this card have a back side with additional info?',
      [
        {
          text: 'No, Process Now',
          style: 'cancel',
          onPress: () => {
            processImages(frontBase64, undefined);
          },
        },
        {
          text: 'Yes, Scan Back',
          onPress: () => {
            setStep('capture-back');
          },
        },
      ]
    );
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
    if (!photo?.base64) return;

    const imageUri = `data:image/jpeg;base64,${photo.base64}`;

    if (step === 'capture-front') {
      setFrontImage(imageUri);
      askForBackSide(photo.base64);
    } else if (step === 'capture-back') {
      setBackImage(imageUri);
      const frontBase64 = frontImage?.includes('base64,') ? frontImage.split('base64,')[1] : '';
      processImages(frontBase64, photo.base64);
    }
  };

  const processImages = async (front?: string, back?: string) => {
    setStep('processing');
    setProcessing(true);

    try {
      const frontBase64 = frontImage?.includes('base64,')
        ? frontImage.split('base64,')[1]
        : front || '';
      const backBase64 = backImage?.includes('base64,')
        ? backImage.split('base64,')[1]
        : back || '';

      const allowed = await recordScan();
      if (!allowed) {
        setProcessing(false);
        setStep('capture-front');
        return;
      }

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          frontImage: frontBase64,
          backImage: backBase64 || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setExtractedData(json.data);
        setStep('review');
        // Haptic feedback: scan completed successfully
        Vibration.vibrate([0, 80, 60, 80]);
      } else {
        Alert.alert('Error', json.error || 'Failed to process card');
        setStep('capture-front');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to process card';
      Alert.alert('Error', message);
      setStep('capture-front');
    } finally {
      setProcessing(false);
    }
  };

  const skipBack = () => {
    const frontBase64 = frontImage?.includes('base64,')
      ? frontImage.split('base64,')[1]
      : '';
    processImages(frontBase64, undefined);
  };

  const doSaveCard = async () => {
    if (!extractedData) return;
    setProcessing(true);

    try {
      const card = await addCard({
        ...extractedData,
        front_image_url: frontImage || '',
        back_image_url: backImage || '',
      });

      if (card) {
        // Haptic feedback: card saved successfully
        Vibration.vibrate(100);
        router.replace(`/card/${card.id}`);
      } else {
        Alert.alert('Save Failed', 'Could not save the card. Please check your internet connection and try again.');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An error occurred';
      Alert.alert('Save Failed', message);
    } finally {
      setProcessing(false);
    }
  };

  const saveCard = () => {
    if (!extractedData) return;

    // Check for duplicate contacts before saving
    const duplicate = findDuplicate(extractedData);
    if (duplicate) {
      const dupLabel = duplicate.name || duplicate.email || duplicate.phone || 'Unknown';
      Alert.alert(
        'Duplicate Contact',
        `A contact matching "${dupLabel}" already exists. Do you still want to save?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'View Existing',
            onPress: () => router.push(`/card/${duplicate.id}`),
          },
          {
            text: 'Save Anyway',
            style: 'destructive',
            onPress: () => doSaveCard(),
          },
        ],
      );
      return;
    }

    doSaveCard();
  };

  const resetScan = () => {
    setFrontImage(null);
    setBackImage(null);
    setExtractedData(null);
    setStep('capture-front');
  };

  // Permission handling - show loading while checking
  if (!permission) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius['2xl'],
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xl,
            }}
          >
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
            Checking camera access...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted && params.mode !== 'gallery') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['4xl'] }}>
          {/* Glow orb behind icon */}
          <View
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: colors.accentGlow,
              opacity: 0.3,
            }}
          />
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radius['2xl'],
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing['2xl'],
              borderWidth: 1,
              borderColor: isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.12)',
              ...colors.shadow.glow(colors.accent),
            }}
          >
            <Camera size={30} color={colors.accent} />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: spacing.sm,
              letterSpacing: -0.3,
            }}
          >
            Camera Permission Required
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: spacing['3xl'],
              lineHeight: 20,
            }}
          >
            We need camera access to scan business cards
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.accentDark,
              borderRadius: radius.lg,
              paddingHorizontal: spacing['4xl'],
              paddingVertical: 15,
              ...colors.shadow.glow(colors.accent),
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.xl }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Processing screen
  if (step === 'processing') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Ambient glow */}
          <View
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: colors.accentGlow,
              opacity: 0.25,
            }}
          />
          <Animated.View
            style={[spinStyle, {
              width: 80,
              height: 80,
              borderRadius: radius['3xl'],
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing['2xl'],
              borderWidth: 1,
              borderColor: isDark ? 'rgba(129, 140, 248, 0.25)' : 'rgba(99, 102, 241, 0.15)',
              ...colors.shadow.glow(colors.accent),
            }]}
          >
            <Sparkles size={34} color={colors.accent} />
          </Animated.View>
          <ActivityIndicator size="small" color={colors.accent} style={{ marginBottom: spacing.lg }} />
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '800',
              letterSpacing: -0.3,
            }}
          >
            Processing Card
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              marginTop: spacing.sm,
              fontWeight: '500',
            }}
          >
            AI is extracting contact details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Review screen
  if (step === 'review' && extractedData) {
    const fields = [
      { key: 'name', label: 'Name' },
      { key: 'job_title', label: 'Designation / Title' },
      { key: 'company', label: 'Company / Organisation' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone (+91)' },
      { key: 'website', label: 'Website' },
      { key: 'address', label: 'Address' },
      { key: 'notes', label: 'Notes (GST, PAN, etc.)' },
    ];

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing['2xl'],
            paddingVertical: spacing.lg,
          }}
        >
          <TouchableOpacity
            onPress={resetScan}
            activeOpacity={0.7}
            style={{
              borderRadius: radius.lg,
              padding: spacing.md,
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              ...colors.shadow.sm,
            }}
          >
            <RotateCcw size={16} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '800',
              letterSpacing: -0.3,
            }}
          >
            Review Details
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              borderRadius: radius.lg,
              padding: spacing.md,
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              ...colors.shadow.sm,
            }}
          >
            <X size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: spacing['2xl'] }}>
          {/* Card preview */}
          {frontImage && (
            <View
              style={{
                marginBottom: spacing['2xl'],
                flexDirection: 'row',
                gap: spacing.md,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: radius.xl,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  ...colors.shadow.sm,
                }}
              >
                <Image
                  source={{ uri: frontImage }}
                  style={{ height: 100 }}
                  resizeMode="cover"
                />
              </View>
              {backImage && (
                <View
                  style={{
                    flex: 1,
                    borderRadius: radius.xl,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    ...colors.shadow.sm,
                  }}
                >
                  <Image
                    source={{ uri: backImage }}
                    style={{ height: 100 }}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          )}

          {/* Editable fields */}
          {fields.map(({ key, label }, index) => (
            <Animated.View key={key} entering={FadeInDown.delay(index * 60)} style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: spacing.sm,
                }}
              >
                {label}
              </Text>
              <TextInput
                value={extractedData[key] || ''}
                onChangeText={(text) =>
                  setExtractedData((prev: Partial<Card> | null) => ({ ...(prev || {}), [key]: text }))
                }
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderRadius: radius.lg,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: 14,
                  fontSize: 14,
                  fontWeight: '500',
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                }}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor={colors.textMuted}
              />
            </Animated.View>
          ))}
        </ScrollView>

        {/* Save button */}
        <View style={{ paddingHorizontal: spacing['2xl'], paddingBottom: spacing['4xl'], paddingTop: spacing.lg }}>
          <Animated.View style={[savePulseStyle, { shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 } }]}>
            <TouchableOpacity
              onPress={saveCard}
              disabled={processing}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.md,
                paddingVertical: 18,
                backgroundColor: colors.accentDark,
                borderRadius: radius.xl,
                ...colors.shadow.glow(colors.accent),
              }}
            >
              {processing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Check size={22} color="#fff" strokeWidth={2.5} />
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: -0.3 }}>
                    Save Contact
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Camera capture screen
  const cameraBg = isDark ? '#06080f' : '#0a0d18';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cameraBg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            borderRadius: radius.lg,
            padding: spacing.md,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <X size={16} color="#fff" />
        </TouchableOpacity>

        {/* Step indicators */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                height: 6,
                width: 32,
                borderRadius: 3,
                backgroundColor: step === 'capture-front' ? colors.accent : colors.success,
                ...(step === 'capture-front' ? colors.shadow.glow(colors.accent) : {}),
              }}
            />
            <View
              style={{
                height: 6,
                width: 32,
                borderRadius: 3,
                backgroundColor:
                  step === 'capture-back'
                    ? colors.accent
                    : step === 'capture-front'
                      ? 'rgba(255,255,255,0.12)'
                      : colors.success,
                ...(step === 'capture-back' ? colors.shadow.glow(colors.accent) : {}),
              }}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          style={{
            borderRadius: radius.lg,
            padding: spacing.md,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <RotateCcw size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Step label */}
      <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: -0.3,
          }}
        >
          {step === 'capture-front' ? 'Scan Front Side' : 'Scan Back Side'}
        </Text>
        <Text
          style={{
            marginTop: spacing.xs,
            fontSize: 13,
            color: 'rgba(255,255,255,0.45)',
            fontWeight: '500',
          }}
        >
          {step === 'capture-front'
            ? 'Position the card within the frame'
            : 'Flip the card and scan the back'}
        </Text>
      </View>

      {/* Camera / Preview */}
      <View
        style={{
          flex: 1,
          marginHorizontal: spacing['2xl'],
          marginBottom: spacing.lg,
          overflow: 'hidden',
          borderRadius: radius['3xl'],
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {(step === 'capture-front' && !frontImage) || (step === 'capture-back' && !backImage) ? (
          Platform.OS === 'web' ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark ? '#0c1022' : '#111627',
              }}
            >
              <Camera size={40} color="rgba(255,255,255,0.2)" />
              <Text
                style={{
                  marginTop: spacing.lg,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: '500',
                }}
              >
                Camera not available on web
              </Text>
              <TouchableOpacity
                onPress={() => pickFromGallery(step === 'capture-front' ? 'front' : 'back')}
                style={{
                  backgroundColor: colors.accentDark,
                  borderRadius: radius.lg,
                  paddingHorizontal: spacing['2xl'],
                  paddingVertical: spacing.md,
                  marginTop: spacing.lg,
                  ...colors.shadow.glow(colors.accent),
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff' }}>
                  Select from Gallery
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
              />
              {/* Card frame overlay */}
              <View style={[StyleSheet.absoluteFill, styles.overlayContainer]}>
                <Animated.View
                  style={[framePulseStyle, {
                    width: '88%',
                    aspectRatio: 1.75,
                    borderWidth: 2,
                    borderColor: colors.accent,
                    borderRadius: radius.xl,
                    borderStyle: 'dashed',
                    overflow: 'hidden',
                    // Corner glow effect
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                  }]}
                >
                  {/* Animated scan line */}
                  <Animated.View
                    style={[scanLineAnimStyle, {
                      position: 'absolute',
                      left: 12,
                      right: 12,
                      height: 2,
                      backgroundColor: colors.accent,
                      borderRadius: 1,
                      shadowColor: colors.accent,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 10,
                    }]}
                  />
                </Animated.View>
              </View>
            </View>
          )
        ) : (
          <Image
            source={{ uri: step === 'capture-front' ? frontImage! : backImage! }}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Bottom actions */}
      <View
        style={{
          alignItems: 'center',
          paddingBottom: spacing['4xl'],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing['2xl'],
          }}
        >
          {/* Gallery pick */}
          <TouchableOpacity
            onPress={() => pickFromGallery(step === 'capture-front' ? 'front' : 'back')}
            style={{
              height: 46,
              width: 46,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.full,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <ImageIcon size={18} color="#fff" />
          </TouchableOpacity>

          {/* Capture button */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              onPress={takePicture}
              style={{
                height: 68,
                width: 68,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 34,
                borderWidth: 3,
                borderColor: colors.accent,
                ...colors.shadow.glow(colors.accent),
              }}
            >
              <View
                style={{
                  backgroundColor: '#ffffff',
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                }}
              />
            </TouchableOpacity>
          )}

          {/* Skip back */}
          {step === 'capture-back' ? (
            <TouchableOpacity
              onPress={skipBack}
              style={{
                height: 46,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.full,
                paddingHorizontal: spacing.xl,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 46 }} />
          )}
        </View>
        {!isPro && scansLimit !== -1 && (
          <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
            {scansUsed}/{scansLimit} free scans used
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
