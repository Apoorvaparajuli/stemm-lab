# STEMM Lab

STEMM Lab is a mobile application designed for students to participate in collaborative STEMM-based activities and challenges. The application allows users to complete challenges, submit results, access STEMM learning resources, use mobile device features, and collaborate within teams using a modern mobile experience.

This project was developed using Expo and React Native as part of a Mobile Application Development assessment project.

---

# Features

## Authentication

- User Login
- User Registration
- Logout Functionality
- Firebase Authentication Integration

## STEMM Challenges

- View STEMM challenges
- Challenge detail pages
- Submit challenge/activity results
- Progress tracking

## Maps and Location

- GPS-based challenge locations
- Interactive map screen
- Location permission handling

## Device Features

- Torch functionality
- Battery status monitoring
- Notifications
- Camera and location permissions

## Resources

- STEMM learning resources
- Educational content and materials

## User Profile

- Team/student profile
- Edit profile settings

## Settings

- Notifications toggle
- Dark mode toggle
- Delete account
- About STEMM Lab

---

# Technologies Used

- Expo
- React Native
- TypeScript
- Expo Router
- Firebase Authentication
- Firebase Firestore
- Firebase Test Lab
- Jest Testing Framework

---

# Project Structure

```txt
app/
  _layout.tsx
  index.tsx

  login/
    index.tsx

  register/
    index.tsx

  home/
    index.tsx

  tasks/
    index.tsx
    add/
      index.tsx
    [id]/
      index.tsx

  map/
    index.tsx

  safety/
    index.tsx

  resources/
    index.tsx

  profile/
    index.tsx
```

Note:
The `tasks` section represents STEMM Challenges within the application interface.

---

# Installation

## 1. Install dependencies

```bash
npm install
```

## 2. Start the development server

```bash
npx expo start
```

---

# Running the App

The app can be opened using:

- Expo Go
- Android Emulator
- iOS Simulator
- Physical Android or iOS device

---

# Firebase Features

The application uses Firebase for:

## Firebase Authentication

Used for:

- Login
- Registration
- User session management

## Firebase Firestore

Used for:

- User profile storage
- Challenge data
- STEMM activity submissions

## Firebase Test Lab

Used for:

- Automated device testing
- Compatibility testing
- Application validation

---

# Device Capabilities

The application demonstrates the use of mobile device capabilities including:

- GPS and Maps
- Torch
- Battery monitoring
- Notifications
- Camera and permissions

---

# Testing

Testing was completed using:

- Jest Unit Testing
- Integration Testing
- End-to-End Testing
- Firebase Test Lab

---

# Purpose of the Application

STEMM Lab was designed to support collaborative STEMM learning through interactive mobile experiences. The application encourages students to participate in STEMM-based activities using modern mobile technologies and device capabilities.

The project demonstrates:

- Mobile application architecture
- Firebase integration
- Sensor and device API usage
- Agile development practices
- Testing and deployment workflows

---

# Development Team

Developed as part of a university mobile application development assessment project.

---

# Future Improvements

Potential future improvements include:

- Real-time team chat
- Advanced leaderboard system
- More STEMM activity types
- Offline challenge syncing
- Enhanced analytics and reporting
- Push notification scheduling
- Gamification and achievement badges
