import React from 'react';
import { Platform } from 'react-native'
import ActionSheetIOS from './ActionSheetIOS'
import ActionSheetAndroid, { IProps } from './ActionSheetAndroid';

export default  ActionSheetAndroid;

export const ActionSheet:React.FC<IProps> = (props) => {
  if (Platform.OS === 'ios') {
    return <ActionSheetIOS />
  } else {
    return <ActionSheetAndroid {...props} />
  }
}




