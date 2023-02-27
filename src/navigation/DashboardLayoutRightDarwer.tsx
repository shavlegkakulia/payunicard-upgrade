import React, {useEffect, useRef} from 'react';
import {BackHandler, Dimensions, View, StyleSheet} from 'react-native';
import {DrawerLayout} from 'react-native-gesture-handler';
import colors from '../constants/colors';
import UnicardView from '../containers/UnicardView';
import {tabHeight} from './TabNav';

export let UnicardSideDrawer: DrawerLayout | null = null;

type Props = {
  children: JSX.Element,
};
const DashboardLayoutRightDarwer: React.FC<Props> = props => {
  const screenWidth = Dimensions.get('window').width;
  const isDrawerOpened = useRef<boolean>();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDrawerOpened.current) {
        UnicardSideDrawer?.closeDrawer();
        return true;
      } else {
        return false;
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <DrawerLayout
      drawerWidth={screenWidth}
      drawerLockMode={'unlocked'}
      drawerPosition="right"
      keyboardDismissMode="on-drag"
      drawerBackgroundColor={colors.white}
      onDrawerOpen={() => (isDrawerOpened.current = true)}
      onDrawerClose={() => (isDrawerOpened.current = false)}
      ref={drawer => {
        UnicardSideDrawer = drawer;
      }}
      renderNavigationView={() => <UnicardView />}>
      <View style={styles.container}>{props.children}</View>
    </DrawerLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: tabHeight,
  },
});

export default DashboardLayoutRightDarwer;
