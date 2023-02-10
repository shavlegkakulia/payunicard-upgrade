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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import {StoreActionType} from '.';
import AppButton from '../../../components/UI/AppButton';
import AppCheckbox from '../../../components/UI/AppCheckbox';
import AppInput from '../../../components/UI/AppInput';
import AppSelect, {
  SelectItem,
} from '../../../components/UI/AppSelect/AppSelect';
import Validation, {required} from '../../../components/UI/Validation';
import colors from '../../../constants/colors';
import currencies, { GEL } from '../../../constants/currencies';
import { ka_ge } from '../../../lang';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import CardService, {
  IGetCardOrderingTariffAmountRequest,
  IGetCardOrderingTariffAmountResponse,
} from '../../../services/CardService';
import NavigationService from '../../../services/NavigationService';
import PresentationServive, {
  ICardType,
  ICitizenshipCountry,
  ICity,
  IPackage,
  IPackageCard,
} from '../../../services/PresentationServive';
import screenStyles from '../../../styles/screens';
import {CurrencyConverter, getNumber} from '../../../utils/Converter';
import { Periodes } from './choosePlane';
import {cardTypeIds} from './TarriffCalculator';

export const delyveryMethods = {
  inServiceCenter: 'inServiceCenter',
  inAddress: 'inAddress',
};

type RouteParamList = {
  params: {
    package: IPackage;
    tarrif: IPackageCard;
    packageCardTypes: IPackageCard[] | undefined;
    cardTypes: ICardType[] | undefined;
    cardTarrif: IGetCardOrderingTariffAmountResponse;
    orderType: string;
    hrm: number;
    selectedFromAccount: string | undefined;
    period: string;
  };
};

const ValidationContext = 'DelValidationContext';

