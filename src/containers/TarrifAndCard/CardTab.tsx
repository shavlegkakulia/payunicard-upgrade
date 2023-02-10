import React, {useEffect, useRef, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Animated} from 'react-native';
import CardTypeItem from '../../components/CardTypeItem/CardTypeItem';
import colors from '../../constants/colors';
import {ICardType, IPackageCard} from '../../services/PresentationServive';
import {getNumber} from '../../utils/Converter';

interface IItem {
  card: ICardType;
  index: number;
  packageCardTypes: IPackageCard[] | undefined;
  setCardsCount: (card: ICardType, operation: string) => void;
  onCardToggle: (card: ICardType) => void;
}

const CardTab: React.FC<IItem> = props => {
  const [{inc, dec}, setPreeValue] = useState({inc: false, dec: false});
  const pressInc = () => {
    setPreeValue({inc: true, dec: false});
    props.setCardsCount(props.card, '+');
  };

  const pressDec = () => {
    setPreeValue({inc: false, dec: true});
    props.setCardsCount(props.card, '-');
  };

  const animatedIsFocused = useRef(
    new Animated.Value(props.card && props.card.isChecked ? 1 : 0),
  );

  useEffect(() => {
    Animated.timing(animatedIsFocused.current, {
      toValue: props.card && props.card.isChecked ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [props.card.isChecked]);

  const viewStyleTop = {
    top: animatedIsFocused.current.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 42],
    }),
  };

  const viewStyleHeight = {
    height: animatedIsFocused.current.interpolate({
      inputRange: [0, 1],
      outputRange: [74, 116],
    }),
  };

  return (
    <Animated.View style={[styles.tabItem, viewStyleHeight]}>
      <Animated.View style={[styles.tabsTab, viewStyleTop]}>
        <View style={styles.tabsTabItem}>
          <TouchableOpacity
            style={[
              styles.toggleCount,
              dec ? styles.tabItemButtonRightCornerRadius : {},
            ]}
            onPressOut={setPreeValue.bind(this, {inc: false, dec: false})}
            onPressIn={pressDec.bind(this, true)}>
            <Text
              style={[styles.toggleCountText, dec ? styles.colorWhite : {}]}>
              -
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.tabsTabItem, styles.tabsTabItemBordered]}>
          <Text style={styles.willCount}>
            {getNumber(props.card.willCount)}
          </Text>
        </View>
        <View style={styles.tabsTabItem}>
          <TouchableOpacity
            style={[
              styles.toggleCount,
              inc ? styles.tabItemButtonLeftCornerRadius : {},
            ]}
            onPressOut={setPreeValue.bind(this, {inc: false, dec: false})}
            onPressIn={pressInc.bind(this, true)}>
            <Text
              style={[styles.toggleCountText, inc ? styles.colorWhite : {}]}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <CardTypeItem
        card={props.card}
        packageCardTypes={props.packageCardTypes}
        onCardSelect={props.onCardToggle}
        style={styles.cardItem}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabsTab: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBackGround,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    overflow: 'hidden',
  },
  tabsTabItem: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  tabsTabItemBordered: {
    borderLeftColor: colors.inputBackGround,
    borderLeftWidth: 1,
    borderRightColor: colors.inputBackGround,
    borderRightWidth: 1,
  },
  willCount: {
    paddingTop: 12,
    fontFamily: 'FiraGO-Medium',
    fontSize: 18,
    lineHeight: 22,
    color: colors.labelColor,
  },
  toggleCount: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  toggleCountText: {
    paddingTop: 12,
    fontFamily: 'FiraGO-Medium',
    fontSize: 25,
    lineHeight: 30,
    color: colors.labelColor,
  },
  tabItem: {
    marginTop: 2,
  },
  cardItem: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
    top: -54,
  },
  tabItemButtonRightCornerRadius: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 10,
  },
  tabItemButtonLeftCornerRadius: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 10,
  },
  colorWhite: {
    color: colors.white,
  },
});

export default CardTab;
