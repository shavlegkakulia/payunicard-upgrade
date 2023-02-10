import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import colors from '../../constants/colors';
import Validation from './Validation';

interface IComponentProps {
  clicked: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  value?: boolean;
  label: string;
  activeColor?: any;
  labelStyle?: any;
  customKey: string;
  context: string;
  requireds?: string[];
}

const AppCheckbox: React.FC<IComponentProps> = (props) => {

  const clickCheckbox = () => {
    props.clicked && props.clicked(!props.value);
  }
  
  let mounted = false;
  const [style, setStyle] = useState({});

  useEffect(() => {
      mounted = true;
      Validation.push(props.customKey, props.context)([...props.requireds || []], (s: boolean) => redraw(s), props.value ? 1 : 0);

      return () => {
          mounted = false;
          Validation.delete(props.customKey);
      }
  }, [props.value])


  const redraw = (is: boolean) => {
      if (mounted) {
          setStyle({
            borderColor: is ? colors.light : colors.danger
          })
      }

      return is;
  }

  let activeColor = props.activeColor ? props.activeColor : '#000';
  return (
    <TouchableOpacity onPress={clickCheckbox} style={[styles.container, props.style]}>
      <View style={styles.view}>
        <View style={[styles.chackbox, style]}>
          <View style={{
            ...styles.selected,
            backgroundColor: props.value ? activeColor : '#FFF',
          }} />
        </View>
        <Text style={[{...styles.label, ...props.labelStyle}]}>{props.label}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  view: {
    flexDirection: 'row', 
    justifyContent: 'center'
  },
  chackbox: {
    height: 16,
    width: 16,
    borderWidth: 2,
    borderRadius: 3,
    borderColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: {
    height: 10,
    width: 10
  },
  label: {
    paddingLeft: 8,
    lineHeight: 17,
    fontSize: 12,
    color: "#000",
    fontFamily: 'FiraGO-Regular'
  }
})


export default AppCheckbox;