const DelyveryMethods: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [delyveryMethod, setDeliveryMethod] = useState<string>();
  const [cityVisible, setCityVisible] = useState(false);
  const [address, setSAddress] = useState<string>();
  const [village, setVillage] = useState<string>();
  const [cardTarrif, setCardTarrif] =
    useState<IGetCardOrderingTariffAmountResponse>();
  const [cityErrorStyle, setCityyErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );
  const [cities, setCities] = useState<ICity[] | undefined>();
  const [city, setCity] = useState<ICity>();

  const next = () => {
    if (!delyveryMethod) return;

    if (!city && delyveryMethod === delyveryMethods.inAddress) {
      setCityyErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return;
    } else {
      setCityyErrorStyle({});
    }

    if (delyveryMethods.inAddress && Validation.validate(ValidationContext))
      return;
    NavigationService.navigate(Routes.PreOrder, {
      orderType: route.params.orderType,
      totalFee:
        (route.params.orderType === StoreActionType.TarrifPlan
          ? 0
          : getNumber(route.params.cardTarrif.tariffAmount)) +
        getNumber(cardTarrif?.deliveryAmount) +
        getNumber(route.params.period === Periodes.Year ? route.params.package?.priceAnnual : route.params.package?.priceQuarterly),
      deliveryAmount: cardTarrif?.deliveryAmount,
      cardAmount:
        route.params.orderType === StoreActionType.TarrifPlan
          ? 0
          : route.params.cardTarrif.tariffAmount,
      tarrifAmount: route.params.period === Periodes.Year ? route.params.package?.priceAnnual : route.params.package?.priceQuarterly,
      hrm: route.params.hrm,
      address: address,
      city: city,
      village: village,
      selectedFromAccount: route.params.selectedFromAccount,
      cardTypes: route.params.cardTypes,
      delyveryMethod: delyveryMethod,
      tarrif: route.params.tarrif,
      packageCardTypes: route.params.packageCardTypes,
      package: route.params.package
    });
  };

  useEffect(() => {
    if (city) {
      getTarrif(route.params.cardTypes);
    }
  }, [city]);

  const getCities = () => {
    if (isLoading) return;

    setIsLoading(true);
    PresentationServive.getCities().subscribe({
      next: Response => {
        setCities(Response.data.data?.cities);
      },
      complete: () => {
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
      },
    });
  };

  const getTarrif = (CardTypes?: ICardType[] | undefined) => {
    const cardTypes = route.params.cardTypes;

    const data: IGetCardOrderingTariffAmountRequest = {
      T1Q:
        (CardTypes || cardTypes)
          ?.filter(t => t.typeId === cardTypeIds.typeVisa)[0]
          .willCount?.toString() || '0',
      T2Q:
        (CardTypes || cardTypes)
          ?.filter(t => t.typeId === cardTypeIds.typeMc)[0]
          .willCount?.toString() || '0',
      cityId: city?.cityId,
    };

    CardService.getCardOrderingTariffAmount(data).subscribe({
      next: Response => {
        setCardTarrif(Response.data.data);
      },
      complete: () => {},
      error: err => {
        
      },
    });
  };

  useEffect(() => {
    getCities();
  }, []);

  useEffect(() => {
    if (delyveryMethod === delyveryMethods.inServiceCenter) {
      setCardTarrif(undefined);
      setCity(undefined);
    }
  }, [delyveryMethod]);

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        style={styles.avoid}>
        <View style={[screenStyles.wraper, styles.container]}>
          <View style={styles.content}>
            <View>
              <TouchableOpacity
                style={[styles.item, styles.itemFirst]}
                onPress={() =>
                  setDeliveryMethod(delyveryMethods.inServiceCenter)
                }>
                <AppCheckbox
                  value={delyveryMethod === delyveryMethods.inServiceCenter}
                  clicked={() => setDeliveryMethod(delyveryMethods.inServiceCenter)}
                  customKey=""
                  context=""
                  label=""
                  activeColor={colors.primary}
                />
                <View style={styles.info}>
                  <Text style={styles.label}>
                    {translate.t('orderCard.getCardAtServiceDesk')}{' '}
                  </Text>
                  {delyveryMethod === delyveryMethods.inServiceCenter && (
                    <Text style={styles.desc}>
                     {translate.t('orderCard.ServiceDeskAddress')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
                onPress={() => setDeliveryMethod(delyveryMethods.inAddress)}>
                <AppCheckbox
                  value={delyveryMethod === delyveryMethods.inAddress}
                  clicked={() => setDeliveryMethod(delyveryMethods.inAddress)}
                  customKey=""
                  context=""
                  label=""
                  activeColor={colors.primary}
                />
                <View style={styles.info}>
                  <Text style={styles.label}>
                  {translate.t('orderCard.getCardDelivered')}{' '}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {delyveryMethod === delyveryMethods.inAddress && (
              <View>
                <View style={styles.addressContainer}>
                  <Text style={styles.BoxTitle}>
                  {translate.t('orderCard.getCardDelivered')}
                  </Text>
                  <View style={[styles.countryBox, cityErrorStyle]}>
                    {city ? (
                      <SelectItem
                        itemKey="name"
                        defaultTitle={translate.t('orderCard.chooseCity')}
                        item={city}
                        onItemSelect={() => setCityVisible(true)}
                        style={styles.countryItem}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => setCityVisible(true)}
                        style={[styles.countrySelectHandler]}>
                        <Text style={styles.countryPlaceholder}>
                        {translate.t('verification.city')}
                          <Text style={styles.point}>*</Text>
                        </Text>
                        <Image
                          style={styles.dropImg}
                          source={require('./../../../assets/images/down-arrow.png')}
                        />
                      </TouchableOpacity>
                    )}

                    <AppSelect
                      itemKey="name"
                      elements={cities}
                      selectedItem={city}
                      itemVisible={cityVisible}
                      onSelect={item => {
                        setCity(item);
                        setCityVisible(false);
                      }}
                      onToggle={() => setCityVisible(!cityVisible)}
                    />
                  </View>
                </View>
                <AppInput
                  value={village}
                  onChange={value => setVillage(value)}
                  context=""
                  customKey="village"
                  placeholder={translate.t('orderCard.vilage')}
                  style={styles.input}
                />
                <AppInput
                  value={address}
                  onChange={value => setSAddress(value)}
                  context={ValidationContext}
                  customKey="address"
                  placeholder={translate.t('verification.address')}
                  requireds={[required]}
                  style={styles.input}
                />

                <Text style={styles.description}>
                  {
                   ` * ${translate.t('orderCard.cardDeliveryText1')} \n\n * ${translate.t('orderCard.cardDeliveryText2')}  `
                  }
                </Text>
              </View>
            )}
            <View style={styles.bottomInfo}>
              <Text style={styles.li}>
              {translate.t('orderCard.deliveryPrice')}:{' '}
                {CurrencyConverter(cardTarrif?.deliveryAmount)}{translate.key === ka_ge ? currencies.GEL : GEL}
              </Text>
              <Text style={styles.li}>
              {translate.t('orderCard.cardPrice')}:{' '}
                {CurrencyConverter(
                  getNumber(
                    route.params.package?.priceAnnual
                      ? 0
                      : route.params.cardTarrif.tariffAmount,
                  ),
                )}
                {translate.key === ka_ge ? currencies.GEL : GEL}
              </Text>
              {route.params.package?.priceAnnual !== undefined && (
                <Text style={styles.li}>
                 {translate.t('orderCard.tariffPrice')}:{' '}
                  {CurrencyConverter(
                    getNumber(route.params.period === Periodes.Year ? route.params.package?.priceAnnual : route.params.package?.priceQuarterly),
                  )}
                  {translate.key === ka_ge ? currencies.GEL : GEL}
                </Text>
              )}
              <Text style={[styles.li, styles.lastLi]}>
                {translate.t('payments.totalDue')}:{' '}
                {CurrencyConverter(
                  (route.params.orderType === StoreActionType.TarrifPlan
                    ? 0
                    : getNumber(route.params.cardTarrif.tariffAmount)) +
                    getNumber(cardTarrif?.deliveryAmount) +
                    getNumber(route.params.period === Periodes.Year ? route.params.package?.priceAnnual : route.params.package?.priceQuarterly),
                )}{' '}
                {translate.key === ka_ge ? currencies.GEL : GEL}
              </Text>
            </View>
          </View>
          <AppButton
            style={styles.button}
            onPress={next}
            isLoading={isLoading}
            title={translate.t('common.next')}
          />
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  item: {
    marginTop: 0,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemFirst: {
    marginTop: 30,
  },
  info: {
    marginLeft: 14,
    flexShrink: 1,
  },
  label: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  desc: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.labelColor,
    marginTop: 13,
  },
  label2: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  addressContainer: {
    marginTop: 20,
  },
  BoxTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginBottom: 15,
  },
  point: {
    color: colors.danger,
  },
  countryItem: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
  },
  dropImg: {
    marginRight: 12,
  },
  countryBox: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
  },
  countrySelectHandler: {
    height: 54,
    backgroundColor: colors.inputBackGround,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryPlaceholder: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.placeholderColor,
    marginLeft: 13,
  },
  input: {
    marginTop: 17,
  },
  description: {
    marginTop: 20,
    fontFamily: 'FiraGO-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
  },
  bottomInfo: {
    marginTop: 40,
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
  button: {
    marginVertical: 40,
  },
});

export default DelyveryMethods;
