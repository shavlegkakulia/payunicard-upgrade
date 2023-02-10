import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const SplashScreen = () => <View style={styles.splash}><Image source={require('../assets/images/ICON.png')} /></View>

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default SplashScreen;