package web.bmdominatezz.gravy;

import android.content.Context;
import android.webkit.WebView;

public class WebEvents {
    Context mContext;
    WebView webView;

    WebEvents(Context c, WebView w) {
        mContext = c;
        webView = w;
    }
    final String e_systemInsetsChange = "window.dispatchEvent(new Event(\"systemInsetChange\"))";
    final String e_backButtonPress = "window.dispatchEvent(new Event(\"backButtonPress\"))";
    final String e_homeButtonPress = "window.dispatchEvent(new Event(\"homeButtonPress\"))";
}
