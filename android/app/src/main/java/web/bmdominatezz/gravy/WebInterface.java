package web.bmdominatezz.gravy;

import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class WebInterface {
    private MainActivity mainActivity;

    WebInterface(MainActivity mainActivity) {
        this.mainActivity = mainActivity;
    }

    public float getDevicePixelRatio() {
        DisplayMetrics displayMetrics = mainActivity.getResources().getDisplayMetrics();
        return displayMetrics.density;
    }

    // Show a toast from the web page.
    @JavascriptInterface
    public void showToast(String toast) {
        Toast.makeText(mainActivity, toast, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void showToastHelloWorld() {
        Toast.makeText(mainActivity, "Hello world! Oh and hello Groove!", Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public String getSystemInsets() throws JSONException {
        JSONObject systemInsets = new JSONObject();
        systemInsets.put("left", (mainActivity.lastInsets == null) ? 0 : mainActivity.lastInsets.left / getDevicePixelRatio());
        systemInsets.put("top", (mainActivity.lastInsets == null) ? 0 : mainActivity.lastInsets.top / getDevicePixelRatio());
        systemInsets.put("right", (mainActivity.lastInsets == null) ? 0 : mainActivity.lastInsets.right / getDevicePixelRatio());
        systemInsets.put("bottom", (mainActivity.lastInsets == null) ? 0 : mainActivity.lastInsets.bottom / getDevicePixelRatio());
        return systemInsets.toString();
    }

    @JavascriptInterface
    public String retrieveApps() throws JSONException {
        mainActivity.retrieveApps();
        Log.d("groovelauncher", "retrieveApps: " + mainActivity.retrievedApps.toString());
        JSONArray retrievedApps = new JSONArray();
        for (ResolveInfo resolveInfo : mainActivity.retrievedApps) {
            JSONObject appInfo = new JSONObject();
            appInfo.put("packageName", resolveInfo.activityInfo.packageName);
            appInfo.put("label", resolveInfo.loadLabel(mainActivity.packageManager).toString());
            retrievedApps.put(appInfo);
        }
        return retrievedApps.toString();
    }

    @JavascriptInterface
    public String getAppIconURL(String packageName) {
        return "https://appassets.androidplatform.net/assets/icons/" + (packageName == null ? "undefined" : packageName) + ".webp";
    }

    @JavascriptInterface
    public boolean launchApp(String packageName) {
        Intent intent = mainActivity.packageManager.getLaunchIntentForPackage(packageName);
        if (intent != null) {
            mainActivity.startActivity(intent);
            return true;

        }
        return false;
    }
    @JavascriptInterface
    public boolean uninstallApp(String packageName){
        Intent appIntent = mainActivity.packageManager.getLaunchIntentForPackage(packageName);
        Intent intent = new Intent(Intent.ACTION_DELETE);
        intent.setData(Uri.parse("package:" + packageName));
        if (appIntent != null) {
            mainActivity.startActivity(intent);
            return true;
        }
        return false;
    }
    @JavascriptInterface
    public boolean launchAppInfo(String packageName){
        Intent appIntent = mainActivity.packageManager.getLaunchIntentForPackage(packageName);
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.parse("package:" + packageName));
        if (appIntent != null) {
            mainActivity.startActivity(intent);
            return true;
        }
        return false;
    }

}