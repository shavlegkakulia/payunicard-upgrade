import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import Cover from '../../../components/Cover';
import AppButton from '../../../components/UI/AppButton';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import { tabHeight } from '../../../navigation/TabNav';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import UserService, {
  IAccountBallance,
  IGetUserBankCardsResponse,
} from '../../../services/UserService';
import screenStyles from '../../../styles/screens';
import { getNumber } from '../../../utils/Converter';

type RouteParamList = {
  params: {
    currentAccount: IAccountBallance | undefined;
  };
};

const TopupActionTypes = {
  topup: 'topup',
  addCard: 'addCard',
};

const Topup: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userBankCards, setUserBankCards] = useState<
    IGetUserBankCardsResponse | undefined
  >();

  const next = (actionType: string) => {
    if (actionType === TopupActionTypes.topup) {
      getUserBankCards();
    } else {
      NavigationService.navigate(Routes.addBankCard);
    }
  };

  const getUserBankCards = () => {
    setIsLoading(true);
    UserService.GetUserBankCards().subscribe({
      next: Response => {
        setUserBankCards(Response.data.data);
      },
      complete: () => setIsLoading(false),
      error: () => {
        setIsLoading(false);
        NavigationService.navigate(Routes.TopupChooseAmountAndAccount, {
          currentAccount: route.params.currentAccount
        });
      },
    });
  };

  useEffect(() => {
    if (userBankCards) {
      if (getNumber(userBankCards.bankCards?.length) <= 0) {
        NavigationService.navigate(Routes.TopupChooseAmountAndAccount, {
          currentAccount: route.params.currentAccount
        });
      } else {
        NavigationService.navigate(Routes.TopupChoosBankCard, {
          cards: userBankCards,
        });
      }
    }
  }, [userBankCards]);

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <View style={[styles.container]}>
        <View style={styles.content}>
          <View style={styles.touchables}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.touchableItem}
              onPress={() => next(TopupActionTypes.topup)}>
              <Cover
                localImage={require('./../../../assets/images/icon-topup-card.png')}
                style={styles.touchableItemIcon}
                isLoading={isLoading}
              />
              <Text
                style={[
                  styles.touchableItemText,
                ]}>
                {translate.t('topUp.withCard')}
              </Text>
            </TouchableOpacity>
            </View>
            <View style={[styles.card, styles.lastCard]}>
            <TouchableOpacity
              style={styles.touchableItem}
              onPress={() => next(TopupActionTypes.addCard)}>
              <Image
                source={require('./../../../assets/images/icon-card-yellow.png')}
                style={styles.touchableItemIcon}
              />
              <Text
                style={[
                  styles.touchableItemText,
                ]}>
                {translate.t('plusSign.addCard')}
              </Text>
            </TouchableOpacity>
           
            <Text style={styles.actionInfoText}>
              <Text style={styles.redPoint}>*</Text> {translate.t('topUp.linkCardText1')}
              {'\n'}
              <Text style={styles.redPoint}>*</Text> {translate.t('topUp.linkCardText2')}{'\n'}
              <Text style={styles.redPoint}>*</Text> {translate.t('topUp.linkCardText3')}
            </Text>
            </View>
          </View>

        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: tabHeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avoid: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20
  },
  lastCard: {
    marginTop: 25
  },
  touchables: {
  
  },
  touchableItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  redPoint: {
    color: colors.danger,
  },
  actionInfoText: {
    fontFamily: 'FiraGO-Book',
    lineHeight: 17,
    fontSize: 14,
    color: colors.labelColor,
    marginTop: 20
  },
  button: {
    marginVertical: 40,
  },
});

export default Topup;
