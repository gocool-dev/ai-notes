import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { FAB, Searchbar, Text, Avatar, Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Import components
import NoteCard from '../components/NoteCard';
import VoiceInput from '../components/VoiceInput';

// Import services
import voiceService, { WebSpeechRecognition } from '../services/voiceService';
import authService from '../services/authService';

// Import theme
import theme from '../config/theme';

const HomeScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Voice recognition purpose flag (search or new note)
  const [voiceInputPurpose, setVoiceInputPurpose] = useState('search');

  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      const data = await authService.getCurrentUserData();
      setUserData(data);
    };
    
    getUserData();
  }, []);

  // Fetch notes from Firestore
  const fetchNotes = async () => {
    setLoading(true);
    try {
      // Only fetch notes for the current user
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error('No authenticated user found when fetching notes');
        setNotes([]);
        setFilteredNotes([]);
        setLoading(false);
        return;
      }

      // Try to get from cache first for faster loading
      const cachedNotes = await AsyncStorage.getItem(`cachedNotes_${currentUser.uid}`);
      if (cachedNotes) {
        const parsedNotes = JSON.parse(cachedNotes);
        setNotes(parsedNotes);
        setFilteredNotes(parsedNotes);
      }

      // Then fetch from Firestore for fresh data
      const q = query(
        collection(db, 'notes'), 
        where('userId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );
      
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
      await AsyncStorage.setItem(`cachedNotes_${currentUser.uid}`, JSON.stringify(notesList));
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = notes.filter(
        note => 
          (note.title && note.title.toLowerCase().includes(query)) || 
          (note.content && note.content.toLowerCase().includes(query))
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
    setVoiceInputPurpose('search');
    setIsVoiceInputActive(true);
  };

  // Handle voice input message
  const handleVoiceMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'FINAL' && data.message) {
        if (voiceInputPurpose === 'search') {
          // Use result for search
          setSearchQuery(data.message);
        } else if (voiceInputPurpose === 'newNote') {
          // Create new note with voice content
          const currentUser = auth.currentUser;
          if (currentUser) {
            navigation.navigate('NoteEdit', { 
              note: { 
                title: '', 
                content: data.message, 
                createdAt: new Date(), 
                updatedAt: new Date(),
                userId: currentUser.uid,
                tags: []
              }, 
              isNewNote: true 
            });
          }
        }
        
        // Close voice input after getting result
        setTimeout(() => {
          setIsVoiceInputActive(false);
        }, 1000);
      } else if (data.type === 'ERROR') {
        Alert.alert('Voice Input', data.message || 'Error with voice recognition');
        setIsVoiceInputActive(false);
      }
    } catch (error) {
      console.error('Error parsing voice message:', error);
      setIsVoiceInputActive(false);
    }
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
    // Ensure user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please sign in to create notes.');
      return;
    }
    
    navigation.navigate('NoteEdit', { 
      note: { 
        title: '', 
        content: '', 
        createdAt: new Date(), 
        updatedAt: new Date(),
        userId: currentUser.uid,
        tags: []
      }, 
      isNewNote: true 
    });
  };

  // Create new note with voice
  const handleNewVoiceNote = () => {
    // Ensure user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please sign in to create notes.');
      return;
    }
    
    setVoiceInputPurpose('newNote');
    setIsVoiceInputActive(true);
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await authService.signOutUser();
      // Navigation is handled by AppContainer based on auth state
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Render user header
  const renderUserHeader = () => {
    if (!userData) return null;
    
    return (
      <Card style={styles.userCard}>
        <Card.Content style={styles.userCardContent}>
          <View style={styles.userInfo}>
            <Avatar.Image 
              size={50} 
              source={userData.photoURL ? { uri: userData.photoURL } : require('../assets/default-avatar.png')} 
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{userData.displayName || 'AI Notes User'}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../assets/empty-notes.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyText}>
          {searchQuery.trim() !== '' 
            ? 'No notes match your search.' 
            : 'No notes yet. Get started by creating your first note!'}
        </Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleNewNote}
        >
          <Text style={styles.emptyButtonText}>Create Note</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderUserHeader()}
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          icon="magnify"
          clearIcon="close"
          right={() => (
            <TouchableOpacity onPress={handleVoiceSearch}>
              <Ionicons name="mic-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* WebView for Speech Recognition */}
      {isVoiceInputActive && (
        <WebSpeechRecognition 
          onMessage={handleVoiceMessage}
          hidden={true}
        />
      )}
      
      {/* Visual feedback for voice input */}
      {isVoiceInputActive && (
        <View style={styles.voiceOverlay}>
          <View style={styles.voiceIndicator}>
            <Ionicons name="mic" size={36} color="white" />
            <Text style={styles.voiceText}>
              Listening... {voiceInputPurpose === 'search' ? '(search)' : '(new note)'}
            </Text>
            <Text style={styles.voiceSubText}>Tap anywhere to cancel</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Loading notes...</Text>
        </View>
      ) : filteredNotes.length === 0 ? (
        renderEmptyState()
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

      <FAB
        style={styles.fabVoice}
        icon="microphone"
        color="#fff"
        small
        onPress={handleNewVoiceNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userCard: {
    margin: theme.spacing.m,
    elevation: 2,
  },
  userCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: theme.spacing.m,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
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
  voiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  voiceIndicator: {
    backgroundColor: theme.colors.primary,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  voiceText: {
    color: 'white',
    fontSize: 18,
    marginTop: 15,
    fontWeight: 'bold',
  },
  voiceSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 10,
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
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: theme.spacing.m,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginBottom: theme.spacing.l,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: 30,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  fabVoice: {
    position: 'absolute',
    margin: theme.spacing.m,
    right: 0,
    bottom: 70,
    backgroundColor: theme.colors.accent,
  },
});

export default HomeScreen;