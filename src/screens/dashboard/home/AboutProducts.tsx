import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import UserService, { IConsolidated } from '../../../services/UserService';
import colors from '../../../constants/colors';
import currencies, { GEL } from '../../../constants/currencies';
import { ka_ge } from '../../../lang';
import Routes from '../../../navigation/routes';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import NavigationService from '../../../services/NavigationService';
import screenStyles from '../../../styles/screens';
import {CurrencyConverter, CurrencySimbolConverter} from '../../../utils/Converter';

const ProductsView: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const [consolidates, setConsolidates] = useState<Array<IConsolidated>>();

  useEffect(() => {
    UserService.Consolidated().subscribe({
      next: response => {
        if(response.data.ok) {
          setConsolidates(response.data.data.products);
        }
      }
    })
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => NavigationService.navigate(Routes.Products)}
      style={[styles.productsViewContainer, screenStyles.shadowedCardbr15]}>
      <View style={styles.productsViewHeader}>
        <Text style={styles.productsViewTitle}>
          {translate.t('dashboard.myProducts')}
        </Text>
        <View>
          <Text style={styles.productsViewSeeall}>
            {translate.t('common.all')}
          </Text>
        </View>
      </View>
      {userData.isUserProductsLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingBox}
        />
      ) : (
        consolidates?.map((product, index) => (
          <View style={styles.ProductsViewItem} key={`products${index}`}>
            <Image
              source={{uri: product.imageUrl}}
              style={styles.productsViewLogo}
            />
            <View style={styles.productsItemRight}>
              <View style={styles.productsItemRightInner}>
                <Text style={styles.productsViewItemTitle}>
                  {product.productName}
                </Text>
                <View style={styles.productCurrencies}>
                <Text style={styles.productsViewItemValue}>
                  {CurrencyConverter(product.balanceInGEL)}
                  {CurrencySimbolConverter(currencies.GEL)}
                </Text>
                <Text style={styles.productsViewItemValue}>
                  {CurrencyConverter(product.balanceInUSD)}
                  {CurrencySimbolConverter(currencies.USD)}
                </Text>
                <Text style={styles.productsViewItemValue}>
                  {CurrencyConverter(product.balanceInEUR)}
                  {CurrencySimbolConverter(currencies.EUR)}
                </Text>
                <Text style={styles.productsViewItemValue}>
                  {CurrencyConverter(product.balanceInGBP)}
                  {CurrencySimbolConverter(currencies.GBP)}
                </Text>
                <Text style={styles.productsViewItemValue}>
                  {CurrencyConverter(product.balanceInTRY)}
                  {CurrencySimbolConverter(currencies.TRY)}
                </Text>
                <Text style={styles.productsViewItemValue}>
                  {CurrencyConverter(product.balanceInRUB)}
                  {CurrencySimbolConverter(currencies.RUR)}
                </Text>
                </View>
              </View>
              {userData.userProducts &&
                index != userData.userProducts.length - 1 && (
                  <View style={styles.productsViewItemLine}></View>
                )}
            </View>
          </View>
        ))
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productsViewContainer: {
    marginTop: 36,
    padding: 17,
    backgroundColor: colors.white,
  },
  productsViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productsViewTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  productsViewSeeall: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 15,
    color: colors.labelColor,
  },
  ProductsViewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  productsViewLogo: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  productsItemRight: {
    flex: 1,
    position: 'relative',
  },
  productsItemRightInner: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productCurrencies: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  productsViewItemTitle: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  productsViewItemValue: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  productsViewItemLine: {
    borderBottomColor: '#F5F5F5',
    borderBottomWidth: 1,
    flex: 1,
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
  },
  loadingBox: {
    alignSelf: 'center',
    flex: 1,
    marginTop: 10,
  },
});

export default ProductsView;
