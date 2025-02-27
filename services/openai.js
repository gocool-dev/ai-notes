import axios from 'axios';
import Constants from 'expo-constants';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1';
// In production, use environment variables or a more secure method
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; 

// Create pre-configured axios instance for OpenAI API
const openaiClient = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  }
});

/**
 * Summarize text using OpenAI GPT-4
 * @param {string} text - The text to summarize
 * @param {number} maxLength - Maximum length of summary in tokens (optional)
 * @returns {Promise<string>} The summarized text
 */
export const summarizeText = async (text, maxLength = 100) => {
  try {
    const response = await openaiClient.post('/chat/completions', {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that summarizes text. Create a concise summary in no more than ${maxLength} tokens.`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: maxLength,
      temperature: 0.5
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in AI summarization:', error);
    throw new Error('Failed to summarize text. Please try again later.');
  }
};

/**
 * Extract key information like dates, places, and action items from text
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} Extracted information
 */
export const extractInformation = async (text) => {
  try {
    const response = await openaiClient.post('/chat/completions', {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Extract key information from the following text. Return JSON with these fields: dates (array), locations (array), actionItems (array), people (array), and tags (array)."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const content = response.data.choices[0].message.content.trim();
    // Extract JSON from potential markdown code block
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1] || content;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error in information extraction:', error);
    return {
      dates: [],
      locations: [],
      actionItems: [],
      people: [],
      tags: []
    };
  }
};

/**
 * Generate contextual suggestions based on note content
 * @param {string} text - The note text
 * @returns {Promise<Array<string>>} List of suggestions
 */
export const generateSuggestions = async (text) => {
  try {
    const response = await openaiClient.post('/chat/completions', {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Based on this note, provide 3 helpful suggestions or related actions the user might want to take. Return as a JSON array of strings."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    const content = response.data.choices[0].message.content.trim();
    // Extract JSON from potential markdown code block
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1] || content;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return ['Take notes', 'Set a reminder', 'Share this note'];
  }
};

export default {
  summarizeText,
  extractInformation,
  generateSuggestions
};