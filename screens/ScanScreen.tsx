import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, searchByIsbn } from '../services/googleBooks';

type ScanState =
  | { kind: 'scanning' }
  | { kind: 'looking-up'; isbn: string }
  | { kind: 'found'; isbn: string; book: Book }
  | { kind: 'not-found'; isbn: string }
  | { kind: 'error'; isbn: string; message: string };

const SUPPORTED_BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

export default function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>({ kind: 'scanning' });
  const lastScannedRef = useRef<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const lookupIsbn = async (isbn: string) => {
    setState({ kind: 'looking-up', isbn });
    try {
      const results = await searchByIsbn(isbn);
      if (results.length === 0) {
        setState({ kind: 'not-found', isbn });
      } else {
        setState({ kind: 'found', isbn, book: results[0] });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء البحث';
      setState({ kind: 'error', isbn, message });
    }
  };

  const handleBarcode = (event: { data: string }) => {
    const data = (event.data ?? '').trim();
    if (!data || data === lastScannedRef.current) return;
    if (state.kind !== 'scanning') return;
    lastScannedRef.current = data;
    lookupIsbn(data);
  };

  const resetScan = () => {
    lastScannedRef.current = null;
    setState({ kind: 'scanning' });
  };

  const goHome = () => {
    navigation.goBack();
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2e4a4f', '#101110']} style={styles.gradient}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2e4a4f', '#101110']} style={styles.gradient}>
          <View style={styles.centered}>
            <MaterialCommunityIcons name="camera-off-outline" size={64} color="#fff" />
            <Text style={styles.title}>إذن الكاميرا مطلوب</Text>
            <Text style={styles.subtitle}>
              نستخدم الكاميرا فقط لقراءة رمز ISBN على غلاف الكتاب والبحث عنه.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
              <Text style={styles.primaryButtonText}>السماح للكاميرا</Text>
            </TouchableOpacity>
            {!permission.canAskAgain && Platform.OS !== 'web' ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => Linking.openSettings()}
              >
                <Text style={styles.secondaryButtonText}>فتح الإعدادات</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
              <Text style={styles.secondaryButtonText}>العودة إلى البحث</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: [...SUPPORTED_BARCODE_TYPES] }}
          onBarcodeScanned={state.kind === 'scanning' ? handleBarcode : undefined}
        />

        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={goHome}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
              <Text style={styles.iconButtonText}>رجوع</Text>
            </TouchableOpacity>
            <Text style={styles.topTitle}>مسح ISBN</Text>
            <View style={styles.iconButtonPlaceholder} />
          </View>

          <View style={styles.scanFrame} pointerEvents="none">
            <View style={styles.scanFrameBox} />
            <Text style={styles.scanHint}>وجّه الكاميرا نحو الرمز الشريطي خلف الكتاب</Text>
          </View>

          <View style={styles.bottomCard}>{renderBottom(state, resetScan, goHome)}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function renderBottom(state: ScanState, resetScan: () => void, goHome: () => void) {
  if (state.kind === 'scanning') {
    return (
      <View style={styles.bottomScanning}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.bottomText}>جاهز للمسح...</Text>
      </View>
    );
  }

  if (state.kind === 'looking-up') {
    return (
      <View style={styles.bottomScanning}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.bottomText}>جارٍ البحث عن الرمز {state.isbn}...</Text>
      </View>
    );
  }

  if (state.kind === 'found') {
    const { book } = state;
    return (
      <View>
        <View style={styles.foundRow}>
          {book.coverImage ? (
            <Image source={{ uri: book.coverImage }} style={styles.foundCover} />
          ) : (
            <View style={[styles.foundCover, styles.foundCoverPlaceholder]}>
              <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#cfd8dc" />
            </View>
          )}
          <View style={styles.foundInfo}>
            <Text style={styles.foundTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.foundAuthor} numberOfLines={1}>
              {book.authors.join('، ') || 'مؤلف غير معروف'}
            </Text>
            {book.publishedDate ? (
              <Text style={styles.foundMeta}>{book.publishedDate}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={resetScan}>
            <Text style={styles.primaryButtonText}>مسح كتاب آخر</Text>
          </TouchableOpacity>
          {book.infoLink ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Linking.openURL(book.infoLink!).catch(() => {})}
            >
              <Text style={styles.secondaryButtonText}>التفاصيل</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
            <Text style={styles.secondaryButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (state.kind === 'not-found') {
    return (
      <View>
        <Text style={styles.bottomText}>لا توجد نتائج للرمز {state.isbn}.</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={resetScan}>
            <Text style={styles.primaryButtonText}>إعادة المسح</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
            <Text style={styles.secondaryButtonText}>العودة إلى البحث</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.bottomText}>تعذّر البحث: {state.message}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={resetScan}>
          <Text style={styles.primaryButtonText}>المحاولة مجددًا</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
          <Text style={styles.secondaryButtonText}>العودة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonPlaceholder: {
    width: 60,
  },
  iconButtonText: {
    color: '#fff',
    marginHorizontal: 6,
    fontSize: 14,
  },
  topTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrameBox: {
    width: 260,
    height: 160,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#fff',
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    writingDirection: 'rtl',
  },
  bottomCard: {
    backgroundColor: 'rgba(16,17,16,0.92)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
  },
  bottomScanning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    color: '#fff',
    fontSize: 15,
    marginHorizontal: 12,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  foundRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  foundCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  foundCoverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  foundTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  foundAuthor: {
    color: '#cfd8dc',
    fontSize: 14,
    marginTop: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  foundMeta: {
    color: '#9aa6ab',
    fontSize: 12,
    marginTop: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3f6b71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 4,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#cfd8dc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
