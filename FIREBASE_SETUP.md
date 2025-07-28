# Firebase Setup Instructions for Golf Handicap Tracker

## 🚀 Quick Start (Your Setup)

**Your Firebase project is already configured!** You just need to:

1. ✅ **App Configuration**: Already completed - your Firebase config is in the code
2. 🔧 **Enable Authentication**: Go to [Firebase Console](https://console.firebase.google.com/project/handicaptracker-65a8d/authentication/providers) and enable Email/Password
3. 🗄️ **Set up Firestore**: Go to [Firestore Database](https://console.firebase.google.com/project/handicaptracker-65a8d/firestore) and create a database
4. 🔐 **Add Security Rules**: Copy the rules from below into Firestore Rules tab
5. 🧪 **Test**: Start the server and create an account!

## Overview
This Golf Handicap Tracker now includes user authentication and cloud data synchronization using Firebase. Follow these steps to set up your Firebase project and configure the app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "golf-handicap-tracker")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click "Get started" if this is your first time
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Set up Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode" (for production)
4. Select a location for your database (choose one close to your users)
5. Click "Done"

### Firestore Security Rules (for production)
Replace the default rules with these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own golf data
    match /golf-data/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && validateGolfData(resource.data);
    }
  }
}

// Function to validate golf data structure
function validateGolfData(data) {
  return data.keys().hasAll(['rounds', 'handicap', 'stats']) &&
         data.rounds is list &&
         data.rounds.size() <= 50 && // Limit rounds to 50 per user
         (data.handicap == null || data.handicap is number) &&
         data.stats is map;
}
```

For development/testing, you can start with simpler rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /golf-data/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 4: Get Firebase Configuration

1. In your Firebase project console, click the gear icon (Settings) in the left sidebar
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "Golf Handicap Tracker Web")
6. Check "Also set up Firebase Hosting" if you want to host on Firebase (optional)
7. Click "Register app"
8. Copy the Firebase configuration object

## Step 5: Configure the App ✅ COMPLETED

Your Firebase configuration has already been added to the app files:

- ✅ `src/js/auth.js` - Updated with your Firebase config
- ✅ `src/js/cloud-sync.js` - Updated with your Firebase config

Your project details:
- **Project ID**: `handicaptracker-65a8d`
- **Auth Domain**: `handicaptracker-65a8d.firebaseapp.com`
- **App ID**: `1:420060832386:web:f03e2d6b47ff72ad704a9b`

**No further action needed for this step!**

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:8080`

3. You should see the authentication screen

4. Try creating a new account with a valid email address

5. Once signed in, add some golf rounds and verify they sync to the cloud

## Step 7: Deploy (Optional)

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init hosting
   ```

4. When prompted:
   - Select your Firebase project
   - Set public directory to `src`
   - Configure as single-page app: `No`
   - Don't overwrite index.html

5. Deploy:
   ```bash
   firebase deploy
   ```

### Deploy to Other Platforms

The app is a static web application, so you can deploy it to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

Just upload the `src` folder contents to your hosting provider.

## Features Included

✅ **User Authentication**
- Email/password sign up and sign in
- Password reset functionality
- Secure user sessions

✅ **Cloud Data Sync**
- Automatic backup of golf rounds to cloud
- Real-time sync across devices
- Offline functionality with sync when online
- Data merge conflict resolution

✅ **Multi-Device Support**
- Sign in from any device
- Data automatically syncs
- Consistent experience across devices

✅ **Security**
- Each user can only access their own data
- Encrypted data transmission
- Secure authentication tokens

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" errors**
   - Make sure you've replaced the configuration in both `auth.js` and `cloud-sync.js`
   - Check that your Firebase project is active

2. **Authentication not working**
   - Verify Email/Password is enabled in Firebase Console
   - Check browser console for error messages

3. **Data not syncing**
   - Ensure Firestore is set up and security rules allow access
   - Check network connectivity
   - Look for error messages in browser console

4. **App not loading**
   - Make sure you're serving the files over HTTP (not opening file:// URLs)
   - Check that all Firebase scripts are loading correctly

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Test with a fresh browser session
4. Check Firebase Console for authentication and database logs

## Security Best Practices

1. **Use Environment Variables**: In production, store Firebase config in environment variables
2. **Set up proper Firestore rules**: Don't leave in test mode for production
3. **Monitor usage**: Keep an eye on Firebase usage quotas
4. **Regular backups**: Consider exporting data periodically for additional backup

## Firebase Pricing

Firebase offers a generous free tier that should be sufficient for personal use:
- Authentication: 50,000 free users
- Firestore: 50,000 reads, 20,000 writes per day
- Storage: 1GB free

For higher usage, check Firebase pricing at: https://firebase.google.com/pricing
