import {RouteProp, useRoute} from '@react-navigation/core';
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import {StoreActionType} from '.';
import AppButton from '../../../components/UI/AppButton';
import colors from '../../../constants/colors';
import currencies, { GEL } from '../../../constants/currencies';
import { ka_ge } from '../../../lang';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
}  from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import {
  ICardType,
  ICity,
  IPackage,
  IPackageCard,
} from '../../../services/PresentationServive';
import screenStyles from '../../../styles/screens';
import {CurrencyConverter, getNumber, getString} from '../../../utils/Converter';
import { futureDay } from '../../../utils/utils';
import { delyveryMethods } from './DelyveryMethods';

type RouteParamList = {
  params: {
    orderType: string;
    totalFee: number | undefined;
    deliveryAmount: number | undefined;
    cardAmount: number | undefined;
    tarrifAmount: number | undefined;
    hrm: number;
    address: string;
    city: ICity;
    village: string;
    selectedFromAccount: string | undefined;
    cardTypes: ICardType[] | undefined;
    delyveryMethod: string;
    hasTotalFee: boolean;
  };
};

const PrintInfo: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const next = () => {
    NavigationService.navigate(Routes.Dashboard);
  };

  const after10DayDate = futureDay(10);

  const totalAmount = getNumber(route.params.deliveryAmount) + getNumber(route.params.cardAmount) + getNumber(route.params.tarrifAmount);

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View style={styles.content}>
          <Image
            source={require('./../../../assets/images/succes_icon.png')}
            style={styles.icon}
          />
          <Text style={styles.infoHeader}>
            {route.params.hasTotalFee
              ? translate.t('orderCard.orderReceived')
              : translate.t('orderCard.preOrderReceived')}
          </Text>
          {!route.params.hasTotalFee && (
            <Text style={styles.info}>
              {translate.t('orderCard.warning1')} <Text style={styles.bold}>{translate.t('orderCard.warning2').replace('{amount}', totalAmount.toString())}</Text>{' '}
              {translate.t('orderCard.warning3')}{'\n'}
              <Text style={styles.bold}>
              {translate.t('orderCard.warning4').replace('{year}', new Date(after10DayDate).getFullYear().toString()).replace('{day}', new Date(after10DayDate).getDay().toString()).replace('{month}', new Date(after10DayDate).getMonth().toString())}
              </Text>
              {'\n'}
              {translate.t('orderCard.warning5')}
            </Text>
          )}
          <View style={styles.bottomInfo}>
            <View style={styles.ul}>
              <Text style={styles.li}>{translate.t('orderCard.deliveryPrice')}:</Text>
              <Text style={styles.li}>
                {CurrencyConverter(route.params.deliveryAmount)}{translate.key === ka_ge ? currencies.GEL : GEL}
              </Text>
            </View>
            <View style={styles.ul}>
              <Text style={styles.li}>{translate.t('orderCard.cardPrice')}:</Text>
              <Text style={styles.li}>
                {CurrencyConverter(getNumber(route.params.cardAmount))}{translate.key === ka_ge ? currencies.GEL : GEL}
              </Text>
            </View>
            {route.params.orderType === StoreActionType.TarrifPlan && (
              <View style={styles.ul}>
                <Text style={styles.li}>{translate.t('orderCard.tariffPrice')}:</Text>
                <Text style={styles.li}>
                  {CurrencyConverter(getNumber(route.params.tarrifAmount))}{translate.key === ka_ge ? currencies.GEL : GEL}
                </Text>
              </View>
            )}
            <View style={styles.ul}>
              <Text style={[styles.li, styles.lastLi]}>{translate.t('payments.totalDue')}:</Text>
              <Text style={[styles.li, styles.lastLi]}>
                {CurrencyConverter(route.params.totalFee)}{translate.key === ka_ge ? currencies.GEL : GEL}
              </Text>
            </View>
          </View>

          <View style={styles.delyveryInfo}>
            <Text style={styles.addrTitle}>{translate.t('orderCard.deliveryAddress')}</Text>
            <Text style={styles.addrValue}>
              {route.params.delyveryMethod === delyveryMethods.inAddress
                ? `${getString(route.params?.city?.name)}, ${getString(route.params.address)}, ${getString(route.params.village)}`
                : translate.t('orderCard.ServiceDeskAddress')}
            </Text>
          </View>

          <TouchableOpacity style={styles.customButton}>
            <Image
              source={require('./../../../assets/images/topup2.png')}
              style={styles.icon2}
            />
            <Text style={styles.buttonText}>{translate.t('topUp.withAnotherCard')}</Text>
          </TouchableOpacity>

          {!route.params.hasTotalFee && (
            <Text style={styles.description}>
              *{
                translate.t('orderCard.seeAfterTopup')
              }
            </Text>
          )}
        </View>
        <AppButton
          style={styles.button}
          onPress={next}
          isLoading={isLoading}
          title={translate.t('common.close')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: tabHeight,
  },
  content: {
    flex: 1,
    flexShrink: 1,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  icon: {
    alignSelf: 'center',
    marginTop: 40,
  },
  infoHeader: {
    marginTop: 12,
    fontFamily: 'FiraGO-Bold',
    fontSize: 16,
    lineHeight: 19,
    color: colors.black,
    textAlign: 'center',
  },
  info: {
    marginTop: 13,
    fontFamily: 'FiraGO-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.labelColor,
    textAlign: 'center',
  },
  bold: {
    color: colors.black,
    fontWeight: '700',
  },
  description: {
    marginTop: 20,
    fontFamily: 'FiraGO-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
  },
  bottomInfo: {
    marginTop: 53,
  },
  ul: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  li: {
    marginBottom: 20,
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    textAlign: 'right',
  },
  lastLi: {
    color: colors.black,
    marginBottom: 0,
  },
  delyveryInfo: {
    marginTop: 40,
  },
  addrTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  addrValue: {
    marginTop: 7,
    fontFamily: 'FiraGO-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.labelColor,
  },
  customButton: {
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 30,
    backgroundColor: colors.inputBackGround,
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  icon2: {
    marginRight: 7,
  },
  buttonText: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  button: {
    marginVertical: 40,
  },
});

export default PrintInfo;
