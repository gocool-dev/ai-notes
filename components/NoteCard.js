import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, Chip, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import theme
import theme from '../config/theme';

// Import utilities
import { formatDate } from '../utils/dateUtils';

const NoteCard = ({ note }) => {
  // Format the content for preview (max 3 lines)
  const getContentPreview = (content) => {
    if (!content) return '';
    
    // Split by new lines and get up to 3
    const lines = content.split('\n').slice(0, 3);
    
    // Limit to 150 characters total
    const preview = lines.join('\n');
    if (preview.length > 150) {
      return preview.substring(0, 147) + '...';
    }
    
    return preview;
  };
  
  // Check if the note has location data
  const hasLocationData = note.latitude && note.longitude;
  
  // Format updated date
  const formattedDate = formatDate(note.updatedAt);
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <Title style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled Note'}
          </Title>
          {hasLocationData && (
            <Ionicons name="location" size={16} color={theme.colors.primary} />
          )}
        </View>
        
        <Paragraph style={styles.content}>
          {getContentPreview(note.content)}
        </Paragraph>
        
        <View style={styles.metaContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          
          {note.tags && note.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {note.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  style={styles.tag}
                  textStyle={styles.tagText}
                  mode="outlined"
                  compact
                >
                  {tag}
                </Chip>
              ))}
              {note.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{note.tags.length - 3}</Text>
              )}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  content: {
    marginTop: theme.spacing.xs,
    color: '#666',
    fontSize: 14,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.s,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    marginHorizontal: 2,
    height: 24,
  },
  tagText: {
    fontSize: 10,
  },
  moreTagsText: {
    fontSize: 10,
    color: '#888',
    marginLeft: 4,
  },
});

export default NoteCard;