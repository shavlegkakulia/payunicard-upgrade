import { useEffect, useRef, useState } from 'react';
import { EmitterSubscription, Keyboard, KeyboardEvent } from 'react-native';

interface IProps {
    height: number, 
    width: number, 
    screenX: number,
    screenY: number
}

export const useKeyboard = (): IProps => {
  const [keyboard, setKeyboard] = useState<IProps>({height: 0, width: 0, screenX: 0, screenY: 0});
  const keyboardShow = useRef<EmitterSubscription>();
  const keyboardHide= useRef<EmitterSubscription>();
  
  function onKeyboardDidShow(e: KeyboardEvent): void {
    setKeyboard(e.endCoordinates);
  }

  function onKeyboardDidHide(): void {
    setKeyboard({height: 0, width: 0, screenX: 0, screenY: 0});
  }

  useEffect(() => {
    keyboardShow.current = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
    keyboardHide.current = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);

    return () => {
        keyboardShow.current?.remove()
        keyboardHide.current?.remove()
    };
  }, []);

  return keyboard;
};