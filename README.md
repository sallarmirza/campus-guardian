# Campus Guardian

A smart surveillance and violation management system for university campuses using machine learning and real-time monitoring.

## Project Structure

```
Campus Guard/
├── backend/          # Node.js API server
├── web-admin/        # React admin panel
├── mobile-app/       # React Native mobile app
├── ml-pipeline/      # Machine learning detection models
├── docs/            # Documentation
└── README.md
```

## Features

- **Automated Detection**: Smoking, dress-code violations using ML
- **Student Identification**: Face recognition with fallback options
- **Incident Management**: Real-time logging and verification workflow
- **Mobile & Web Apps**: Cross-platform admin tools
- **Analytics**: Violation trends and reporting
- **Privacy-First**: Manual verification, consent-based, secure data handling

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Web**: React/Next.js
- **Mobile**: React Native
- **ML**: YOLOv8, FaceNet, OpenCV
- **Storage**: AWS S3 / Firebase
- **Auth**: JWT with role-based access

## Getting Started

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Web Admin Panel**
   ```bash
   cd web-admin
   npm install
   npm start
   ```

3. **Mobile App**
   ```bash
   cd mobile-app
   npm install
   npx react-native run-android  # or run-ios
   ```

4. **ML Pipeline**
   ```bash
   cd ml-pipeline
   pip install -r requirements.txt
   python detection_service.py
   ```

## Privacy & Ethics

- Written consent from all participants
- Manual verification before penalties
- Data encryption and retention policies
- Student appeal process
- Compliance with privacy regulations

## License

This project is for educational purposes as part of Final Year Project.