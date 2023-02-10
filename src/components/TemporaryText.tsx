import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import colors from '../constants/colors';

interface IProps {
  text: string;
  ttl?: number;
  show: boolean;
}

const TemporaryText: React.FC<IProps> = props => {
  const [visibiliti, setVisibility] = useState<boolean>(false);
  const visibleTtlRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (props.show) {
      if (visibleTtlRef.current) clearTimeout(visibleTtlRef.current);
      setVisibility(true);
      visibleTtlRef.current = setTimeout(() => {
        setVisibility(false);
      }, props.ttl || 2000);
    }

    return () => {
      if (visibleTtlRef.current && !props.show) clearTimeout(visibleTtlRef.current);
    };
  }, [props.show]);

  return (
    <View style={styles.copiedTextBox}>
      {visibiliti && <Text style={styles.copiedText}>{props.text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  copiedTextBox: {
   paddingLeft: 5
  },
  copiedText: {
    color: colors.primary,
    fontFamily: 'FiraGO-Book',
    lineHeight: 14,
    fontSize: 10,
  },
});

export default TemporaryText;
