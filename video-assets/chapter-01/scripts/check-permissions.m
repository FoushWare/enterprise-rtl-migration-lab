#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <ApplicationServices/ApplicationServices.h>
int main(){@autoreleasepool{printf("screenRecording=%s\n",CGPreflightScreenCaptureAccess()?"true":"false");printf("accessibility=%s\n",AXIsProcessTrusted()?"true":"false");printf("display=%zux%zu\n",CGDisplayPixelsWide(CGMainDisplayID()),CGDisplayPixelsHigh(CGMainDisplayID()));}return 0;}
