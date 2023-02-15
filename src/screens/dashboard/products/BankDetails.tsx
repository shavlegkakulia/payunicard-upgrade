import Clipboard from "@react-native-clipboard/clipboard";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import downloadPdfFromPath from "../../../utils/Downloader";
import { ka_ge } from "../../../lang";
import { PUSH } from "../../../redux/actions/error_action";
import { ITranslateState, IGlobalState as ITranslateGlobalState } from "../../../redux/action_types/translate_action_types";
import AccountServise from '../../../services/AccountService';

const bankDetailsGel = [
  {
    id: 1,
    bankName: {
      ka: 'ს.ს "საქართველოს ბანკი"',
      en: 'JSC "Bank Of Georgia"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE74BG0000000162455757",
    swiftCode: "BAGAGE22",
  },
  {
    id: 2,
    bankName: {
      ka: 'ს.ს "ლიბერთი ბანკი"',
      en: 'JSC "Liberty Bank"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE70LB0113162834673006",
    swiftCode: "LBRTGE22",
  },
  {
    id: 3,
    bankName: {
      ka: 'ს.ს "თიბისი ბანკი"',
      en: 'JSC "TBC Bank"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE13TB7251636090000001",
    swiftCode: "TBCBGE22",
  },
];

const bankDetailsUsd = [
  {
    id: 1,
    bankName: {
      ka: 'ს.ს "საქართველოს ბანკი"',
      en: 'JSC "Bank Of Georgia"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE74BG0000000162455757",
    swiftCode: "BAGAGE22",
  },
  {
    id: 2,
    bankName: {
      ka: 'ს.ს "ლიბერთი ბანკი"',
      en: 'JSC "Liberty Bank"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE43LB0113162834673007",
    swiftCode: "LBRTGE22",
  },
  {
    id: 3,
    bankName: {
      ka: 'ს.ს "თიბისი ბანკი"',
      en: 'JSC "TBC Bank"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE57TB7251636190000001",
    swiftCode: "TBCBGE22",
  },
];

const bankDetailsEur = [
  {
    id: 1,
    bankName: {
      ka: 'ს.ს "საქართველოს ბანკი"',
      en: 'JSC "Bank Of Georgia"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE74BG0000000162455757",
    swiftCode: "BAGAGE22",
  },
  {
    id: 2,
    bankName: {
      ka: 'ს.ს "ლიბერთი ბანკი"',
      en: 'JSC "Liberty Bank"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE86LB0113162834673009",
    swiftCode: "LBRTGE22",
  },
  {
    id: 3,
    bankName: {
      ka: 'ს.ს "თიბისი ბანკი"',
      en: 'JSC "TBC Bank"',
      getName(key: string) {
        return this[key];
      },
    },
    accountNumber: "GE57TB7251636190000001",
    swiftCode: "TBCBGE22",
  },
];

const BankDetails = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const dispatch = useDispatch<any>();
  const [curs, setCurs] = useState([
    { id: 1, value: "GEL", active: false },
    { id: 2, value: "USD", active: false },
    { id: 3, value: "EUR", active: false },
  ]);
  const [banks, setBanks] = useState([
    {
      id: 1,
      active: false,
      logo: require("./../../../assets/images/icon-bog.png"),
    },
    {
      id: 2,
      active: false,
      logo:
      translate.key === ka_ge
          ? require("./../../../assets/images/icon-lb.png")
          : require("./../../../assets/images/icon-lb-en.png"),
    },
    {
      id: 3,
      active: false,
      logo: require("./../../../assets/images/icon-tbc.png"),
    },
  ]);

  const handleExpotWalletDetailsPDF = () => {
    const key = curs?.filter((c) => c.active === true)?.[0]?.value;
    if(!key) {
      dispatch(PUSH(translate.t('generalErrors.errorOccurred')))
      return;
    }
    let bool = false;
    if (key == "GEL") {
      bool = true;
    }
    AccountServise.ExportWalletAccountDetails(key, bool).subscribe({next: (response) => {
      if (response.data.path) {
        downloadPdfFromPath({
          path: response.data.path,
          fileName: "Requisite",
        });
      } else {
        dispatch(PUSH(translate.t('generalErrors.errorOccurred')))
      }
    }, error: () => {
      dispatch(PUSH(translate.t('generalErrors.errorOccurred')))
    }})
  
  };

  const selectBank = useCallback((id: number) => {
    const _banks = [...banks];
    _banks.map((c) => (c.active = false));
    _banks.filter((c) => c.id === id)[0].active = true;
    setBanks(_banks);
  }, [banks]);

  const onActive = useCallback((id: number) => {
    const _curs = [...curs];
    _curs.map((c) => (c.active = false));
    _curs.filter((c) => c.id === id)[0].active = true;
    setCurs(_curs);
  }, [curs]);

  const copyToClipboard = (str: string) => {
    Clipboard.setString(str);
    dispatch(PUSH(translate.t('common.copied')));
  };

  const selectedBankDetails = useMemo(() => {
    if (curs?.filter((c) => c.active === true)?.[0]?.value === "USD") {
      return bankDetailsUsd.filter(
        (bank) => bank.id === banks.filter((b) => b.active === true)?.[0]?.id
      );
    } else if (curs?.filter((c) => c.active === true)?.[0]?.value === "EUR") {
      return bankDetailsEur.filter(
        (bank) => bank.id === banks.filter((b) => b.active === true)?.[0]?.id
      );
    } else if (curs?.filter((c) => c.active === true)?.[0]?.value === "GEL") {
      return bankDetailsGel.filter(
        (bank) => bank.id === banks.filter((b) => b.active === true)?.[0]?.id
      );
    }
  }, [curs, banks, bankDetailsUsd, bankDetailsEur, bankDetailsGel]);

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>{translate.t('common.bankTransferDetails')}</Text>
        <Text style={styles.description}>
          {translate.t('products.chooseCurrencyForReq')}
        </Text> 
        <View style={styles.currencies}>
          {curs.map((c) => (
            <TouchableOpacity
              onPress={() => onActive(c.id)}
              key={c.id}
              style={[styles.item, c.active ? styles.activeItem : null]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.itemTitle, c.active ? styles.activeTitle : null]}
              >
                {c.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {banks.map((bank) => (
          <TouchableOpacity
            onPress={() => selectBank(bank.id)}
            key={bank.id}
            style={[
              styles.bankItem,
              bank.active ? styles.bankItemActive : null,
            ]}
          >
            <Image source={bank.logo} style={styles.bankIcon} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedBankDetails?.length ? (
        <View style={styles.detailView}>
          <View style={styles.detailViewItem}>
            <Text style={styles.detailItemTitle}>{translate.t('products.recipeBank')}</Text> 
            <Text style={styles.detailItemValue}>
              {selectedBankDetails[0].bankName.getName(translate.key || ka_ge)}
            </Text>
          </View>
          <View style={styles.detailViewItem}>
            <Text style={styles.detailItemTitle}>{translate.t('transfer.beneficiaryAccount')}</Text>
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(selectedBankDetails?.[0].accountNumber)
              }
            >
              <View style={styles.copyArea}>
                <Image
                  source={require("./../../../assets/images/textCopyIcon.png")}
                  style={styles.copyIcon}
                />
                <Text style={styles.detailItemValue}>
                  {selectedBankDetails[0].accountNumber}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.detailViewItem}>
            <Text style={styles.detailItemTitle}>{translate.t('transaction.bankCode')}</Text>
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(selectedBankDetails?.[0].swiftCode)
              }
            >
              <View style={styles.copyArea}>
                <Image
                  source={require("./../../../assets/images/textCopyIcon.png")}
                  style={styles.copyIcon}
                />
                <Text style={styles.detailItemValue}>
                  {selectedBankDetails[0].swiftCode}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.detailViewItem}>
            <Text style={styles.detailItemTitle}>{translate.t('transfer.beneficiaryName')}</Text>
            <Text style={styles.detailItemValue}>{translate.t('common.llcPayunicard')}</Text>
          </View>
          <View style={styles.detailViewItem}>
            <Text style={styles.detailItemTitle}>{translate.t('transfer.nomination')}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard("UW01CA00000000784252")}
            >
              <View style={styles.copyArea}>
                <Image
                  source={require("./../../../assets/images/textCopyIcon.png")}
                  style={styles.copyIcon}
                />
                <Text style={styles.detailItemValue}>UW01CA00000000784252</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.detailViewItem}>
            <Text style={styles.detailItemTitle}></Text>
            <Text style={styles.detailItemValue}>
              <Text style={styles.or}>{translate.t('common.or')}</Text> 01005020429
            </Text>
          </View>
        </View>
      ) : null}

      {selectedBankDetails?.length ? (
        <>
          <View style={styles.line}></View>
          <Text style={styles.noinationTitle}>
            {translate.t('products.mustFillNomination')}
          </Text>
          <Text style={styles.warning}>
          {translate.t('products.correctUseNomination')}
          </Text>
          <View style={styles.itemDownload}>
            <Text style={styles.downloadTitle}>{translate.t('products.downloadRequ')}</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleExpotWalletDetailsPDF}
            >
              <Image
                source={require("./../../../assets/images/icon-download.png")}
                style={styles.downloadIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.line}></View>
          </>
      ) : null}
     
          <Text style={[styles.payboxes, !selectedBankDetails?.length ? styles.hasMargin : null]}>
            {translate.t('products.withPayBox')}
          </Text>
          <View style={styles.payboxIcons}>
            <Image
              source={require("./../../../assets/images/icon-tbc-pay.png")}
              style={styles.iconPay}
            />
            <Image
              source={require("./../../../assets/images/icon-oppa.png")}
              style={styles.iconPay}
            />
          </View>
          <View style={styles.line}></View>
          <Text style={styles.bankcards}>{translate.t('products.cards')}</Text>
          <View style={styles.payboxIcons}>
            <Image
              source={require("./../../../assets/images/icon-visa.png")}
              style={styles.iconPay}
            />
            <Image
              source={require("./../../../assets/images/icon-mc.png")}
              style={styles.iconPay}
            />
          </View>


   
    </View>
  );
};

export default BankDetails;

const styles = StyleSheet.create({
  card: {
    marginTop: 74,
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: "FiraGO-Medium",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 20,
    color: "#34373E",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  description: {
    fontFamily: "FiraGO-Medium",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 21,
    color: "#84878E",
  },
  currencies: {
    marginTop: 20,
    flexDirection: "row",
  },
  item: {
    width: 56,
    height: 33,
    backgroundColor: "rgba(132, 135, 142, 0.1)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 24,
  },
  itemTitle: {
    fontFamily: "FiraGO-Medium",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 19,
    color: "#34373E",
  },
  activeItem: {
    backgroundColor: "#34373E",
  },
  activeTitle: {
    color: "#FFFFFF",
  },
  scroll: {
    marginTop: 28,
  },
  scrollContent: {
    paddingLeft: 16,
  },
  bankItem: {
    borderColor: "rgba(132, 135, 142, 0.1)",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginRight: 10,
  },
  bankItemActive: {
    borderColor: "#34373E",
  },
  bankIcon: {
    height: 32,
    resizeMode: "contain",
  },
  detailView: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  copyArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailViewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItemTitle: {
    fontFamily: "FiraGO-Regular",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 15,
    color: "#84878E",
  },
  detailItemValue: {
    fontFamily: "FiraGO-Regular",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 17,
    color: "#34373E",
  },
  copyIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
    marginRight: 8,
  },
  or: {
    fontWeight: "600",
    color: "#34373E",
  },
  line: {
    flex: 1,
    borderColor: "#84878E10",
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 4,
  },
  noinationTitle: {
    fontFamily: "FiraGO-Medium",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    color: "#F04438",
    paddingHorizontal: 16,
    letterSpacing: 0.8,
  },
  warning: {
    fontFamily: "FiraGO-Medium",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 20,
    color: "#34373E",
    paddingHorizontal: 16,
    marginTop: 12,
    letterSpacing: 0.8,
  },
  itemDownload: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  downloadTitle: {
    fontFamily: "FiraGO-Regular",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 17,
    lineHeight: 17,
    color: "#34373E",
  },
  downloadButton: {
    backgroundColor: "rgba(132, 135, 142, 0.1)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  downloadIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  payboxes: {
    fontFamily: "FiraGO-Medium",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 20,
    color: "#34373E",
    arginTop: 25,
    paddingHorizontal: 16,
    textTransform: "uppercase",
  },
  hasMargin: {
    marginTop: 40
  },
  bankcards: {
    fontFamily: "FiraGO-Medium",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 20,
    color: "#34373E",
    marginTop: 10,
    paddingHorizontal: 16,
    textTransform: "uppercase",
  },
  payboxIcons: {
    flexDirection: "row",
    marginTop: 26,
    marginBottom: 20,
  },
  iconPay: {
    height: 24,
    resizeMode: "contain",
  },
});
