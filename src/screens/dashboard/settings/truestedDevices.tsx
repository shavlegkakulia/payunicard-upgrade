import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  Switch,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import FullScreenLoader from '../../../components/FullScreenLoading';
import colors from '../../../constants/colors';
import { DEVICE_ID } from '../../../constants/defaults';
import {tabHeight} from '../../../navigation/TabNav';
import { IAuthState, IGlobalState as IAuthGlobalState, SET_ACTIVE_DEVICES, SET_DEVICE_ID } from '../../../redux/action_types/auth_action_types';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import deviceService, {IDevices} from '../../../services/deviceService';
import {getString} from '../../../utils/Converter';
import storage from './../../../services/StorageService';

const TrustedDevices: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const authData = useSelector<IAuthGlobalState>(
    state => state.AuthReducer,
  ) as IAuthState;
  const [isLoading, setIsLoading] = useState(false);
 
  const dispatch = useDispatch<any>();;

  const onOffTrustDevice = (id: number, isCurrent?: boolean) => {
      if(isLoading) return;
      setIsLoading(true);
      deviceService.UpdateDeviceStatus(id).subscribe({
          next: Response => {
              if(Response.data.ok) {
                const _ds = [...(authData.devices || [])].filter(device => device.id !== id); 
                if(isCurrent) {
                    storage.removeItem(DEVICE_ID);
                    dispatch({type: SET_DEVICE_ID, deviceId: undefined});
                  }
                  dispatch({type: SET_ACTIVE_DEVICES, devices: _ds});
              }
          },
          complete: () => setIsLoading(false),
          error: () => setIsLoading(false)
      })
  };

  if (isLoading && !authData.devices) {
    return <FullScreenLoader />;
  }
 
  const renderItem = ({item}: {item: IDevices}) => (
    <View style={[styles.item, item.isCurrent && styles.isCurrent]}>
      <View style={styles.navItemDetail}>
        <Text style={styles.navItemTitle} numberOfLines={1}>{item.deviceDescription}</Text>
      </View>
      <Switch
        style={styles.check}
        trackColor={{
          false: colors.inputBackGround,
          true: colors.primary,
        }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.inputBackGround}
        onValueChange={onOffTrustDevice.bind(this, item.id, item.isCurrent)}
        value={true}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.content}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        style={styles.avoid}>
        <View style={styles.container}>
          <FlatList
            data={authData.devices}
            renderItem={renderItem}
            keyExtractor={item => getString(item.id + '')}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    //marginTop: StatusBar.currentHeight || 0,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: tabHeight,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  item: {
    backgroundColor: colors.inputBackGround,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  navItemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItemTitle: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    maxWidth: Dimensions.get('window').width - 100
  },
  check: {
    alignSelf: 'flex-start',
  },
  isCurrent: {
      borderColor: colors.primary,
      borderWidth: 1
  }
});

export default TrustedDevices;
