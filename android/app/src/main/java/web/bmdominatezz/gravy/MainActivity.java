package web.bmdominatezz.gravy;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.List;

import web.bmdominatezz.gravy.WebEvents;

public class MainActivity extends AppCompatActivity {
    public Insets lastInsets;
    public WebEvents webEvents;
    public WebView webView;
    public PackageManager packageManager;
    public List<ResolveInfo> retrievedApps;

    @Override
    protected void onPause() {
        webEvents.dispatchEvent(WebEvents.events.activityPause, null);
        super.onPause();
    }

    @Override
    protected void onResume() {
        webEvents.dispatchEvent(WebEvents.events.activityResume, null);
        super.onResume();
    }

    @SuppressLint("MissingSuperCall")
    @Override
    public void onBackPressed() {
        webEvents.dispatchEvent(WebEvents.events.backButtonPress, null);
        //super.onBackPressed();
    }


    private InputStream loadDrawableAsStream(Drawable drawable) {
        Bitmap bitmap;
        if (drawable instanceof BitmapDrawable) {
            bitmap = ((BitmapDrawable) drawable).getBitmap();
        } else {
            // Create a bitmap if the drawable is not a BitmapDrawable
            bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);
        }
        // Define the max size
        int maxSize = 200;

// Check dimensions and resize if necessary
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        if (width > maxSize || height > maxSize) {
            float ratio = Math.min((float) maxSize / width, (float) maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
            bitmap = Bitmap.createScaledBitmap(bitmap, width, height, true);
        }

// Convert the resized bitmap to InputStream
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.WEBP, 100, byteArrayOutputStream); // im not sure if webp is the fastest 😭
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        InputStream inputStream = new ByteArrayInputStream(byteArray);
        return inputStream;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        webView = (WebView) findViewById(R.id.webview);
        webEvents = new WebEvents(this, webView);
        packageManager = getPackageManager();
        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClientCompat() {


            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri requestUri;
                if (Build.VERSION.SDK_INT >= 21) {
                    requestUri = request.getUrl();
                } else {
                    requestUri = Uri.parse(request.toString());
                }

                String path = requestUri.getPath(); // Get the path part of the URL
                // Split the path into segments
                String[] segments = path.split("/");

                if (segments.length == 4 && "icons".equals(segments[2])) {
                    String iconFileName = segments[3];
                    if (iconFileName.length() > 5) {
                        String iconPackageName = iconFileName.substring(0, iconFileName.length() - 5);
                        Intent intent = packageManager.getLaunchIntentForPackage(iconPackageName);
                        if (intent != null) {
                            ResolveInfo resolveInfo = packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);
                            if (resolveInfo != null) {
                                Drawable appIcon = resolveInfo.activityInfo.loadIcon(packageManager);
                                InputStream inputStream = loadDrawableAsStream(appIcon);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/png", "UTF-8", inputStream);
                                }
                            } else {
                                Log.d("ResolveInfo", "No resolve info found.");
                            }
                        } else {
                            Log.d("ResolveInfo", "Intent is null. Package may not be installed.");
                        }

                       /* couldnt decide which one is faster :(
                        for (ResolveInfo resolveInfo : retrievedApps) {
                            if (iconPackageName.equals(resolveInfo.activityInfo.packageName)) {

                                Drawable appIcon = resolveInfo.activityInfo.loadIcon(packageManager);

                                InputStream inputStream = loadDrawableAsStream(appIcon);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/png", "UTF-8", inputStream);
                                }
                            }
                        }*/


                    } else {

                    }

                } else {

                }

                return assetLoader.shouldInterceptRequest(requestUri);
            }
        });


        WebSettings webViewSettings = webView.getSettings();
        webViewSettings.setJavaScriptEnabled(true);

        // Assets are hosted under http(s)://appassets.androidplatform.net/assets/... .
        webView.addJavascriptInterface(new WebInterface(this), "Groove");

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        retrieveApps();
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            //Don't uncomment this cause webview itself will deal with inset paddings
            //v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            //webView.evaluateJavascript("");
            webEvents.dispatchEvent(WebEvents.events.systemInsetsChange, null);

            Log.d("groovelauncher", "onCreate: inset chhange" + systemBars.toString());
            lastInsets = systemBars;

            return insets;
        });
    }

    public void retrieveApps() {
        // are these categories even enough 💀 idk hope it is
        final Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        retrievedApps = packageManager.queryIntentActivities(mainIntent, 0);
    }
}
