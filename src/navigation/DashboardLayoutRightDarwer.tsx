import React, {useEffect, useRef} from 'react';
import {BackHandler, Dimensions, View, StyleSheet} from 'react-native';
import {DrawerLayout} from 'react-native-gesture-handler';
import colors from '../constants/colors';
import UnicardView from '../containers/UnicardView';
import NavigationService from '../services/NavigationService';
import {tabHeight} from './TabNav';
type Props = {
  children: JSX.Element,
};
const DashboardLayoutRightDarwer: React.FC<Props> = props => {
  const sideDraver = useRef<DrawerLayout | null>();
  const screenWidth = Dimensions.get('window').width;
  const isDrawerOpened = useRef<boolean>();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDrawerOpened.current) {
        sideDraver.current?.closeDrawer();
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
        sideDraver.current = drawer;
        NavigationService.setDrawerClose(sideDraver.current?.closeDrawer, 1);
        NavigationService.setDrawerOpen(sideDraver.current?.openDrawer, 1);
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
