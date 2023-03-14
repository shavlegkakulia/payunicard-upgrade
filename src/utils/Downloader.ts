import { PermissionsAndroid, Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

const downloadPdfFromPath = async ({path, fileName, returnValue}: {path: string, fileName?: string, returnValue?: (vlue: boolean) => void}) => {
  const android = RNFetchBlob.android
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    ).then(() => {
      const { dirs } = RNFetchBlob.fs;
      const dirToSave =
        Platform.OS == "ios" ? dirs.DocumentDir : dirs.DownloadDir;

      const configfb = {
        addAndroidDownloads: {
          fileCache: true,
          useDownloadManager: true,
          notification: true,
          description: "An Pdf file.",
          mediaScannable: true,
          title: `${fileName || 'Statements'}.pdf`,
          path: `${dirToSave}/${fileName || 'Statements'}.pdf`,
        },
      };

      const configOptions = Platform.select({
        ios: {
          fileCache: configfb.addAndroidDownloads.fileCache,
          title: configfb.addAndroidDownloads.title,
          path: configfb.addAndroidDownloads.path,
        },
        android: { ...configfb },
      });

      RNFetchBlob.config({
        ...configOptions,
      })
        .fetch("GET", `${path}`, {
          "Content-Type": "application/json",
          Accept: "application/pdf",
          responseType: "blob",
        })
        .then(async (res) => {
          if (Platform.OS === "ios") {
            await RNFetchBlob.fs.writeFile(
              configfb.addAndroidDownloads.path,
              res.data,
              "base64"
            ).then(() => {
              RNFetchBlob.ios.previewDocument(configfb.addAndroidDownloads.path);
            })
            
          } else {
            android.actionViewIntent(res.path(), 'application/pdf')
          }
          returnValue?.(true);
        }).catch(() => returnValue?.(false));
    }).catch(() => returnValue?.(false));
  };

  export default downloadPdfFromPath;