import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Text,
  Image,
  Platform,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import AppCheckbox from '../../../components/UI/AppCheckbox';
import AppInput from '../../../components/UI/AppInput';
import AppSelect, {
  SelectItem,
} from '../../../components/UI/AppSelect/AppSelect';
import Validation, { required } from '../../../components/UI/Validation';
import colors from '../../../constants/colors';
import { EN, KA, ka_ge } from '../../../lang';
import { PUSH } from '../../../redux/actions/error_action';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import { IKCData } from '../../../services/KvalificaServices';
import { ICitizenshipCountry } from '../../../services/PresentationServive';
import {  onFormatDate } from '../../../utils/utils';
import {IVerficationState, IGlobalState as IVERIFICATIONSTATE} from '../../../redux/action_types/verification_action_types';

export enum ESex {
  male = 'male',
  female = 'female',
}

interface IProps {
  notEditable: boolean | undefined;
  selectedCountry: ICitizenshipCountry | undefined;
  selectedCountry2: ICitizenshipCountry | undefined;
  placeofbirthcountry: ICitizenshipCountry | undefined;
  countryes: ICitizenshipCountry[] | undefined;
  onSetCountry: (country: ICitizenshipCountry) => void;
  onSetPLaceOfBirth: (country: ICitizenshipCountry) => void;
  onSetCountry2: (country: ICitizenshipCountry | undefined) => void;
  kycData: IKCData | undefined;
  onUpdateData: (c: IKCData | undefined) => void;
  onComplate: () => void;
}

const ValidationContext = 'userVerification8';

