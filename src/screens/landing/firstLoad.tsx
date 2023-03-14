import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  NativeScrollEvent,
  Platform,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import AppButton from './../../components/UI/AppButton';
import PaginationDots from './../../components/PaginationDots';
import Colors from './../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from './../../redux/action_types/translate_action_types';
import {useDispatch, useSelector} from 'react-redux';
import {useDimension} from '../../hooks/useDimension';
import {ScrollView} from 'react-native-gesture-handler';
import {createRef} from 'react';
import {use} from '../../redux/actions/translate_actions';
import colors from './../../constants/colors';
// import analytics from '@react-native-firebase/analytics';
import Routes from '../../navigation/routes';

interface IPageProps {
  Complate: () => void;
}

interface IFragments {
  desc: {
    en: string,
    ka: string
  };
  imgUrl: ImageSourcePropType;
  icon1?: ImageSourcePropType;
  icon2?: ImageSourcePropType;
  isWallet?: boolean;
}

const FirstLoad: React.FC<IPageProps> = props => {
  const [step, setStep] = useState<number>(0);
  const [fragments, setFragments] = useState<Array<IFragments>>([]);
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const carouselRef = createRef<ScrollView>();
  const dimension = useDimension();
  const dispatch = useDispatch<any>();

  // useEffect(() => {
  //   (async () => {
  //     await analytics().logScreenView({
  //       screen_name: Routes.FirstLoad,
  //       screen_class: Routes.FirstLoad,
  //     });
  //   })();
  // }, []);

  const onChange = (nativeEvent: NativeScrollEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      if (slide != step) {
        //if(slide === 3) return;
        setStep(slide);
      }
    }
  };
//translate.t('onboard.firstScreenDesc'),
  useEffect(() => {
    let _fragments = [
      {
        desc: {
          en:'Open the wallet remotely',
          ka: 'გახსენი საფულე დისტანციურად'
        } ,
        imgUrl: require('../../assets/images/load_screen_1.png'),
      },
      {
        desc: {
          en: 'Get a free non-bank VISA / MASTERCARD card',
          ka: 'მიიღე უფასო არასაბანკო VISA/MASTERCARD ბარათი'
        },
          //translate.t('onboard.secondScreenDesc')},
        imgUrl: require('../../assets/images/load_screen_2.png'),
      },
      {
        desc: {
          en: 'Utilities, loans, conversion, remittances',
          ka: 'კომუნალურები, კონვერტაცია, გზავნილები',
          //translate.t('onboard.thirdScreenDesc')
        },
        imgUrl: require('../../assets/images/load_screen_3.png'),
      },
      {
        desc: {
          en: 'Accumulation and discount cards in one app',
          ka: 'დაგროვების და ფასდაკლების ბარათები ერთ აპლიკაციაში'
        },
        //translate.t('onboard.fourthScreenDesc'),
        imgUrl: require('../../assets/images/load_screen_4.png'),
      },
    ];
    setFragments(_fragments);
    if (Platform.OS === 'ios' && fragments) {
      setFragments([
        ..._fragments,
        {
          desc:{
            en: 'Add PayUnicard Visa cards to Apple Wallet',
            ka: 'დაამატე ფეიუნიქარდის Visa ბარათები Apple Wallet-ში',
          }, 
          //,translate.t('onboard.wallet'),
          imgUrl: require('../../assets/images/icon-apple-screen.png'),
          icon1: require('./../../assets/images/icon-apple-pay-button.png'),
          icon2: require('./../../assets/images/apple-wallet-button.png'),
          isWallet: true,
        },
      ]);
    }
  }, [Platform.OS]);
  const nextStep = () => {
    setStep(s => {
      if (s >= fragments.length - 1) {
        props.Complate();
        return s;
      }
      moveNext(s + 1);
      return s + 1;
    });
  };

  const moveNext = (index: number) => {
    carouselRef.current?.scrollTo({
      x: index * dimension.width,
      animated: true,
    });
  };

  const fragmentStyle: StyleProp<ViewStyle> = {
    width: dimension.width,
  };
  const walletView: StyleProp<ViewStyle> = {
    width: dimension.width,
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  return (
    <View style={styles.screenContainer}>
      <View style={styles.carouselContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.authorizeText}> </Text>
          <TouchableOpacity
            onPress={async () => {
              dispatch(use(translate.next()));
            }}>
            <Text style={styles.langSwitchText}>{`Switch to ${
              translate.key === 'en' ? 'GE' : 'EN'
            }`}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={carouselRef}
          onScroll={({nativeEvent}) => onChange(nativeEvent)}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          horizontal>
          {fragments.map((fragment, index) => (
            <View
              key={index}
              style={[
                fragment.isWallet !== undefined ? walletView : fragmentStyle,
              ]}>
              {fragment.icon1 !== undefined && (
                <Image
                  style={styles.icon1}
                  source={fragment.icon1}
                  resizeMode={'contain'}
                />
              )}
              {fragment.isWallet !== undefined && (
                <Text style={[styles.desc, styles.walletDesc]}>
                  { fragment.desc[translate.key]}
                </Text>
              )}
              <View style={[fragment.isWallet ? {} : styles.imageContainer]}>
                <Image
                  style={[
                    fragment.isWallet ? styles.walletImage : styles.image,
                  ]}
                  source={fragment.imgUrl}
                  resizeMode={'contain'}
                />
              </View>
              {fragment.isWallet === undefined && (
                <Text style={styles.desc}>{ fragment.desc[translate.key]}</Text>
              )}
              {fragment.icon2 !== undefined && (
                <Image
                  style={styles.icon2}
                  source={fragment.icon2}
                  resizeMode={'contain'}
                />
              )}
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsContainer}>
          <PaginationDots length={fragments.length} step={step} />
        </View>
        <View style={styles.nextButtonView}>
          <AppButton title={translate.t('common.next')} onPress={nextStep} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: 'flex-end',
    width: '100%',
    alignSelf: 'center',
  },
  image: {
    width: 230,
    //height: 200
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desc: {
    fontSize: 23,
    color: Colors.black,
    alignSelf: 'center',
    fontFamily: 'FiraGO-Bold',
    paddingBottom: 36,
    textAlign: 'center',
    maxWidth: 327,
  },
  carouselContainer: {
    flex: 1,
  },
  dotsContainer: {
    padding: 28,
    width: '100%',
    alignSelf: 'center',
  },
  nextButtonView: {
    width: '100%',
    maxWidth: 327,
    paddingBottom: 40,
    alignSelf: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    width: '100%',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
    paddingHorizontal: 30,
  },
  authorizeText: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 16,
    color: colors.black,
  },
  langSwitchText: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 16,
    color: colors.black,
  },
  icon1: {
    width: 71,
    marginTop: 20,
  },
  walletDesc: {
    paddingBottom: 10,
  },
  walletImage: {
    width: 120,
    height: 260,
  },
  icon2: {
    width: 108,
    height: 33,
  },
});

export default FirstLoad;
