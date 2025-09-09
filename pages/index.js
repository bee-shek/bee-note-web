import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';

export default function Home() {
  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff', shadowOpacity: 0.05, shadowRadius: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 8 }}>🐝 Bee Note (Web)</Text>
        <Text style={{ opacity: 0.8, marginBottom: 16 }}>
          This is a Next.js + React Native Web starter. It already renders React Native components in the browser.
        </Text>

        <Pressable onPress={() => alert('It works!')} style={{ padding: 12, backgroundColor: '#111827', borderRadius: 10 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Test Button</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 28 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>How to use with your Snack App.js</Text>
        <Text style={{ lineHeight: 20 }}>
          1) Open <Text style={{ fontWeight: '700' }}>pages/index.js</Text> in your GitHub repo.
        </Text>
        <Text style={{ lineHeight: 20 }}>
          2) Replace this component with your Snack <Text style={{ fontWeight: '700' }}>App.js</Text> code.
        </Text>
        <Text style={{ lineHeight: 20 }}>
          3) Replace any <Text style={{ fontWeight: '700' }}>findNodeHandle/UIManager</Text> usage with web-safe code (use <Text style={{ fontWeight: '700' }}>scrollIntoView</Text>).
        </Text>
        <Text style={{ lineHeight: 20 }}>
          4) Commit → Netlify builds automatically.
        </Text>
      </View>
    </ScrollView>
  );
}
