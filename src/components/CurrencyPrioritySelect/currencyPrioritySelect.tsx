import React from 'react';
import {
  Modal,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import colors from '../../constants/colors';
import {useDimension} from '../../hooks/useDimension';
import { IPackageCard} from '../../services/PresentationServive';

interface IProps {
  packagecard: IPackageCard[] | undefined;
  selectedPackageCard: IPackageCard | undefined;
  packageCardVisible: boolean;
  onSelect: (pack: IPackageCard | undefined) => void;
  onToggle: (visible?: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

interface IItemProps {
  packageCard: IPackageCard | undefined;
  onPackageCardSelect: (pack: IPackageCard | undefined) => void;
  isSelected?: boolean;
  style?: StyleProp<ViewStyle>;
  disable?: boolean;
}

export const CurrencyPriorityItem: React.FC<IItemProps> = props => {
  const selectPackage = () => {
    if (props.disable) return;
    props.onPackageCardSelect(props.packageCard);
  };

  return (
    <TouchableOpacity
      style={[
        styles.item,
        props.isSelected ? styles.activeIitem : {},
        props.style,
        props.disable && styles.disabledAccount,
      ]}
      onPress={selectPackage}>
      <View style={styles.itemLeft}>
        <View style={styles.accountDetail}>
          <Text style={styles.accountNumber}>{props.packageCard?.ccy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CurrencyPrioritySelect: React.FC<IProps> = props => {
  const dimension = useDimension();

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={props.packageCardVisible}
        onRequestClose={() => {
          props.onToggle();
        }}>
        <TouchableOpacity
          style={styles.background}
          activeOpacity={1}
          onPress={() => props.onToggle()}
        />
        <View style={styles.centeredView}>
          <View style={[styles.modalView]}>
            <ScrollView style={{maxHeight: dimension.height - 200}}>
              {props.packagecard?.map((pack, index) => (
                <CurrencyPriorityItem
                  packageCard={pack}
                  key={index}
                  onPackageCardSelect={props.onSelect}
                  isSelected={
                    props.selectedPackageCard?.paketTypeId === pack.paketTypeId
                  }
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
    justifyContent: 'center',
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
    justifyContent: 'space-between',
  },
  ccy: {
    fontFamily: 'FiraGO-Book',
    fontSize: 10,
    lineHeight: 12,
    color: colors.labelColor,
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

export default CurrencyPrioritySelect;
