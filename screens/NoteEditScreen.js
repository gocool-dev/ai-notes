import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  TextInput,
  IconButton,
  Chip,
  Menu,
  Divider,
  Portal,
  Dialog,
  Button,
  Text
} from 'react-native-paper';
import { doc, setDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Ionicons } from '@expo/vector-icons';

// Import services
import voiceService from '../services/voiceService';
import openaiService from '../services/openai';
import locationService from '../services/locationService';

// Import components
import VoiceInput from '../components/VoiceInput';
import AIActionBar from '../components/AIActionBar';

// Import theme
import theme from '../config/theme';

const NoteEditScreen = ({ navigation, route }) => {
  const { note, isNewNote } = route.params;

  // Note state
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tags, setTags] = useState(note.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);

  // AI features state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showAIActions, setShowAIActions] = useState(false);

  // Tag input state
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);

  // Refs
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);

  // Listen for changes to mark the note as edited
  useEffect(() => {
    if (title !== note.title || content !== note.content) {
      setIsEdited(true);
    }
  }, [title, content, note]);

  // Set navigation options
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <IconButton
            icon="microphone"
            size={24}
            onPress={handleVoiceInput}
            disabled={isSaving || isDeleting}
          />
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={() => setMenuVisible(true)}
            disabled={isSaving || isDeleting}
          />
        </View>
      ),
    });
  }, [navigation, isSaving, isDeleting]);

  // Initialize voice service
  useEffect(() => {
    voiceService.initVoiceRecognition();
    
    return () => {
      voiceService.destroyVoiceRecognition();
    };
  }, []);

  // Handle back button/navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isEdited || isSaving || isDeleting) {
        // If not edited or currently saving/deleting, allow navigation
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Show confirmation dialog
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isEdited, isSaving, isDeleting]);

  // Save note function
  const saveNote = async () => {
    if (title.trim() === '' && content.trim() === '') {
      Alert.alert('Empty Note', 'Please add some content to your note before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        updatedAt: new Date(),
      };

      if (isNewNote) {
        // Add created timestamp for new notes
        noteData.createdAt = new Date();
        
        // Create new document in Firestore
        await addDoc(collection(db, 'notes'), noteData);
        Alert.alert('Success', 'Note created successfully!');
      } else {
        // Update existing document
        await setDoc(doc(db, 'notes', note.id), noteData, { merge: true });
        Alert.alert('Success', 'Note updated successfully!');
      }
      
      // Mark as saved and navigate back
      setIsEdited(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save the note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note function
  const deleteNote = async () => {
    // Show confirmation first
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              if (!isNewNote) {
                await deleteDoc(doc(db, 'notes', note.id));
                Alert.alert('Success', 'Note deleted successfully!');
              }
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete the note. Please try again.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Handle voice input
  const handleVoiceInput = () => {
    setIsVoiceInputActive(true);
    
    voiceService.performVoiceSearch((result) => {
      setIsVoiceInputActive(false);
      
      if (!result.error && result.results.length > 0) {
        // Focus on content and append voice text
        const dictatedText = result.results[0];
        
        if (contentInputRef.current.isFocused()) {
          setContent((prevContent) => {
            return prevContent ? `${prevContent}\n${dictatedText}` : dictatedText;
          });
        } else if (titleInputRef.current.isFocused()) {
          setTitle(dictatedText);
        } else {
          // Default to content
          setContent((prevContent) => {
            return prevContent ? `${prevContent}\n${dictatedText}` : dictatedText;
          });
          contentInputRef.current.focus();
        }
      } else {
        Alert.alert('Voice Input', result.message);
      }
    });
  };

  // AI summarization
  const summarizeContent = async () => {
    if (content.trim().length < 50) {
      Alert.alert('Too Short', 'Please add more content to summarize (at least 50 characters).');
      return;
    }

    setIsSummarizing(true);
    try {
      const summary = await openaiService.summarizeText(content);
      Alert.alert(
        'AI Summary',
        summary,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use as Title',
            onPress: () => {
              // Truncate if too long for a title
              setTitle(summary.length > 100 ? summary.substring(0, 97) + '...' : summary);
            },
          },
          {
            text: 'Add to Note',
            onPress: () => {
              setContent((prevContent) => {
                return `${prevContent}\n\n### AI Summary:\n${summary}`;
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error summarizing content:', error);
      Alert.alert('Error', 'Failed to summarize the content. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Extract key information
  const extractInformation = async () => {
    if (content.trim().length < 50) {
      Alert.alert('Too Short', 'Please add more content to analyze (at least 50 characters).');
      return;
    }

    setIsSummarizing(true);
    try {
      const info = await openaiService.extractInformation(content);
      
      // Handle dates, locations, action items, people, and tags
      if (info.tags && info.tags.length > 0) {
        // Add AI-suggested tags to existing tags
        const existingTagSet = new Set(tags);
        info.tags.forEach(tag => existingTagSet.add(tag));
        setTags(Array.from(existingTagSet));
      }
      
      // Format extracted info as markdown and add to note
      let infoText = '\n\n### Key Information (AI-Extracted):\n';
      
      if (info.dates && info.dates.length > 0) {
        infoText += '**Dates**: ' + info.dates.join(', ') + '\n';
      }
      
      if (info.locations && info.locations.length > 0) {
        infoText += '**Locations**: ' + info.locations.join(', ') + '\n';
      }
      
      if (info.actionItems && info.actionItems.length > 0) {
        infoText += '**Action Items**:\n';
        info.actionItems.forEach(item => {
          infoText += `- ${item}\n`;
        });
      }
      
      if (info.people && info.people.length > 0) {
        infoText += '**People**: ' + info.people.join(', ') + '\n';
      }
      
      setContent((prevContent) => {
        return prevContent + infoText;
      });
      
      Alert.alert('Success', 'Key information extracted and added to your note!');
    } catch (error) {
      console.error('Error extracting information:', error);
      Alert.alert('Error', 'Failed to extract information. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Add tag function
  const addTag = () => {
    if (newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
      setShowTagDialog(false);
    }
  };

  // Remove tag function
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Add location reminder function
  const addLocationReminder = async () => {
    const currentLocation = await locationService.getCurrentLocation();
    
    if (!currentLocation) {
      Alert.alert('Location Error', 'Unable to get your current location. Please check your permissions.');
      return;
    }
    
    const address = await locationService.getAddressFromCoordinates(
      currentLocation.latitude,
      currentLocation.longitude
    );
    
    const locationName = address ? address.formattedAddress : 'Current Location';
    
    try {
      await locationService.saveLocationReminder({
        title: title || 'Untitled Note',
        note: content,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        locationName,
        radius: 200, // Default radius in meters
      });
      
      Alert.alert('Success', `Location reminder set for: ${locationName}`);
    } catch (error) {
      console.error('Error setting location reminder:', error);
      Alert.alert('Error', 'Failed to set location reminder. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <TextInput
          ref={titleInputRef}
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          mode="flat"
          underlineColor="transparent"
          disabled={isSaving || isDeleting}
        />
        
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              style={styles.tag}
              onClose={() => removeTag(tag)}
              onPress={() => {}}
              mode="outlined"
            >
              {tag}
            </Chip>
          ))}
          <TouchableOpacity onPress={() => setShowTagDialog(true)}>
            <Chip
              icon="plus"
              style={styles.addTagChip}
              mode="outlined"
            >
              Add Tag
            </Chip>
          </TouchableOpacity>
        </View>
        
        <TextInput
          ref={contentInputRef}
          style={styles.contentInput}
          placeholder="Start typing your note..."
          value={content}
          onChangeText={setContent}
          multiline
          mode="flat"
          underlineColor="transparent"
          disabled={isSaving || isDeleting}
        />
      </ScrollView>

      {/* AI Action Bar */}
      <AIActionBar
        visible={showAIActions}
        onSummarize={summarizeContent}
        onExtractInfo={extractInformation}
        onClose={() => setShowAIActions(false)}
        isSummarizing={isSummarizing}
      />

      {/* Voice Input Overlay */}
      {isVoiceInputActive && <VoiceInput visible={isVoiceInputActive} />}

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <IconButton
          icon="brain"
          size={24}
          onPress={() => setShowAIActions(!showAIActions)}
          color={theme.colors.primary}
        />
        <IconButton
          icon="map-marker"
          size={24}
          onPress={addLocationReminder}
          color={theme.colors.primary}
        />
        <View style={styles.saveButtonContainer}>
          <Button
            mode="contained"
            onPress={saveNote}
            disabled={isSaving || isDeleting}
            loading={isSaving}
            style={styles.saveButton}
          >
            {isNewNote ? 'Create' : 'Save'}
          </Button>
        </View>
      </View>

      {/* Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 400, y: 50 }}
      >
        <Menu.Item
          title="Delete Note"
          icon="delete"
          onPress={() => {
            setMenuVisible(false);
            deleteNote();
          }}
          disabled={isNewNote || isSaving || isDeleting}
        />
        <Menu.Item
          title="Summarize"
          icon="text-box"
          onPress={() => {
            setMenuVisible(false);
            summarizeContent();
          }}
          disabled={isSaving || isDeleting || isSummarizing}
        />
        <Menu.Item
          title="Extract Key Info"
          icon="information"
          onPress={() => {
            setMenuVisible(false);
            extractInformation();
          }}
          disabled={isSaving || isDeleting || isSummarizing}
        />
        <Menu.Item
          title="Read Aloud"
          icon="volume-high"
          onPress={() => {
            setMenuVisible(false);
            voiceService.speakText(content);
          }}
          disabled={isSaving || isDeleting || content.trim() === ''}
        />
      </Menu>

      {/* Tag Dialog */}
      <Portal>
        <Dialog visible={showTagDialog} onDismiss={() => setShowTagDialog(false)}>
          <Dialog.Title>Add Tag</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Tag Name"
              value={newTag}
              onChangeText={setNewTag}
              mode="outlined"
              autoCapitalize="none"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTagDialog(false)}>Cancel</Button>
            <Button onPress={addTag}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.s,
  },
  tag: {
    margin: theme.spacing.xs,
  },
  addTagChip: {
    margin: theme.spacing.xs,
    backgroundColor: 'transparent',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    paddingTop: 8,
    paddingBottom: 100, // Add padding to account for bottom bar
    backgroundColor: 'transparent',
    minHeight: 300,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  saveButton: {
    borderRadius: 20,
  },
  headerButtons: {
    flexDirection: 'row',
  },
});

export default NoteEditScreen;