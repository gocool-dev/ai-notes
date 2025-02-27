import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  IconButton,
  Surface,
  Menu,
  Divider,
  Chip,
  Portal,
  Modal,
  Button,
  Text,
} from 'react-native-paper';
import { collection, addDoc, updateDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import services
import voiceService, { WebSpeechRecognition } from '../services/voiceService';

// Import theme
import theme from '../config/theme';

const NoteEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { note, isNewNote } = route.params;

  // Note content state
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // UI state
  const [menuVisible, setMenuVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState('content'); // 'title', 'content', or 'tag'
  
  // References
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const tagInputRef = useRef(null);

  // Set up header buttons
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <IconButton
            icon="microphone"
            size={24}
            onPress={handleVoiceInput}
            color={theme.colors.primary}
          />
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={() => setMenuVisible(true)}
            color={theme.colors.primary}
          />
        </View>
      ),
    });
  }, [navigation]);

  // Detect changes to mark unsaved state
  useEffect(() => {
    if (
      title !== (note?.title || '') ||
      content !== (note?.content || '') ||
      JSON.stringify(tags) !== JSON.stringify(note?.tags || [])
    ) {
      setUnsavedChanges(true);
    } else {
      setUnsavedChanges(false);
    }
  }, [title, content, tags, note]);

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      if (unsavedChanges) {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to go back?',
          [
            { text: 'Stay', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
          ]
        );
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [unsavedChanges, navigation]);

  // Save note
  const saveNote = async () => {
    try {
      if (!title.trim() && !content.trim()) {
        Alert.alert('Empty Note', 'Please add content to your note before saving.');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Authentication Required', 'Please sign in to save notes.');
        return;
      }

      const trimmedTitle = title.trim();
      const noteData = {
        title: trimmedTitle || 'Untitled Note',
        content,
        tags,
        userId: currentUser.uid,
        updatedAt: Timestamp.now(),
      };

      if (isNewNote) {
        noteData.createdAt = Timestamp.now();
        await addDoc(collection(db, 'notes'), noteData);
      } else {
        await updateDoc(doc(db, 'notes', note.id), noteData);
      }

      setUnsavedChanges(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  };

  // Delete note
  const deleteNote = async () => {
    try {
      if (isNewNote) {
        navigation.goBack();
        return;
      }

      await deleteDoc(doc(db, 'notes', note.id));
      setDeleteModalVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note. Please try again.');
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    // Determine which field is currently active
    if (titleInputRef.current?.isFocused?.()) {
      setVoiceTarget('title');
    } else if (contentInputRef.current?.isFocused?.()) {
      setVoiceTarget('content');
    } else if (tagInputRef.current?.isFocused?.()) {
      setVoiceTarget('tag');
    } else {
      // Default to content if no field is focused
      setVoiceTarget('content');
    }
    
    setIsVoiceActive(true);
  };
  
  // Handle voice recognition result
  const handleVoiceMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'FINAL' && data.message) {
        const result = data.message;
        
        // Apply result to the appropriate field
        switch (voiceTarget) {
          case 'title':
            setTitle(prevTitle => {
              if (prevTitle.trim() === '') {
                return result;
              } else {
                return prevTitle + ' ' + result;
              }
            });
            break;
            
          case 'content':
            setContent(prevContent => {
              if (prevContent.trim() === '') {
                return result;
              } else {
                return prevContent + ' ' + result;
              }
            });
            break;
            
          case 'tag':
            setTagInput(result);
            break;
        }
        
        // Close voice input after getting result
        setTimeout(() => {
          setIsVoiceActive(false);
        }, 1000);
      } else if (data.type === 'ERROR') {
        Alert.alert('Voice Input', data.message || 'Error with voice recognition');
        setIsVoiceActive(false);
      }
    } catch (error) {
      console.error('Error parsing voice message:', error);
      setIsVoiceActive(false);
    }
  };

  // Add a tag
  const addTag = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Voice recognition WebView */}
      {isVoiceActive && (
        <WebSpeechRecognition
          onMessage={handleVoiceMessage}
          hidden={true}
        />
      )}
      
      {/* Voice input indicator */}
      {isVoiceActive && (
        <Portal>
          <Modal visible={true} dismissable={true} onDismiss={() => setIsVoiceActive(false)}>
            <View style={styles.voiceModal}>
              <View style={styles.voiceIndicator}>
                <Ionicons name="mic" size={32} color="#fff" />
              </View>
              <Text style={styles.voiceText}>
                Listening for {voiceTarget === 'title' ? 'Title' : voiceTarget === 'content' ? 'Content' : 'Tag'}...
              </Text>
              <Text style={styles.voiceSubText}>Tap to cancel</Text>
            </View>
          </Modal>
        </Portal>
      )}
      
      <Surface style={styles.headerContainer}>
        <TextInput
          ref={titleInputRef}
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          multiline
        />
        
        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                style={styles.tag}
                onClose={() => removeTag(tag)}
                onPress={() => removeTag(tag)}
                mode="outlined"
              >
                {tag}
              </Chip>
            ))}
            <IconButton
              icon="tag-plus"
              size={20}
              onPress={() => setTagModalVisible(true)}
              style={styles.addTagButton}
            />
          </ScrollView>
        </View>
      </Surface>

      <ScrollView style={styles.contentContainer}>
        <TextInput
          ref={contentInputRef}
          style={styles.contentInput}
          placeholder="Start typing your note..."
          value={content}
          onChangeText={setContent}
          multiline
          scrollEnabled={false} // ScrollView handles scrolling
        />
      </ScrollView>

      <Surface style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.unsavedText}>
            {unsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </Text>
          <Button
            mode="contained"
            onPress={saveNote}
            disabled={!unsavedChanges}
            style={styles.saveButton}
          >
            Save
          </Button>
        </View>
      </Surface>

      {/* Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: theme.dimensions.windowWidth - 20, y: 60 }}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            saveNote();
          }}
          title="Save"
          disabled={!unsavedChanges}
          icon="content-save"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            setTagModalVisible(true);
          }}
          title="Manage Tags"
          icon="tag-multiple"
        />
        <Divider />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            voiceService.speakText(title + '. ' + content);
          }}
          title="Read Aloud"
          icon="text-to-speech"
        />
        <Divider />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            setDeleteModalVisible(true);
          }}
          title="Delete Note"
          icon="delete"
          titleStyle={{ color: theme.colors.error }}
        />
      </Menu>

      {/* Tag Modal */}
      <Portal>
        <Modal
          visible={tagModalVisible}
          onDismiss={() => setTagModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Manage Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              ref={tagInputRef}
              style={styles.tagInput}
              placeholder="Add a tag..."
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
            />
            <IconButton
              icon="plus"
              size={20}
              onPress={addTag}
              disabled={!tagInput.trim()}
            />
            <IconButton
              icon="microphone"
              size={20}
              onPress={() => {
                setVoiceTarget('tag');
                setTagModalVisible(false);
                setTimeout(() => {
                  setIsVoiceActive(true);
                }, 100);
              }}
            />
          </View>
          <ScrollView style={styles.tagsScrollView}>
            <View style={styles.tagsList}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  style={styles.tagInModal}
                  onClose={() => removeTag(tag)}
                  mode="outlined"
                >
                  {tag}
                </Chip>
              ))}
              {tags.length === 0 && (
                <Text style={styles.noTagsText}>No tags added yet</Text>
              )}
            </View>
          </ScrollView>
          <Button onPress={() => setTagModalVisible(false)}>Done</Button>
        </Modal>
      </Portal>

      {/* Delete Confirmation Modal */}
      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Delete Note</Text>
          <Text style={styles.modalText}>
            Are you sure you want to delete this note? This action cannot be undone.
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setDeleteModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={deleteNote}
              style={styles.deleteButton}
              buttonColor={theme.colors.error}
            >
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: theme.spacing.m,
    elevation: 2,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.s,
  },
  tag: {
    marginRight: theme.spacing.s,
    marginVertical: 2,
  },
  addTagButton: {
    margin: 0,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.m,
  },
  contentInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingHorizontal: 0,
    textAlignVertical: 'top',
  },
  footer: {
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unsavedText: {
    color: '#888',
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: theme.spacing.l,
    margin: theme.spacing.l,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
  },
  modalText: {
    marginBottom: theme.spacing.m,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  deleteButton: {
    flex: 1,
    marginLeft: theme.spacing.s,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tagsScrollView: {
    maxHeight: 200,
    marginBottom: theme.spacing.m,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagInModal: {
    margin: 4,
  },
  noTagsText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.m,
  },
  voiceModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: theme.spacing.l,
    alignItems: 'center',
    margin: theme.spacing.l,
  },
  voiceIndicator: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  voiceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
  },
  voiceSubText: {
    color: '#888',
    fontSize: 14,
  },
});

export default NoteEditScreen;