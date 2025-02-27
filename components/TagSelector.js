import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Chip, TextInput, Button, Dialog, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import theme
import theme from '../config/theme';

/**
 * Tag selector component for selecting and managing tags
 * @param {Object} props
 * @param {Array} props.selectedTags - Currently selected tags
 * @param {Function} props.onTagsChange - Callback when tags change
 * @param {Array} props.suggestedTags - Optional list of suggested tags
 * @param {Boolean} props.readOnly - If true, tags cannot be added/removed
 */
const TagSelector = ({ 
  selectedTags = [], 
  onTagsChange, 
  suggestedTags = [],
  readOnly = false 
}) => {
  const [tags, setTags] = useState(selectedTags);
  const [showDialog, setShowDialog] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [recentTags, setRecentTags] = useState([]);

  // When selectedTags prop changes, update internal tags state
  useEffect(() => {
    setTags(selectedTags);
  }, [selectedTags]);

  // Load recently used tags from somewhere (this would be implemented in a real app)
  useEffect(() => {
    // This would typically fetch from AsyncStorage or similar
    // For this example, we're just using the suggestedTags
    setRecentTags(suggestedTags);
  }, [suggestedTags]);

  // Add a tag
  const addTag = (tag) => {
    if (!tag.trim() || tags.includes(tag.trim())) {
      return;
    }

    const newTags = [...tags, tag.trim()];
    setTags(newTags);
    
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    if (readOnly) return;
    
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Handle adding from dialog
  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
      setShowDialog(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tagsScroll}
        contentContainerStyle={styles.tagsContainer}
      >
        {tags.map((tag) => (
          <Chip
            key={tag}
            style={styles.tag}
            onClose={readOnly ? undefined : () => removeTag(tag)}
            mode="outlined"
          >
            {tag}
          </Chip>
        ))}
        
        {!readOnly && (
          <TouchableOpacity onPress={() => setShowDialog(true)}>
            <Chip
              icon="plus"
              style={styles.addTagChip}
              mode="outlined"
            >
              Add Tag
            </Chip>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Tag Dialog */}
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Add Tag</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Tag Name"
              value={newTag}
              onChangeText={setNewTag}
              mode="outlined"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              autoFocus={true}
              placeholder="Enter tag name"
              returnKeyType="done"
              onSubmitEditing={handleAddTag}
            />

            {recentTags.length > 0 && (
              <View style={styles.suggestedTags}>
                <Text style={styles.suggestedTitle}>Recent Tags:</Text>
                <View style={styles.suggestedContainer}>
                  {recentTags
                    .filter(tag => !tags.includes(tag))
                    .slice(0, 5)
                    .map((tag) => (
                      <TouchableOpacity 
                        key={tag} 
                        onPress={() => addTag(tag)}
                      >
                        <Chip 
                          style={styles.suggestedTag} 
                          mode="outlined"
                        >
                          {tag}
                        </Chip>
                      </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button onPress={handleAddTag}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  tagsScroll: {
    flexGrow: 0,
  },
  tagsContainer: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  tag: {
    marginHorizontal: 4,
  },
  addTagChip: {
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  suggestedTags: {
    marginTop: 16,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestedTag: {
    margin: 4,
  },
});

export default TagSelector;