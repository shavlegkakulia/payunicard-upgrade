import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {useSelector} from 'react-redux';
import colors from '../constants/colors';
import {EN, KA, ka_ge} from '../lang';
import {tabHeight} from '../navigation/TabNav';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from './../redux/action_types/translate_action_types';
import PresentationServive, {
  IOffersDetailResponse,
} from './../services/PresentationServive';
import screenStyles from '../styles/screens';

type RouteParamList = {
  params: {
    offerId: number;
  };
};

const OfferDetails: React.FC = () => {
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [offer, setOffer] = useState<IOffersDetailResponse | undefined>();
  const {offerId} = route.params;

  const get_GetOffer = () => {
    setIsLoading(true);
    PresentationServive.get_GetOfferDetail(
      offerId,
      translate.key === ka_ge ? KA : EN,
    ).subscribe({
      next: Response => {
        setOffer(Response.data.data?.offer);
      },
      complete: () => setIsLoading(false),
    });
  };

  const seeMore = () => {
    if (offer?.merchantUrl) Linking.openURL(offer?.merchantUrl);
  };

  useEffect(() => {
    get_GetOffer();
  }, []);

  return (
    <ScrollView contentContainerStyle={[screenStyles.wraper, styles.avoid]}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingBox}
        />
      ) : (
        <>
          <Text style={styles.title} numberOfLines={2}>
            {offer?.title}
          </Text>
          <Image
            source={{uri: offer?.url}}
            style={styles.img}
            resizeMode="contain"
          />
          <Text style={styles.text}>
            {offer?.description}
            {'\n\n\n'}
            {(offer?.merchantUrl !== undefined && offer?.merchantUrl.length > 0) && (
              <TouchableOpacity onPress={seeMore} style={styles.seemore}>
                <Text style={styles.seemoretext}>
                  {translate.t('common.seeMore')}
                </Text>
              </TouchableOpacity>
            )}
          </Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: 'FiraGO-Bold',
    lineHeight: 19,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    flexWrap: 'wrap',
  },
  img: {
    width: '100%',
    minWidth: 250,
    minHeight: 150,
    marginTop: 10,
  },
  text: {
    fontFamily: 'FiraGO-Book',
    lineHeight: 17,
    fontSize: 14,
    textAlign: 'left',
    marginTop: 25,
    marginBottom: tabHeight + 40,
  },
  loadingBox: {
    alignSelf: 'center',
    flex: 1,
  },
  seemore: {
    paddingVertical: 10,
  },
  seemoretext: {
    fontFamily: 'FiraGO-Medium',
    lineHeight: 17,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default OfferDetails;
