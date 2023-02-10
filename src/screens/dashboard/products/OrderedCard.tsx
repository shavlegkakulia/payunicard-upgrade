import React from 'react';
import {Image, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {EUR, GEL, USD} from '../../../constants/currencies';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import {ICardStatus} from '../../../services/UserService';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
} from '../../../utils/Converter';
import {formatDate} from '../../../utils/utils';
import {cardTypeIds} from '../cardsStore/TarriffCalculator';
import userStatuses from '../../../constants/userStatuses';
import {PACKET_TYPE_IDS} from './index';
import colors from '../../../constants/colors';

interface IProps {
  card: ICardStatus;
  width: number | string | undefined;
  onCancelPackageWEB: (GroupId: number, OrderingCardId: number) => void;
}

const OrderedCard: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const {documentVerificationStatusCode, customerVerificationStatusCode} =
    userData.userDetails || {};
  const isUserVerified =
    documentVerificationStatusCode === userStatuses.Enum_Verified &&
    customerVerificationStatusCode === userStatuses.Enum_Verified;
  return (
    <View style={{width: props.width, marginLeft: 15}}>
      <View
        style={[
          styles.accountCardWallet,
          props.card.cardTypeID === PACKET_TYPE_IDS.unicard &&
            styles.accountCardUnicard,
          props.card.cardTypeID === PACKET_TYPE_IDS.uniUltra &&
            styles.accountUnicard,
          props.card.cardTypeID === PACKET_TYPE_IDS.upera &&
            styles.accountCardUpera,
          {width: '100%'},
        ]}>
        {props.card.cardTypeID !== PACKET_TYPE_IDS.unicard && (
          <>
            <Image
              source={
                props.card.cardTypeID === PACKET_TYPE_IDS.wallet
                  ? require('./../../../assets/images/cardCornerGray.png')
                  : props.card.cardTypeID === PACKET_TYPE_IDS.uniUltra
                  ? require('./../../../assets/images/cardCornerPrimary.png')
                  : props.card.cardTypeID === PACKET_TYPE_IDS.upera
                  ? require('./../../../assets/images/cardCornerPrimary.png')
                  : require('./../../../assets/images/cardCornerOrange.png')
              }
              style={styles.cardCorner}
            />
            <Image
              source={require('./../../../assets/images/x-5x5.png')}
              style={styles.x}
            />
          </>
        )}
        <TouchableOpacity activeOpacity={0.8}>
          <View>
            <Text style={styles.cardTitle}>
              {props.card.packagecode}****
              {props.card.status === 0
                ? translate.t('orderCard.preOrder')
                : translate.t('products.orderedCard')}
            </Text>
          </View>
          <View style={[styles.cardCurrencies]}>
            <View>
              <View style={styles.cardBalanceContainer}>
                <Text style={styles.cardBallance}>
                  {CurrencyConverter(props.card.amount)}
                  {CurrencySimbolConverter(GEL, translate.key)}
                </Text>
              </View>
              <View style={styles.cardCurrencyBalance}>
                <TouchableOpacity activeOpacity={1}>
                  <Text style={styles.cardCurrency}>
                    {CurrencySimbolConverter(GEL, translate.key)} {CurrencyConverter(0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1}>
                  <Text style={styles.cardCurrency}>
                    {CurrencySimbolConverter(USD)} {CurrencyConverter(0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1}>
                  <Text style={styles.cardCurrency}>
                    {CurrencySimbolConverter(EUR)} {CurrencyConverter(0)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Image
                source={require('./../../../assets/images/verticall-dots.png')}
              />
            </View>
          </View>
          <View style={styles.cardAccountContainer}>
            <View style={styles.cardContainerInner}>
              <>
                <Text style={styles.orderedCardAmount}>
                  {translate.t('payments.totalDue')}:{' '}
                  <Text style={styles.bolder}>
                    {CurrencyConverter(props.card.amount)}{' '}
                    {CurrencySimbolConverter(GEL, translate.key)}
                  </Text>
                </Text>

                <Text style={styles.orderedCardCancellation}>
                  {translate.t('orderCard.orderCancellDate')}:{' '}
                  <Text style={styles.bolder}>
                    {formatDate(props.card.orderCancelDate?.toString())
                      .split('.')
                      .join('/')
                      .toString()}
                    , 00:00
                  </Text>{' '}
                </Text>
              </>
            </View>
            <View style={styles.cardLogoContainer}>
              {props.card.cardTypeID === cardTypeIds.typeVisa ? (
                <Image
                  source={require('./../../../assets/images/visa_35x14.png')}
                />
              ) : (
                <Image
                  source={require('./../../../assets/images/mastercard_24x15.png')}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {!isUserVerified && (
        <View style={styles.notVerifiedBlock}>
          <Image
            source={require('./../../../assets/images/alert_red.png')}
            resizeMode="contain"
            style={styles.notVerifiedAlertIcon}
          />
          <Text style={styles.notVerifiedBlockText}>
            {translate.t('orderCard.forGetCardMustIdentity')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accountCardWallet: {
    borderWidth: 1,
    borderColor: colors.cardBorderColor,
    borderRadius: 7,
    padding: 13,
    position: 'relative',
    marginBottom: 20,
    backgroundColor: colors.white,
  },
  accountCardUnicard: {
    borderColor: colors.uniColor,
  },
  accountUnicard: {
    borderColor: colors.uniColor,
  },
  accountUniPlus: {
    borderColor: colors.uniColor,
  },
  accountCardUpera: {
    borderColor: colors.primary,
  },
  cardCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  x: {
    position: 'absolute',
    right: 4,
    top: 4,
  },
  cardTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  cardCurrencies: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  cardBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBallance: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 24,
    lineHeight: 29,
    color: colors.black,
  },
  cardCurrencyBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  cardCurrency: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 12,
    lineHeight: 14,
    color: colors.labelColor,
    marginRight: 13,
  },
  cardAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cardContainerInner: {
    flex: 1,
  },
  orderedCardAmount: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 8,
    lineHeight: 10,
    color: colors.black,
  },
  bolder: {
    fontWeight: '700',
  },
  orderedCardCancellation: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 8,
    lineHeight: 16,
    color: colors.black,
    marginTop: 2,
  },
  cardLogoContainer: {
    justifyContent: 'flex-end',
  },
  notVerifiedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notVerifiedAlertIcon: {
    width: 30,
    height: 30,
  },
  notVerifiedBlockText: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 9,
    lineHeight: 12,
    color: colors.black,
    marginLeft: 8,
  },
});

export default OrderedCard;
