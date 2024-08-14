package web.bmdominatezz.gravy;

import android.content.Context;
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
        activityResume
    }

    WebEvents(Context c, WebView w) {
        mContext = c;
        webView = w;
    }

    public void dispatchEvent(String eventName, JSONObject arguments) {
        webView.evaluateJavascript("window.dispatchEvent(new Event(\"systemInsetChange\")" +
                (arguments != null ? "," + arguments.toString() : "")
                + ")", null);
    }

    public void dispatchEvent(events eventName,JSONObject arguments) {
        dispatchEvent(eventName.toString(),arguments);
    }
}
