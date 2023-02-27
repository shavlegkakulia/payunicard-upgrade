import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import Routes from './routes';
import Dashboard from '../screens/dashboard/dashboard';
import Products from '../screens/dashboard/products';
import Payments from '../screens/dashboard/payments';
import Transfers from '../screens/dashboard/transfers';
import DefaultOptions, {DefaultOptionsDrawer} from './Header';
import ProductDetail from '../screens/dashboard/products/productDetail';
import TabNav from './TabNav';
import Transactions from '../screens/dashboard/transactions/transactions';
import TransferToBank from '../screens/dashboard/transfers/TransferToBank';
import TransferToUni from '../screens/dashboard/transfers/TransferToUni';
import TransferBetweenAccounts from '../screens/dashboard/transfers/TransferBetweenAccounts';
import TransferConvertation from '../screens/dashboard/transfers/TransferConvertation';
import PaymentSteps from '../screens/dashboard/payments/PaymentSteps/paymentSteps';
import InsertAbonentCode from '../screens/dashboard/payments/PaymentSteps/InsertAbonentCode';
import InsertAccointAndAmount from '../screens/dashboard/payments/PaymentSteps/InsertAccountAndAmount';
import CheckDebt from '../screens/dashboard/payments/PaymentSteps/CheckDebt';
import PaymentSucces from '../screens/dashboard/payments/PaymentSteps/PaymentSucces';
import EditTemplate from '../screens/dashboard/payments/PaymentSteps/EditTemplate';
import PayAll from '../screens/dashboard/payments/PayAll/PayAll';
import PayAllSucces from '../screens/dashboard/payments/PayAll/PayAllSucces';
import CardsStore from '../screens/dashboard/cardsStore';
import ChoosePlane from '../screens/dashboard/cardsStore/ChoosePlane';
import TarriffCalculator from '../screens/dashboard/cardsStore/TarriffCalculator';
import DelyveryMethods from '../screens/dashboard/cardsStore/DelyveryMethods';
import TarrifSetOtp from '../screens/dashboard/cardsStore/TarrifSetOtp';
import PreOrder from '../screens/dashboard/cardsStore/PreOrder';
import PrintInfo from '../screens/dashboard/cardsStore/PrintInfo';
import TransferTemplateEdit from '../screens/dashboard/transfers/TransferTemplateEdit';
import Topup from '../screens/dashboard/topup/Topup';
import TopupFlow from '../screens/dashboard/topup';
import ChoosBankCard from '../screens/dashboard/topup/ChoosBankCard';
import ChooseAmountAndAccount from '../screens/dashboard/topup/ChooseAmountAndAccount';
import TopupSucces from '../screens/dashboard/topup/TopupSucces';
import CreatePayTemplate from '../screens/dashboard/payments/CreateTemplate';
import {DrawerLayout} from 'react-native-gesture-handler';
import {BackHandler, StatusBar, View} from 'react-native';
import SideBarDrawer from './SideBarDrawer';
import colors from '../constants/colors';
import NavigationService from '../services/NavigationService';
import Settings from '../screens/dashboard/settings/settings';
import PasswordReset from '../screens/landing/password/PasswordReset';
import ResetPasswordOtp from '../screens/landing/password/ResetPasswordOtp';
import PasswordResetStepFour from '../screens/landing/password/PasswordResetStepFour';
import PasswordResetSucces from '../screens/landing/password/PasswordResetSucces';
import SetPassCode from '../screens/dashboard/settings/setPassCode';
import EditUserInfo from '../screens/dashboard/settings/editUserInfo';
import Verification from '../screens/dashboard/Verification/Index';
import BiometricAuthScreen from '../screens/dashboard/settings/biometric';
import PasswordChangeSucces from '../screens/landing/password/change/PasswordChangeSucces';
import PasswordChangeStepFour from '../screens/landing/password/change/PasswordChangeStepFour';
import ChangePasswordOtp from '../screens/landing/password/change/ChangePasswordOtp';
import {useSelector} from 'react-redux';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../redux/action_types/translate_action_types';
import KvalifcaVerification from '../screens/dashboard/Verification/KvalifcaVerification';
import OfferDetails from '../containers/OfferDetails';
import PaymentMethods from '../screens/dashboard/cardsStore/paymentMethods';
import TrustedDevices from '../screens/dashboard/settings/truestedDevices';
import {
  IAuthState,
  IGlobalState as AuthState,
} from '../redux/action_types/auth_action_types';

