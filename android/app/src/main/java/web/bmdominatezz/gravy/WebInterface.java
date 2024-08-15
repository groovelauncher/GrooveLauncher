package web.bmdominatezz.gravy;

import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
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
        JSONObject grooveSettings = new JSONObject();
        grooveSettings.put("packageName", "groove.internal.settings");
        grooveSettings.put("label", "Groove Settings");
        retrievedApps.put(grooveSettings);
        return retrievedApps.toString();
    }

    @JavascriptInterface
    public String getAppIconURL(String packageName) {
        return "https://appassets.androidplatform.net/assets/icons/" + (packageName == null ? "undefined" : packageName) + ".webp";
    }

    @JavascriptInterface
    public boolean launchApp(String packageName) {
        Intent intent = mainActivity.packageManager.getLaunchIntentForPackage(packageName);
        if (packageName.startsWith("groove.internal")) {
            mainActivity.webView.post(new Runnable() {
                @Override
                public void run() {
                    mainActivity.webView.evaluateJavascript("window.GrooveBoard.BackendMethods.launchInternalApp(\"" + packageName + "\")", null);
                }
            });
            //mainActivity.webView.evaluateJavascript("window.GrooveBoard.BackendMethods.launchInternalApp(\"" + packageName + "\")", null);
            return true;
        } else if (intent != null) {
            mainActivity.startActivity(intent);
            return true;
        }
        return false;
    }

    @JavascriptInterface
    public boolean uninstallApp(String packageName) {
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
    public boolean launchAppInfo(String packageName) {
        Intent appIntent = mainActivity.packageManager.getLaunchIntentForPackage(packageName);
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.parse("package:" + packageName));
        if (appIntent != null) {
            mainActivity.startActivity(intent);
            return true;
        }
        return false;
    }

    @JavascriptInterface
    public void setStatusBarAppearance(String appearance) {
        Window window = mainActivity.getWindow();
        View decorView = window.getDecorView();
        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController insetsController = window.getInsetsController();
                if (insetsController != null) {
                    switch (appearance) {
                        case "hide":
                            insetsController.hide(WindowInsets.Type.statusBars());
                            break;
                        case "dark":
                            insetsController.show(WindowInsets.Type.statusBars());
                            insetsController.setSystemBarsAppearance(WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
                            decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
                            break;
                        case "light":
                            insetsController.show(WindowInsets.Type.statusBars());
                            insetsController.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
                            decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                            break;
                        default:
                            break;
                    }
                }
            } else {
                // For older API levels
                int flags = 0;
                switch (appearance) {
                    case "hide":
                        flags |= View.SYSTEM_UI_FLAG_FULLSCREEN;
                        break;
                    case "dark":
                        flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        break;
                    case "light":
                        flags |= View.SYSTEM_UI_FLAG_VISIBLE;
                        break;
                }
                decorView.setSystemUiVisibility(flags);
            }
        } catch (Exception e) {
        }
    }

    @JavascriptInterface
    public void setNavigationBarAppearance(String appearance) {
        Window window = mainActivity.getWindow();
        View decorView = window.getDecorView();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController insetsController = window.getInsetsController();
                if (insetsController != null) {
                    switch (appearance) {
                        case "hide":
                            insetsController.hide(WindowInsets.Type.navigationBars());
                            break;
                        case "dark":
                            insetsController.show(WindowInsets.Type.navigationBars());
                            insetsController.setSystemBarsAppearance(WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS, WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
                            decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
                            break;
                        case "light":
                            insetsController.show(WindowInsets.Type.navigationBars());
                            insetsController.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
                            decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                            break;
                        default:
                            break;
                    }
                }
            } else {
                // For older API levels
                int flags = 0;
                switch (appearance) {
                    case "hide":
                        flags |= View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;
                        break;
                    case "dark":
                        flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        break;
                    case "light":
                        flags |= View.SYSTEM_UI_FLAG_VISIBLE;
                        break;
                }
                decorView.setSystemUiVisibility(flags);
            }
        } catch (Exception e) {
        }
    }

    @JavascriptInterface
    public void searchStore(String appName) {
        Uri uri = Uri.parse("market://search?q=" + appName);
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        if (intent.resolveActivity(mainActivity.packageManager) != null) {
            mainActivity.startActivity(intent);
        } else {
        }
    }

}