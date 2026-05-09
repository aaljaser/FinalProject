import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  I18nManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book } from '../services/googleBooks';
import { useBookSearch } from '../hooks/useBookSearch';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  onScanPress: () => void;
}

const SearchBar = ({ value, onChange, onScanPress }: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <MaterialCommunityIcons name="magnify" size={22} color="#cfd8dc" style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      placeholder="ابحث عن كتاب أو مؤلف..."
      placeholderTextColor="#9aa6ab"
      onChangeText={onChange}
      value={value}
      textAlign={I18nManager.isRTL ? 'left' : 'right'}
      returnKeyType="search"
      autoCorrect={false}
    />
    <TouchableOpacity
      style={styles.scanButton}
      onPress={onScanPress}
      accessibilityRole="button"
      accessibilityLabel="مسح رمز ISBN بالكاميرا"
    >
      <MaterialCommunityIcons name="barcode-scan" size={22} color="#fff" />
    </TouchableOpacity>
  </View>
);

const formatYear = (publishedDate?: string): string | undefined => {
  if (!publishedDate) return undefined;
  const match = publishedDate.match(/^(\d{4})/);
  return match ? match[1] : publishedDate;
};

const BookCard = ({ book }: { book: Book }) => {
  const year = formatYear(book.publishedDate);
  const authors = book.authors.length > 0 ? book.authors.join('، ') : 'مؤلف غير معروف';

  const onPress = () => {
    if (book.infoLink) {
      Linking.openURL(book.infoLink).catch(() => {});
    }
  };

  return (
    <TouchableOpacity style={styles.bookCard} activeOpacity={0.85} onPress={onPress}>
      {book.coverImage ? (
        <Image source={{ uri: book.coverImage }} style={styles.bookCover} />
      ) : (
        <View style={[styles.bookCover, styles.bookCoverPlaceholder]}>
          <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#cfd8dc" />
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {authors}
        </Text>
        {year ? <Text style={styles.bookMeta}>سنة النشر: {year}</Text> : null}
        {book.description ? (
          <Text style={styles.bookDescription} numberOfLines={3}>
            {book.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const StateMessage = ({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.stateContainer}>
    <MaterialCommunityIcons name={icon} size={56} color="rgba(255,255,255,0.7)" />
    <Text style={styles.stateTitle}>{title}</Text>
    {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
  </View>
);

export default function HomeScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const { books, status, error } = useBookSearch(query);

  const goToScanner = () => {
    navigation.navigate('Scan');
  };

  const content = useMemo(() => {
    if (status === 'idle') {
      return (
        <StateMessage
          icon="book-search-outline"
          title="ابدأ بالبحث"
          subtitle="اكتب اسم كتاب أو مؤلف، أو امسح رمز ISBN لاستكشاف العناوين."
        />
      );
    }

    if (status === 'loading') {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.stateTitle}>جارٍ البحث...</Text>
        </View>
      );
    }

    if (status === 'error') {
      return (
        <StateMessage
          icon="wifi-alert"
          title="تعذّر الاتصال"
          subtitle={error ?? 'يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.'}
        />
      );
    }

    if (status === 'success' && books.length === 0) {
      return (
        <StateMessage
          icon="book-remove-outline"
          title="لا توجد نتائج"
          subtitle="جرّب كلمات بحث مختلفة، أو تأكد من صحة رمز ISBN."
        />
      );
    }

    return (
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  }, [status, books, error]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2e4a4f', '#101110']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>بصيرة</Text>
          <Text style={styles.subtitle}>اكتشف الكتب على خطى ابن الهيثم</Text>
        </View>

        <SearchBar value={query} onChange={setQuery} onScanPress={goToScanner} />

        <View style={styles.contentArea}>{content}</View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 14,
    color: '#cfd8dc',
    writingDirection: 'rtl',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchIcon: {
    marginHorizontal: 6,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
  },
  scanButton: {
    backgroundColor: '#3f6b71',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  contentArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bookCover: {
    width: 72,
    height: 108,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bookCoverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#cfd8dc',
    marginBottom: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  bookMeta: {
    fontSize: 12,
    color: '#9aa6ab',
    marginBottom: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  bookDescription: {
    fontSize: 12,
    color: '#cfd8dc',
    lineHeight: 18,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  stateSubtitle: {
    color: '#cfd8dc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    writingDirection: 'rtl',
  },
});
