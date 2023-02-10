import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image, Text} from 'react-native';
import { useSelector } from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import AppInput from '../../../components/UI/AppInput';
import colors from '../../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
}  from '../../../redux/action_types/translate_action_types';
import {
  IPayTemplateAddRequest,
  ITemplates,
} from '../../../services/TemplatesService';
import screenStyles from '../../../styles/screens';

const ValidationContext = 'editPayTemplate';

interface IProps {
  template?: ITemplates;
  onEditPayTemplate: (data: IPayTemplateAddRequest) => Promise<boolean>;
  sendHeader: (element: JSX.Element | null) => void;
}

const EditPayTemplate: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [templateNameInputToggle, setTemplateNameInputToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState<string | undefined>(
    props.template?.templName,
  );

  let isMounted = true;

  const onOperationHandle = () => {
    setIsLoading(true);
    props.onEditPayTemplate({
      templName: templateName,
      payTempID: props?.template?.payTempID,
    });
  };

  useEffect(() => {
    isMounted = true;

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const data = (
      <View style={styles.paymentStepHeaderHeader}>
        <View style={styles.titleBox}>
          <Text numberOfLines={1} style={styles.titleText}>
            {translate.t('template.editTemplate')}
          </Text>
        </View>
      </View>
    );
    props.sendHeader(data);
  }, []);

  useEffect(() => {
    if (props.template?.payTempID && isMounted) {
      setTemplateNameInputToggle(toogle => !toogle);
      setTemplateName(props.template?.templName);
    }
  }, [props.template?.payTempID]);

  return (
    <View style={[screenStyles.wraper, styles.container]}>
      <Image
        source={require('./../../../assets/images/templateIcon.png')}
        style={styles.templateIcon}
      />
      <AppButton
        backgroundColor={colors.none}
        color={colors.labelColor}
        title={translate.t('template.editTemplate')}
        onPress={() => {
          setTemplateNameInputToggle(toggle => !toggle);
        }}
      />
      {templateNameInputToggle ? (
        <View style={styles.templateNameColumn}>
          <AppInput
            autoFocus={true}
            value={templateName}
            onChange={name => {
              setTemplateName(name);
            }}
            context={ValidationContext}
            placeholder={translate.t('template.templateName')}
            customKey="templateName"
            style={styles.templateNameInput}
          />
        </View>
      ) : null}
      <AppButton
        isLoading={isLoading}
        onPress={onOperationHandle}
        title={translate.t('common.save')}
        style={styles.handleButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    backgroundColor: colors.white,
    height: '100%',
  },
  templateNameColumn: {
    width: 170,
    alignSelf: 'center',
    marginTop: 5,
  },
  templateNameInput: {
    marginTop: 0,
    backgroundColor: colors.none,
    alignSelf: 'center',
    borderRadius: 0,
    borderWidth: 1,
    borderBottomColor: colors.inputBackGround,
  },
  handleButton: {
    marginTop: 40,
  },
  templateIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginTop: 30,
  },
  paymentStepHeaderHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 16,
    marginTop: 0,
    paddingHorizontal: 20,
    height: 27
},
titleBox: {
    flex: 1
},
titleText: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 14,
    lineHeight: 27,
    flex: 1,
    textAlign: 'right',
    alignSelf: 'stretch'
}
});

export default EditPayTemplate;
