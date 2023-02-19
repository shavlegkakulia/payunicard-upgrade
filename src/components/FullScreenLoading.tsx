import React, {FC, useEffect, useRef, useState} from 'react';
import {View, ActivityIndicator, StyleSheet, Modal, TouchableOpacity, Text} from 'react-native';
import colors from '../constants/colors';

interface IProps {
  background?: string;
  visible?: boolean;
  hideLoader?: boolean;
  maxTime?: number;
  from?: string;
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
  }, [props.maxTime]);
 
  return (
    <Modal animationType="fade" visible={getvisible} transparent={true}>
      <TouchableOpacity onPress={() => setgetvisible(false)}
        style={[
          styles.container,
          StyleSheet.absoluteFill,
          props.background ? {backgroundColor: props?.background} : undefined,
        ]}>
        {!props.hideLoader && (
<>
<ActivityIndicator size="large" color={colors.primary} />
{/* <Text>{props.from}</Text> */}
</>
)}
      </TouchableOpacity>
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
