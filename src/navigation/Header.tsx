
import {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import {Image, View, TouchableOpacity, StyleSheet, Text, Platform, Dimensions} from 'react-native';

import colors from '../constants/colors';
import {headerHeight} from '../constants/defaults';
import { ka_ge } from '../lang';
import  NavigationService from '../services/NavigationService';
import Routes from './routes';
import { SvgXml } from 'react-native-svg';
import { payLogo, payLogo_en } from '../constants/svgXmls';
import {SideDrawer} from './AppStack';

const DefaultOptions = ({
  navigation,
  lang
}: {
  navigation: any;
  lang: string
}): StackNavigationOptions => ({
  headerTitleAlign: 'center',
  headerStyle: [styles.header, Platform.OS === 'android' && {height: headerHeight}],
  headerShown: true,
  headerLeft: () => (
    <View style={styles.notification}>
      <TouchableOpacity onPress={() => NavigationService.navigate(Routes.notifications)}>
        <Image
          source={require('./../assets/images/notification.png')}
          style={styles.leftItem}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  ),
  headerTitle: () => (
    <View>
      <SvgXml xml={lang === ka_ge ? payLogo : payLogo_en} height="42" />
    </View>
  ),
  headerRight: () => {
    return (
      <View>
        <TouchableOpacity
          style={styles.hamburger}
          onPress={() =>  SideDrawer?.openDrawer()}>
          <Image
            source={require('./../assets/images/hamburger.png')}
            style={styles.rightItem}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  },
});

export const DefaultOptionsDrawer = ({
  route,
  navigation,
  title,
  hideHeader,
  backText,
}: {
  route: any;
  navigation: any;
  title: string;
  hideHeader?: boolean;
  backText?: string;
}): StackNavigationOptions => ({
  headerTitleAlign: 'center',
  headerStyle: [styles.header, Platform.OS === 'android' && {height: headerHeight}],
  headerShown: hideHeader ? false : true,
  gestureEnabled: true,
  headerLeft: () => (
    <View style={styles.backButon}>
      {backText && <TouchableOpacity style={styles.back} onPress={() => { NavigationService.GoBack() }}>
        <Image
          style={styles.backImg}
          source={require('./../assets/images/back-arrow-primary.png')}
        />
        <Text style={styles.backText}>{backText}</Text>
      </TouchableOpacity>}
    </View>
  ),
  headerTitle: () => (
    <Text numberOfLines={1} style={styles.headerTitle}>
      {title}
    </Text>
  ),
  headerRight: () => (
    <View>
      <TouchableOpacity style={styles.hamburger} onPress={() => SideDrawer?.openDrawer()}>
        <Image
          source={require('./../assets/images/hamburger.png')}
          style={styles.rightItem}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  ),
});

export const UnauthScreenOptionsDrawer = ({
  navigation,
  title,
  hideHeader,
  backText,
  animationEnabled
}: {
  navigation: any;
  title: string;
  hideHeader?: boolean;
  backText?: string;
  animationEnabled?: boolean;
}): StackNavigationOptions => ({
  headerTitleAlign: 'center',
  headerStyle: [styles.header, Platform.OS === 'android' && {height: headerHeight}],
  headerShown: hideHeader ? false : true,
  gestureEnabled: false,
  animationEnabled: animationEnabled === undefined ? true : animationEnabled === false ? false : true,
  headerLeft: () => (
    <View style={styles.backButon}>
      <TouchableOpacity style={styles.back} onPress={() => { navigation.goBack(); }}>
        <Image
          style={styles.backImg}
          source={require('./../assets/images/back-arrow-primary.png')}
        />
        <Text style={styles.backText}>{backText}</Text>
      </TouchableOpacity>
    </View>
  ),
  headerTitle: () => (
   null
  ),
  headerRight: () => (
    <Text numberOfLines={1} style={styles.rightTitle}>
      {title}
    </Text>
  ),
});



const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.baseBackgroundColor,
    shadowOffset: {height: 0, width: 0},
    shadowColor: 'transparent',
    elevation: 0,
  },
  notification: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 20,
    backgroundColor: '#f0f7e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButon: {
    height: 40,
    borderRadius: 20,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburger: {
    marginRight: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payunicard: {
    width: 57,
    height: 30,
  },
  leftItem: {
    width: 40,
    height: 40,
  },
  logo: {
    height: 42,
  },
  rightItem: {
    width: 26,
    height: 17,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 20,
    minWidth: 45,
    alignSelf: 'center'
  },
  backImg: {
    marginRight: 12,
  },
  backText: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.primary,
    fontSize: 14,
    lineHeight: 17,
  },
  headerTitle: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 14,
    lineHeight: 17,
    maxWidth: Dimensions.get('screen').width - 150,
  },
  rightTitle: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 14,
    maxWidth: '100%',
    marginRight: 20
  },
});

export default DefaultOptions;
