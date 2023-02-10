import {RouteProp, useRoute} from '@react-navigation/core';
import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import AppInput from '../../../components/UI/AppInput';
import Validation, {required} from '../../../components/UI/Validation';
import colors from '../../../constants/colors';
import {tabHeight} from '../../../navigation/TabNav';
import {PUSH} from '../../../redux/actions/error_action';
import {
  ITransfersState,
  IGlobalState as ITRansferGlobalState,
  TRANSFERS_ACTION_TYPES,
} from '../../../redux/action_types/transfers_action_types';
import { ITranslateState, IGlobalState as ITranslateGlobalState }  from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import TemplatesService, {
  IPayTemplateEditRequest,
} from '../../../services/TemplatesService';
import screenStyles from '../../../styles/screens';

type RouteParamList = {
  params: {
    templId: number;
    templName: string;
  };
};

const ValidationContext = 'EditTransferTemplate';

const TransferTemplateEdit = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [templName, setTemplName] = useState<string>(route.params.templName);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const TransfersStore = useSelector<ITRansferGlobalState>(
    state => state.TransfersReducer,
  ) as ITransfersState;
  const dispatch = useDispatch<any>();;

  const submit = () => {
    if (isLoading) return;
    if (Validation.validate(ValidationContext)) {
      dispatch(PUSH(translate.t('template.fillTemplateName')));
      return;
    }
    setIsLoading(true);

    const data: IPayTemplateEditRequest = {
      templId: route.params.templId,
      templName: templName,
    };

    TemplatesService.transactionTemplateEdit(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          const templates = [...(TransfersStore.transferTemplates || [])];
          const currentTemplateIndex = templates.findIndex(
            template => template.templateId === route.params.templId,
          );
          if (currentTemplateIndex >= 0) {
            templates[currentTemplateIndex].templName = templName;
            dispatch({
              type: TRANSFERS_ACTION_TYPES.SET_TRANSFER_TEMPLATES,
              transferTemplates: templates,
            });
          }
        }
      },
      complete: () => {
        setIsLoading(false);
        NavigationService.GoBack();
      },
      error: () => setIsLoading(false),
    });
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View style={styles.content}>
          <AppInput
            value={templName}
            onChange={setTemplName}
            context={ValidationContext}
            customKey="templName"
            placeholder={ translate.t("template.templateName")}
            requireds={[required]}
          />

          <AppButton title={ translate.t("common.save")} onPress={submit} isLoading={isLoading} />
        </View>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 40,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
});

export default TransferTemplateEdit;
