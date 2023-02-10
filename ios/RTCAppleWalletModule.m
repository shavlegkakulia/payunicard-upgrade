#import "RTCAppleWalletModule.h"
#import <React/RCTLog.h>


@interface RCT_EXTERN_MODULE(RTCAppleWalletModule, NSObject)
  RCT_EXTERN_METHOD(onEnroll:(NSString)cardHolder cardId:(NSInteger)cardId cardMask: (NSString*)cardMask authToken:(NSString *)authToken callback:(RCTResponseSenderBlock *)successCallback)

  RCT_EXTERN_METHOD(onEcheckElements: (RCTResponseSenderBlock)callback)
@end

