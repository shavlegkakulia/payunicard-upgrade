/*Author shavleg kakulia*/

import React, {useState, useEffect, useRef, memo, createRef} from 'react';

import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  TouchableHighlight,
  Text,
  PanResponderInstance,
} from 'react-native';
import {AppkeyboardAVoidScrollview} from '../UI/AppkeyboardAVoidScrollview';
import styles from './styles';

export const closingDuration: number = 400;

export interface IProps {
  onPress?: (index: number) => void;
  children: JSX.Element,
  height: number;
  heightIsChanged?: boolean;
  hasScroll?: boolean;
  hasDraggableIcon: boolean;
  backgroundColor?: string;
  dragIconColor?: string;
  draggable?: boolean;
  radius?: number;
  options?: any[];
  cancelButtonIndex?: number;
  visible: boolean;
  scrollable?: boolean;
  header?:JSX.Element | null;
  from?:string;
  context?: string
}

const ActionSheetAndroid: React.FC<IProps> = props => {
  const [modalVisible, setModalvisible] = useState<boolean>(false);
  const animatedHeight = useRef<Animated.Value>(new Animated.Value(0));
  const pan = useRef<Animated.ValueXY>(new Animated.ValueXY());
  const panResponder = useRef<PanResponderInstance>();
  const timSubs = useRef<NodeJS.Timeout>();

  const createPanResponder = (props: IProps) => {
    const {height} = props;

    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, {dy: pan.current.y}], {useNativeDriver: false})(
            e,
            gestureState,
          );
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const gestureLimitArea = height / 2;

        const gestureDistance = gestureState.dy;
        if (gestureDistance >= gestureLimitArea) {
          setActionSheetVisible(false);
        } else {
          Animated.spring(pan.current, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start();
        }
      },
    });
  };

  const setActionSheetVisible = (visible: boolean, index: number = -1) => {
    if (visible) {
      setModalvisible(true);
    } else {
      onSlideDown(index);
    }
  };

  const onSlideDown = (index: number = -1) => {
    const {onPress} = props;
    Animated.timing(animatedHeight.current, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      setModalvisible(false);
      pan.current.setValue({x: 0, y: 0});
      animatedHeight.current = new Animated.Value(0);
      if (typeof onPress === 'function') onPress(index);
    });
  };

  const onSlideUp = () => {
    timSubs.current = setTimeout(() => {
      Animated.timing(animatedHeight.current, {
        toValue: props.height,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }, 500);
  };

  const show = () => {
    setActionSheetVisible(true);
  };

  const close = () => {
    setActionSheetVisible(false);
  };

  const _toucableElement = (element: JSX.Element, index: number) => {
    const {cancelButtonIndex} = props;
    let conditionalStyles = {};
    if (cancelButtonIndex === index)
      conditionalStyles = [styles.buttonText, styles.cancellButton];
    return (
      <TouchableHighlight
        key={index}
        activeOpacity={1}
        style={styles.buttonContainer}
        onPress={() => setActionSheetVisible(false, index)}>
        <Text style={conditionalStyles}>{element}</Text>
      </TouchableHighlight>
    );
  };

  const _renderOptions = () => {
    return props.options?.map((option, index) => {
      return _toucableElement(option, index);
    }) || <></>;
  };

  useEffect(() => {
    createPanResponder(props);
  }, []);

  useEffect(() => {
    if (props.visible) {
      show();
    } else {
      if(props.height)
      close();
    }

    return () => {
      if(timSubs.current) clearTimeout(timSubs.current)
    }
  }, [props.visible]);

  const {
    children,
    hasDraggableIcon,
    backgroundColor,
    dragIconColor,
    draggable = true,
    radius = 0,
    hasScroll,
    options,
  } = props;

  const panStyle = {
    transform: pan.current.getTranslateTransform(),
  };

  const _children = !options ? children : _renderOptions();

  return (
    <Modal
      transparent
      visible={modalVisible}
      onShow={() => {
        onSlideUp();
      }}
      onRequestClose={() => close()}>
      <View
        style={[
          styles.wrapper,
          {backgroundColor: backgroundColor || '#25252599'},
        ]}>
        <TouchableOpacity
          style={styles.background}
          activeOpacity={1}
          onPress={() => close()}
        />

        <Animated.View
          style={[
            panStyle,
            styles.container,
            {
              height: animatedHeight.current,
              justifyContent: 'flex-end',
            },
          ]}>
          <Animated.View
            {...(draggable &&
              panResponder.current?.panHandlers &&
              panResponder.current?.panHandlers)}
            style={[
              panStyle,
              styles.header,
              {
                height: 50,
                borderTopRightRadius: radius || 10,
                borderTopLeftRadius: radius || 10,
              },
            ]}></Animated.View>
          
            <View style={[styles.draggableContainer, hasDraggableIcon && styles.innerDragableIcon]}>
              {hasDraggableIcon && <View
                style={[
                  styles.draggableIcon,
                  {
                    backgroundColor: dragIconColor || '#000000',
                  },
                ]}
              />}
                {props.header}
            </View>
          
        
          {props.scrollable ? (
            <AppkeyboardAVoidScrollview
              scrollEnabled={hasScroll}
              showsVerticalScrollIndicator={hasScroll}>
              {_children}
            </AppkeyboardAVoidScrollview>
          ) : (
            <View style={styles.fixedView}>{_children}</View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ActionSheetAndroid;
