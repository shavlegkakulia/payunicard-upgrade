
import React, {useState} from 'react';
import {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import colors from '../../../constants/colors';
import UserService, {
  IFund,
  IGetTransactionDetailsResponse,
} from '../../../services/UserService';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
  getNumber,
  getString,
} from '../../../utils/Converter';
import envs from '../../../../config/env';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import { useSelector } from 'react-redux';
import Cover from '../../../components/Cover';
import RNFetchBlob from 'rn-fetch-blob';

interface IProps {
  statement: IGetTransactionDetailsResponse | undefined;
  fundStatement: IFund | undefined;
  onDownload?: (tranID: number | undefined) => void;
  isPdfDownloading: boolean;
}

interface IPageProps {
  statement: IGetTransactionDetailsResponse | undefined;
  fundStatement: IFund | undefined;
  sendHeader: (element: JSX.Element | null) => void;
  onClose?: () => void;
}

const TRANSACTION_TYPES = {
  CLIRING: 1,
  BLOCKED: 2,
  TRANCONVERT: 3,
  TRANPOS: 4,
  TRANUTILITY: 5,
};

const onFormatDate = (date?: string) => {
  if(!date) {
    return "";
  }
  const dateArray = date.split(' ');
  let d = dateArray[0].split('/');
  let _date: string[] = [];
  d.forEach(el => {
    _date.push(('0' + el).slice(el.length === 1 ? -2 : -4))
  })
 
  return _date.join('/');
}

const ViewCliring: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;

  return (
    <>
      {(props.statement?.mccGroupName !== undefined ||
        props.statement?.abvrName !== undefined) && (
        <View style={styles.cliringHeader}>
          <View style={styles.directionRow}>
            <Text style={styles.detailCategory} numberOfLines={1}>
              {props.statement?.mccGroupName}
            </Text>
            <Text style={styles.groupName} numberOfLines={1}>
              {props.statement?.abvrName?.trimEnd()}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.directionRow}>
        <View style={styles.detailBox}>
          <Image
            style={styles.detailIcon}
            source={{uri: `${envs.CDN_PATH}mccicons/shopping-icon.png`}}
          />
        </View>

        <View>
          <View style={styles.currencyColumn}>
            <Text style={styles.amountccy}>
              {CurrencyConverter(props.statement?.amount)}{' '}
            </Text>
            <Text style={styles.amountccy}>
              {CurrencySimbolConverter(props.statement?.ccy, translate.key)}
            </Text>
          </View>

          {props.statement?.tranDate !== undefined && (
            <View style={styles.tranDateColumn}>
              <Text style={styles.textDescStyle}>
                {onFormatDate(props.statement?.tranDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
        <Text style={styles.textHeaderStyle}>{translate.t('common.details')}</Text>
        {props.statement?.amount !== undefined && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.amount')}</Text>
            <Text style={styles.textDescValueStyle}>
              {CurrencyConverter(props.statement?.amount)}
            </Text>
          </View>
        )}
        {(props.statement?.abvrName &&
          props.statement?.abvrName?.trim().length > 0) && (
            <View style={styles.directionRow}>
              <Text style={styles.textDescStyle}>{translate.t('transaction.merchantName')}</Text>
              <Text style={styles.textDescValueStyle}>
                {props.statement?.abvrName.trimEnd()}
              </Text>
            </View>
          )}
        {props.statement?.uniBonus !== undefined && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('dashboard.uniPoints')}</Text>
            <Text style={styles.textDescValueStyle}>
              {CurrencyConverter(props.statement?.uniBonus || 0) || 0}
            </Text>
          </View>
        )}
        {props.statement?.senderMaskedCardNumber !== undefined && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.cardNumber')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.receiveraccount}
            </Text>
          </View>
        )}
        {props.statement?.tranDate !== undefined && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.payDate')}</Text>
            <Text style={styles.textDescValueStyle}>
              {onFormatDate(props.statement?.tranDate)}
            </Text>
          </View>
        )}
        {props.statement?.dateCreated !== undefined && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.postDate')}</Text>
            <Text style={styles.textDescValueStyle}>
              {onFormatDate(
                props.statement?.dateCreated
                  ? props.statement?.dateCreated.toString()
                  : '' 
              )}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.splitter}></View>

      <View style={[styles.detailBox, styles.defDetail]}>
        <Text style={styles.textHeaderStyle}>{translate.t('transaction.tranDetails')}</Text>
        {props.statement?.aprCode !== undefined &&
          props.statement?.aprCode.trim().length > 0 && (
            <View style={styles.directionRow}>
              <Text style={styles.textDescStyle}>{translate.t('transaction.tranAprovalCode')}</Text>
              <Text style={styles.textDescValueStyle}>
                {props.statement?.aprCode}
              </Text>
            </View>
          )}
        {props.statement?.tranid !== undefined && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transaction.tranId')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.tranid}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.download}>
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={props.onDownload?.bind(this, props.statement?.tranid)}>
           <Cover
              style={styles.downloadBg}
              imgStyle={styles.downIcon}
              localImage={require('./../../../assets/images/icon-download-primary.png')}
              isLoading={props.isPdfDownloading}
            />
        </TouchableOpacity>
      </View>
    </>
  );
};

