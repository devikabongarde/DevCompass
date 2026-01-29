# DevCompass - Feature Navigation Guide

## 🗺️ Where to Find Everything

### **1. Chat & Messaging** 💬
- **Location**: People tab → Recent conversations
- **Direct Access**: 
  - From teammates list → "Send Invite" → Creates chat
  - From user profiles → "Message" button
  - From team invites → Accept invite → Team chat
- **Screen**: `ChatScreen.tsx`

### **2. Profile Features** 👤
- **Your Profile**: Profile tab (bottom navigation)
- **Full Profile View**: Profile tab → "View Full Profile" 
- **Edit Profile**: Profile tab → "Edit Profile" (to be added)
- **Other Users**: From teammates → Tap user → `UserProfileScreen`
- **Follow/Unfollow**: In any user's profile screen

### **3. Team & Social Features** 🤝
- **Find Teammates**: 
  - Right swipe on hackathon cards
  - Tap blue "View teammates" badge
- **View Available Teammates**: `TeammatesListScreen`
- **Team Invites**: People tab → "Invites" section
- **Your Teams**: People tab → "Teams" section
- **Send Invites**: From teammates list → "Send Invite" button

### **4. Hackathon Features** 🏆
- **Browse**: Feed tab (main screen)
- **Save**: Left swipe or heart button
- **Saved List**: Profile tab → "Saved Hackathons"
- **Calendar View**: Calendar tab
- **Details**: Tap any hackathon card

### **5. Navigation Flow**
```
Feed → Swipe Right → TeammateModal (register)
Feed → Tap Blue Badge → TeammatesListScreen → Send Invite → ChatScreen

Profile → View Full Profile → UserProfileScreen → Message → ChatScreen
People → Invites → Accept → Team Chat
People → Teams → Tap Team → Team Chat
```

### **6. Missing Features to Add**
- [ ] Edit Profile screen
- [ ] Search users functionality  
- [ ] Notifications screen
- [ ] Settings screen
- [ ] Followers/Following lists

### **7. Quick Access**
- **Chat**: People tab or from any user profile
- **Profile**: Profile tab → "View Full Profile"
- **Teams**: People tab
- **Saved**: Profile tab → "Saved Hackathons"