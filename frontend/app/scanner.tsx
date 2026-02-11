import { BACKEND_URL } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useContacts } from '@/lib/contacts-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, RotateCcw, Check, Camera, ImageIcon, Sparkles } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScanStep = 'capture-front' | 'capture-back' | 'processing' | 'review';

export default function ScanScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { addCard } = useContacts();

  const colors = {
    bg: isDark ? '#0c0f1a' : '#f5f7fa',
    cardBg: isDark ? '#161b2e' : '#ffffff',
    cardBorder: isDark ? '#1e2642' : '#e8ecf4',
    text: isDark ? '#eef0f6' : '#0f172a',
    textSub: isDark ? '#7c8db5' : '#64748b',
    accent: '#6366f1',
    accentSoft: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    inputBg: isDark ? '#111627' : '#f0f2f7',
  };

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Camera permission is loaded asynchronously

  const [step, setStep] = useState<ScanStep>('capture-front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

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
      } else {
        Alert.alert('Error', json.error || 'Failed to process card');
        setStep('capture-front');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to process card');
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

  const saveCard = async () => {
    if (!extractedData) return;
    setProcessing(true);

    try {
      const card = await addCard({
        ...extractedData,
        front_image_url: frontImage || '',
        back_image_url: backImage || '',
      });

      if (card) {
        router.replace(`/card/${card.id}`);
      } else {
        Alert.alert('Error', 'Failed to save card');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setProcessing(false);
    }
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textSub }} className="mt-4 text-[13px]">
            Checking camera access...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted && params.mode !== 'gallery') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View className="flex-1 items-center justify-center px-8">
          <View
            style={{ backgroundColor: colors.accentSoft }}
            className="h-16 w-16 items-center justify-center rounded-2xl mb-4"
          >
            <Camera size={28} color={colors.accent} />
          </View>
          <Text style={{ color: colors.text }} className="mb-2 text-center text-[16px] font-bold">
            Camera Permission Required
          </Text>
          <Text style={{ color: colors.textSub }} className="mb-6 text-center text-[13px]">
            We need camera access to scan business cards
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            activeOpacity={0.85}
            style={{ backgroundColor: colors.accent }}
            className="rounded-xl px-8 py-3.5"
          >
            <Text className="text-[13px] font-semibold text-white">Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text style={{ color: colors.textSub }} className="text-[13px]">Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Processing screen
  if (step === 'processing') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View className="flex-1 items-center justify-center">
          <View
            style={{ backgroundColor: colors.accentSoft }}
            className="h-20 w-20 items-center justify-center rounded-3xl mb-5"
          >
            <Sparkles size={32} color={colors.accent} />
          </View>
          <ActivityIndicator size="small" color={colors.accent} className="mb-4" />
          <Text style={{ color: colors.text }} className="text-[16px] font-bold">
            Processing Card
          </Text>
          <Text style={{ color: colors.textSub }} className="mt-1.5 text-[12px]">
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
      { key: 'job_title', label: 'Job Title' },
      { key: 'company', label: 'Company' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'website', label: 'Website' },
      { key: 'address', label: 'Address' },
      { key: 'notes', label: 'Notes' },
    ];

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity
            onPress={resetScan}
            activeOpacity={0.7}
            className="rounded-xl p-2.5"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
          >
            <RotateCcw size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-[15px] font-bold">
            Review Details
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="rounded-xl p-2.5"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }}
          >
            <X size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5">
          {/* Card preview */}
          {frontImage && (
            <View className="mb-5 flex-row" style={{ gap: 8 }}>
              <Image
                source={{ uri: frontImage }}
                className="h-24 flex-1 rounded-2xl"
                resizeMode="cover"
              />
              {backImage && (
                <Image
                  source={{ uri: backImage }}
                  className="h-24 flex-1 rounded-2xl"
                  resizeMode="cover"
                />
              )}
            </View>
          )}

          {/* Editable fields */}
          {fields.map(({ key, label }) => (
            <View key={key} className="mb-3">
              <Text
                style={{ color: colors.textSub }}
                className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
              >
                {label}
              </Text>
              <TextInput
                value={extractedData[key] || ''}
                onChangeText={(text) =>
                  setExtractedData((prev: any) => ({ ...prev, [key]: text }))
                }
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                }}
                className="rounded-xl px-4 py-3.5 text-[13px]"
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor={colors.textSub}
              />
            </View>
          ))}
        </ScrollView>

        {/* Save button */}
        <View className="px-5 pb-6 pt-2">
          <TouchableOpacity
            onPress={saveCard}
            disabled={processing}
            activeOpacity={0.85}
            className="flex-row items-center justify-center rounded-2xl py-4.5"
            style={{
              gap: 8,
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={18} color="#fff" />
                <Text className="text-[14px] font-semibold text-white">Save Contact</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Camera capture screen
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0d18' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-xl p-2.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <X size={16} color="#fff" />
        </TouchableOpacity>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View
            style={{ backgroundColor: step === 'capture-front' ? colors.accent : '#22c55e' }}
            className="h-1.5 w-8 rounded-full"
          />
          <View
            style={{
              backgroundColor:
                step === 'capture-back' ? colors.accent : step === 'capture-front' ? '#334155' : '#22c55e',
            }}
            className="h-1.5 w-8 rounded-full"
          />
        </View>
        <TouchableOpacity
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          className="rounded-xl p-2.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <RotateCcw size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Step label */}
      <View className="items-center py-3">
        <Text className="text-[15px] font-bold text-white">
          {step === 'capture-front' ? 'Scan Front Side' : 'Scan Back Side'}
        </Text>
        <Text className="mt-1 text-[12px] text-white/50">
          {step === 'capture-front'
            ? 'Position the card within the frame'
            : 'Flip the card and scan the back'}
        </Text>
      </View>

      {/* Camera / Preview */}
      <View className="flex-1 mx-5 mb-4 overflow-hidden rounded-3xl">
        {(step === 'capture-front' && !frontImage) || (step === 'capture-back' && !backImage) ? (
          Platform.OS === 'web' ? (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#111627' }}>
              <Camera size={40} color="#4a5578" />
              <Text className="mt-4 text-[13px] text-white/40">Camera not available on web</Text>
              <TouchableOpacity
                onPress={() => pickFromGallery(step === 'capture-front' ? 'front' : 'back')}
                style={{ backgroundColor: colors.accent }}
                className="mt-4 rounded-xl px-6 py-3"
              >
                <Text className="text-[13px] font-semibold text-white">Select from Gallery</Text>
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
                <View
                  style={{
                    width: '88%',
                    aspectRatio: 1.75,
                    borderWidth: 2,
                    borderColor: colors.accent,
                    borderRadius: 16,
                    borderStyle: 'dashed',
                  }}
                />
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
      <View className="flex-row items-center justify-center pb-8" style={{ gap: 20 }}>
        {/* Gallery pick */}
        <TouchableOpacity
          onPress={() => pickFromGallery(step === 'capture-front' ? 'front' : 'back')}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <ImageIcon size={18} color="#fff" />
        </TouchableOpacity>

        {/* Capture button */}
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            onPress={takePicture}
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ borderWidth: 3, borderColor: colors.accent }}
          >
            <View
              style={{ backgroundColor: '#ffffff' }}
              className="h-12 w-12 rounded-full"
            />
          </TouchableOpacity>
        )}

        {/* Skip back */}
        {step === 'capture-back' ? (
          <TouchableOpacity
            onPress={skipBack}
            className="h-11 items-center justify-center rounded-full px-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <Text className="text-[12px] font-semibold text-white">Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
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
