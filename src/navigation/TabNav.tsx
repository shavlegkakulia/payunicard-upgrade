import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View, StyleSheet, Text, Platform, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../constants/colors';
import SUBSCRIBTION_KEYS from '../constants/subscribtionKeys';
import {
  INavigationState,
  IGlobalState,
  NAVIGATION_ACTIONS,
} from './../redux/action_types/navigation_action_types';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from './../redux/action_types/translate_action_types';
import NavigationService from './../services/NavigationService';
import { subscriptionService } from './../services/subscriptionService';
import { getString } from './../utils/Converter';
import Routes from './routes';

export const tabHeight = 67;

const RouteIcons: any = {};

RouteIcons['undefined'] = [
  require('./../assets/images/plus.png'),
  require('./../assets/images/plus.png'),
];

RouteIcons[Routes.Home] = [
  require('./../assets/images/home_active.png'),
  require('./../assets/images/home.png'),
];

RouteIcons[Routes.Dashboard] = [
  require('./../assets/images/home_active.png'),
  require('./../assets/images/home.png'),
];

RouteIcons[Routes.Products] = [
  require('./../assets/images/products_active.png'),
  require('./../assets/images/products.png'),
];

RouteIcons[Routes.Payments] = [
  require('./../assets/images/payments_active.png'),
  require('./../assets/images/payments.png'),
];

RouteIcons[Routes.Transfers] = [
  require('./../assets/images/transfers_active.png'),
  require('./../assets/images/transfers.png'),
];

const TabNav = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const dispatch = useDispatch<any>();

  const [currentNav, setCurrentNav] = useState<string | undefined>(Routes.Home);

  const navStore = useSelector<IGlobalState>(
    state => state.NavigationReducer,
  ) as INavigationState;

  const openActionSheet = () => {
    subscriptionService.sendData(
      SUBSCRIBTION_KEYS.OPEN_ACTIONS_ACTIONSHEET,
      true,
    );
  };

  const onHandle = (nav: string | undefined) => {
    const currentRoute = nav;

    dispatch({
      type: NAVIGATION_ACTIONS.SET_CURRENT_ROUTE,
      currentRoute: currentRoute,
    });

    setCurrentNav(nav);
  };

  useEffect(() => {
    setCurrentNav(navStore.currentRoute);
  }, [navStore.currentRoute]);

  return (
    <View style={styles.botomTab}>
      <NavItem
        active={currentNav === Routes.Home || currentNav === Routes.Dashboard}
        to={Routes.Dashboard}
        callback={onHandle}
        title={translate.t('tabNavigation.home')}
      />

      <NavItem
        active={currentNav === Routes.Products}
        to={Routes.Products}
        callback={onHandle}
        title={translate.t('tabNavigation.products')}
      />

      <NavItem
        active={currentNav === Routes.Products}
        action={openActionSheet}
        callback={onHandle}
        title=' '
      />

      <NavItem
        active={currentNav === Routes.Payments}
        to={Routes.Payments}
        callback={onHandle}
        title={translate.t('tabNavigation.payments')}
      />

      <NavItem
        active={currentNav === Routes.Transfers}
        to={Routes.Transfers}
        callback={onHandle}
        title={translate.t('tabNavigation.transfers')}
      />
    </View>
  );
};

const screenHeight = Dimensions.get("window").height;
const cHeight = screenHeight >= 800 && Platform.OS === 'ios' ? tabHeight + 20 : tabHeight;

const styles = StyleSheet.create({
  botomTab: {
    flexDirection: 'row',
    height: cHeight,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    shadowColor: colors.black,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    //elevation: 1,
    borderTopWidth: 1,
    borderTopColor: colors.inputBackGround,
    paddingBottom: screenHeight >= 800 && Platform.OS === 'ios' ? 20 : 0
  },
  tabIcon: {
    width: 40,
    height: 40,
  },
  item: {
    alignItems: 'center',
    flex: 5,
    // borderColor: 'red',
    // borderWidth: 1
  },
  title: {
    fontFamily: 'FiraGO-Book',
    lineHeight: 12,
    fontSize: 9,
    color: colors.labelColor,
    marginTop: 5
  }
});

export default TabNav;

interface ITabItemProps {
  active: boolean;
  to?: string;
  title?: string;
  action?: () => void;
  callback: (route: string | undefined) => void;
}

const NavItem: React.FC<ITabItemProps> = props => {
  const onHandle = () => {
    props.action ? props.action() : NavigationService.navigate(props.to);
    props.to && props.callback(props.to);
  };

  return (
    <TouchableOpacity onPress={onHandle} style={styles.item}>
      <Image
        source={
          props.active
            ? RouteIcons[getString(props.to || 'undefined')][0]
            : RouteIcons[getString(props.to || 'undefined')][1]
        }
        style={styles.tabIcon}
      />
      {props.title && <Text style={styles.title}>{props.title}</Text>}
    </TouchableOpacity>
  );
};
