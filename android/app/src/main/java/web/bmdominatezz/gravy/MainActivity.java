package web.bmdominatezz.gravy;

import android.annotation.SuppressLint;
import android.content.Context;
import android.net.Uri;
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

import org.json.JSONException;
import org.json.JSONObject;

import web.bmdominatezz.gravy.WebEvents;

public class MainActivity extends AppCompatActivity {
    public Insets lastInsets;
    public WebEvents webEvents;
    public WebView webView;

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @SuppressLint("MissingSuperCall")
    @Override
    public void onBackPressed() {
        // Do nothing or provide a custom action to prevent closing the launcher
        //super.onBackPressed();
        webEvents.dispatchEvent(WebEvents.events.backButtonPress, null);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        webView = (WebView) findViewById(R.id.webview);
        webEvents = new WebEvents(this, webView);
        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation") // for API < 21
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return assetLoader.shouldInterceptRequest(Uri.parse(url));
            }
        });


        WebSettings webViewSettings = webView.getSettings();
        webViewSettings.setJavaScriptEnabled(true);

        // Assets are hosted under http(s)://appassets.androidplatform.net/assets/... .
        webView.addJavascriptInterface(new WebInterface(this), "Groove");

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");

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
}
