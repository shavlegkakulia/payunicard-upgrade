import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  StyleSheet,
  Text,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import FullScreenLoader from '../../../components/FullScreenLoading';
import AppInput from '../../../components/UI/AppInput';
import colors from '../../../constants/colors';
import {tabHeight} from '../../../navigation/TabNav';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import PresentationServive, {
  ICitizenshipCountry,
} from '../../../services/PresentationServive';
import UserService, {
  IGetUserProfileDataResponse,
} from '../../../services/UserService';
import {getString} from '../../../utils/Converter';

const USERCONTEXT = 'USERCONTEXT';

const EditUserInfo: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [profileData, setProfileData] = useState<
    IGetUserProfileDataResponse | undefined
  >();
  const [profileDataEdited, setProfileDataEdited] = useState<
    IGetUserProfileDataResponse | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [countryes, setCountries] = useState<
    ICitizenshipCountry[] | undefined
  >();

  const getCitizenshipCountries = () => {
    if (isLoading) return;

    setIsLoading(true);
    PresentationServive.GetCitizenshipCountries().subscribe({
      next: Response => {
        setCountries(Response.data.data?.countries);
      },
      complete: () => {
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
      },
    });
  };

  useEffect(() => {
    if (!profileData && !isLoading) {
      setIsLoading(true);
      UserService.getUserProfileData().subscribe({
        next: Response => {
          if (Response.data.ok) {
            setProfileData(Response.data.data);
            setProfileDataEdited(Response.data.data);
          }
        },
        complete: () => {
          setIsLoading(false);
        },
        error: () => {
          setIsLoading(false);
        },
      });
    }
  }, [profileData]);

  useEffect(() => {
    getCitizenshipCountries();
  }, []);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  const country = countryes?.filter(
    c => c.countryID === profileDataEdited?.factCountryID,
  );

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        style={styles.avoid}>
        <View style={styles.container}>
          {profileDataEdited?.phone !== undefined && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{translate.t('common.mobile')}</Text>
              {/* <AppInput
                editable={false}
                value={profileDataEdited?.phone}
                onChange={phone => {
                  setProfileDataEdited(prev => {
                    const user = {...prev};
                    user.phone = phone;
                    return user;
                  });
                }}
                placeholder={translate.t('common.mobile')}
                customKey="mobile"
                context={USERCONTEXT}
              /> */}
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>{profileDataEdited?.phone}</Text>
              </View>
            </View>
          )}
          {profileDataEdited?.name !== undefined && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{translate.t('common.name')}</Text>
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>{profileDataEdited?.name}</Text>
              </View>
            </View>
          )}
          {profileDataEdited?.surname !== undefined && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{translate.t('common.lname')}</Text>
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>
                  {profileDataEdited?.surname}
                </Text>
              </View>
            </View>
          )}
          {profileDataEdited?.birthDate !== undefined &&
            profileDataEdited?.birthDate !== null && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {translate.t('common.birthDate')}
                </Text>
                <View style={styles.infoNode}>
                  <Text style={styles.infoValue}>
                    {new Date(profileDataEdited?.birthDate)
                      .getFullYear()
                      .toString()}
                  </Text>
                </View>
              </View>
            )}
          {profileDataEdited?.personalID !== undefined &&
            profileDataEdited?.personalID !== null && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {translate.t('common.personalNumber')}
                </Text>
                <View style={styles.infoNode}>
                  <Text style={styles.infoValue}>
                    {profileDataEdited?.personalID}
                  </Text>
                </View>
              </View>
            )}
          {profileDataEdited?.email?.trim() !== undefined && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{translate.t('common.email')}</Text>
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>{profileDataEdited?.email}</Text>
              </View>
            </View>
          )}
          {profileDataEdited?.factAddress !== undefined && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {translate.t('verification.address')}
              </Text>
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>
                  {profileDataEdited?.factAddress}
                </Text>
              </View>
            </View>
          )}

          {country && country[0]?.countryName && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{translate.t('common.country')}</Text>
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>{country[0]?.countryName}</Text>
              </View>
            </View>
          )}
          {profileDataEdited?.factCity !== undefined && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {translate.t('verification.city')}
              </Text>
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>
                  {profileDataEdited?.factCity}
                </Text>
              </View>
            </View>
          )}
          {profileDataEdited?.factPostalCode !== undefined && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {translate.t('verification.zipCode')}
              </Text>
              <View style={styles.infoNode}>
                <Text style={styles.infoValue}>
                  {profileDataEdited?.factPostalCode}
                </Text>
              </View>
            </View>
          )}

          <View>
            <ScrollView horizontal={true}>
              {profileDataEdited?.idPhotos?.documentBackSide !== undefined && (
                <Image
                  source={{uri: profileDataEdited?.idPhotos?.documentBackSide}}
                  resizeMode="contain"
                  style={styles.docImages}
                />
              )}
              {profileDataEdited?.idPhotos?.documentFrontSide !== undefined && (
                <Image
                  source={{uri: profileDataEdited?.idPhotos?.documentFrontSide}}
                  resizeMode="contain"
                  style={styles.docImages}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: tabHeight,
    paddingTop: 20,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'FiraGO-Book',
    fontSize: 10,
    lineHeight: 12,
    color: colors.labelColor,
    marginLeft: 0,
    marginBottom: 6,
  },
  docImages: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  infoNode: {
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBackGround,
  },
  infoValue: {
    paddingBottom: 5,
  },
});

export default EditUserInfo;
