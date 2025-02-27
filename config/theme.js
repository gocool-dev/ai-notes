import { DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
    notification: '#f50057',
    // Custom colors
    noteBg: '#f0f0f0',
    noteAccent: '#6200ee',
    success: '#4CAF50',
    warning: '#FB8C00',
    info: '#2196F3',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'space-mono',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'space-mono',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'space-mono',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'space-mono',
      fontWeight: 'normal',
    },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  roundness: 8,
};

export default theme;