import React, { useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { IAccountBallance } from '../../../services/UserService';
import { debounce } from '../../../utils/utils';
import { TYPE_UNICARD } from '../../../constants/accountTypes';
import { PACKET_TYPE_IDS } from '.';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
  getNumber,
  getString,
} from '../../../utils/Converter';
import TemporaryText from '../../../components/TemporaryText';
import colors from '../../../constants/colors';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import { useSelector } from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';

interface OProps {
  account: IAccountBallance;
  cardMask?: string;
  inGroup?: boolean;
  goLayerUp?: boolean;
  cardContainerStyle?: StyleProp<ViewStyle>;
  logo?: ImageSourcePropType;
  onDetailView?: Function;
}

const AccountCard: React.FC<OProps> = props => {
  const [outer, setOuter] = useState(true);
  const [copiedText, setCopiedText] = useState<string | undefined>();
  const copiedTextTtl = useRef<NodeJS.Timeout>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const clickPropagationDebounce = debounce((e: Function) => e(), 500);

  const goDetail = () => {
    setOuter(true);
    clickPropagationDebounce(() => {
      if (outer) {
        props.onDetailView && props.onDetailView();
      }
    });
  };

  const copyToClipboard = (str: string) => {
    setOuter(false);
    Clipboard.setString(str);
    setCopiedText(str);
    copiedTextTtl.current = setTimeout(() => {
      setCopiedText(undefined);
    }, 1000);
  };

  const getAvailableBalanceByPrioritiCCY = () => {
    const accounts = { ...props.account };
    const priorityBalance = accounts.currencies?.filter(
      currency => currency.key === props.account.ccyPriority,
    );

    if (accounts.type === TYPE_UNICARD) {
      return accounts.availableInGEL;
    }

    return priorityBalance?.length ? priorityBalance[0].availableBal : 0;
  };

  return (
    <View
      style={[
        styles.accountCardWallet,
        props.inGroup && styles.accountInGroup,
        props.goLayerUp && styles.accountInGroupUpper,
        props.account.customerPaketId === PACKET_TYPE_IDS.upera && styles.accountCardUpera,
        props.account.customerPaketId === PACKET_TYPE_IDS.uniPlus && styles.accountCardUniPlus,
        props.account.customerPaketId === PACKET_TYPE_IDS.uniUltra && styles.accountCardUniUltra,
        props.cardContainerStyle,
      ]}>
      {props.account.type !== PACKET_TYPE_IDS.unicard && (
        <Image
          source={
            props.account.customerPaketId === PACKET_TYPE_IDS.wallet ?
              require('./../../../assets/images/cardCornerGray.png')
              :
              props.account.customerPaketId === PACKET_TYPE_IDS.uniUltra ?
                require('./../../../assets/images/cardCornerOrange.png')
                :
                props.account.customerPaketId === PACKET_TYPE_IDS.uniPlus ?
                  require('./../../../assets/images/cardCornerUniPlus.png')
                  :
                  props.account.customerPaketId === PACKET_TYPE_IDS.upera ?
                    require('./../../../assets/images/cardCornerPrimary.png')
                    : require('./../../../assets/images/cardCornerGray.png')
          }
          style={styles.cardCorner}
        />
      )}
      <TouchableOpacity onPress={goDetail} activeOpacity={0.8}>
        <View>
          <Text style={styles.cardTitle}>
            {props.account.accountTypeName}
            {' ' + (props.cardMask || '')}
          </Text>
        </View>
        <View
          style={[
            styles.cardCurrencies,
            props.account.type === PACKET_TYPE_IDS.unicard &&
            styles.cardCurrenciesUnicard,
          ]}>
          <View>
            <View style={styles.cardBalanceContainer}>
              <Text style={styles.cardBallance}>
                {CurrencyConverter(getAvailableBalanceByPrioritiCCY())}
                {CurrencySimbolConverter(props.account.ccyPriority, translate.key)}
              </Text>
              {props.account.type === PACKET_TYPE_IDS.unicard && (
                <Image
                  source={require('./../../../assets/images/score-star.png')}
                  style={styles.cardUniStar}
                />
              )}
            </View>
            {props.account.type !== PACKET_TYPE_IDS.unicard && (
              <View style={styles.cardCurrencyBalance}>
                {props.account.currencies?.map(currency => (
                  <TouchableOpacity key={currency.key}>
                    <Text style={styles.cardCurrency}>
                      {currency.value} {CurrencyConverter(currency.balance)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View>
            {props.account.type !== PACKET_TYPE_IDS.unicard &&
              props.account.type !== PACKET_TYPE_IDS.wallet &&
              getNumber(props.account.cards?.length) > 1 && (
                <Text
                  style={[
                    styles.cardAccountCount,
                    props.account.customerPaketId === PACKET_TYPE_IDS.upera && styles.colorPrimary,
                    props.account.customerPaketId === PACKET_TYPE_IDS.uniPlus && styles.colorUniPlus,
                    props.account.customerPaketId === PACKET_TYPE_IDS.uniUltra && styles.colorUniUltra,
                  ]}>
                  {props.account.cards?.length}
                </Text>
              )}
            <Image
              source={require('./../../../assets/images/verticall-dots.png')}
            />
          </View>
        </View>
        <View style={styles.cardAccountContainer}>
          <View style={styles.cardContainerInner}>
            <TouchableWithoutFeedback>
              <TouchableOpacity
                style={styles.cardAccountInfo}
                onPress={() =>
                  copyToClipboard(getString(props.account.accountNumber))
                }>
                <Text style={styles.cardAccount}>
                  {props.account.type === TYPE_UNICARD
                    ? props.account.accountNumber?.replace(
                      /\b(\d{4})(\d{4})(\d{4})(\d{4})\b/,
                      '$1  $2  $3  $4',
                    )
                    : props.account.accountNumber}
                </Text>
                {props.account.type !== PACKET_TYPE_IDS.unicard && (
                  <Image
                    source={require('./../../../assets/images/textCopyIcon.png')}
                    style={styles.cardAccountCopy}
                  />
                )}
                <TemporaryText
                  text={translate.t('common.copied')}
                  show={props.account.accountNumber === copiedText}
                />
              </TouchableOpacity>
            </TouchableWithoutFeedback>
          </View>
          <View>
            {props.logo ? (
              <Image
                source={props.logo}
                resizeMode="contain"
                style={styles.packetLogo}
              />
            ) : props.account.type === PACKET_TYPE_IDS.unicard ? (
              <Image source={require('./../../../assets/images/uniLogo.png')} />
            ) : (
              <Image
                source={{ uri: props.account.imageUrl }}
                resizeMode="contain"
                style={styles.packetLogo}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
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


  accountInGroup: {
    position: 'absolute',
    top: -5,
    right: -5,
    left: 5,
    bottom: 5,
    zIndex: 1,
  },
  accountInGroupUpper: {
    zIndex: 9,
  },
  accountCardUpera: {
    borderColor: colors.primary,
  },
  accountCardUniPlus: {
    borderColor: colors.uniPlus
  },
  accountCardUniUltra: {
    borderColor: colors.uniUltra
  },
  cardCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  cardCurrenciesUnicard: {
    marginTop: 30,
  },
  cardBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardUniStar: {
    marginLeft: 6,
    width: 18,
    height: 18
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
  cardAccountCount: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 15,
    color: colors.uniColor,
    position: 'relative',
    right: 2,
    marginBottom: 4,
  },
  colorPrimary: {
    color: colors.primary,
  },
  colorUniPlus: {
    color: colors.uniPlus,
  },
  colorUniUltra: {
    color: colors.uniUltra,
  },
  cardAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cardContainerInner: {
    flex: 1,
  },
  cardAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAccount: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginRight: 5,
  },
  cardAccountCopy: {
    width: 12,
    height: 12,
  },
  packetLogo: {
    height: 18,
    width: 30,
  },
});

export default AccountCard;
