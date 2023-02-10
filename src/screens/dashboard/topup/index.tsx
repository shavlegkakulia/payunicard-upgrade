import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import {View, StyleSheet, Image, Text, ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import { IAccountBallance } from '../../../services/UserService';
import screenStyles from '../../../styles/screens';

type RouteParamList = {
  params: {
    currentAccount: IAccountBallance | undefined;
  };
};

const TopupFlow: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const topup = () => {
    NavigationService.navigate(Routes.Topup, {
      currentAccount: route?.params?.currentAccount
    });
  };

  const goToPaymentMethods = () => {
    NavigationService.navigate(Routes.paymentMethods);
  }

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View style={styles.content}>
          <View style={styles.touchables}>
            <TouchableOpacity
              style={styles.touchableItem}
              onPress={topup.bind(this)}>
              <Image
                source={require('./../../../assets/images/icon-topup-card.png')}
                style={styles.touchableItemIcon}
              />
              <Text style={styles.touchableItemText}>{translate.t('topUp.withCard')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableItem} onPress={goToPaymentMethods}>
              <Image
                source={require('./../../../assets/images/icon-other-bank.png')}
                style={styles.touchableItemIcon}
              />
              <Text style={styles.touchableItemText}>{translate.t('topUp.withBanktransf')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  touchables: {
    marginBottom: 14,
  },
  touchableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  touchableItemIcon: {
    marginRight: 30,
  },
  touchableItemText: {
    fontFamily: 'FiraGO-Medium',
    lineHeight: 17,
    fontSize: 14,
    color: colors.labelColor,
  },
});

export default TopupFlow;
