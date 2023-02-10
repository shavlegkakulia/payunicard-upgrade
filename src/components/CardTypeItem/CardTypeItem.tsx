import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import colors from '../../constants/colors';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../redux/action_types/translate_action_types';
import {ICardType, IPackageCard} from './../../services/PresentationServive';
import { CurrencyConverter, CurrencySimbolConverter } from './../../utils/Converter';
import AppCheckbox from '../UI/AppCheckbox';

interface IItemProps {
  card: ICardType;
  onCardSelect: (card: ICardType) => void;
  style?: StyleProp<ViewStyle>;
  disable?: boolean;
  packageCardTypes: IPackageCard[] | undefined;
}

export const CardTypeItem: React.FC<IItemProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const cardSelect = () => {
    if (props.disable) return;
    props.onCardSelect(props.card);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.item,
        props.style,
        props.disable && styles.disabledAccount,
      ]}
      onPress={cardSelect}>
      <View style={styles.itemLeft}>
        <View style={styles.imageContainer}>
          <AppCheckbox
            activeColor={colors.primary}
            clicked={cardSelect}
            label=""
            context=""
            customKey=""
            value={props.card.isChecked}
          />
          <Image
            source={{uri: props.card.imageURL}}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.accountDetail}>
          <Text style={styles.accountNumber}>{props.card.name}</Text>
          <View style={styles.ccyContainer}>
            {props.packageCardTypes?.map(currency => (
              <Text key={currency.ccy} style={styles.ccy}>
                {CurrencySimbolConverter(currency.ccy, translate.key)}{' '}
                {CurrencyConverter(0)}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 30,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 380,
  },
  background: {
    flex: 1,
    backgroundColor: '#00000098',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: colors.baseBackgroundColor,
    borderBottomColor: colors.baseBackgroundColor,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 20,
    paddingRight: 30,
    height: 54,
    //paddingVertical: 20
  },
  activeIitem: {
    borderTopColor: colors.primary,
    borderBottomColor: colors.primary,
  },
  imageContainer: {
    marginRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  image: {
    width: 20,
    height: 20,
  },
  accountNumber: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  ccyContainer: {
    flexDirection: 'row',
  },
  ccy: {
    fontFamily: 'FiraGO-Book',
    fontSize: 10,
    lineHeight: 12,
    color: colors.labelColor,
    paddingRight: 10
  },
  amount: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    marginLeft: 15,
  },
  itemLeft: {
    flexDirection: 'row',
  },
  accountDetail: {
    justifyContent: 'center',
  },
  disabledAccount: {
    opacity: 0.5,
  },
});

export default CardTypeItem;
