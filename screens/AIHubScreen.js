import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  TextInput, 
  Button,
  IconButton,
  Portal,
  Dialog,
  Text,
  Chip 
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import services
import openaiService from '../services/openai';
import voiceService from '../services/voiceService';

// Import theme
import theme from '../config/theme';

const AIHubScreen = () => {
  // State for text input and processing
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // State for summary
  const [summary, setSummary] = useState('');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  
  // State for extracted information
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  
  // State for suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  
  // State for voice input
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);

  // Process the input text with AI
  const processWithAI = async (type) => {
    if (inputText.trim().length < 20) {
      Alert.alert('Too Short', 'Please enter at least 20 characters to process with AI.');
      return;
    }
    
    setProcessing(true);
    
    try {
      switch (type) {
        case 'summarize':
          const summaryResult = await openaiService.summarizeText(inputText);
          setSummary(summaryResult);
          setShowSummaryDialog(true);
          break;
          
        case 'extract':
          const extractedData = await openaiService.extractInformation(inputText);
          setExtractedInfo(extractedData);
          setShowInfoDialog(true);
          break;
          
        case 'suggest':
          const suggestionsResult = await openaiService.generateSuggestions(inputText);
          setSuggestions(suggestionsResult);
          setShowSuggestionsDialog(true);
          break;
          
        default:
          console.error('Unknown AI processing type:', type);
      }
    } catch (error) {
      console.error('Error processing with AI:', error);
      Alert.alert('Error', 'Failed to process your text with AI. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle voice input
  const handleVoiceInput = () => {
    setIsVoiceInputActive(true);
    
    voiceService.performVoiceSearch((result) => {
      setIsVoiceInputActive(false);
      
      if (!result.error && result.results.length > 0) {
        setInputText((prev) => {
          if (prev.trim() === '') {
            return result.results[0];
          } else {
            return prev + ' ' + result.results[0];
          }
        });
      } else {
        Alert.alert('Voice Input', result.message);
      }
    });
  };
  
  // Speak text using text-to-speech
  const speakText = (text) => {
    voiceService.speakText(text);
  };
  
  // Clear input text
  const clearText = () => {
    setInputText('');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.inputCard}>
        <Card.Content>
          <Title>AI Text Processor</Title>
          <Paragraph>Enter or speak your text, then use AI tools to analyze it.</Paragraph>
          
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={8}
            placeholder="Type or speak your text here..."
            value={inputText}
            onChangeText={setInputText}
            mode="outlined"
          />
          
          <View style={styles.inputButtonsContainer}>
            <IconButton
              icon="microphone"
              size={28}
              onPress={handleVoiceInput}
              color={theme.colors.primary}
            />
            <IconButton
              icon="eraser"
              size={28}
              onPress={clearText}
              color={theme.colors.error}
            />
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.aiToolsContainer}>
        <Title style={styles.aiToolsTitle}>AI Tools</Title>
        
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => processWithAI('summarize')}
          disabled={processing || inputText.trim().length < 20}
        >
          <Card style={[styles.card, processing && styles.disabledCard]}>
            <Card.Content>
              <Ionicons name="text" size={36} color={theme.colors.primary} />
              <Title>Summarize</Title>
              <Paragraph>Create a concise summary of your text.</Paragraph>
            </Card.Content>
          </Card>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => processWithAI('extract')}
          disabled={processing || inputText.trim().length < 20}
        >
          <Card style={[styles.card, processing && styles.disabledCard]}>
            <Card.Content>
              <Ionicons name="information-circle" size={36} color={theme.colors.primary} />
              <Title>Extract Key Info</Title>
              <Paragraph>Pull out dates, locations, action items, and people.</Paragraph>
            </Card.Content>
          </Card>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => processWithAI('suggest')}
          disabled={processing || inputText.trim().length < 20}
        >
          <Card style={[styles.card, processing && styles.disabledCard]}>
            <Card.Content>
              <Ionicons name="bulb" size={36} color={theme.colors.primary} />
              <Title>Generate Suggestions</Title>
              <Paragraph>Get smart recommendations based on your text.</Paragraph>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>
      
      {processing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.processingText}>Processing with AI...</Text>
        </View>
      )}
      
      {/* Summary Dialog */}
      <Portal>
        <Dialog
          visible={showSummaryDialog}
          onDismiss={() => setShowSummaryDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Summary</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              <Paragraph>{summary}</Paragraph>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => speakText(summary)}>Read Aloud</Button>
            <Button onPress={() => setShowSummaryDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Extracted Info Dialog */}
      <Portal>
        <Dialog
          visible={showInfoDialog}
          onDismiss={() => setShowInfoDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Extracted Information</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              {extractedInfo && (
                <View>
                  {extractedInfo.dates && extractedInfo.dates.length > 0 && (
                    <View style={styles.infoSection}>
                      <Title style={styles.infoTitle}>Dates</Title>
                      <View style={styles.chipContainer}>
                        {extractedInfo.dates.map((date, index) => (
                          <Chip key={index} style={styles.chip} mode="outlined">{date}</Chip>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {extractedInfo.locations && extractedInfo.locations.length > 0 && (
                    <View style={styles.infoSection}>
                      <Title style={styles.infoTitle}>Locations</Title>
                      <View style={styles.chipContainer}>
                        {extractedInfo.locations.map((location, index) => (
                          <Chip key={index} style={styles.chip} mode="outlined">{location}</Chip>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {extractedInfo.people && extractedInfo.people.length > 0 && (
                    <View style={styles.infoSection}>
                      <Title style={styles.infoTitle}>People</Title>
                      <View style={styles.chipContainer}>
                        {extractedInfo.people.map((person, index) => (
                          <Chip key={index} style={styles.chip} mode="outlined">{person}</Chip>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {extractedInfo.actionItems && extractedInfo.actionItems.length > 0 && (
                    <View style={styles.infoSection}>
                      <Title style={styles.infoTitle}>Action Items</Title>
                      {extractedInfo.actionItems.map((item, index) => (
                        <Paragraph key={index} style={styles.actionItem}>• {item}</Paragraph>
                      ))}
                    </View>
                  )}
                  
                  {extractedInfo.tags && extractedInfo.tags.length > 0 && (
                    <View style={styles.infoSection}>
                      <Title style={styles.infoTitle}>Tags</Title>
                      <View style={styles.chipContainer}>
                        {extractedInfo.tags.map((tag, index) => (
                          <Chip key={index} style={styles.chip} mode="outlined">{tag}</Chip>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowInfoDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Suggestions Dialog */}
      <Portal>
        <Dialog
          visible={showSuggestionsDialog}
          onDismiss={() => setShowSuggestionsDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Suggestions</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              {suggestions.map((suggestion, index) => (
                <Card key={index} style={styles.suggestionCard}>
                  <Card.Content>
                    <Paragraph>{suggestion}</Paragraph>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSuggestionsDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inputCard: {
    margin: theme.spacing.m,
    elevation: 2,
  },
  textInput: {
    marginTop: theme.spacing.m,
  },
  inputButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.s,
  },
  aiToolsContainer: {
    padding: theme.spacing.m,
  },
  aiToolsTitle: {
    marginBottom: theme.spacing.m,
  },
  aiCard: {
    marginBottom: theme.spacing.m,
  },
  card: {
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  processingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    margin: theme.spacing.m,
  },
  processingText: {
    marginLeft: theme.spacing.s,
    fontSize: 16,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    maxHeight: 400,
  },
  infoSection: {
    marginBottom: theme.spacing.m,
  },
  infoTitle: {
    fontSize: 18,
    marginBottom: theme.spacing.s,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  actionItem: {
    marginVertical: 4,
  },
  suggestionCard: {
    marginBottom: theme.spacing.s,
  },
});

export default AIHubScreen;