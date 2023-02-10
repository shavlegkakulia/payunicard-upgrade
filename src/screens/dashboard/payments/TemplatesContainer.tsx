import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Cover from '../../../components/Cover';
import SwipableListItem from '../../../containers/SwipableListItem/SwipableListItem';
import AppButton from '../../../components/UI/AppButton';
import AppCheckbox from '../../../components/UI/AppCheckbox';
import AppInput, {InputTypes} from '../../../components/UI/AppInput';
import colors from '../../../constants/colors';
import {GEL} from '../../../constants/currencies';
import {ITemplates} from '../../../services/TemplatesService';
import screenStyles from '../../../styles/screens';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
  getNumber,
  getString,
} from '../../../utils/Converter';
import {highLightWord} from '../../../utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { deletePayTemplate } from '../../../redux/actions/payments_actions';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';

interface ITemplatesContainerProps {
  templates: ITemplates[];
  isActionLoading: boolean;
  isTemplatesFetching: boolean;
  onPay: (template: ITemplates) => void;
  onCheckForPayToggleHandle: (index: number, payTempID: number) => void;
  payAll: () => void;
  onEditPayTemplate: (template: ITemplates | undefined) => void;
}

const TemplatesContainer: React.FC<ITemplatesContainerProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;

  const [searchTemplateName, setSearchTemplateName] = useState<string>();
  const [checkVisible, setCheckVisible] = useState<boolean>(false);
  const templateSearchTimeot = useRef<NodeJS.Timeout>();
  const dispatch = useDispatch<any>();

  const RightActionOptions = [
    <Cover
      localImage={require('../../../assets/images/delete-40x40.png')}
      style={styles.categoriesImage}
    />,
    <Cover
      localImage={require('../../../assets/images/edit-40x40.png')}
      style={styles.categoriesImage}
    />,
  ];

  const templateAction = (index: number, templateId: number | undefined) => {
    if (props.isActionLoading) return;

    //0 = delete, 1 = edit
    if (index === 0 && templateId) {
      dispatch(deletePayTemplate(templateId));
    } else {
      const templates = [...props.templates].filter(
        template => template.payTempID === templateId,
      );
      if (templates[0]) {
        props.onEditPayTemplate(templates[0]);
      }
    }
  };

  const matchText = (word?: string, highlight?: string) => {
    const breackWords = (text: string) => {
      const matchText = highLightWord(text, highlight);
      return (
        <Text numberOfLines={2} style={styles.tempatesItemName}>
          {matchText.startString}
          <Text
            numberOfLines={1}
            style={[styles.tempatesItemName, styles.highlight]}>
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

  const searchInTemplates = useCallback((name: string) => {
    if (templateSearchTimeot.current)
      clearTimeout(templateSearchTimeot.current);

    templateSearchTimeot.current = setTimeout(() => {
      setSearchTemplateName(name);
    }, 500);
  }, []);

  const toggleCheck = () => setCheckVisible(checked => (checked = !checked));

  let templatesList = [...props.templates];
  if (searchTemplateName)
    templatesList = templatesList.filter(template =>
      template.templName?.match(searchTemplateName),
    );

  const coumputeTemplatesDebt = useCallback(() => {
    let templates = templatesList.filter(
      template => template.checkForPay && template.debt && template.debt > 0,
    );
    return templates.reduce((sum, {debt}) => sum + getNumber(debt), 0);
  }, [templatesList]);

  return (
    <View style={[styles.templatesContainer, screenStyles.shadowedCardbr15]}>
      <View style={styles.templatesHeader}>
        <Text style={styles.templatesTitle}>{translate.t('payments.paymentTemplates')}</Text>
        <AppButton
          title={translate.t('common.select')}
          loaderColor={colors.primary}
          loadingSize={15}
          style={styles.templatesCheckToggleButton}
          backgroundColor={colors.none}
          TextStyle={styles.templatesSelectall}
          onPress={toggleCheck}
        />
      </View>
      <View style={styles.searchInputBox}>
        <AppInput
          customKey="search"
          context=""
          placeholder={translate.t('common.search')}
          type={InputTypes.search}
          onChange={searchInTemplates}
        />
      </View>
      {props.isTemplatesFetching ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingBox}
        />
      ) : (
        <View style={styles.templatesItemsContainer}>
          {templatesList.map((template, index) => (
            <SwipableListItem
              key={template.payTempID}
              swipeId={template.payTempID}
              style={styles.templatesItem}
              onAcionClick={templateAction}
              options={RightActionOptions}>
              <>
              <View style={styles.templatesItemLeft}>
                {checkVisible && (
                  <TouchableOpacity
                    onPress={() =>
                      props.onCheckForPayToggleHandle(
                        index,
                        template.payTempID || 0,
                      )
                    }
                    style={styles.touchArea}>
                    <AppCheckbox
                      label=""
                      value={template.checkForPay}
                      customKey="check"
                      context="templatesCheck"
                      activeColor={colors.primary}
                      clicked={() =>
                        props.onCheckForPayToggleHandle(
                          index,
                          template.payTempID || 0,
                        )
                      }
                      style={styles.templatesCheck}
                    />
                  </TouchableOpacity>
                )}

                <View style={styles.templatesItemLogoBox}>
                  <Image
                    source={{uri: template.imageUrl}}
                    style={styles.templatesItemLogo}
                    resizeMode={'contain'}
                  />
                </View>
              </View>
              <TouchableOpacity
                key={index}
                onPress={() => props.onPay(template)}
                style={{flex: 1}}>
                <View style={styles.templatesItemRight}>
                  <View style={styles.templatesItemColumn}>
                    <Text numberOfLines={1} style={[styles.tempatesItemName, styles.nameColumn]}>
                      {matchText(template.templName, searchTemplateName)}
                    </Text>
                    {(template.canPayWithUnipoints || 0) > 0 && (
                      <Image
                        source={require('../../../assets/images/uniLogo.png')}
                        style={styles.templatesItemUniLogo}
                      />
                    )}
                  </View>

                  <View
                    style={[
                      styles.templatesItemColumn,
                      styles.templatesItemColumnTwo,
                    ]}>
                    <Text
                      style={styles.templatesItemAbonentCode}
                      numberOfLines={1}>
                      {translate.t('payments.abonent')}: {template.abonentCode}
                    </Text>
                    <Text
                      style={[
                        styles.templatesItemDebt,
                        (template.debt || 0) > 0 && {color: colors.danger},
                      ]}>
                      {CurrencyConverter(
                        template.localDebt !== undefined
                          ? template.localDebt
                          : template.debt,
                      )}
                      {CurrencySimbolConverter(GEL, translate.key)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              </>
            </SwipableListItem>
          ))}
        </View>
      )}
      {!props.isTemplatesFetching && (
        <>
          <View style={styles.templatesPayAllBox}>
            <Text style={styles.templatesComputedDebt}>
            {translate.t('payments.totalDue')}:  {CurrencyConverter(coumputeTemplatesDebt())}{' '}
              {CurrencySimbolConverter(GEL, translate.key)}
            </Text>
          </View>
          <AppButton
            onPress={props.payAll}
            title={translate.t('common.pay')}
            disabled={templatesList.every(
              template => template.checkForPay === false,
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  templatesContainer: {
    marginTop: 20,
    padding: 17,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templatesTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  templatesSelectall: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 15,
    color: colors.labelColor,
  },
  searchInputBox: {
    marginTop: 18,
  },
  templatesItemsContainer: {
    marginVertical: 11,
  },
  templatesItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    flex: 1,
    marginBottom: 6,
    height: 54,
    padding: 7,
    borderColor: colors.baseBackgroundColor,
    borderRadius: 10,
    borderWidth: 1,
  },
  templatesItemLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBackGround,
    overflow: 'hidden',
    marginRight: 18,
  },
  templatesItemLogo: {
    width: '100%',
    height: '100%',
  },
  templatesItemRight: {
    flex: 1,
  },
  templatesItemColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  templatesItemColumnTwo: {
    marginTop: 4,
  },
  tempatesItemName: {
    flexGrow: 1,
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    paddingRight: 10,
  },
  nameColumn: {
    maxWidth: '90%'
  },
  templatesItemAbonentCode: {
    flex: 1,
    fontFamily: 'FiraGO-Book',
    fontSize: 8,
    lineHeight: 10,
    color: colors.placeholderColor,
    paddingRight: 10,
  },
  templatesItemUniLogo: {
    width: 21,
  },
  templatesItemDebt: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 15,
    color: colors.primary,
  },
  templatesComputedDebt: {
    marginTop: 18,
    textAlign: 'right',
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  templatesPayAllBox: {
    marginBottom: 30,
  },
  templatesItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templatesCheck: {
    marginRight: 17,
  },
  templatesCheckToggleButton: {
    paddingRight: 0,
  },
  touchArea: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesImage: {},
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

export default TemplatesContainer;
