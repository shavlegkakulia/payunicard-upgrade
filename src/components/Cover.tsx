import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import colors from '../constants/colors';

interface IProps {
  imageUrl?: string;
  isLoading?: boolean;
  localImage?: ImageProps;
  style?: StyleProp<ViewStyle>;
  imgStyle?: StyleProp<ImageStyle>;
  isOverflowVisible?: boolean;
  circleBg?: string;
}

const Cover: React.FC<IProps> = props => {
  const _logoBox = 
    {...styles.LogoBox};
    if(!props.isOverflowVisible) {
      _logoBox.overflow = 'hidden';
 
    } else {
      _logoBox.backgroundColor = props.circleBg;
      console.log( props)
    }
  
  return (
    <View style={[styles.item, props.style]}>
      {props.isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : props.localImage ? (
        <View style={_logoBox}>
          <Image
            source={props.localImage}
            resizeMode={'contain'}
            style={[styles.logo, props.imgStyle]}
          />
        </View>
      ) : (
        <View style={_logoBox}>
          <Image
            source={{uri: props.imageUrl}}
            resizeMode={'contain'}
            style={[styles.logo, props.imgStyle]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.white,
  },
  LogoBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBackGround,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  loaderBox: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Cover;
