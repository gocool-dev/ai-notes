import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { FAB, Searchbar, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import components
import NoteCard from '../components/NoteCard';
import VoiceInput from '../components/VoiceInput';

// Import services
import voiceService from '../services/voiceService';

// Import theme
import theme from '../config/theme';

const HomeScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);

  // Fetch notes from Firestore
  const fetchNotes = async () => {
    setLoading(true);
    try {
      // Try to get from cache first for faster loading
      const cachedNotes = await AsyncStorage.getItem('cachedNotes');
      if (cachedNotes) {
        const parsedNotes = JSON.parse(cachedNotes);
        setNotes(parsedNotes);
        setFilteredNotes(parsedNotes);
      }

      // Then fetch from Firestore for fresh data
      const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const notesList = [];
      querySnapshot.forEach((doc) => {
        notesList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setNotes(notesList);
      setFilteredNotes(notesList);
      
      // Cache notes for offline access
      await AsyncStorage.setItem('cachedNotes', JSON.stringify(notesList));
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Focus effect to refresh notes when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
      
      // Initialize voice recognition
      voiceService.initVoiceRecognition();
      
      return () => {
        // Clean up voice recognition when screen loses focus
        voiceService.destroyVoiceRecognition();
      };
    }, [])
  );

  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = notes.filter(
        note => 
          note.title.toLowerCase().includes(query) || 
          note.content.toLowerCase().includes(query)
      );
      setFilteredNotes(filtered);
    }
  }, [searchQuery, notes]);

  // Handle search input change
  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    setIsVoiceInputActive(true);
    
    voiceService.performVoiceSearch((result) => {
      setIsVoiceInputActive(false);
      
      if (!result.error && result.results.length > 0) {
        // Use the most probable result
        setSearchQuery(result.results[0]);
      } else {
        Alert.alert('Voice Search', result.message);
      }
    });
  };

  // Handle note press
  const handleNotePress = (note) => {
    navigation.navigate('NoteEdit', { note, isNewNote: false });
  };

  // Render each note item
  const renderNoteItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotePress(item)}>
      <NoteCard note={item} />
    </TouchableOpacity>
  );

  // Create new note
  const handleNewNote = () => {
    navigation.navigate('NoteEdit', { 
      note: { 
        title: '', 
        content: '', 
        createdAt: new Date(), 
        updatedAt: new Date(),
        tags: []
      }, 
      isNewNote: true 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          icon="magnify"
          clearIcon="close"
          onIconPress={handleVoiceSearch}
          right={() => (
            <TouchableOpacity onPress={handleVoiceSearch}>
              <Ionicons name="mic-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
      </View>

      {isVoiceInputActive && <VoiceInput visible={isVoiceInputActive} />}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Loading notes...</Text>
        </View>
      ) : filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== '' 
              ? 'No notes match your search.' 
              : 'No notes yet. Tap + to create one.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={handleNewNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  searchbar: {
    elevation: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: theme.spacing.m,
    color: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  notesList: {
    padding: theme.spacing.m,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.m,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default HomeScreen;