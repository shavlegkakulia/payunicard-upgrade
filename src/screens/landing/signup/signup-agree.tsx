import React from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {WebView} from 'react-native-webview';

import colors from '../../../constants/colors';
import NavigationService from '../../../services/NavigationService';

const AgreeTerm: React.FC = () => {
  const source = {
    uri: 'https://www.payunicard.ge/documents/en/ServiceTermsOfUse.pdf?v=001',
  };

  const boBack = () => {
    NavigationService.GoBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <WebView
          source={{uri: source.uri}}
          onNavigationStateChange={boBack}
          cacheEnabled={false}
          thirdPartyCookiesEnabled={true}
        />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  pdf: {
    flex: 1,
  },
});

export default AgreeTerm;
