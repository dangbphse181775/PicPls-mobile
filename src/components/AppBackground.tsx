/**
 * AppBackground — Global background component
 * Renders the cinematic bokeh image + dark overlay behind ALL screens.
 * Used once at App.tsx level so every screen inherits it automatically.
 */
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function AppBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0F0F1A' }]} pointerEvents="none">
      <Image
        source={require('../../assets/bg.png')}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    opacity: 0.18,
  },
});
