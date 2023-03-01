import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import UserService, { IConsolidated } from "../../../services/UserService";
import colors from "../../../constants/colors";
import currencies, {
  EUR,
  GBP,
  GEL,
  TRY,
  USD,
} from "../../../constants/currencies";
import Routes from "../../../navigation/routes";
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from "../../../redux/action_types/translate_action_types";
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from "../../../redux/action_types/user_action_types";
import NavigationService from "../../../services/NavigationService";
import screenStyles from "../../../styles/screens";
import {
  CurrencyConverter,
  CurrencySimbolConverter,
} from "../../../utils/Converter";

const ProductsView: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    (state) => state.TranslateReduser
  ) as ITranslateState;
  const userData = useSelector<IUserGlobalState>(
    (state) => state.UserReducer
  ) as IUserState;
  const [consolidates, setConsolidates] = useState<Array<IConsolidated>>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    UserService.Consolidated().subscribe({
      next: (response) => {
        if (response.data.ok) {
          setConsolidates(response.data.data.products);
        }
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
      },
    });
  }, []);

  const ordered = (accs: IConsolidated) => {
    const returnArray: { name: string; value: string | number }[] = [];
    const objArray: { name: string; value: string | number }[] = [];
    Object.keys(accs).forEach((key) =>
      objArray.push({
        name: key,
        value: accs[key],
      })
    );
    let normalized = objArray.filter((o) => o.name.startsWith("available"));

    normalized = normalized.sort(
      (a, b) => parseFloat(b.value.toString()) - parseFloat(a.value.toString())
    );
    const filterValue = normalized.filter(
      (p) =>
        parseFloat(p.value.toString()) > 0 || parseFloat(p.value.toString()) < 0
    );
    filterValue.forEach((f) => {
      if (f.name === "availableInGEL") {
        returnArray.push(f);
      }
      if (f.name === "availableInUSD") {
        returnArray.push(f);
      }
      if (f.name === "availableInEUR") {
        returnArray.push(f);
      }
    });
    if (returnArray.length === 3) {
      return returnArray;
    }
    if (returnArray.length === 0) {
      returnArray.push(
        normalized.filter((n) => n.name === "availableInGEL")[0]
      );
      returnArray.push(
        normalized.filter((n) => n.name === "availableInUSD")[0]
      );
      returnArray.push(
        normalized.filter((n) => n.name === "availableInEUR")[0]
      );
      return returnArray;
    }
    if (returnArray.length === 1) {
      const gelIndex = returnArray.findIndex(
        (n) => n.name === "availableInGEL"
      );
      const usdIndex = returnArray.findIndex(
        (n) => n.name === "availableInUSD"
      );
      if (gelIndex >= 0) {
        returnArray.push(
          normalized.filter((n) => n.name === "availableInUSD")[0]
        );
        returnArray.push(
          normalized.filter((n) => n.name === "availableInEUR")[0]
        );
      } else if (usdIndex >= 0) {
        returnArray.push(
          normalized.filter((n) => n.name === "availableInGEL")[0]
        );
        returnArray.push(
          normalized.filter((n) => n.name === "availableInEUR")[0]
        );
      } else {
        returnArray.push(
          normalized.filter((n) => n.name === "availableInGEL")[0]
        );
        returnArray.push(
          normalized.filter((n) => n.name === "availableInUSD")[0]
        );
      }
      return returnArray;
    }
    if (returnArray.length === 2) {
      const gelIndex = returnArray.findIndex(
        (n) => n.name === "availableInGEL"
      );
      const usdIndex = returnArray.findIndex(
        (n) => n.name === "availableInUSD"
      );
      if (gelIndex === -1) {
        returnArray.push(
          normalized.filter((n) => n.name === "availableInGEL")[0]
        );
      } else if (usdIndex === -1) {
        returnArray.push(
          normalized.filter((n) => n.name === "availableInUSD")[0]
        );
      } else {
        returnArray.push(
          normalized.filter((n) => n.name === "availableInEUR")[0]
        );
      }
      return returnArray;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => NavigationService.navigate(Routes.Products)}
      style={[styles.productsViewContainer, screenStyles.shadowedCardbr15]}
    >
      <View style={styles.productsViewHeader}>
        <Text style={styles.productsViewTitle}>
          {translate.t("dashboard.myProducts")}
        </Text>
        <View>
          <Text style={styles.productsViewSeeall}>
            {translate.t("common.all")}
          </Text>
        </View>
      </View>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingBox}
        />
      ) : (
        consolidates?.map((product, index) => (
          <View style={styles.ProductsViewItem} key={`products${index}`}>
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productsViewLogo}
            />
            <View style={styles.productsItemRight}>
              <View style={styles.productsItemRightInner}>
                <Text style={styles.productsViewItemTitle}>
                  {product.productName}
                </Text>
                <View style={styles.productCurrencies}>
                  {ordered(product)?.map((el) => (
                    <View style={{ flexDirection: "row" }}>
                      <Text key={el.name} style={styles.productsViewItemValue}>
                        {CurrencyConverter(el.value).trim()}
                      </Text>
                      <View
                        style={{
                          width: 15,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "right",
                            fontFamily: "FiraGO-Book",
                            fontSize: 14,
                            lineHeight: 17,
                            color: colors.black,
                          }}
                        >
                          {CurrencySimbolConverter(
                            el.name.includes(GEL)
                              ? currencies.GEL
                              : el.name.includes(USD)
                              ? currencies.USD
                              : el.name.includes(EUR)
                              ? currencies.EUR
                              : el.name.includes(GBP)
                              ? currencies.GBP
                              : el.name.includes(TRY)
                              ? currencies.TRY
                              : currencies.RUR
                          )}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {/* <Text style={styles.productsViewItemValue}>
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
                </Text> */}
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
    marginTop: 16,
    padding: 17,
    backgroundColor: colors.white,
  },
  productsViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productsViewTitle: {
    fontFamily: "FiraGO-Medium",
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  productsViewSeeall: {
    fontFamily: "FiraGO-Book",
    fontSize: 12,
    lineHeight: 15,
    color: colors.labelColor,
  },
  ProductsViewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  productsViewLogo: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  productsItemRight: {
    flex: 1,
    position: "relative",
  },
  productsItemRightInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productCurrencies: {
    alignItems: "flex-end",
  },
  productsViewItemTitle: {
    fontFamily: "FiraGO-Medium",
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginBottom: 3,
  },
  productsViewItemValue: {
    fontFamily: "FiraGO-Book",
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  productsViewItemLine: {
    borderBottomColor: "#F5F5F5",
    borderBottomWidth: 1,
    flex: 1,
    position: "absolute",
    bottom: -8,
    left: 0,
    right: 0,
  },
  loadingBox: {
    alignSelf: "center",
    flex: 1,
    marginTop: 10,
  },
});

export default ProductsView;
