import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Cover from '../../../components/Cover';
import AppInput, {InputTypes} from '../../../components/UI/AppInput';
import colors from '../../../constants/colors';
import SwipableListItem from '../../../containers/SwipableListItem/SwipableListItem';
import Routes from '../../../navigation/routes';
import {TRANSFERS_ACTION_TYPES} from '../../../redux/action_types/transfers_action_types';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import TemplatesService, {
  IDeactivateUserTemplateRequest,
  IPayTemplateEditRequest,
  ITransferTemplate,
} from '../../../services/TemplatesService';
import screenStyles from '../../../styles/screens';
import {getString} from '../../../utils/Converter';
import {highLightWord} from '../../../utils/utils';

interface ITransferTemplatesProps {
  templates: ITransferTemplate[];
  isTemplatesFetching: boolean;
  onStartTransferFromTemplate: (template: ITransferTemplate, wt: boolean) => void;
  isDisabled?: boolean;
}

const TransferTemplates: React.FC<ITransferTemplatesProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const templateSearchTimeot = useRef<NodeJS.Timeout>();
  const [searchTemplateName, setSearchTemplateName] = useState<string>();

  const dispatch = useDispatch<any>();;

  const isDisabled = !props.isDisabled ? {} : {opacity: 0.5};

  const searchInTemplates = useCallback((name: string) => {
    if(props.isDisabled) return;
    if (templateSearchTimeot.current)
      clearTimeout(templateSearchTimeot.current);

    templateSearchTimeot.current = setTimeout(() => {
      setSearchTemplateName(name);
    }, 500);
  }, []);

  const matchText = (word?: string, highlight?: string) => {
    const breackWords = (text: string) => {
      const matchText = highLightWord(text, highlight);
      return (
        <Text numberOfLines={2} style={styles.transfersName}>
          {matchText.startString}
          <Text
            numberOfLines={1}
            style={[styles.transfersName, styles.highlight]}>
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

  const deactivateTemplate = (tid: number) => {
    const data: IDeactivateUserTemplateRequest = {
      templId: tid,
    };

    TemplatesService.deactivateUserTemplate(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          const pts = [...props.templates].filter(
            templ => templ.templateId !== tid,
          );
          dispatch({
            type: TRANSFERS_ACTION_TYPES.SET_TRANSFER_TEMPLATES,
            transferTemplates: [...pts],
          });
        }
      },
      complete: () => {},
    });
  };

  const setFavorite = (templateId: number | undefined) => {
    if (isLoading) return;
    setIsLoading(true);
    const currentTemplateIndex = templatesList.findIndex(
      template => template.templateId === templateId,
    );
    if (currentTemplateIndex >= 0) {
      const templates = [...templatesList];
      const isFavorite = !templates[currentTemplateIndex].isFavourite;
      const data: IPayTemplateEditRequest = {
        templId: templateId,
        templName: templates[currentTemplateIndex].templName,
        isFavourite: isFavorite,
      };

      TemplatesService.transactionTemplateEdit(data).subscribe({
        next: Response => {
          if (Response.data.ok) {
            templates[currentTemplateIndex].isFavourite = isFavorite;
            templates.sort((a, b) => {
              return a.isFavourite === b.isFavourite
                ? 0
                : a.isFavourite
                ? -1
                : 1;
            });
            dispatch({
              type: TRANSFERS_ACTION_TYPES.SET_TRANSFER_TEMPLATES,
              transferTemplates: templates,
            });
          }
        },
        complete: () => setIsLoading(false),
        error: () => setIsLoading(false),
      });
    }
  };

  const templateAction = (index: number, templateId: number | undefined) => {
    if(props.isDisabled) return;
    //0 = delete, 1 = edit, 2 = favorite
    if (index === 0 && templateId) {
      deactivateTemplate(templateId);
    } else if (index === 1) {
      const currentTemplateIndex = templatesList.findIndex(
        template => template.templateId === templateId,
      );
      if (currentTemplateIndex >= 0) {
        NavigationService.navigate(Routes.TransferTemplateEdit, {
          templId: templateId,
          templName: templatesList[currentTemplateIndex].templName,
        });
      }
    } else {
      setFavorite(templateId);
    }
  };

  const RightActionOptions = [
    <Cover
      localImage={require('../../../assets/images/delete-40x40.png')}
      style={styles.categoriesImage}
    />,
    <Cover
      localImage={require('../../../assets/images/edit-40x40.png')}
      style={styles.categoriesImage}
    />,
    <Cover
      localImage={require('./../../../assets/images/icon-favStarFull.png')}
      style={styles.categoriesImage}
    />,
  ];

  let templatesList = [...props.templates];
  if (searchTemplateName)
    templatesList = templatesList.filter(template =>
      template.templName?.match(searchTemplateName),
    );
 
  return (
    <View style={[styles.transfersContainer, screenStyles.shadowedCardbr15]}>
      <View style={styles.transfersHeader}>
        <Text style={styles.transfersTitle}>{translate.t('transfer.transferTemplates')}</Text>
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
        <View style={styles.transfersItemsContainer}>
          {templatesList.map((template, index) => (
            <SwipableListItem
              key={template.templateId}
              swipeId={template.templateId}
              style={styles.templatesItem}
              onAcionClick={templateAction}
              options={RightActionOptions}>
              <View style={styles.templatesItemLeft}>
                <View style={styles.templatesItemLogoBox}>
                  <Image
                    source={{uri: template.imageUrl}}
                    style={[styles.templatesItemLogo, isDisabled]}
                  />
                </View>
              </View>
              <TouchableOpacity
                key={index}
                onPress={() => props.onStartTransferFromTemplate(template, true)}
                style={styles.transfersItem}>
                <View style={styles.templatesItemRight}>
                  <View style={styles.templatesItemColumn}>
                    {matchText(template.templName, searchTemplateName)}
                  </View>
                </View>
              </TouchableOpacity>
              {template.isFavourite && (
                <Image
                  source={require('./../../../assets/images/star.png')}
                  style={styles.isFav}
                />
              )}
            </SwipableListItem>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  transfersContainer: {
    marginTop: 30,
    padding: 17,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  transfersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transfersTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  transfersItemsContainer: {
    justifyContent: 'space-between',
    marginTop: 25,
  },
  transfersItem: {
    flex: 1,
  },
  transfersName: {
    textAlign: 'center',
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 15,
    color: colors.black,
  },
  searchInputBox: {
    marginTop: 18,
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
  categoriesImage: {},
  templatesItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templatesItemLogoBox: {
    marginRight: 18,
  },
  templatesItemRight: {
    flex: 1,
  },
  templatesItemColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  templatesItemLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBackGround,
  },
  isFav: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
});

export default TransferTemplates;
