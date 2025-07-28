# Firebase Setup Checklist for Golf Handicap Tracker

## ✅ Configuration Status

- [x] **Firebase Config Added**: Your configuration is in `auth.js` and `cloud-sync.js`
- [x] **Project Created**: `handicaptracker-65a8d`
- [x] **App Registered**: Web app configured
- [x] **Code Updated**: All files have your Firebase configuration

## 🔧 Firebase Console Setup Required

### 1. Enable Authentication
1. Go to: https://console.firebase.google.com/project/handicaptracker-65a8d/authentication/providers
2. Click "Get started" if needed
3. Click on "Email/Password"
4. Toggle "Enable" to ON
5. Click "Save"

### 2. Create Firestore Database
1. Go to: https://console.firebase.google.com/project/handicaptracker-65a8d/firestore
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select a location (recommend: us-central1)
5. Click "Done"

### 3. Set Firestore Security Rules
1. In Firestore, go to "Rules" tab
2. Replace the default rules with:

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

3. Click "Publish"

## 🧪 Testing Steps

1. **Start the app**: Server should be running on http://localhost:8080
2. **Check console**: Open browser dev tools, look for Firebase errors
3. **Create account**: Try signing up with a real email
4. **Add golf round**: Test if data syncs to cloud
5. **Check Firestore**: Verify data appears in Firebase Console

## 🚨 Common Issues & Solutions

### "Firebase not initialized"
- Check browser console for specific errors
- Verify you've enabled Authentication and created Firestore database

### "Auth domain not authorized"
- Make sure you're accessing via http://localhost:8080 (not file://)
- Check that your domain is authorized in Firebase Console

### "Firestore permission denied"
- Verify security rules are published
- Check that user is signed in before trying to save data

## 📞 Need Help?

1. Check browser console (F12 → Console tab)
2. Check Firebase Console for error logs
3. Verify all Firebase services are enabled
4. Test with a fresh browser session (clear cache)

## 🎯 Next Steps After Setup

Once everything is working:
1. Test on multiple devices
2. Try offline/online scenarios
3. Add more golf rounds to test sync
4. Consider deploying to Firebase Hosting

---

**Status**: Ready to test! Complete the Firebase Console setup above, then test your account creation.
