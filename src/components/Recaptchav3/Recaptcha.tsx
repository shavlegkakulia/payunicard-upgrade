import React, {ForwardedRef, useEffect, useRef} from 'react';
import {StyleSheet} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
interface IComponentProps {
  action: (token: string) => void;
  siteKey: string;
  siteUrl: string;
}
const GetRecaptcha = React.forwardRef<WebView, IComponentProps>(
  (props, ref) => {
    const {action, siteKey, siteUrl} = props;
    const onMessage = (data: WebViewMessageEvent) => {
      action(data.nativeEvent.data);
    };

    return (
      <WebView
        ref={ref}
        style={styles.content}
        onMessage={async e => await onMessage(e)}
        containerStyle={styles.content}
        source={{
          html: `
              <!DOCTYPE html>
                  <html lang="en">
                  <head>
                  <meta charset="UTF-8">
                  <title>Title</title>
                  <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
                      <script>
                      function onLoad(e) {
                          window.grecaptcha.ready(() => {
                              window.grecaptcha.execute('${siteKey}', {action: 'login'}).then((token) => {
                                  window.ReactNativeWebView.postMessage(token);
                              });
                          }) 
                      }
                      </script>
                  </head>
                  <body onload="onLoad()"></body>
              </html>`,
          baseUrl: siteUrl,
        }}
      />
    );
  },
);

const styles = StyleSheet.create({
  content: {
    overflow: 'hidden',
    maxHeight: 0,
    maxWidth: 0,
    flex: 1,
  },
});

export default GetRecaptcha;
