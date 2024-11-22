package web.bmdominatezz.gravy;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.os.Build;
import android.provider.Settings;
import android.content.Context;

public class BuildConfigInterface {
    private Context context;

    public BuildConfigInterface(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public String CAK() {
        return BuildConfig.CAK;
    }
} 