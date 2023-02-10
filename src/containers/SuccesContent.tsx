import React from 'react';
import {
  Image,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import colors from '../constants/colors';

interface IProps {
  statusText: string;
  style?: StyleProp<ViewStyle>;
  imgProp?: ImageSourcePropType;
}

const SuccesContent: React.FC<IProps> = props => {
  const conditinalStyle = [styles.succesContainer, props.style];

  return (
    <View style={conditinalStyle}>
      <View style={styles.succesInner}>
        {props.imgProp ? (
          <Image source={props.imgProp} />
        ) : (
          <Image source={require('./../assets/images/succes_icon.png')} />
        )}
        <Text style={styles.succesText}>{props.statusText}</Text>
        {props.children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  succesContainer: {
    flex: 1,
    backgroundColor: colors.white
  },
  succesText: {
    textAlign: 'center',
    justifyContent: 'space-between',
    fontFamily: 'FiraGO-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: colors.black,
    marginTop: 28,
  },
  succesInner: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});

export default SuccesContent;
