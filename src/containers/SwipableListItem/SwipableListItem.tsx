import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  TextStyle,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface IProps {
  onAcionClick: (index: number, swipeId?: number) => void;
  options: JSX.Element[];
  style?: StyleProp<TextStyle>;
  swipeId?: number;
  children: JSX.Element
}

const rightActions = (
  _progress: Animated.AnimatedInterpolation<any>,
  dragX: Animated.AnimatedInterpolation<any>,
  options: JSX.Element[],
  swipeId: number | undefined,
  onAction: (index: number, swipeId?: number) => void,
  close: () => void,
) => {
  const translateX = dragX.interpolate({
    inputRange: [0, 15],
    outputRange: [0, 1],
    extrapolateRight: 'clamp',
  });

  return (
    <View style={styles.swapable}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[index > 0 && {marginLeft: 23}]}
          onPress={() => {
            onAction(index, swipeId);
            close();
          }}>
          <Animated.View style={{transform: [{translateX}]}}>
            {option}
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const SwipableListItem: React.FC<IProps> = props => {
  const swipeableRef = useRef<Swipeable>(null);

  const close = () => {
    if (swipeableRef.current) swipeableRef.current?.close();
  };

  return (
    <Swipeable
      containerStyle={styles.item}
      ref={swipeableRef}
      renderRightActions={(progress, drag) =>
        rightActions(
          progress,
          drag,
          props.options,
          props?.swipeId,
          props.onAcionClick,
          close,
        )
      }>
      <View style={props.style}>{props.children}</View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  item: {
    //flex: 1
  },
  swapable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 43,
    marginRight: 0,
  },
});

export default SwipableListItem;
