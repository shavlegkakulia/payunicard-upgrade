import React from 'react';
import {View, StyleSheet, Text, Image, ActivityIndicator} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {useSelector} from 'react-redux';
import colors from '../../../constants/colors';
import { uni_coin } from '../../../constants/svgXmls';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
} from '../../../utils/Converter';

const CurrentMoney: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const containerStyle = [styles.container, styles.currentMoneyBox];
  return (
    <View style={containerStyle}>
      <View style={styles.currentCurrenty}>
        <Text style={styles.currencyTitle}>
          {translate.t('dashboard.userBalance')}
        </Text>
        {userData.isTotalBalanceLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loadingBox}
          />
        ) : (
          <Text style={styles.currencyValue}>
            {CurrencyConverter(userData.userTotalBalance?.balance)}
            {CurrencySimbolConverter(userData.userTotalBalance?.ccy, translate.key)}
          </Text>
        )}
      </View>

      <View style={styles.currentUniscores}>
        <Text style={styles.currentUniscoresTitle}>
          {translate.t('dashboard.uniPoints')}
        </Text>
        {userData.isTotalBalanceLoading ? (
          <View style={styles.currentUniscoresValueBox}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.currentUniscoresValueBox}>
            <Text style={styles.currentUniscoresValue}>
              {CurrencyConverter(userData.userTotalBalance?.points)}
            </Text>
            <SvgXml xml={uni_coin} height="18" width="18" style={styles.currentUniscoresSimbol} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentCurrenty: {},
  currencyTitle: {
    color: colors.labelColor,
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 16,
    marginBottom: 3,
  },
  currencyValue: {
    color: colors.black,
    fontFamily: 'FiraGO-Bold',
    fontSize: 24,
    lineHeight: 29,
  },
  currentUniscores: {},
  currentUniscoresTitle: {
    color: colors.labelColor,
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 16,
    marginBottom: 3,
  },
  currentUniscoresValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUniscoresValue: {
    color: colors.black,
    fontFamily: 'FiraGO-Bold',
    fontSize: 24,
    lineHeight: 29,
  },
  currentUniscoresSimbol: {
    marginLeft: 5,
  },
  loadingBox: {
    alignSelf: 'flex-start',
  },
  currentMoneyBox: {
    marginTop: 35,
    paddingHorizontal: 8,
  },
});

export default CurrentMoney;
