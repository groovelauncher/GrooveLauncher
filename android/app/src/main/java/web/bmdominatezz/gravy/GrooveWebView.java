package web.bmdominatezz.gravy;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.util.AttributeSet;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import web.bmdominatezz.gravy.Utils.*;

import java.io.InputStream;
import java.util.List;

public class GrooveWebView extends WebView {
    private Context m_context;
    public List<ResolveInfo> retrievedApps;
    PackageManager packageManager;
    public Insets lastInsets;
    WebEvents webEvents;

    public GrooveWebView(Context context) {
        super(context);
        m_context = context;
    }

    public GrooveWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        m_context = context;
    }

    public GrooveWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        m_context = context;
    }

    public void retrieveApps() {
        // are these categories even enough 💀 idk hope it is
        final Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        retrievedApps = packageManager.queryIntentActivities(mainIntent, 0);
    }

    public void init(PackageManager pm, Activity mainActivity) {
        packageManager = pm;
        webEvents = new WebEvents(m_context, this);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(m_context))
                .build();

        this.setWebViewClient(new WebViewClientCompat() {


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
                                Drawable appIcon = resolveInfo.loadIcon(packageManager);
                                AdaptiveIconGenerator generator = new AdaptiveIconGenerator(m_context, appIcon);
                                // Generate the adaptive icon
                                Drawable resultDrawable = generator.generateIcon();
                                InputStream inputStream = Utils.loadDrawableAsStream(resultDrawable);
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

        WebSettings webViewSettings = this.getSettings();
        webViewSettings.setJavaScriptEnabled(true);
        webViewSettings.setDomStorageEnabled(true);

        // Assets are hosted under http(s)://appassets.androidplatform.net/assets/... .
        this.addJavascriptInterface(new WebInterface((MainActivity) mainActivity), "Groove");

        this.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        retrieveApps();
    }
}
