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
import colors from '../../constants/colors';
import {IBankCard} from '../../services/UserService';
import AppCheckbox from '../UI/AppCheckbox';

interface IItemProps {
  card: IBankCard | undefined;
  onCardSelect: (card: IBankCard | undefined) => void;
  style?: StyleProp<ViewStyle>;
}

const bankCadTypes = {
  visa: 4,
  mc: 5
}

export const BankCardSelect: React.FC<IItemProps> = props => {
  const cardSelect = () => {
    props.onCardSelect(props.card);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.item, props.style]}
      onPress={cardSelect}>
      <View style={styles.itemLeft}>
        <View style={styles.imageContainer}>
          <AppCheckbox
            activeColor={colors.primary}
            clicked={cardSelect}
            label=""
            context=""
            customKey=""
            value={props.card?.isSelected}
          />
          <Image
            source={props.card?.cardType === bankCadTypes.mc ? require('./../../assets/images/mastercard_24x15.png') : require('./../../assets/images/visa_35x14.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.accountDetail}>
          <Text style={styles.accountNumber}>{props.card?.cardNumber}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: colors.baseBackgroundColor,
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 30,
    height: 54
  },
  imageContainer: {
    marginRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  image: {
    height: 15,
    marginLeft: 20
  },
  accountNumber: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  itemLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  accountDetail: {
    justifyContent: 'center',
  },
});

export default BankCardSelect;