import Landing from '../screens/landing/landing';
import Login from '../screens/landing/login';
import Signup from '../screens/landing/signup/signup';
import FirstLoad from '../screens/landing/firstLoad';
import SignupStepTwo from '../screens/landing/signup/signup-step-2';
import SignupStepThree from '../screens/landing/signup/signup-step-3';
import SignupSteOtp from '../screens/landing/signup/SignupSteOtp';
import {UnauthScreenOptionsDrawer} from './Header';
import PasswordResetStepTwo from '../screens/landing/password/PasswordResetStepTwo';
import PasswordResetStepThree from '../screens/landing/password/PasswordResetStepThree';
import setLoginWithPassCode from '../screens/landing/SetLoginWithPassCode';
import AgreeTerm from '../screens/landing/signup/signup-agree';
import RefreshTokenOtp from '../screens/landing/RefreshIokenOtp';
import AddBankCard from '../screens/dashboard/addBankCard/AddBankCard';
import AddBankCardSucces from '../screens/dashboard/addBankCard/AddBankCardSucces';
import {subscriptionService} from '../services/subscriptionService';
import Notifications from '../screens/dashboard/notifications/Notifications';
import InternationalTransfer from '../screens/dashboard/transfers/InternationalTransfer';
import { useNavigationState } from '@react-navigation/core';


const appStack = createStackNavigator();
export let SideDrawer: DrawerLayout | null = null;

