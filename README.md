# AI-Powered Note-Taking App

A cross-platform mobile application built with React Native and Expo that leverages AI for enhanced note-taking functionality.

## Features

- **Effortless Input**: Create notes using text or voice input
- **AI Summarization**: Automatically generate concise summaries of your notes
- **Smart Reminders**: Get contextual alerts for events, dates, and locations
- **Voice Search**: Search through your notes using voice commands
- **Location-Based Alerts**: Receive reminders triggered by your geolocation
- **Collaboration**: Share and collaborate on notes with others

## Tech Stack

### Frontend
- React Native
- Expo
- React Navigation for navigation
- React Native Paper for UI components

### Backend
- Firebase Firestore for database
- Firebase Authentication for user management
- OpenAI GPT-4 API for AI features

### Third-Party Integrations
- Google Maps API for location services
- Google Speech-to-Text API for voice recognition
- Firebase Cloud Messaging for push notifications

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Firebase account
- OpenAI API key
- Google Cloud account (for Maps and Speech APIs)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-notes-app.git
cd ai-notes-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Update Firebase configuration
Edit the `firebase.js` file in the `services` directory with your Firebase project credentials.

5. Start the development server
```bash
expo start
```

## Project Structure

```
ai-notes-app/
├── App.js                # Main application entry point
├── app.json              # Expo configuration
├── assets/               # Static assets like images
├── components/           # Reusable UI components
├── screens/              # App screens
├── navigation/           # Navigation configuration
├── services/             # Service integrations
├── utils/                # Utility functions
├── store/                # State management
└── config/               # Configuration files
```

## Development Plan

### MVP Features
- Note creation (text and voice input)
- AI-powered summarization (using OpenAI GPT-4)
- Location-based reminders (using Google Maps API)
- Push notifications (using Firebase Cloud Messaging)

### Advanced Features
- Voice search (using Google Speech-to-Text API)
- Flight price tracking (using Skyscanner API)
- Shopping and gift suggestions (using Amazon Product Advertising API)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for their GPT-4 API
- [Expo](https://expo.dev/) for the development platform
- [Firebase](https://firebase.google.com/) for backend services
- [Google Cloud](https://cloud.google.com/) for Maps and Speech-to-Text APIs