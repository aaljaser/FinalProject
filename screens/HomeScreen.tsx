import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
}

const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Art of Science',
    author: 'Abdulkarim Aljaser',
    coverImage: 'https://api.a0.dev/assets/image?text=science%20book%20cover%20arabic%20style&seed=1',
    rating: 4.5
  },
  {
    id: '2',
    title: 'Digital Innovation',
    author: 'Tech Pioneers',
    coverImage: 'https://api.a0.dev/assets/image?text=modern%20tech%20book%20cover%20arabic%20style&seed=2',
    rating: 4.8
  },
  {
    id: '3',
    title: 'Future of AI',
    author: 'Data Scientists',
    coverImage: 'https://api.a0.dev/assets/image?text=AI%20book%20cover%20futuristic%20arabic&seed=3',
    rating: 4.2
  }
];

const SearchBar = ({ onSearch }: { onSearch: (text: string) => void }) => (
  <View style={styles.searchContainer}>
    <MaterialCommunityIcons name="magnify" size={24} color="#666" style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      placeholder="Search books..."
      placeholderTextColor="#666"
      onChangeText={onSearch}
    />
  </View>
);

const BookCard = ({ book }: { book: Book }) => (
  <TouchableOpacity style={styles.bookCard}>
    <Image source={{ uri: book.coverImage }} style={styles.bookCover} />
    <View style={styles.bookInfo}>
      <Text style={styles.bookTitle}>{book.title}</Text>
      <Text style={styles.bookAuthor}>{book.author}</Text>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, index) => (
          <MaterialCommunityIcons
            key={index}
            name={index < Math.floor(book.rating) ? 'star' : 'star-outline'}
            size={16}
            color={index < Math.floor(book.rating) ? '#FFD700' : '#666'}
          />
        ))}
        <Text style={styles.ratingText}>{book.rating}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [books, setBooks] = React.useState<Book[]>(MOCK_BOOKS);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filteredBooks = MOCK_BOOKS.filter(book => 
      book.title.toLowerCase().includes(text.toLowerCase()) ||
      book.author.toLowerCase().includes(text.toLowerCase())
    );
    setBooks(filteredBooks);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2e4a4f', '#101110bc']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Aljaser Books</Text>
          <Text style={styles.subtitle}>Discover your next favorite book</Text>
        </View>
        
        <SearchBar onSearch={handleSearch} />
        
        <ScrollView style={styles.booksContainer}>
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    margin: 20,
    borderRadius: 12,
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  booksContainer: {
    padding: 20,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 15,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#ccc',
    marginLeft: 8,
    fontSize: 14,
  },
});