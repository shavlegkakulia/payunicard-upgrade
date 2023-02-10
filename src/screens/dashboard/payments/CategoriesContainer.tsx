import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Cover from '../../../components/Cover';
import AppInput, {InputTypes} from '../../../components/UI/AppInput';
import colors from '../../../constants/colors';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../redux/action_types/payments_action_type';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import {ICategory, IService} from '../../../services/PresentationServive';
import screenStyles from '../../../styles/screens';
import {getString} from '../../../utils/Converter';
import {highLightWord} from '../../../utils/utils';

interface ICategoriesContainerProps {
  categories: ICategory[] | undefined;
  isLoading: boolean;
  Services: IService[];
  isCategoriesFetching: boolean;
  hideSearchBox?: boolean;
  notForTemplate?: boolean;
  onSearch: (value: string) => void;
  onViewCategory: (
    categoryID: number,
    isService: boolean,
    hasService: boolean,
    hasChildren: boolean,
    viewInAction: boolean,
    title: string,
  ) => void;
}

const CategoriesContainer: React.FC<ICategoriesContainerProps> = props => {
  const categorySearchTimeot = useRef<NodeJS.Timeout>();
  const [paymentSectionStep, setPaymentSectionStep] = useState<number>(0);
  const [loadingIndex, setLoadingIndex] = useState<number | undefined>(
    undefined,
  );

  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;

  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;

  const carouselRef = createRef<ScrollView>();

  const dispatch = useDispatch<any>();

  const matchText = (word?: string, highlight?: string, cannotPay?:boolean) => {
    const breackWords = (text: string) => {
      const matchText = highLightWord(text, highlight);
      return (
        <Text numberOfLines={2} style={[styles.categoriesName, cannotPay && {opacity: 0.5}]}>
          {matchText.startString}
          <Text
            numberOfLines={1}
            style={[styles.categoriesName, styles.highlight]}>
            {matchText.match}
          </Text>
          {matchText.endString}
        </Text>
      );
    };

    return (
      <View style={[styles.highlightContainer]}>
        {breackWords(getString(word))}
      </View>
    );
  };

  const searchInCategories = useCallback((name: string) => {
    dispatch({
      type: PAYMENTS_ACTIONS.SET_PAYMENT_SERACH_SERVICENAME,
      SearchServiceName: name,
    });
    if (categorySearchTimeot.current)
      clearTimeout(categorySearchTimeot.current);

    categorySearchTimeot.current = setTimeout(() => {
      props.onSearch(name);
    }, 500);
  }, []);

  const onCategoryView = (index: number, next: Function) => {
    if (props.isLoading) return;
    setLoadingIndex(index);
    next();
  };

  const onChangePaymentSectionStep = (nativeEvent: NativeScrollEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      if (slide != paymentSectionStep) {
        //if(slide === 3) return;
        setPaymentSectionStep(slide);
      }
    }
  };

  useEffect(() => {
    if (!props.isLoading) setLoadingIndex(undefined);
  }, [props.isLoading]);

  let categoryList = [...(props.categories || [])];
  let services = [...props.Services];

  return (
    <View style={[styles.categoriesContainer, !props.notForTemplate && {...screenStyles.shadowedCardbr15, marginTop: 30}]}>
      {!props.notForTemplate && <View style={styles.categoriesHeader}>
        <Text style={styles.categoriesTitle}>{translate.t('payments.categories')}</Text>
      </View>}
      {!props.hideSearchBox && (
        <View style={styles.searchInputBox}>
          <AppInput
            customKey="search"
            context=""
            placeholder={translate.t('common.search')}
            type={InputTypes.search}
            value={PaymentStore.SearchServiceName}
            onChange={searchInCategories}
          />
        </View>
      )}
      {props.isCategoriesFetching ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingBox}
        />
      ) : (
        <View style={styles.categoriesItemsContainer}>
          {!(props.Services.length > 0)
            ? categoryList.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoriesItem}
                  onPress={() => {
                    if(category.cannotPay) return;
                    onCategoryView(index, () =>
                      props.onViewCategory(
                        category.categoryID,
                        category.isService,
                        category.hasServices,
                        category.hasChildren,
                        true,
                        category.name,
                      ),
                    );
                  }}>
                  <Cover
                    imageUrl={category.imageUrl?.replace('svg', 'png')}
                    isLoading={index === loadingIndex}
                    style={[styles.categoriesImage, category.cannotPay && {opacity: 0.5}]}
                  />
                  {matchText(category.name, PaymentStore.SearchServiceName, category.cannotPay)}
                </TouchableOpacity>
              ))
            : services.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoriesItem}
                  onPress={() => {
                    onCategoryView(index, () =>
                      props.onViewCategory(
                        service?.categoryID || 0,
                        true,
                        true,
                        false,
                        true,
                        service?.resourceValue || '',
                      ),
                    );
                  }}>
                  <Cover
                    imageUrl={service.merchantServiceURL?.replace('svg', 'png')}
                    isLoading={index === loadingIndex}
                    style={styles.categoriesImage}
                  />
                  {matchText(service.resourceValue)}
                </TouchableOpacity>
              ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    padding: 17,
    backgroundColor: colors.white
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  categoriesTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  transactionContainer: {
    marginVertical: 38,
  },
  categoriesItemsContainer: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: 25,
  },
  categoriesItem: {
    width: '50%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 120,
  },
  categoriesImage: {
    width: 40,
    height:40,
    backgroundColor: colors.none
  },
  categoriesName: {
    textAlign: 'center',
    marginTop: 0,
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 15,
    color: colors.black,
  },
  searchInputBox: {
    marginTop: 18,
  },
  loaderBox: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  words: {
    marginTop: 10,
  },
  highlight: {
    color: colors.secondary,
  },
  highlightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  loadingBox: {
    alignSelf: 'center',
    flex: 1,
    marginTop: 10,
  },
});

export default CategoriesContainer;
