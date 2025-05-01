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

    @JavascriptInterface
    public String CHANGELOG() {
        return BuildConfig.CHANGELOG;
    }

    @JavascriptInterface
    public boolean signed() {
        return true;
    }

    @JavascriptInterface
    public boolean isGeckoView() {
        // Replace with actual detection if available
        return BuildConfig.FLAVOR != null && BuildConfig.FLAVOR.toLowerCase().contains("geckoview");
    }

    @JavascriptInterface
    public boolean isWebView() {
        // Replace with actual detection if available
        return !isGeckoView();
    }

    @JavascriptInterface
    public boolean isNightly() {
        // Replace with actual detection if available
        return BuildConfig.BUILD_TYPE != null && BuildConfig.BUILD_TYPE.toLowerCase().contains("nightly");
    }

    @JavascriptInterface
    public String appVersion() {
        return BuildConfig.VERSION_NAME;
    }

    @JavascriptInterface
    public String appArchitecture() {
        // Replace with actual architecture detection if needed
        return System.getProperty("os.arch", "unknown");
    }
}