const AppStack: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const state = useSelector<AuthState>(
    state => state.AuthReducer,
  ) as IAuthState;
  const isDrawerOpened = useRef<boolean>();
  const routes = useNavigationState(state => state?.routes);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDrawerOpened.current) {
        SideDrawer?.closeDrawer();
        return true;
      } else {
        return false;
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const red_sub = subscriptionService.getData().subscribe(res => {
      if (res?.key === 'force_redirect') {
        NavigationService.navigate(Routes.Landing);
      }

      if (res?.key === 'close_drower') {
        if (isDrawerOpened.current) {
          SideDrawer?.closeDrawer();
        }
      }
    });

    return () => {
      red_sub.unsubscribe();
    };
  }, []);

  return (
    <DrawerLayout
      drawerWidth={300}
      drawerLockMode={
        state.isAuthenticated && state.accesToken.length > 0
          ? 'unlocked'
          : 'locked-closed'
      }
      keyboardDismissMode="on-drag"
      onDrawerOpen={() => (isDrawerOpened.current = true)}
      onDrawerClose={() => (isDrawerOpened.current = false)}
      ref={drawer => {
        SideDrawer = drawer;
      }}
      renderNavigationView={props => <SideBarDrawer props={props} />}>
      <>
        <StatusBar
          backgroundColor={colors.baseBackgroundColor}
          barStyle="dark-content"
        />
        <appStack.Navigator
          initialRouteName={Routes.Landing}
          screenOptions={{
            gestureEnabled: false,
            headerShown: false,
          }}>
          {state.isAuthenticated === true && state.accesToken.length ? (
            <>
              <appStack.Screen
                name={Routes.Home}
                options={props =>
                  DefaultOptions({
                    navigation: props.navigation,
                    lang: translate.key,
                  })
                }
                component={Dashboard}
              />
              <appStack.Screen
                name={Routes.Dashboard}
                options={props =>
                  DefaultOptions({
                    navigation: props.navigation,
                    lang: translate.key,
                  })
                }
                component={Dashboard}
              />
              <appStack.Screen
                name={Routes.Products}
                options={props =>
                  DefaultOptions({
                    navigation: props.navigation,
                    lang: translate.key,
                  })
                }
                component={Products}
              />
              <appStack.Screen
                name={Routes.Payments}
                options={props =>
                  DefaultOptions({
                    navigation: props.navigation,
                    lang: translate.key,
                  })
                }
                component={Payments}
              />
              <appStack.Screen
                name={Routes.Transfers}
                options={props =>
                  DefaultOptions({
                    navigation: props.navigation,
                    lang: translate.key,
                  })
                }
                component={Transfers}
              />
              <appStack.Screen
                name={Routes.ProductDetail}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('common.details'),
                    backText: translate.t('common.back'),
                  })
                }
                component={ProductDetail}
              />
              <appStack.Screen
                name={Routes.Transactions}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('tabNavigation.transactions'),
                    backText: translate.t('common.back'),
                  })
                }
                component={Transactions}
              />
              <appStack.Screen
                name={Routes.TransferToBank_CHOOSE_ACCOUNTS}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.toBank'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferToBank}
              />
              <appStack.Screen
                name={Routes.TransferToBank_SET_CURRENCY}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.toBank'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferToBank}
              />
              <appStack.Screen
                name={Routes.TransferToBank_SET_OTP}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.toBank'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferToBank}
              />
              <appStack.Screen
                name={Routes.TransferToBank_SUCCES}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.toBank'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferToBank}
              />
              <appStack.Screen
                name={Routes.TransferToUni_CHOOSE_ACCOUNTS}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('tabNavigation.toUniWallet');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                  });
                }}
                component={TransferToUni}
              />
              <appStack.Screen
                name={Routes.TransferToUni_SET_CURRENCY}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('tabNavigation.toUniWallet');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                  });
                }}
                component={TransferToUni}
              />
              <appStack.Screen
                name={Routes.TransferToUni_SET_OTP}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('tabNavigation.toUniWallet');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                  });
                }}
                component={TransferToUni}
              />
              <appStack.Screen
                name={Routes.TransferToUni_SUCCES}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('tabNavigation.toUniWallet');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                    hideHeader: true,
                  });
                }}
                component={TransferToUni}
              />
              <appStack.Screen
                name={Routes.TransferToUni_TEMPLATE_IS_SAVED}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('tabNavigation.toUniWallet');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                    hideHeader: true,
                  });
                }}
                component={TransferToUni}
              />
              <appStack.Screen
                name={Routes.TransferBetweenAcctounts_CHOOSE_ACCOUNTS}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.betweeenOwnAccounts'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferBetweenAccounts}
              />
              <appStack.Screen
                name={Routes.TransferBetweenAcctounts_SET_CURRENCY}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.betweeenOwnAccounts'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferBetweenAccounts}
              />
              <appStack.Screen
                name={Routes.TransferBetweenAcctounts_SUCCES}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.betweeenOwnAccounts'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferBetweenAccounts}
              />
              <appStack.Screen
                name={Routes.TransferConvertation_CHOOSE_ACCOUNTS}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.currencyExchange'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferConvertation}
              />
              <appStack.Screen
                name={Routes.TransferConvertation_SET_CURRENCY}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.currencyExchange'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferConvertation}
              />
              <appStack.Screen
                name={Routes.TransferConvertation_SUCCES}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('transfer.currencyExchange'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferConvertation}
              />
              <appStack.Screen
                name={Routes.Internatinal_choose_account}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('transfer.internationalTransfer');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                  });
                }}
                component={InternationalTransfer}
              />
              <appStack.Screen
                name={Routes.Internatinal_set_currency}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('transfer.internationalTransfer');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                  });
                }}
                component={InternationalTransfer}
              />
              <appStack.Screen
                name={Routes.Internatinal_set_otp}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('transfer.internationalTransfer');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                  });
                }}
                component={InternationalTransfer}
              />
              <appStack.Screen
                name={Routes.Internatinal_succes}
                options={props => {
                  //@ts-ignore
                  let title = props?.route?.params?.newTemplate
                    ? translate.t('plusSign.crTransferTemplate')
                    : translate.t('transfer.internationalTransfer');
                  return DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: title,
                    backText: translate.t('common.back'),
                  });
                }}
                component={InternationalTransfer}
              />
              <appStack.Screen
                name={Routes.Payments_STEP1}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PaymentSteps}
              />
              <appStack.Screen
                name={Routes.Payments_STEP2}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PaymentSteps}
              />
              <appStack.Screen
                name={Routes.Payments_STEP3}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PaymentSteps}
              />
              <appStack.Screen
                name={Routes.Payments_STEP4}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PaymentSteps}
              />
              <appStack.Screen
                name={Routes.Payments_INSERT_ABONENT_CODE}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    backText: translate.t('common.back'),
                  })
                }
                component={InsertAbonentCode}
              />
              <appStack.Screen
                name={Routes.Payments_INSERT_ACCOUNT_AND_AMOUNT}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    backText: translate.t('common.back'),
                  })
                }
                component={InsertAccointAndAmount}
              />
              <appStack.Screen
                name={Routes.Payments_CHECK_DEBT}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    backText: translate.t('common.back'),
                  })
                }
                component={CheckDebt}
              />
              <appStack.Screen
                name={Routes.Payments_SUCCES}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('products.payment'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={PaymentSucces}
              />
              <appStack.Screen
                name={Routes.Payments_EditTemplate}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('template.editTemplate'),
                    backText: translate.t('common.back'),
                  })
                }
                component={EditTemplate}
              />
              <appStack.Screen
                name={Routes.Payments_PAY_ALL}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('payments.payAll'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PayAll}
              />
              <appStack.Screen
                name={Routes.Payments_PAY_ALL_CHECK_DEBT}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('payments.payAll'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PayAll}
              />
              <appStack.Screen
                name={Routes.Payments_PAY_ALL_SUCCES}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('payments.payAll'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={PayAllSucces}
              />
              <appStack.Screen
                name={Routes.Payments_PAY_ALL_OTP}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('payments.payAll'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PayAll}
              />
              <appStack.Screen
                name={Routes.CardsStore}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.orderCard'),
                    backText: translate.t('common.back'),
                  })
                }
                component={CardsStore}
              />
              <appStack.Screen
                name={Routes.ChoosePlan}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.orderCard'),
                    backText: translate.t('common.back'),
                  })
                }
                component={ChoosePlane}
              />
              <appStack.Screen
                name={Routes.TarriffCalculator}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.orderCard'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TarriffCalculator}
              />
              <appStack.Screen
                name={Routes.DelyveryMethods}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.orderCard'),
                    backText: translate.t('common.back'),
                  })
                }
                component={DelyveryMethods}
              />
              <appStack.Screen
                name={Routes.TarrifSetOtp}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.orderCard'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TarrifSetOtp}
              />
              <appStack.Screen
                name={Routes.PreOrder}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.orderCard'),
                    backText: translate.t('common.back'),
                  })
                }
                component={PreOrder}
              />
              <appStack.Screen
                name={Routes.PrintInfo}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.orderCard'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={PrintInfo}
              />
              <appStack.Screen
                name={Routes.TransferTemplateEdit}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('template.editTemplate'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TransferTemplateEdit}
              />
              <appStack.Screen
                name={Routes.TopupFlow}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.topUp'),
                    backText: translate.t('common.back'),
                  })
                }
                component={TopupFlow}
              />
              <appStack.Screen
                name={Routes.Topup}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.topUp'),
                    backText: translate.t('common.back'),
                  })
                }
                component={Topup}
              />
              <appStack.Screen
                name={Routes.TopupChoosBankCard}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.topUp'),
                    backText: translate.t('common.back'),
                  })
                }
                component={ChoosBankCard}
              />
              <appStack.Screen
                name={Routes.TopupChooseAmountAndAccount}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.topUp'),
                    backText: translate.t('common.back'),
                  })
                }
                component={ChooseAmountAndAccount}
              />
              <appStack.Screen
                name={Routes.TopupSucces}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.topUp'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={TopupSucces}
              />
              <appStack.Screen
                name={Routes.addBankCard}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.addCard'),
                    backText: translate.t('common.back'),
                  })
                }
                component={AddBankCard}
              />
              <appStack.Screen
                name={Routes.AddBankCardSucces}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('plusSign.addCard'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
                component={AddBankCardSucces}
              />
              <appStack.Screen
                name={Routes.CreatePayTemplate}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('payments.paymentTemplates'),
                    backText: translate.t('common.back'),
                  })
                }
                component={CreatePayTemplate}
              />
              <appStack.Screen name={Routes.Settings} component={Settings} />
              <appStack.Screen
                name={Routes.ResetPassword}
                component={PasswordReset}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.changePassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.ResetPasswordOtp}
                component={ResetPasswordOtp}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.changePassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordResetStepFour}
                component={PasswordResetStepFour}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.changePassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordResetSucces}
                component={PasswordResetSucces}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.changePassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.setPassCode}
                component={SetPassCode}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.passCode'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.EditUserInfo}
                component={EditUserInfo}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.personalInfo'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.Verification}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep1}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep2}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep3}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep4}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep5}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep6}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep7}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep8}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.VerificationStep9}
                component={Verification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                 
                  })
                }
              />
              <appStack.Screen
                name={Routes.Biometric}
                component={BiometricAuthScreen}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordChangeSucces}
                component={PasswordChangeSucces}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.changePassword'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordChangeStepFour}
                component={PasswordChangeStepFour}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.changePassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.ChangePasswordOtp}
                component={ChangePasswordOtp}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('settings.changePassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.KvalifcaVerification}
                component={KvalifcaVerification}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('verification.verification'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.OfferDetails}
                component={OfferDetails}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('tabNavigation.offerDetail'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.paymentMethods}
                component={PaymentMethods}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('common.bankTransferDetails'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.TrustedDevices}
                component={TrustedDevices}
                options={props =>
                  DefaultOptionsDrawer({
                    navigation: props.navigation,
                    route: props.route,
                    title: translate.t('common.trustedDevices'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.notifications}
                options={props =>
                  DefaultOptions({
                    navigation: props.navigation,
                    lang: translate.key,
                  })
                }
                component={Notifications}
              />
            </>
          ) : (
            <>
              <appStack.Screen name={Routes.Landing} component={Landing} />
              <appStack.Screen name={Routes.Login} component={Login} />
              <appStack.Screen
                name={Routes.Signup}
                component={Signup}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('signup.title'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.SignupStepTwo}
                component={SignupStepTwo}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('signup.title'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.SignupStepThree}
                component={SignupStepThree}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('signup.title'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.SignupSteOtp}
                component={SignupSteOtp}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('signup.title'),
                    backText: translate.t('common.back'),
                    animationEnabled: false
                  })
                }
              />
              <appStack.Screen name={Routes.FirstLoad} component={FirstLoad} />
              <appStack.Screen
                name={Routes.ResetPassword}
                component={PasswordReset}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('login.forgotpassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordResetStepTwo}
                component={PasswordResetStepTwo}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('tabNavigation.resetPassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordResetStepThree}
                component={PasswordResetStepThree}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('tabNavigation.resetPassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.ResetPasswordOtp}
                component={ResetPasswordOtp}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('tabNavigation.resetPassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordResetStepFour}
                component={PasswordResetStepFour}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('tabNavigation.resetPassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordResetSucces}
                component={PasswordResetSucces}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('tabNavigation.resetPassword'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.setLoginWithPassCode}
                component={setLoginWithPassCode}
              />
              <appStack.Screen
                name={Routes.PasswordChangeSucces}
                component={PasswordChangeSucces}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('settings.changePassword'),
                    hideHeader: true,
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.PasswordChangeStepFour}
                component={PasswordChangeStepFour}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('settings.changePassword'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.AgreeTerm}
                component={AgreeTerm}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('tabNavigation.termsAndCondition'),
                    backText: translate.t('common.back'),
                  })
                }
              />
              <appStack.Screen
                name={Routes.RefreshTokenOtp}
                component={RefreshTokenOtp}
                options={props =>
                  UnauthScreenOptionsDrawer({
                    navigation: props.navigation,
                    title: translate.t('otp.smsCode'),
                    backText: translate.t('common.back'),
                  })
                }
              />
            </>
          )}
        </appStack.Navigator>
        {(state.isAuthenticated === true && state.accesToken?.length > 0 && !routes?.[routes?.length - 1].name.startsWith(Routes.Verification)) ? (
          <TabNav />
        ) : null}
      </>
    </DrawerLayout>
  );
};

export default AppStack;
