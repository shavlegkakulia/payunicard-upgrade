import {RouteProp, useRoute} from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import {StoreActionType} from '.';
import CurrencyPrioritySelect, {
  CurrencyPriorityItem,
} from '../../../components/CurrencyPrioritySelect/currencyPrioritySelect';
import PackageSelect, {
  PackageItem,
} from '../../../components/PackageSelect/PackageSelect';
import AppButton from '../../../components/UI/AppButton';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
 } from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import PresentationServive, {
  GetPackageTypeListResponse,
  IPackage,
  IPackageCard,
} from '../../../services/PresentationServive';
import screenStyles from '../../../styles/screens';
import {CurrencyConverter} from '../../../utils/Converter';
import { PacketTypeIds } from './TarriffCalculator';

type RouteParamList = {
  params: {
    type: string;
  };
};

export const Periodes = {
  Quarter: 'Quarter',
  Year: 'Year',
};

const choosePlane: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [packageVisible, setPackageVisible] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>(Periodes.Year);
  const [currencyPrioritiVisible, setCurrencyPriorityVisible] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [packageTypes, setPackageTypes] =
    useState<GetPackageTypeListResponse>();
  const [packageCardTypes, setPackageCardTypes] = useState<IPackageCard[]>();
  const [selectedPackage, setSelectedPackage] = useState<
    IPackage | undefined
  >();
  const [selectedCurrencyType, setSelectedCurrencyType] =
    useState<IPackageCard>();
  const [packageErrorStyle, setPackageErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [ccyPriorityErrorStyle, setCcyPriorityErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});

  const selectPackage = (pack: IPackage) => {
    setSelectedPackage(pack);
    setPackageVisible(!packageVisible);
  };

  const selectCcyPriority = (pack: IPackageCard | undefined) => {
    setSelectedCurrencyType(pack);
    setCurrencyPriorityVisible(!currencyPrioritiVisible);
  };

  const next = () => {
    if (!selectedPackage) {
      setPackageErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return;
    } else {
      setPackageErrorStyle({});
    }

    if (!selectedCurrencyType) {
      setCcyPriorityErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return;
    } else {
      setCcyPriorityErrorStyle({});
    }

    NavigationService.navigate(Routes.TarriffCalculator, {
      package: selectedPackage,
      tarrif: selectedCurrencyType,
      activePeriod: period,
      orderType: StoreActionType.TarrifPlan,
      packageCardTypes: packageCardTypes,
      period: period,
    });
  };

  useEffect(() => {
    setIsLoading(true);
    PresentationServive.getPackageTypes().subscribe({
      next: Response => {
        if (Response.data.ok) {
          setPackageTypes(Response.data.data);
        }
      },
      complete: () => setIsLoading(false),
      error: err => setIsLoading(false),
    });
  }, []);

  useEffect(() => {
    const types = [...(packageTypes?.packageCards || [])].filter(
      type => type.paketTypeId === selectedPackage?.paketTypeId,
    );
    setPackageCardTypes(types);

    if(selectedPackage?.paketTypeId === PacketTypeIds.UPERA && period === Periodes.Quarter) {
      setSelectedPackage(undefined);
    }
  }, [selectedPackage]);

  useEffect(() => {
    if(selectedPackage?.paketTypeId === PacketTypeIds.UPERA && period === Periodes.Quarter) {
      setSelectedPackage(undefined);
    }
  }, [period]);

  const packages = packageTypes?.packages?.filter(
    t => t.paketCode !== 'Wallet',
  );

  return (
    <View style={[screenStyles.wraper, styles.container]}>
      <View style={styles.content}>
        <View style={styles.items}>
          <View style={styles.periodTab}>
            <TouchableOpacity
              onPress={setPeriod.bind(this, Periodes.Quarter)}
              style={[
                styles.periodItem,
                period === Periodes.Quarter && styles.periodItemActive,
              ]}>
              <Text
                style={[
                  styles.periodText,
                  period === Periodes.Quarter && styles.periodTextActive,
                ]}>
                {translate.t('orderCard.quarter')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={setPeriod.bind(this, Periodes.Year)}
              style={[
                styles.periodItem,
                period === Periodes.Year && styles.periodItemActive,
              ]}>
              <Text
                style={[
                  styles.periodText,
                  period === Periodes.Year && styles.periodTextActive,
                ]}>
                {translate.t('orderCard.year')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accountBox}>
            <Text style={styles.accountBoxTitle}>{translate.t('orderCard.chosseTariff')}</Text>

            {selectedPackage ? (
              <PackageItem
                quarter={period === Periodes.Quarter}
                package={selectedPackage}
                onPackageSelect={() => setPackageVisible(true)}
                style={styles.accountItem}
              />
            ) : (
              <TouchableOpacity
                onPress={() => setPackageVisible(true)}
                style={[styles.accountSelectHandler, packageErrorStyle]}>
                <Image
                  style={styles.dropImg}
                  source={require('./../../../assets/images/down-arrow.png')}
                />
              </TouchableOpacity>
            )}

            <PackageSelect
              quarter={period === Periodes.Quarter}
              packages={packages}
              selectedPackage={selectedPackage}
              packageVisible={packageVisible}
              activePeriod={period}
              onSelect={pack => selectPackage(pack)}
              onToggle={() => setPackageVisible(!packageVisible)}
            />
          </View>

          <View style={styles.accountBox}>
            <Text style={styles.accountBoxTitle}>
              {translate.t('orderCard.chosseCurrencyPriority')}
            </Text>

            {selectedCurrencyType ? (
              <CurrencyPriorityItem
                packageCard={selectedCurrencyType}
                onPackageCardSelect={() => setCurrencyPriorityVisible(true)}
                style={styles.accountItem}
              />
            ) : (
              <TouchableOpacity
                onPress={() => setCurrencyPriorityVisible(true)}
                style={[styles.accountSelectHandler, ccyPriorityErrorStyle]}>
                <Image
                  style={styles.dropImg}
                  source={require('./../../../assets/images/down-arrow.png')}
                />
              </TouchableOpacity>
            )}

            <CurrencyPrioritySelect
              packagecard={packageCardTypes}
              selectedPackageCard={selectedCurrencyType}
              packageCardVisible={currencyPrioritiVisible}
              onSelect={pack => selectCcyPriority(pack)}
              onToggle={() =>
                setCurrencyPriorityVisible(!currencyPrioritiVisible)
              }
            />
          </View>
        </View>

        {/* <View style={styles.bline}>
          <Text style={styles.info}>
          {translate.t('orderCard.tariffPrice')}
            {CurrencyConverter(period === Periodes.Year ? selectedPackage?.priceAnnual : selectedPackage?.priceQuarterly)} currencies.GEL
          </Text>
        </View> */}
      </View>
      <AppButton
        style={styles.button}
        onPress={next}
        isLoading={isLoading}
        title={translate.t('common.next')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: tabHeight,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  items: {
    marginTop: 100,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 15,
  },
  accountBox: {
    marginTop: 50,
  },
  accountBoxTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginBottom: 15,
  },
  accountItem: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
  },
  accountSelectHandler: {
    height: 54,
    backgroundColor: colors.inputBackGround,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dropImg: {
    marginRight: 12,
  },
  bline: {
    borderTopColor: colors.inputBackGround,
    borderTopWidth: 1,
    paddingTop: 15,
  },
  info: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  periodTab: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: colors.inputBackGround,
    borderWidth: 1,
  },
  periodItem: {
    height: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  periodItemActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  periodTextActive: {
    color: colors.white,
  },
  button: {
    marginVertical: 40,
  },
});

export default choosePlane;
