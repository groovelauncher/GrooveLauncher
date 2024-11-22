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
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            try {
                // Check if developer options are enabled
                if (Settings.Global.getInt(context.getContentResolver(), Settings.Global.DEVELOPMENT_SETTINGS_ENABLED) == 1) {
                    return "0";
                }
            } catch (Settings.SettingNotFoundException e) {
                // If we can't determine, better safe than sorry
                return "0";
            }
        }
        return BuildConfig.CAK;
    }
} 