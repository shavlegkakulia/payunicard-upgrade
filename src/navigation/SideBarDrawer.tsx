import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ImageSourcePropType,
  ScrollView,
  Platform,
} from 'react-native';
import AppButton from '../components/UI/AppButton';
import colors from '../constants/colors';
import {Logout} from '../redux/actions/auth_actions';
import {useDispatch, useSelector} from 'react-redux';
import Routes from './routes';
import {sleep} from '../utils/utils';
import {
  IUserState,
  IGloablState,
} from '../redux/action_types/user_action_types';
import NavigationService from '../services/NavigationService';
import {
  INavigationState,
  IGlobalState as INavGlobalState,
  NAVIGATION_ACTIONS,
} from '../redux/action_types/navigation_action_types';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../redux/action_types/translate_action_types';

interface ITouchableProps {
  navigation: any;
  activeRoute: string;
  title?: string;
  route: string;
  iconUrl: ImageSourcePropType;
  activeIconUrl: ImageSourcePropType;
  onActive: (name: string) => void;
  closDdrower?: () => void;
}

const SidebarTouchableItem: React.FC<ITouchableProps> = props => {
  const dispatch = useDispatch<any>();
  const navDelayRef = useRef<NodeJS.Timeout>();
  const onHandle = () => {
    if(navDelayRef.current) clearTimeout(navDelayRef.current);
    if(!props.route) return;
    const currentRoute = props.route;

    dispatch({
      type: NAVIGATION_ACTIONS.SET_CURRENT_ROUTE,
      currentRoute: currentRoute,
    });
    props?.closDdrower?.();
    navDelayRef.current = setTimeout(() => {
      NavigationService.navigate(props.route);
    }, 1000);
  };
  let imgUrl: ImageSourcePropType;
  if (props.activeRoute === props.route) {
    imgUrl = props.activeIconUrl;
  } else {
    imgUrl = props.iconUrl;
  }
  return (
    <TouchableOpacity style={styles.touchable} onPress={onHandle} activeOpacity={props.route ? 0.7 : 1}>
      <View style={styles.icon}>
        {props.iconUrl && <Image source={imgUrl} style={styles.drawerIcon} />}
        <Text
          style={[
            props.activeRoute === props.route
              ? {fontWeight: '700'}
              : {fontWeight: '300'},
            styles.title,
          ]}>
          {props.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const SideBarDrawer: React.FC<any> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const dispatch = useDispatch<any>();
  const [currentNav, setCurrentNav] = useState<string>(Routes.Home);
  const userState = useSelector<IGloablState>(
    state => state.UserReducer,
  ) as IUserState;
  const navStore = useSelector<INavGlobalState>(
    state => state.NavigationReducer,
  ) as INavigationState;

  useEffect(() => {
    setCurrentNav(navStore.currentRoute || "");
  }, [navStore.currentRoute]);

  const signOut = useCallback(async () => {
    props.closDdrower?.();
    await sleep(dispatch(Logout()), 1500);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.avoid} showsVerticalScrollIndicator={false}>
      <View style={styles.sidebarContainer}>
        <View>
          <View style={styles.profile}>
            <View style={styles.coverBox}>
              <Image
                source={{uri: userState.userDetails?.imageUrl}}
                style={styles.userImg}
              />
            </View>
            <Text style={styles.userName}>
            {userState.userDetails?.name} {userState.userDetails?.surname}
            </Text>
          </View>
          <View style={styles.navs}>
            <SidebarTouchableItem
              {...props}
              closDdrower={props.closDdrower}
              title={translate.t('tabNavigation.home')}
              route={Routes.Dashboard}
              iconUrl={require('./../assets/images/home.png')}
              activeIconUrl={require('./../assets/images/home_active.png')}
              activeRoute={currentNav}
            />
            <SidebarTouchableItem
              {...props}
              closDdrower={props.closDdrower}
              title={translate.t('tabNavigation.myProducts')}
              route={Routes.Products}
              iconUrl={require('./../assets/images/products.png')}
              activeIconUrl={require('./../assets/images/products_active.png')}
              activeRoute={currentNav}
            />
            <SidebarTouchableItem
              {...props}
              closDdrower={props.closDdrower}
              title={translate.t('tabNavigation.myPayments')}
              route={Routes.Payments}
              iconUrl={require('./../assets/images/payments.png')}
              activeIconUrl={require('./../assets/images/payments_active.png')}
              activeRoute={currentNav}
            />
            <SidebarTouchableItem
              {...props}
              closDdrower={props.closDdrower}
              title={translate.t('tabNavigation.myTransfers')}
              route={Routes.Transfers}
              iconUrl={require('./../assets/images/transfers.png')}
              activeIconUrl={require('./../assets/images/transfers_active.png')}
              activeRoute={currentNav}
            />
            <SidebarTouchableItem
              {...props}
              closDdrower={props.closDdrower}
              title={translate.t('tabNavigation.myTransactions')}
              route={Routes.Transactions}
              iconUrl={require('./../assets/images/transactions.png')}
              activeIconUrl={require('./../assets/images/transactions_active.png')}
              activeRoute={currentNav}
            />
  
            <SidebarTouchableItem
              {...props}
              closDdrower={props.closDdrower}
              title={translate.t('tabNavigation.settings')}
              route={Routes.Settings}
              iconUrl={require('./../assets/images/settings.png')}
              activeIconUrl={require('./../assets/images/settings_active.png')}
              activeRoute={currentNav}
            />
            <View style={styles.line}></View>
            <View>
              <Text style={styles.userNameTitle}>{translate.t('common.username')}</Text>
              <Text style={styles.userNameValue}>{userState.userDetails?.username}</Text>
            </View>

          </View>
        </View>
        <AppButton
          style={styles.logout}
          TextStyle={styles.logoutTitle}
          title={translate.t('common.logout')}
          onPress={signOut}
          backgroundColor={colors.primary}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    backgroundColor: colors.white,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 30 : 0
  },
  touchable: {
    padding: 10,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  icon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'FiraGO-Book',
    marginLeft: 13,
  },
  logout: {
    marginVertical: 20,
    marginHorizontal: 30,
  },
  logoutTitle: {
    lineHeight: 15,
  },
  drawerIcon: {
    width: 40,
    height: 40,
  },
  coverBox: {
    width: 40,
    height: 40,
    borderColor: '#94DD34',
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  profile: {
    backgroundColor: '#94dd3415',
    height: 73,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  userName: {
    marginLeft: 10,
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 18.8,
  },
  navs: {
    padding: 10,
  },
  line: {
    flex: 1,
    borderBottomColor: colors.baseBackgroundColor,
    borderBottomWidth: 1,
    paddingTop: 10,
    marginBottom: 10
  },
  userNameTitle: {
    marginLeft: 10,
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 18.8,
    color: colors.black
  },
  userNameValue: {
    marginLeft: 10,
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 18.8,
    color: colors.dark
  }
});

export default SideBarDrawer;