const ViewTransfer: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  return (
    <>
      <View style={[styles.directionRow, styles.transactionHeader]}>
        <View style={styles.detailBox}>
          <Image
            style={styles.detailIcon}
            source={{uri: `${envs.CDN_PATH}mccicons/other-expances-icon.png`}}
          />
        </View>

        <View>
          <View style={styles.currencyColumn}>
            <Text style={styles.amountccy}>
              {CurrencyConverter(props.statement?.amount)}{' '}
            </Text>
            <Text style={styles.amountccy}>
              {CurrencySimbolConverter(props.statement?.ccy, translate.key)}
            </Text>
          </View>

          {(props.statement?.tranDate || props.statement?.dateCreated) && (
            <View style={styles.tranDateColumn}>
              <Text style={styles.textDescValueStyleNpBreak}>
                {onFormatDate(props.statement?.dateCreated?.toString() || props.statement?.tranDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
        <Text style={styles.textHeaderStyle}>{translate.t('transfer.from')}</Text>
        {props.statement?.senderName !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transfer.senderName')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement.senderName}
            </Text>
          </View>
        )}
        {props.statement?.senderaccount !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.accountNumber')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.senderaccount}
            </Text>
          </View>
        )}

        {props.statement?.senderBankCode !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transaction.bankCode')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.senderBankCode}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
        <Text style={styles.textHeaderStyle}>{translate.t('transfer.to')}</Text>
        {props.statement?.receivername !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transfer.beneficiary')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement.receivername}
            </Text>
          </View>
        )}
        {props.statement?.receiveraccount !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.accountNumber')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.receiveraccount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
        <Text style={styles.textHeaderStyle}>{translate.t('common.details')}</Text>
        {props.statement?.amount !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.amount')}</Text>
            <Text style={styles.textDescValueStyle}>
              {CurrencyConverter(props.statement.amount)}
            </Text>
          </View>
        )}
        {props.statement?.description !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transfer.nomination')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.description}
            </Text>
          </View>
        )}
        {props.statement?.tranDate !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.payDate')}</Text>
            <Text style={styles.textDescValueStyle}>
              {onFormatDate(props.statement?.tranDate)}
            </Text>
          </View>
        )}
        {props.statement?.dateCreated !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.postDate')}</Text>
            <Text style={styles.textDescValueStyle}>
              {onFormatDate(
                props.statement?.dateCreated
                  ? props.statement?.dateCreated.toString()
                  : ''
              )}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.splitter}></View>

      <View style={[styles.detailBox, styles.defDetail]}>
        <Text style={styles.textHeaderStyle}>{translate.t('transaction.tranDetails')}</Text>
        {props.statement?.tranid !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transaction.tranId')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.tranid}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.download}>
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={props.onDownload?.bind(this, props.statement?.tranid)}>
            <Cover
              style={styles.downloadBg}
              imgStyle={styles.downIcon}
              localImage={require('./../../../assets/images/icon-download-primary.png')}
              isLoading={props.isPdfDownloading}
            />
        </TouchableOpacity>
      </View>
    </>
  );
};

