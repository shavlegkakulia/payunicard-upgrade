import React, {useEffect, useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Keyboard} from 'react-native';
import FloatingLabelInput from '../../../containers/otp/Otp';
import colors from '../../../constants/colors';
import screenStyles from '../../../styles/screens';
import AppButton from '../../../components/UI/AppButton';
import {tabHeight} from '../../../navigation/TabNav';
import {
  ICardType,
  ICity,
  IPackage,
  IPackageCard,
} from '../../../services/PresentationServive';
import {RouteProp, useRoute} from '@react-navigation/core';
import NavigationService from '../../../services/NavigationService';
import Routes from '../../../navigation/routes';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
} from '../../../services/OTPService';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import {useSelector} from 'react-redux';
import UserService, {
  ICustomerPackageRegistrationRequest,
} from '../../../services/UserService';
import {delyveryMethods} from './DelyveryMethods';
import {StoreActionType} from '.';
import {Periodes} from './choosePlane';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import SmsRetriever from 'react-native-sms-retriever';
import { getString } from '../../../utils/Converter';

type RouteParamList = {
  params: {
    package: IPackage;
    tarrif: IPackageCard;
    packageCardTypes: IPackageCard[] | undefined;
    orderType: string;
    totalFee: number | undefined;
    deliveryAmount: number | undefined;
    cardAmount: number | undefined;
    tarrifAmount: number | undefined;
    hrm: number;
    address: string;
    city?: ICity;
    village: string;
    selectedFromAccount: string | undefined;
    cardTypes: ICardType[] | undefined;
    delyveryMethod: string;
    hasTotalFee: boolean;
    period: string;
  };
};

const TarrifSetOtp: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string | undefined>();
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const next = () => {
    if (!otp) return;
    customerPackageRegistration();
  };

  const customerPackageRegistration = () => {
    setIsLoading(true);

    let orderTarrif = route.params.packageCardTypes?.filter(
      t => t.ccy !== route.params.tarrif.ccy,
    ) || [];
    const tarrifOrdered = [route.params.tarrif, ...orderTarrif];
    let tarifPriority: any = [];
    tarrifOrdered.forEach(t => tarifPriority.push(t.ccy));

    let data: ICustomerPackageRegistrationRequest = {
      paketTypeid: route.params.package.paketTypeId,
      
      cardTypeID: route.params.cardTypes?.every(ct => ct.willCount)
        ? 3
        : route.params.cardTypes?.filter(ct => ct.willCount)[0].typeId,
      cardDeliveryCountryID: 79,
      customerId: userData.userDetails?.customerID,
      termID: 1,
      otp: otp,
      hrm: route.params.hrm,
      accountPriority: tarifPriority.join('/'),
      paymentMethod: route.params.period === Periodes.Quarter ? 2 : 3,
    };

    // if(route.params.orderType !== StoreActionType.TarrifPlan) {
    //   data = {...data, accountNumberCh: route.params.selectedFromAccount}
    // }

    if (route.params.delyveryMethod === delyveryMethods.inServiceCenter) {
      data = {...data, serviseCenter: 1};
    } else {
      data = {
        ...data,
        serviseCenter: 0,
        cardDeliveryCityID: route.params?.city?.cityId,
        cardDeliveryCity: route.params?.city?.name,
        cardDeliveryAddress: route.params.address + route.params.village,
      };
    }

    UserService.customerPackageRegistration(data).subscribe({
      next: Response => {
        if(Response.data.ok) {
          NavigationService.navigate(Routes.PrintInfo, {
            orderType: route.params.orderType,
            totalFee: route.params.totalFee,
            deliveryAmount: route.params.deliveryAmount,
            cardAmount:
              route.params.orderType === StoreActionType.TarrifPlan
                ? 0
                : route.params.cardAmount,
            tarrifAmount: route.params.tarrifAmount,
            hrm: route.params.hrm,
            address: route.params.address,
            city: route.params.city,
            village: route.params.village,
            selectedFromAccount: route.params.selectedFromAccount,
            cardTypes: route.params.cardTypes,
            delyveryMethod: delyveryMethods,
            hasTotalFee: route.params.hasTotalFee,
          });
        }
      },
      complete: () => {
        setIsLoading(false);
      },
      error: err => {
        setIsLoading(false);
       
      },
    });
  };

  const sendOtp = () => {
    setIsLoading(true);
    const OTP: GeneratePhoneOtpByUserRequest = {
      userName: userData.userDetails?.username,
    };

    OTPService.GeneratePhoneOtpByUser({OTP}).subscribe({
      next: () => {
    
      },
      complete: () => {
        setIsLoading(false);
        setOtp(undefined);
      },
      error: () => setIsLoading(false),
    });
  };

  const onSmsListener = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          if (event && event?.message) {
            try {
              const otpobj = /(\d{4})/g?.exec(getString(event?.message));
            if (otpobj && otpobj?.length > 0) {
              setOtp(otpobj[1]);
              Keyboard.dismiss();
            }
            } catch (error) {
              console.log(JSON.stringify(error))
            }
          }
        })
      }
    } catch (error) {
      
    }
  };

  useEffect(() => {
    onSmsListener();

    return () => SmsRetriever.removeSmsListener();
  }, []);

  useEffect(() => {
    sendOtp();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View style={styles.content}>
          <FloatingLabelInput
            Style={styles.otpBox}
            label={translate.t('otp.smsCode')}
            title={translate.t('otp.otpSentBlank')}
            resendTitle={translate.t('otp.resend')}
            value={otp}
            onChangeText={setOtp}
            onRetry={sendOtp}
          />
        </View>
        <AppButton
          style={styles.button}
          onPress={next}
          isLoading={isLoading}
          title={translate.t('common.next')}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: tabHeight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  otpBox: {},
  button: {
    marginVertical: 40,
  },
});

export default TarrifSetOtp;
