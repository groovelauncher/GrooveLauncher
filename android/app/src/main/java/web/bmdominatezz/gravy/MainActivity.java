package web.bmdominatezz.gravy;

import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {
    public WebEvents webEvents;
    public GrooveWebView webView;
    public PackageManager packageManager;

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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        webView = (GrooveWebView) findViewById(R.id.webview);
        packageManager = getPackageManager();
        webView.init(packageManager, this);
        webEvents = webView.webEvents;
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            //Don't uncomment this cause webview itself will deal with inset paddings
            //v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            webEvents.dispatchEvent(WebEvents.events.systemInsetsChange, null);
            webView.lastInsets = systemBars;
            return insets;
        });
    }
}