const ViewUtility: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  return (
    <>
      <View style={[styles.directionRow, styles.utilityHeader]}>
        <View style={styles.detailBox}>
          <Image
            style={styles.detailIcon}
            source={{uri: `${envs.CDN_PATH}mccicons/utility-payment-icon.png`}}
          />
        </View>

        <View>
          <View style={styles.currencyColumn}>
            <Text style={styles.amountccy}>
              {CurrencyConverter(props.statement?.amount)}{' '}
            </Text>
            <Text style={styles.amountccy}>
              {CurrencySimbolConverter(props.statement?.ccy, translate.key)}
            </Text>
          </View>

          {(props.statement?.tranDate || props.statement?.dateCreated) && (
            <View style={styles.tranDateColumn}>
              <Text style={styles.textDescStyle}>
                {onFormatDate(
                  props.statement?.dateCreated?.toString() ||
                    props.statement?.tranDate
                )}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
        <Text style={styles.textHeaderStyle}>{translate.t('transfer.from')}</Text>

        {props.statement?.senderMaskedCardNumber !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.cardNumber')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.senderMaskedCardNumber}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
        <Text style={styles.textHeaderStyle}>{translate.t('transfer.to')}</Text>
        {props.statement?.description !== undefined  && (
          <>
            <View style={styles.directionRow}>
              <Text style={styles.textDescStyle}>{translate.t('transaction.provider')}</Text>
              <Text style={styles.textDescValueStyle}>
                {props.statement.description.split('/')[0].split(':')[1]}
              </Text>
            </View>

            <View style={styles.directionRow}>
              <Text style={styles.textDescStyle}>{translate.t('common.user')}</Text>
              <Text style={styles.textDescValueStyle}>
                {props.statement.description.split('/')[1]}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
        <Text style={styles.textHeaderStyle}>{translate.t('common.details')}</Text>
        {props.statement?.amount !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.amount')}</Text>
            <Text style={styles.textDescValueStyle}>
              {CurrencyConverter(props.statement.amount)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.splitter}></View>

      <View style={[styles.detailBox, styles.defDetail]}>
        <Text style={styles.textHeaderStyle}>{translate.t('transaction.tranDetails')}</Text>
        {props.statement?.tranid !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transaction.tranId')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.statement?.tranid}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.download}>
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={props.onDownload?.bind(this, props.statement?.tranid)}>
          <Cover
              style={styles.downloadBg}
              imgStyle={styles.downIcon}
              localImage={require('./../../../assets/images/icon-download-primary.png')}
              isLoading={props.isPdfDownloading}
            />
        </TouchableOpacity>
      </View>
    </>
  );
};

const ViewBlocked: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  return (
    <>
      <View style={[styles.directionRow, styles.utilityHeader]}>
        <View style={styles.detailBox}>
          <Image
            style={styles.detailIcon}
            source={{uri: `${envs.CDN_PATH}mccicons/holded-icon.png`}}
          />
        </View>

        <View>
          <View style={styles.currencyColumn}>
            <Text style={[styles.amountccy, styles.blockedAmount]}>
              {CurrencyConverter(props.fundStatement?.amount)}{' '}
            </Text>
            <Text style={[styles.amountccy, styles.blockedAmount]}>
              {CurrencySimbolConverter(props.fundStatement?.currency, translate.key)}
            </Text>
          </View>

          {props.fundStatement?.transactionDate !== undefined  && (
            <View style={styles.tranDateColumn}>
              <Text style={styles.textDescStyle}>
                {onFormatDate(props.fundStatement?.transactionDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.splitter}></View>

      <View style={styles.detailBox}>
      <Text style={[styles.textHeaderStyle, styles.bolder]}>{translate.t('transaction.blockedFunds')}</Text>
        <Text style={styles.textHeaderStyle}>{translate.t('transaction.merchantName')}</Text>
        {props.fundStatement?.merchantDescription !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>
              {props.fundStatement?.merchantDescription}
            </Text>
          </View>
        )}
        {props.fundStatement?.terminalNumber !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('transaction.terminalNumber')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.fundStatement?.terminalNumber}
            </Text>
          </View>
        )}
        {props.fundStatement?.cardNumber !== undefined  && (
          <View style={styles.directionRow}>
            <Text style={styles.textDescStyle}>{translate.t('common.cardNumber')}</Text>
            <Text style={styles.textDescValueStyle}>
              {props.fundStatement?.cardNumber}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

const TransactionDetailView: React.FC<IPageProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [transactionType, setTransactionType] = useState<number | undefined>(
    TRANSACTION_TYPES.CLIRING,
  );
  const [isPdfDownloading, setIsPdfDownloading] = useState<boolean>(false);

  const downloadPdfFromPath = async (path: string, callback: () => void) => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ).then(() => {
      const {dirs} = RNFetchBlob.fs;
      const dirToSave =
        Platform.OS == 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const configfb = {
        addAndroidDownloads: {
          fileCache: true,
          useDownloadManager: true,
          notification: true,
          description: 'An Pdf file.',
          mediaScannable: true,
          title: 'Statements.pdf',
          path: `${dirToSave}/Statements.pdf`,
        },
      };
      const configOptions = Platform.select({
        ios: {
          fileCache: configfb.addAndroidDownloads.fileCache,
          title: configfb.addAndroidDownloads.title,
          path: configfb.addAndroidDownloads.path,
        },
        android: {...configfb},
      });
  
      RNFetchBlob.config({
        ...configOptions,
      })
        .fetch('GET', `${path}`, {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
          responseType: 'blob',
        })
        .then(res => {
          if (Platform.OS === 'ios') {
            RNFetchBlob.fs.writeFile(
              configfb.addAndroidDownloads.path,
              res.data,
              'base64',
            );
            RNFetchBlob.ios.previewDocument(configfb.addAndroidDownloads.path);
          }
        }).finally(() => callback()).catch(() => callback());
    }).catch(() => {
      callback();
    });
  };

  const ExporPdf = (tranID: number | undefined) => {
    if(isPdfDownloading) return;
    setIsPdfDownloading(true);
    UserService.ExportUserAccountStatementsAsPdfMobile(getNumber(tranID)).subscribe({
      next: async Response => {
        if(Response.data.ok) {
          await downloadPdfFromPath(getString(Response.data.data?.path), () => setIsPdfDownloading(false));
        }
      },
      error: () => setIsPdfDownloading(false)
    })
  }

  useEffect(() => {
    if (props.fundStatement) {
      setTransactionType(TRANSACTION_TYPES.BLOCKED);
      return;
    }
    if (
      props.statement?.opClass == 'CLIRING.C' ||
      props.statement?.opClass == 'CLIRING.C_EUR' ||
      props.statement?.opClass == 'CLIRING.C_USD' ||
      props.statement?.opClass == 'CLIRING.D' ||
      props.statement?.opClass == 'CLIRING.D_EUR' ||
      props.statement?.opClass == 'CLIRING.D_USD' ||
      props.statement?.opClass == 'CLIRING.D_Fee'
    ) {
      setTransactionType(TRANSACTION_TYPES.CLIRING);
    } else if (props.statement?.opClass == 'P2B') {
      setTransactionType(TRANSACTION_TYPES.TRANUTILITY);
    } else if (
      props.statement?.opClass == 'B2P.Bank' ||
      props.statement?.opClass == 'B2P.Bank_EUR' ||
      props.statement?.opClass == 'B2P.Bank_USD' ||
      props.statement?.opClass == 'B2P.Enrollment' ||
      props.statement?.opClass == 'B2PGL' ||
      props.statement?.opClass == 'B2P.F' ||
      props.statement?.opClass == 'P2B_FEE' ||
      props.statement?.opClass == 'P2P.EXCHANGE' ||
      props.statement?.opClass == 'P2P.EXCHANGE.out' ||
      props.statement?.opClass == 'P2P.INTER.out' ||
      props.statement?.opClass == 'P2P.INTER.in' ||
      props.statement?.opClass == 'P2B.Bank' ||
      props.statement?.opClass == 'PACKAGE.Out' ||
      props.statement?.opClass == 'P2B.BANK_USD.Out' ||
      props.statement?.opClass == 'P2B.BANK_EUR.Out'
    ) {
      setTransactionType(TRANSACTION_TYPES.TRANCONVERT);
    } else if (props.statement?.terminal == 'A') {
      setTransactionType(TRANSACTION_TYPES.TRANPOS);
    }
  }, []);

  useEffect(() => {
    const data = (
      <View style={styles.header}>
        <Text style={styles.title}>{translate.t('transaction.tranDetails')}</Text>
        <TouchableOpacity style={styles.modalClose} onPress={() => props.onClose?.()}>
            <Image
              source={require('./../../../assets/images/close40x40.png')}
              style={styles.modalCloseIcon}
            />
          </TouchableOpacity>
      </View>
    );
    props.sendHeader(data);
  }, []);
  
  return (
    <View style={styles.container}>
      {(transactionType === TRANSACTION_TYPES.CLIRING || transactionType === TRANSACTION_TYPES.TRANPOS) && (
        <ViewCliring isPdfDownloading={isPdfDownloading} {...props} onDownload={ExporPdf} />
      )}

      {transactionType === TRANSACTION_TYPES.TRANCONVERT && (
        <ViewTransfer isPdfDownloading={isPdfDownloading} {...props} onDownload={ExporPdf} />
      )}

      {transactionType === TRANSACTION_TYPES.TRANUTILITY && (
        <ViewUtility isPdfDownloading={isPdfDownloading} {...props} onDownload={ExporPdf} />
      )}

      {transactionType === TRANSACTION_TYPES.BLOCKED && (
        <ViewBlocked isPdfDownloading={isPdfDownloading} {...props} onDownload={ExporPdf} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 26,
  },
  title: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.black,
  },
  detailBox: {
    marginTop: 0,
  },
  textHeaderStyle: {
    fontFamily: 'FiraGO-Bold',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginBottom: 5,
  },
  textDescStyle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.labelColor,
    marginBottom: 5,
  },
  textDescValueStyle: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'right',
    color: colors.labelColor,
    marginBottom: 5,
    flex: 1,
  },
  textDescValueStyleNpBreak: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'right',
    color: colors.labelColor,
    marginBottom: 5,
  },
  amountccy: {
    fontFamily: 'FiraGO-Bold',
    fontSize: 18,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.danger,
  },

  aboutColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCategory: {
    fontFamily: 'FiraGO-Medium',
    lineHeight: 17,
    fontSize: 14,
    color: colors.labelColor,
    marginRight: 10,
    maxWidth: '50%',
  },
  groupName: {
    fontFamily: 'FiraGO-Medium',
    fontWeight: '700',
    lineHeight: 17,
    fontSize: 14,
    color: colors.labelColor,
    maxWidth: '50%',
  },
  detailIcon: {
    width: 65,
    height: 65,
    alignSelf: 'center',
  },
  currencyColumn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tranDateColumn: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 5,
    flex: 1
  },
  splitter: {
    borderColor: colors.inputBackGround,
    borderTopWidth: 1,
    marginVertical: 30,
  },
  defDetail: {
    marginBottom: 40,
  },
  blockedAmount: {
    color: colors.labelColor,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cliringHeader: {
    marginVertical: 20,
  },
  transactionHeader: {
    marginTop: 20,
  },
  utilityHeader: {
    marginTop: 20,
  },
  download: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  downloadBg: {
    backgroundColor: colors.inputBackGround,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  bolder: {
    color: colors.black,
    marginBottom: 10
  },
  downIcon: {
    width: 14,
    height: 17,
  },
  modalClose: {
    position: 'absolute',
    top: -15,
    right: 15,
    padding: 8,
    flex: 1,
    width: 40,
    
  },
  modalCloseIcon: {
    width: 24,
    height: 24,
  },
});

export default TransactionDetailView;
