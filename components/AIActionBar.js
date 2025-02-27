import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import theme
import theme from '../config/theme';

const AIActionBar = ({ visible, onSummarize, onExtractInfo, onClose, isSummarizing }) => {
  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      
      <View style={styles.header}>
        <Text style={styles.title}>AI Tools</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSummarize}
          disabled={isSummarizing}
        >
          {isSummarizing ? (
            <ActivityIndicator size={24} color={theme.colors.primary} />
          ) : (
            <Ionicons name="text" size={24} color={theme.colors.primary} />
          )}
          <Text style={styles.actionText}>Summarize</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onExtractInfo}
          disabled={isSummarizing}
        >
          {isSummarizing ? (
            <ActivityIndicator size={24} color={theme.colors.primary} />
          ) : (
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          )}
          <Text style={styles.actionText}>Extract Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.s,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: theme.spacing.m,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    width: 120,
  },
  actionText: {
    marginTop: theme.spacing.s,
    fontSize: 14,
  },
});

export default AIActionBar;