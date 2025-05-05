package web.bmdominatezz.gravy;

import android.content.Context;
import android.util.Log;
import android.webkit.WebView;

import org.json.JSONObject;

public class WebEvents {
    Context mContext;
    WebView webView;

    public enum events {
        systemInsetsChange,
        backButtonPress,
        homeButtonPress,
        activityPause,
        activityResume,
        appInstall,
        appUninstall,
        animationDurationScaleChange,
        deepLink,
        systemThemeChange,
        notificationPosted,
        notificationRemoved,
        debugLog
    }

    WebEvents(Context c, WebView w) {
        mContext = c;
        webView = w;
    }

    public void dispatchEvent(String eventName, JSONObject arguments) {
        String script = "";
        if (arguments == null) {
            script = "window.dispatchEvent(new CustomEvent(\"" + eventName + "\"))";
        } else {
            script = "window.dispatchEvent(new CustomEvent(\"" + eventName + "\", {detail:" + arguments.toString() + "}))";
        }
        Log.d("groovelauncher", "dispatchEventScript: " + script);
        webView.evaluateJavascript(script, null);
    }

    public void dispatchEvent(String eventName) {
        String script = "";
        script = "window.dispatchEvent(new CustomEvent(\"" + eventName + "\"))";
        Log.d("groovelauncher", "dispatchEventScript: " + script);
        webView.evaluateJavascript(script, null);
    }

    public void dispatchEvent(events eventName, JSONObject arguments) {
        dispatchEvent(eventName.toString(), arguments);
    }

    public void dispatchEvent(events eventName) {
        dispatchEvent(eventName.toString());
    }

}