const StepEight: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [countryErrorStyle, setCountryErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [countryErrorStyle2, setCountryErrorStyle2] = useState<
    StyleProp<ViewStyle>
  >({});
  const [placeErrorStyle, setPaceErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const VerficationStore = useSelector<IVERIFICATIONSTATE>(
    state => state.VerificationReducer,
  ) as IVerficationState;
  const [countryVisible, setCountryVisible] = useState(false);
  const [countryVisible2, setCountryVisible2] = useState(false);
  const [placeOfBirthVisible, setPlaceOfBirthVisible] = useState(false);
  const [hasDualSitizenship, setHasDualSitizenship] = useState(false);
  const [bDate, setBDate] = useState<Date | null>(null);
  const [chooseDate, setChooseDate] = useState<boolean>(false);
  const [dateErrorStyle, setDateErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );
  const disapatch = useDispatch<any>();;

  const nextHandler = () => {
    if (!bDate) {
      setDateErrorStyle({ borderColor: colors.danger, borderWidth: 1 });
      return;
    } else {
      setDateErrorStyle({});
    }
    if (!props.kycData?.sex) {
      disapatch(PUSH(translate.t('generalErrors.fillOutField')));
      return;
    }
    if (!props.selectedCountry) {
      setCountryErrorStyle({ borderColor: colors.danger, borderWidth: 1 });
      return;
    } else {
      setCountryErrorStyle({});
    }

    if (hasDualSitizenship && !props.selectedCountry2) {
      setCountryErrorStyle2({ borderColor: colors.danger, borderWidth: 1 });
      return;
    } else {
      setCountryErrorStyle2({});
    }

    if (!props.placeofbirthcountry) {
      setPaceErrorStyle({ borderColor: colors.danger, borderWidth: 1 });
      return;
    } else {
      setPaceErrorStyle({});
    }

    if (Validation.validate(ValidationContext)) {
      return;
    }

    let data = { ...props.kycData };
    data.birthDate = bDate.toISOString().split('T')[0];
    props.onUpdateData(data);

    props.onComplate();
  };

  const setCountryName = (value: string) => {
    let data = { ...props.kycData };
    data.countryName = value;
    props.onUpdateData(data);
  };

  const setBirthDate = (value: string) => {
    let data = { ...props.kycData };
    data.birthDate = value;
    props.onUpdateData(data);
  };

  const setSex = (value: string) => {
    if (props.notEditable) {
      return;
    }
    let data = { ...props.kycData };
    data.sex = value;
    props.onUpdateData(data);
  };

  useEffect(() => {
    if (!hasDualSitizenship) props.onSetCountry2?.(undefined);
  }, [hasDualSitizenship]);

  console.log('VerficationStore.userKYCData?.issueDate', VerficationStore.userKYCData?.issueDate)
 
  const bdate = useMemo(
    () => (
      <DatePicker
        modal
        mode="date"
        title={translate.t('common.setDate')}
        cancelText={translate.t('common.cancel')}
        confirmText={translate.t('common.confirm')}
        locale={translate.key === ka_ge ? KA : EN}
        timeZoneOffsetInMinutes={-7 * 60}
        maximumDate={new Date()}
        open={chooseDate}
        date={bDate || new Date()}
        onDateChange={() => { }}
        onConfirm={date => {
          setChooseDate(false);
          setBDate(date);
        }}
        onCancel={() => {
          setChooseDate(false);
        }}
      />
    ),
    [chooseDate, bDate],
  );
  return (
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <Text style={styles.sexTitle}>{translate.t('verification.selectCitizenship')}</Text>
        <View style={[styles.countryBox, countryErrorStyle]}>
          {props.selectedCountry ? (
            <SelectItem
              itemKey="countryName"
              defaultTitle={translate.t('verification.chooseCountry')}
              item={props.selectedCountry}
              onItemSelect={() => !props.notEditable && setCountryVisible(true)}
              style={styles.countryItem}
            />
          ) : (
            <TouchableOpacity
              onPress={() => setCountryVisible(true)}
              style={[styles.countrySelectHandler]}>
              <Text style={styles.countryPlaceholder}>
                {translate.t('verification.chooseCountry')}
              </Text>
              <Image
                style={styles.dropImg}
                source={require('./../../../assets/images/down-arrow.png')}
              />
            </TouchableOpacity>
          )}
        </View>
        <AppSelect
          itemKey="countryName"
          elements={props.countryes}
          selectedItem={props.selectedCountry}
          itemVisible={placeOfBirthVisible}
          onSelect={item => {
            props?.onSetPLaceOfBirth?.(item);
            setPlaceOfBirthVisible(false);
          }}
          onToggle={() =>
            !props.notEditable && setPlaceOfBirthVisible(!placeOfBirthVisible)
          }
        />
        <View style={[styles.countryBox, placeErrorStyle, { marginTop: 20 }]}>
          {props.placeofbirthcountry ? (
            <SelectItem
              itemKey="countryName"
              defaultTitle={translate.t('verification.placeOfBirth')}
              item={props.placeofbirthcountry}
              onItemSelect={() => !props.notEditable && setPlaceOfBirthVisible(true)}
              style={styles.countryItem}
            />
          ) : (
            <TouchableOpacity
              onPress={() => setPlaceOfBirthVisible(true)}
              style={[styles.countrySelectHandler]}>
              <Text style={styles.countryPlaceholder}>
                {translate.t('verification.placeOfBirth')}
              </Text>
              <Image
                style={styles.dropImg}
                source={require('./../../../assets/images/down-arrow.png')}
              />
            </TouchableOpacity>
          )}
        </View>
        <AppInput
          placeholder={translate.t('verification.birthDetail')}
          onChange={countryName => setCountryName(countryName)}
          value={props.kycData?.countryName}
          customKey="countryName"
          requireds={[required]}
          style={[styles.input, { marginBottom: 20 }]}
          context={ValidationContext}
        />
        <AppSelect
          itemKey="countryName"
          elements={props.countryes}
          selectedItem={props.selectedCountry}
          itemVisible={countryVisible}
          onSelect={item => {
            props?.onSetCountry?.(item);
            setCountryVisible(false);
          }}
          onToggle={() =>
            !props.notEditable && setCountryVisible(!countryVisible)
          }
        />
        <Text style={styles.dateOfBirthTitle}>{translate.t('verification.dateOfBirth')}</Text>
        <TouchableOpacity onPress={() => setChooseDate(true)}>
          <View style={[styles.InputBox, dateErrorStyle]}>
            <Text style={styles.birthDateValue}>
              {bdate ? (
                onFormatDate(bDate?.toString())
              ) : (
                <>
                  {translate.t('common.month') +
                    '/' +
                    translate.t('common.day') +
                    '/' +
                    translate.t('common.year')}
                </>
              )}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.sexCont}>
          <Text style={styles.sexTitle}>{translate.t('verification.sex')}</Text>
          <AppCheckbox
            activeColor={colors.primary}
            clicked={function (value: boolean): void {
              if (value) {
                setSex(ESex.male)
              }
            }}
            label={translate.t('common.male')}
            customKey={'male'}
            context={''}
            value={props.kycData?.sex === ESex.male}
          />

          <AppCheckbox
            activeColor={colors.primary}
            style={styles.female}
            clicked={function (value: boolean): void {
              if (value) {
                setSex(ESex.female)
              }
            }}
            label={translate.t('common.female')}
            customKey={'female'}
            context={''}
            value={props.kycData?.sex === ESex.female}
          />
        </View>
        <View style={{ marginTop: 20 }}>
        </View>
        <AppCheckbox
          style={styles.checkbox}
          activeColor={colors.primary}
          label={translate.t('verification.dualSitizenship')}
          clicked={() =>
            !props.notEditable && setHasDualSitizenship(!hasDualSitizenship)
          }
          value={hasDualSitizenship}
          key={'hasDualSitizenship'}
          customKey="hasDualSitizenship"
          context={ValidationContext}
        />
        {hasDualSitizenship && (
          <View style={[styles.countryBox, countryErrorStyle2]}>
            {props.selectedCountry2 ? (
              <SelectItem
                itemKey="countryName"
                defaultTitle={translate.t('verification.chooseCountry')}
                item={props.selectedCountry2}
                onItemSelect={() => setCountryVisible2(true)}
                style={styles.countryItem}
              />
            ) : (
              <TouchableOpacity
                onPress={() => setCountryVisible2(true)}
                style={[styles.countrySelectHandler]}>
                <Text style={styles.countryPlaceholder}>
                  {translate.t('verification.chooseCountry')}
                </Text>
                <Image
                  style={styles.dropImg}
                  source={require('./../../../assets/images/down-arrow.png')}
                />
              </TouchableOpacity>
            )}
            <AppSelect
              itemKey="countryName"
              elements={props.countryes}
              selectedItem={props.selectedCountry2}
              itemVisible={countryVisible2}
              onSelect={item => {
                props?.onSetCountry2?.(item);
                setCountryVisible2(false);
              }}
              onToggle={() => setCountryVisible2(!countryVisible2)}
            />
          </View>
        )}
      </View>
      <AppButton
        title={translate.t('common.next')}
        onPress={nextHandler}
        style={styles.button}
      />
      {bdate}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 327,
    width: '100%',
    alignSelf: 'center',
  },
  addressContainer: {
    marginTop: 20,
  },
  input: {
    marginVertical: 20,
  },
  button: {
    marginTop: 30,
  },
  countryBox: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
    marginVertical: 10
  },
  countryItem: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
  },
  dropImg: {
    marginRight: 12,
  },
  countrySelectHandler: {
    height: 54,
    backgroundColor: colors.inputBackGround,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryPlaceholder: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.placeholderColor,
    marginLeft: 13,
  },
  checkbox: {
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  sexCont: {
    alignItems: 'flex-start',
    marginTop: 20
  },
  sexTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.placeholderColor,
    marginBottom: 10
  },
  dateOfBirthTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 15,
    color: colors.placeholderColor,
    marginBottom: 10
  },
  female: {
    marginTop: 15
  },
  InputBox: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
    height: 59,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  birthDateValue: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    marginTop: 20,
    marginBottom: 20
  },
});

export default StepEight;
