import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
            <Text style={{ color: '#F5A623', fontSize: 24 }}>DevCompass Test</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, marginTop: 10 }}>If you see this, the app is loading!</Text>
            <StatusBar style="light" />
        </View>
    );
}
