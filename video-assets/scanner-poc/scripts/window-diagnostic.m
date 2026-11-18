#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>
int main(){@autoreleasepool{NSArray *wins=CFBridgingRelease(CGWindowListCopyWindowInfo(kCGWindowListOptionAll,kCGNullWindowID));for(NSDictionary *w in wins){NSString *owner=w[(id)kCGWindowOwnerName];if([owner containsString:@"Code"]){printf("%s\n",[[w description] UTF8String]);}}}return 0;}
