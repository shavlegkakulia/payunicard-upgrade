import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import BankCardSelect from '../../../components/BankCardSelect/BankCardSelect';
import AppButton from '../../../components/UI/AppButton';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import UserService, {
  IBankCard,
  IGetUserBankCardsResponse,
} from '../../../services/UserService';
import screenStyles from '../../../styles/screens';
import {getNumber} from '../../../utils/Converter';

type RouteParamList = {
  params: {
    cards: IGetUserBankCardsResponse | undefined;
  };
};

const ChoosBankCard: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [activeCard, setActiveCard] = useState<IBankCard | undefined>();

  const next = () => {
    NavigationService.navigate(Routes.TopupChooseAmountAndAccount, {
      card: activeCard,
    });
  };

  const cardSelect = (card: IBankCard | undefined) => {
    const cards = [...(route.params.cards?.bankCards || [])];
    const cardIndex = cards.findIndex(c => c.cardNumber === card?.cardNumber);
    if (cardIndex >= 0) {
      cards.map(c => (c.isSelected = false));
      cards[cardIndex].isSelected = true;
      setActiveCard(card);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View style={[styles.content]}>
          <View>
            {route.params.cards?.bankCards?.map(bcard => (
              <BankCardSelect
                key={bcard.cardNumber}
                onCardSelect={cardSelect}
                card={bcard}
                style={styles.CardItem}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.darkButton} onPress={next.bind(this)}>
            <Image
              source={require('./../../../assets/images/icon-rounded-dark-plus.png')}
              style={styles.darkPlus}
              resizeMode="contain"
            />
            <Text style={styles.otherMethodText}>{translate.t('topUp.withAnotherCard')}</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          style={styles.button}
          title={translate.t('common.next')}
          onPress={next.bind(this)}
          disabled={activeCard === undefined}
        />
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
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  CardItem: {
    marginBottom: 25,
  },
  loadingBox: {
    alignSelf: 'center',
    marginTop: 10,
  },
  darkButton: {
    width: '100%',
    height: 40,
    backgroundColor: colors.inputBackGround,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  otherMethodText: {
    fontFamily: 'FiraGO-Medium',
    lineHeight: 17,
    fontSize: 14,
    color: colors.labelColor,
    marginLeft: 5,
  },
  darkPlus: {
    width: 17,
    height: 17,
  },
  button: {
    marginVertical: 40,
  },
});

export default ChoosBankCard;
