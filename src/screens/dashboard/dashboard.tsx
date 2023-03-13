import React, { useCallback, useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { ScrollView, View, RefreshControl, Platform, Modal, Image, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, NativeModules, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import colors from '../../constants/colors';
import userStatuses from '../../constants/userStatuses';
import {
  FetchUserAccounts,
  FetchUserProducts,
  FetchUserTotalBalance,
} from '../../redux/actions/user_actions';
import {
  IUserState,
  IGloablState as IUserGlobalState,
  FETCH_USER_DETAILS,
} from '../../redux/action_types/user_action_types';
import NetworkService from '../../services/NetworkService';
import screenStyles from '../../styles/screens';
import DashboardLayout from '../DashboardLayout';
import CurrentMoney from './home/CurrentMoney';
import TransactionsList from './transactions/TransactionsList';
import Routes from '../../navigation/routes';
import { subscriptionService } from '../../services/subscriptionService';
import SUBSCRIBTION_KEYS from '../../constants/subscribtionKeys';
import { NAVIGATION_ACTIONS } from '../../redux/action_types/navigation_action_types';
import { useNavigationState } from '@react-navigation/native';
import { PAYMENTS_ACTIONS } from '../../redux/action_types/payments_action_type';
import NavigationService from '../../services/NavigationService';
import { TRANSFERS_ACTION_TYPES } from '../../redux/action_types/transfers_action_types';
import { debounce } from '../../utils/utils';
import {
  NavigationEventSubscription,
  NavigationScreenProp,
} from 'react-navigation';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../redux/action_types/translate_action_types';
import AccountStatusView from './home/AccounStatus';
import ProductsView from './home/AboutProducts';
import UnicardAction from './home/UnicardActionView';
import OffersView from './home/Offers';
import { SetAppleWalletAvailability } from '../../utils/CanAddToAppleWallet';
import AddWalletSection from './home/AddWalletSection';
import UserService from '../../services/UserService';
import { onEcheckElements } from '../../navigation/AppleWallet/AppleWallet';

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
}

const Dashboard: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [refreshing, setRefreshing] = useState(false);
  const [hasWalletCards, setHasWalletCards] = useState<boolean>(false);

  const { GPayModule } = NativeModules; // this is the same name we returned 
console.log(NativeModules)
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const dispatch = useDispatch<any>();

  const { documentVerificationStatusCode, customerVerificationStatusCode } =
    userData.userDetails || {};

  const start_verification = () => {
    if (
      (documentVerificationStatusCode === userStatuses.Enum_NotVerified ||
        documentVerificationStatusCode ===
        userStatuses.Enum_PartiallyProcessed) &&
      customerVerificationStatusCode === userStatuses.Enum_NotVerified
    ) {
      NavigationService.navigate(Routes.Verification, { verificationStep: 1, fetchCountries: true });
    }
  };
  const _routes = useNavigationState(state => state.routes);

  const transferToUni = () => {
    const currentRoute = _routes[_routes.length - 1].name;
    //cleare transfer global state
    dispatch({ type: TRANSFERS_ACTION_TYPES.RESET_TRANSFER_STATES });
    dispatch({
      type: NAVIGATION_ACTIONS.SET_PARENT_ROUTE,
      parentRoute: currentRoute,
    });

    NavigationService.navigate(Routes.TransferToUni_CHOOSE_ACCOUNTS, {
      transferStep: Routes.TransferToUni_CHOOSE_ACCOUNTS,
      newTemplate: true,
    });
  };



  const FetchUserData = () => {
    NetworkService.CheckConnection(() => {
      dispatch(FetchUserProducts());
      dispatch(FetchUserAccounts());
      dispatch(FetchUserTotalBalance());
    });
  };

  const GetRouteInfo = useCallback((e: any) => {
    const { index, routes } = e.data.state;
    const currentRoute = routes[index]?.name;

    console.log('*********logging here route state*********', currentRoute);

    dispatch({
      type: NAVIGATION_ACTIONS.SET_CURRENT_ROUTE,
      currentRoute: currentRoute,
    });

    NavigationService.setCurrentRoute(currentRoute);

    //reset payments data
    if (currentRoute === Routes.Payments) {
      dispatch({ type: PAYMENTS_ACTIONS.RESET_PAYEMENT_DATA });
    }

    //reset transfers data
    if (currentRoute === Routes.Transfers) {
      dispatch({ type: TRANSFERS_ACTION_TYPES.RESET_TRANSFER_STATES });
    }
  }, []);

  const RouteListener = useRef<NavigationEventSubscription>();

  useEffect(() => {
    RouteListener.current = props.navigation.addListener('state', GetRouteInfo);

    return () => {
      if (RouteListener.current)
        try {
          RouteListener.current?.remove();
        } catch (err) { }
    };
  }, []);

  const onRefresh = () => {
    FetchUserData();
  };

  useEffect(() => {
    //check wallet modal visible here
    if(Platform.OS === 'ios') {
      onEcheckElements().then((cardsInWallet: any) => {
        console.log('cardsInWallet', cardsInWallet.length)
        if(cardsInWallet.length > 0) {
          setHasWalletCards(true);
        }
      }).catch(err => {
        setHasWalletCards(false);
      })
      
    }
  }, []);

  useEffect(() => {
    NetworkService.CheckConnection(() => {
      if (!userData.userProducts?.length) dispatch(FetchUserProducts());
      if (!userData.userAccounts?.length) dispatch(FetchUserAccounts());
      if (!userData.userTotalBalance) dispatch(FetchUserTotalBalance());
    });
  }, []);

  useEffect(() => {
    if (
      !userData.useAccountStatements &&
      !userData.isTotalBalanceLoading &&
      !userData.isUserProductsLoading
    ) {
      setRefreshing(false);
    }
  }, [
    userData.isStatementsLoading,
    userData.isTotalBalanceLoading,
    userData.isUserProductsLoading,
  ]);

  const actionSHeetCloseDelay = debounce((e: Function) => e(), 1000);

  useEffect(() => {
    const sub = subscriptionService.getData().subscribe(data => { console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data)
      if (
        data?.key === SUBSCRIBTION_KEYS.OPEN_CREATE_TRANSFER_TEMPLATE
      ) {
        actionSHeetCloseDelay(transferToUni);
   
      } else if (data?.key === SUBSCRIBTION_KEYS.FETCH_USER_ACCOUNTS) {
        dispatch(FetchUserAccounts());
      } else if (data?.key === SUBSCRIBTION_KEYS.OPEN_CARDS_STOTE) {
        actionSHeetCloseDelay(() =>
          NavigationService.navigate(Routes.CardsStore),
        );
  
      } else if (data?.key === SUBSCRIBTION_KEYS.START_TOPUP) {
        actionSHeetCloseDelay(() =>
          NavigationService.navigate(Routes.TopupFlow),
        );
       
      } else if (data?.key === SUBSCRIBTION_KEYS.ADD_BANK_CARD) {
        actionSHeetCloseDelay(() =>
          NavigationService.navigate(Routes.addBankCard),
        );
    
      } else if (data?.key === SUBSCRIBTION_KEYS.OPEN_CREATE_PAYMENT_TEMPLATE) {
        actionSHeetCloseDelay(() =>
          NavigationService.navigate(Routes.CreatePayTemplate),
        );
     
      }
    });

    return () => {
      sub.unsubscribe();
      subscriptionService.clearData();
    }
  }, []);



  const handleAppleBannerVisiblity = () => {
    UserService.ConfirmSeeinAppleBaner().then(res => {
      let tempDetails = {...userData};
      let tempClaims = [...(tempDetails?.userDetails?.claims || [])]
      if(tempClaims[0]) {
        tempClaims[0].claimValue = "0"
        tempDetails.userDetails = {...userData.userDetails, claims: [...tempClaims]}
        dispatch({type: FETCH_USER_DETAILS, userDetails: tempDetails})
      }
    }).catch(err => {
      console.log(JSON.stringify(err?.response))
    })
    
    console.log(setTimeout(() => {
      userData.userDetails
    }, 1000))
  }



  useEffect(() => {
    if (userData.userAccounts && Platform.OS == 'ios') {
      dispatch(SetAppleWalletAvailability(userData.userAccounts))
    }

  }, [userData.userAccounts])
  const Change = () => {
    GPayModule.handleAddToGooglePayClick();
 }
  return (
    <DashboardLayout>
     <>
     <ScrollView
        style={screenStyles.screenContainer}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={colors.white}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
          <Button title='native' onPress={() => Change()} />
        <View style={screenStyles.wraperWithShadow}>
          <AccountStatusView onStartVerification={start_verification} />
        </View>
        <View style={screenStyles.wraper}>
          <CurrentMoney />
        </View>
        <View style={screenStyles.wraperWithShadow}>
          <UnicardAction />
        </View>
        <View style={screenStyles.wraperWithShadow}>
          <ProductsView />
        </View>
        {Platform.OS === 'ios' && !hasWalletCards && (
          <View style={screenStyles.wraperWithShadow}>
            <AddWalletSection />
          </View>
        )}
        <OffersView />
        <View style={screenStyles.wraper}>
          <TransactionsList
            statements={[...(userData.useAccountStatements?.statements || [])]}
          />
        </View>
      </ScrollView>


      <Modal
        visible={userData?.userDetails?.claims?.[0]?.claimValue == "1" && Platform.OS == 'ios'}
        onRequestClose={handleAppleBannerVisiblity}>
        <SafeAreaView>
          <ScrollView>
            <View style={styles.walletModalContent}>
              <TouchableOpacity
                style={styles.pressable}
                onPress={handleAppleBannerVisiblity}>
                <Image
                  source={require('./../../assets/images/close40x40.png')}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
              <Image
                source={require('./../../assets/images/icon-apple-pay-button.png')}
                style={styles.walletIcon1}
              />
              <Text style={styles.desc}>{translate.t('dashboard.wallet')}</Text>
              <Image
                source={require('./../../assets/images/icon-apple-screen.png')}
                style={styles.image}
              />
              <TouchableOpacity
                onPress={() => {
                  handleAppleBannerVisiblity();
                  NavigationService.navigate(Routes.Products);
                }}>
                <Image
                  source={require('./../../assets/images/apple-wallet-button.png')}
                  style={styles.walletIcon2}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
     </>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  walletModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height
  },
  walletIcon1: {
    width: 71,
    height: 42,
    resizeMode: 'contain',
    marginBottom: 45
  },
  desc: {
    fontFamily: 'FiraGO-Bold',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.black,
    textAlign: 'center',
    maxWidth: 327,
    marginBottom: 45
  },
  image: {
    width: 120,
    height: 260,
    resizeMode: 'contain',
    marginBottom: 45
  },
  walletIcon2: {
    width: 108,
    height: 32,
    resizeMode: 'contain'
  },
  pressable: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  }
});

export default Dashboard;
