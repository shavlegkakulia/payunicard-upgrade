import React from 'react';
import {View, StyleSheet, Text, Image, TouchableOpacity} from 'react-native';
import { useSelector } from 'react-redux';
import { TYPE_UNICARD } from '../../../constants/accountTypes';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
}  from '../../../redux/action_types/translate_action_types';
import { IUserState, IGloablState as IUserGlobalState } from '../../../redux/action_types/user_action_types';
import NavigationService from '../../../services/NavigationService';
import screenStyles from '../../../styles/screens';
import { getNumber } from '../../../utils/Converter';

export const StoreActionType = {
  TarrifPlan: 'TarrifPlan',
  PurchaseCard: 'PurchaseCard',
};

const CardsStore: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const hasTarrif = getNumber(userData.userAccounts?.filter(up => up.type !== TYPE_UNICARD).length) > 1;
  
  const next = (type: string) => {
    if(!hasTarrif && type === StoreActionType.PurchaseCard) return;

    NavigationService.navigate(type === StoreActionType.TarrifPlan ? Routes.ChoosePlan : Routes.TarriffCalculator, {orderType: type});
  };

  return (
    <View style={[screenStyles.wraper, styles.container]}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.item} onPress={() => next(StoreActionType.TarrifPlan)}>
          <View style={styles.iconBox}>
            <Image
              source={require('./../../../assets/images/icon-list.png')} 
              style={styles.icon}
            />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.title}>{translate.t('orderCard.orderTariff')}</Text>
            <Text style={styles.desc}>
            {translate.t('orderCard.orderTarifDesc')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={!hasTarrif ? 1 : 0.2} style={[styles.item, !hasTarrif && styles.disabledItem]} onPress={() => next(StoreActionType.PurchaseCard)}>
          <View style={styles.iconBox}>
            <Image
              source={require('./../../../assets/images/icon-card-yellow.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.title}>{translate.t('orderCard.cardOrder')}</Text>
            <Text style={styles.desc}>
            {translate.t('orderCard.cardOrderDesc')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  disabledItem: {
    opacity: 0.2
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 30,
  },
  icon: {
    width: 40,
    height: 40,
  },
  textBox: {},
  title: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  desc: {
    marginTop: 5,
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 18,
    color: colors.labelColor,
    flexWrap: 'wrap',
    maxWidth: '99%'
  },
});

export default CardsStore;
