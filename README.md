## About

SafePass is a **privacy-first digital safety application** designed to protect young users online without collecting personal data.

The app runs a **local safety engine directly on the device**, scanning content such as messages, images, and links before they reach the user.

All analysis happens **on-device**, which means:

- no personal data leaves the device
- no monitoring of private conversations
- no centralized tracking

SafePass acts as a **local safety layer**, similar to how a VPN protects network traffic, helping reduce exposure to scams, harmful content, and manipulative patterns while maintaining user privacy.

## Key Features

- Privacy-first design
- On-device safety analysis
- Scam link detection
- Predatory language detection
- Image metadata protection
- Manipulative content detection
- VPN-style protection toggle
- Local safety activity dashboard

---

## Technology Stack

- **React Native**
- **Expo**
- **TypeScript**
- **SQLite (expo-sqlite)**
- **TensorFlow.js**
- **EXIF metadata libraries**

---

## Software Architecture

SafePass follows a **local-first architecture**, meaning all safety analysis happens directly on the user's device.

User Interaction
↓
SafePass Engine
↓
Safety Modules
↓
Local Rules Database
↓
Safety Decision


### SafePass Engine

The **SafePass Engine** is the central controller of the system.

Responsibilities:

- receive content from the app
- route content to the correct safety module
- collect analysis results
- decide the safety response

Possible outcomes:

- **Safe** → content is allowed
- **Warning** → user receives a warning
- **Block** → content is prevented

### Safety Modules

SafePass includes four independent safety modules.

**Media Scanner**

- scans images
- removes sensitive metadata
- detects harmful media

**Interaction Filter**

- analyzes messages
- detects suspicious or predatory language

**Scam Link Detector**

- checks links against a local scam domain database

**Dark Pattern Detector**

- detects manipulative content patterns such as false urgency or deceptive messaging

### Local Storage

SafePass stores all rules and safety logs **locally using SQLite**.

Stored data includes:

- scam domain database
- pattern detection rules
- safety event logs

No personal data is sent to external servers.

## How to Use

### 1. Clone the Repository

### git clone https://github.com/your-username/safepass.git  
### cd safepass

### 2. Install Dependencies

### npm install

### 3. Start the Development Server

### npm start

### 4. Run the Application

Run on Android:

### npm run android

Run on iOS:

### npm run ios

You can also scan the QR code using the **Expo Go** mobile app.

### 5. Use the App

1. Open the SafePass app
2. Turn **Protection ON**
3. SafePass will begin scanning content locally

## Contributing

Contributions are welcome.

### Steps to Contribute

1. Fork the repository on GitHub

2. Clone your fork

### git clone https://github.com/your-username/safepass.git  
### cd safepass

3. Create a new branch

### git checkout -b feature-name

4. Make your changes and commit them

### git commit -m "Describe your changes"

5. Push the branch

### git push origin feature-name

6. Open a Pull Request on GitHub

## License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute this software with proper attribution.
