package web.bmdominatezz.gravy;
import android.content.Context;
import android.util.DisplayMetrics;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

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
}