package web.bmdominatezz.gravy;

import android.util.Log;
import org.mozilla.geckoview.GeckoSession;
import org.mozilla.geckoview.GeckoResult;

/**
 * Content delegate for GeckoView to handle page loading and JavaScript interface
 */
public class GeckoContentDelegate implements GeckoSession.ContentDelegate {
    private static final String TAG = "GeckoContentDelegate";
    private final MainActivity mainActivity;
    private final GrooveGeckoView geckoView;
    private final WebInterface webInterface;

    public GeckoContentDelegate(MainActivity mainActivity, GrooveGeckoView geckoView) {
        this.mainActivity = mainActivity;
        this.geckoView = geckoView;
        // Reuse the existing WebInterface logic
        this.webInterface = new WebInterface(mainActivity, null); // null for webView since we're using GeckoView
    }

    @Override
    public void onFirstComposite(GeckoSession session) {
        Log.d(TAG, "First composite - page rendering started");
    }

    @Override
    public void onFirstContentfulPaint(GeckoSession session) {
        Log.d(TAG, "First contentful paint - page content visible");
        
        // Inject JavaScript interface after page loads
        injectJavaScriptInterface(session);
    }

    private void injectJavaScriptInterface(GeckoSession session) {
        // Inject JavaScript that creates a bridge similar to Android WebView's JavascriptInterface
        String jsCode = 
            "console.log('GeckoView: Initializing JavaScript interface...');" +
            
            // Create Groove interface (equivalent to WebInterface)
            "window.Groove = {" +
            "  showToast: function(message) { " +
            "    console.log('GeckoView: showToast -', message);" +
            "    try { window.android.showToast(message); } catch(e) { console.log('Toast fallback:', message); }" +
            "  }," +
            "  getSystemInsets: function() { " +
            "    console.log('GeckoView: getSystemInsets');" +
            "    return JSON.stringify({left:0,top:24,right:0,bottom:0});" +
            "  }," +
            "  retrieveApps: function() { " +
            "    console.log('GeckoView: retrieveApps');" +
            "    return JSON.stringify([" +
            "      {packageName: 'com.example.app1', label: 'Sample App 1', type: 1}," +
            "      {packageName: 'com.example.app2', label: 'Sample App 2', type: 1}" +
            "    ]);" +
            "  }," +
            "  launchApp: function(packageName) { " +
            "    console.log('GeckoView: launchApp -', packageName);" +
            "    return true;" +
            "  }," +
            "  getAppLabel: function(packageName) { " +
            "    console.log('GeckoView: getAppLabel -', packageName);" +
            "    return 'App Label';" +
            "  }," +
            "  getAppIconURL: function(packageName) { " +
            "    console.log('GeckoView: getAppIconURL -', packageName);" +
            "    return JSON.stringify({foreground: 'data:image/png;base64,iVBOR...', background: '#ffffff'});" +
            "  }," +
            "  getAppVersion: function() { " +
            "    console.log('GeckoView: getAppVersion');" +
            "    return 'GeckoView-POC-0.1.0';" +
            "  }," +
            "  setStatusBarAppearance: function(appearance) { " +
            "    console.log('GeckoView: setStatusBarAppearance -', appearance);" +
            "  }," +
            "  getStatusBarAppearance: function() { " +
            "    console.log('GeckoView: getStatusBarAppearance');" +
            "    return 'light';" +
            "  }," +
            "  appReady: function() { " +
            "    console.log('GeckoView: appReady called');" +
            "  }," +
            "  triggerHapticFeedback: function(feedback) { " +
            "    console.log('GeckoView: triggerHapticFeedback -', feedback);" +
            "    return true;" +
            "  }," +
            "  checkPermission: function(permission) { " +
            "    console.log('GeckoView: checkPermission -', permission);" +
            "    return 'true';" +
            "  }," +
            "  requestPermission: function(permission) { " +
            "    console.log('GeckoView: requestPermission -', permission);" +
            "  }" +
            "};" +
            
            // Create BuildConfig interface
            "window.BuildConfig = {" +
            "  isGeckoView: function() { return true; }," +
            "  isWebView: function() { return false; }," +
            "  isNightly: function() { return false; }," +
            "  getAppVersion: function() { return 'GeckoView-POC'; }," +
            "  CAK: function() { return ''; }," +
            "  CHANGELOG: function() { return 'GeckoView proof of concept implementation'; }," +
            "  signed: function() { return true; }" +
            "};" +
            
            // Notify that the interface is ready
            "console.log('GeckoView JavaScript interface ready!');" +
            "if (window.GrooveBoard && window.GrooveBoard.backendMethods) {" +
            "  console.log('GrooveBoard detected, interfaces should work now.');" +
            "} else {" +
            "  console.log('GrooveBoard not yet available, interfaces injected for when it loads.');" +
            "}";

        session.evaluateJS(jsCode).accept(result -> {
            Log.d(TAG, "JavaScript injection completed");
        }, exception -> {
            Log.e(TAG, "JavaScript injection failed", exception);
        });
    }

    @Override
    public void onTitleChange(GeckoSession session, String title) {
        Log.d(TAG, "Title changed to: " + title);
    }

    @Override
    public void onFocusRequest(GeckoSession session) {
        Log.d(TAG, "Focus requested");
    }

    @Override
    public void onCloseRequest(GeckoSession session) {
        Log.d(TAG, "Close requested");
    }

    @Override
    public void onFullScreen(GeckoSession session, boolean fullScreen) {
        Log.d(TAG, "Full screen: " + fullScreen);
    }

    @Override
    public void onMetaViewportFitChange(GeckoSession session, String viewportFit) {
        Log.d(TAG, "Viewport fit changed: " + viewportFit);
    }
}