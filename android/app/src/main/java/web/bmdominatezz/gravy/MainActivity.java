package web.bmdominatezz.gravy;

import android.annotation.SuppressLint;
import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
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

public class MainActivity extends AppCompatActivity {
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
    }

    int[] lastInsets = {0, 0, 0, 0};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        WebView webView = (WebView) findViewById(R.id.webview);

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
        webView.addJavascriptInterface(new Web2JavaInterface(this), "Groove");

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            //Don't uncomment this cause webview itself will deal with inset paddings
            //v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            lastInsets[0] = systemBars.left;
            lastInsets[1] = systemBars.top;
            lastInsets[2] = systemBars.right;
            lastInsets[3] = systemBars.bottom;
            return insets;
        });
    }

    public class Web2JavaInterface {
        Context mContext;

        Web2JavaInterface(Context c) {
            mContext = c;
        }

        // Show a toast from the web page.
        @JavascriptInterface
        public void showToast(String toast) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public void showToastHelloWorld() {
            Toast.makeText(mContext, "Hello world! Oh and hello Groove!", Toast.LENGTH_SHORT).show();
        }
    }

}
