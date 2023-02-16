import React, {FC, useEffect, useRef, useState} from 'react';
import {View, ActivityIndicator, StyleSheet, Modal} from 'react-native';
import colors from '../constants/colors';

interface IProps {
  background?: string;
  visible?: boolean;
  hideLoader?: boolean;
  maxTime?: number;
}

const FullScreenLoader: FC<IProps> = props => {
  const [getvisible, setgetvisible] = useState(false);
  const ttl = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if(props.visible) {
      setgetvisible(true);
    } else {
      setgetvisible(false);
    }
  }, [props.visible])
  
  useEffect(() => {
    if(ttl.current) clearTimeout(ttl.current)
    ttl.current = setTimeout(() => {
      setgetvisible(false);
    }, props.maxTime || 5000);

    return () => clearTimeout(ttl.current);
  }, [props.visible, props.maxTime]);
  
  return (
    <Modal animationType="fade" visible={getvisible} transparent={true}>
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
