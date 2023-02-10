import React, {FC, useEffect} from 'react';
import {useRef} from 'react';
import {ScrollView, StyleProp, ViewStyle} from 'react-native';
import {useDimension} from '../../hooks/useDimension';
import {useKeyboard} from '../../hooks/useKeyboard';

interface IProps {
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean | false;
  showsVerticalScrollIndicator?: boolean | false;
  children?: JSX.Element,
}

export const AppkeyboardAVoidScrollview: FC<IProps> = props => {
  const dimensionHooks = useDimension();
  const keyboardData = useKeyboard();
  let scroll = useRef<ScrollView>();

  // useEffect(() => {
  //     scroll.current?.scrollToEnd({animated: true});
  // }, [keyboardData.height])

  return (
    <ScrollView
      ref={(c: ScrollView) => {
        scroll.current = c;
      }}
      contentContainerStyle={{flexGrow: 1}}
      {...props}
      keyboardShouldPersistTaps={'handled'}
      style={[
        {maxHeight: dimensionHooks.height - keyboardData.height},
        props.style,
      ]}>
      {props.children}
    </ScrollView>
  );
};
