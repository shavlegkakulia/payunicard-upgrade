import React, {FC} from 'react';
import {View, ActivityIndicator, StyleSheet, Modal} from 'react-native';
import colors from '../constants/colors';

interface IProps {
  background?: string;
  visible?: boolean;
  hideLoader?: boolean;
}

const FullScreenLoader: FC<IProps> = props => {
  return (
    <Modal animationType="fade" visible={props.visible} transparent={true}>
      <View
        style={[
          styles.container,
          StyleSheet.absoluteFill,
          props.background ? {backgroundColor: props?.background} : undefined,
        ]}>
        {!props.hideLoader && (
          <ActivityIndicator size="large" color={colors.primary} />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default FullScreenLoader;
