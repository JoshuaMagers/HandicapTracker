# 🏌️ Golf Handicap Tracker

A mobile-friendly Progressive Web App for tracking your golf scores and calculating your handicap index.

![Golf Handicap Tracker Screenshot](https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Golf+Handicap+Tracker)

## 🌟 Live Demo

Visit the live demo: [Golf Handicap Tracker](https://joshuamagers.github.io/HandicapTracker/)

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Installation](#-installing-on-your-phone)
- [Usage](#-how-to-use)
- [Technologies](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **📱 Mobile-Optimized**: Designed specifically for use on your phone
- **📊 Handicap Calculation**: Automatic USGA-style handicap calculation
- **📈 Score Tracking**: Keep track of all your rounds with detailed information
- **👀 Round Management**: View, edit, and delete any past round with detailed modals
- **🔄 Smart Sorting**: Sort rounds by date, score, or performance
- **📱 Swipe Actions**: Swipe left on mobile to quickly delete rounds
- **🏆 Achievements**: Unlock badges as you improve your game
- **📱 PWA**: Install on your phone like a native app
- **🔄 Offline Support**: Works even without internet connection
- **🌙 Dark Mode**: Automatic dark mode support
- **📊 Statistics**: View trends and track your improvement
- **⌨️ Keyboard Shortcuts**: Press Escape to close modals

## 🚀 Getting Started

### Option 1: Python Server (Recommended)
```bash
cd src
python -m http.server 8080
```
Then open http://localhost:8080 in your browser.

### Option 2: Node.js (if you have Node installed)
```bash
npm install
npm start
```

## 📱 Installing on Your Phone

1. Open the app in your mobile browser
2. Look for "Add to Home Screen" option in your browser menu
3. Follow the prompts to install the app
4. The app will now work like a native app on your phone!

## 🏌️ How to Use

### Adding a Round
1. Fill in the course name, date, and your score
2. Adjust course rating and slope rating if needed (defaults to par 72, slope 113)
3. Tap "Add Round" to save

### Understanding Your Handicap
- Your handicap is calculated using a simplified USGA method
- You need at least 3 rounds for a handicap calculation
- The app uses your best differentials from recent rounds
- Lower handicap = better golfer!

### Features
- **Dashboard**: See your current handicap, stats, and achievements
- **Recent Rounds**: View and manage your round history with sorting options
- **Round Management**: 
  - 📋 **View**: Tap "View" to see detailed round information including rank and differential
  - ✏️ **Edit**: Tap "Edit" to modify any round details
  - 🗑️ **Delete**: Tap "Delete" or swipe left on mobile to remove rounds
- **Smart Sorting**: Sort rounds by newest/oldest/best/worst scores
- **Trends**: See if your game is improving
- **Auto-complete**: Course names are remembered for easy re-entry
- **Keyboard Shortcuts**: Press Escape to close modals

## 🎯 Handicap Calculation

The app uses a simplified version of the USGA Handicap System:

1. **Score Differential** = (Score - Course Rating) × 113 ÷ Slope Rating
2. **Best Differentials**: Uses your lowest differentials based on number of rounds
3. **Handicap Index** = Average of best differentials × 0.96

### Number of Rounds vs Differentials Used:
- 3-5 rounds: 1 differential
- 6 rounds: 2 differentials  
- 7-8 rounds: 2 differentials
- 9+ rounds: Best 40% of differentials

## 📊 Statistics Tracked

- **Current Handicap Index**
- **Total Rounds Played**
- **Best Score**
- **Recent Average Score**
- **Improvement Trends**
- **Achievement Badges**

## 🏆 Achievements

Unlock badges as you reach milestones:
- 🏌️ First Round
- 🎯 10 Rounds  
- 🏆 Veteran Player (20 rounds)
- 💪 Sub-90 Round
- 🔥 Sub-80 Round
- 🌟 Single Digit Handicap
- ⭐ Under 5 Handicap

## 💾 Data Storage

All data is stored locally in your browser using localStorage:
- Your data stays on your device
- No account required
- Works offline
- Data persists between sessions

## 🔧 Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: Local Storage API for data persistence
- **PWA**: Service Worker, Web App Manifest
- **Responsive**: Mobile-first design with CSS Grid and Flexbox
- **Offline**: Full offline functionality
- **Accessibility**: High contrast support, keyboard navigation

## 📱 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ✅ Samsung Internet

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- USGA for handicap calculation guidelines
- Golf course data from various public sources
- Progressive Web App patterns and best practices

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

**Ready to improve your golf game? Start tracking your scores today! ⛳**