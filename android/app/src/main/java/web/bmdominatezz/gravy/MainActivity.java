package web.bmdominatezz.gravy;

import web.bmdominatezz.gravy.TimerUtils;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.icu.text.SimpleDateFormat;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Parcelable;
import android.provider.MediaStore;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;
import android.view.KeyEvent;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.io.File;
import java.io.IOException;
import java.sql.Time;
import java.util.Date;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class MainActivity extends AppCompatActivity {
    public WebEvents webEvents;
    public GrooveWebView webView;
    public PackageManager packageManager;
    private Handler handler;
    private Runnable pauseRunnable;
    public final static String TAG = "groovelauncher";
    Boolean activityPaused = false;
    public Boolean activityDispatchEvent = true;
    public Boolean activityDispatchHomeEvent = true;
    AppChangeReceiver appChangeReceiver;
    public static final int INPUT_FILE_REQUEST_CODE = 1;
    public static final int FILECHOOSER_RESULTCODE = 1;
    public ValueCallback<Uri> mUploadMessage;
    public Uri mCapturedImageURI = null;
    public ValueCallback<Uri[]> mFilePathCallback;
    public String mCameraPhotoPath;


    @Override
    protected void onPause() {
        pauseRunnable = new Runnable() {
            @Override
            public void run() {
                activityPaused = true;
                if (activityDispatchEvent)
                    webEvents.dispatchEvent(WebEvents.events.activityPause, null);
                Log.d("groovelauncher", "onPause: ");
            }
        };
        handler.postDelayed(pauseRunnable, 10); // Delay of 10ms
        super.onPause();
    }

    @Override
    protected void onResume() {
        if (pauseRunnable != null) {
            handler.removeCallbacks(pauseRunnable);
            if (activityPaused) {
                if (activityDispatchEvent)
                    webEvents.dispatchEvent(WebEvents.events.activityResume, null);
                activityPaused = false;
            }
            if(activityDispatchHomeEvent) webEvents.dispatchEvent(WebEvents.events.homeButtonPress, null);
            Log.d("groovelauncher", "homeButtonPress: ");
        } else {
            if (activityDispatchEvent)
                webEvents.dispatchEvent(WebEvents.events.activityResume, null);
            activityPaused = false;
            Log.d("groovelauncher", "onResume: ");
        }
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
        handler = new Handler();
        webView.init(packageManager, this);
        //webView.setWebChromeClient(new ChromeClient());
        appChangeReceiver = new AppChangeReceiver(this);
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

    Handler activityDispatchEventTimeout;
    public void activityDispatchEventAutoTimeout(){
        Log.d(TAG, "activityDispatchEventAutoTimeout: false");
        activityDispatchHomeEvent = false;
        activityDispatchEvent = false;
        if (activityDispatchEventTimeout != null) {
            TimerUtils.clearTimeout(activityDispatchEventTimeout);
        }
        TimerUtils.setTimeout(new Runnable() {
            @Override
            public void run() {
                activityDispatchHomeEvent = true;
                activityDispatchEvent = true;
                Log.d(TAG, "activityDispatchEventAutoTimeout: true");
            }
        }, 100);
    }
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "onActivityResult: ");

      activityDispatchEventAutoTimeout();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            if (requestCode != INPUT_FILE_REQUEST_CODE || mFilePathCallback == null) {
                super.onActivityResult(requestCode, resultCode, data);
                return;
            }
            Uri[] results = null;
            // Check that the response is a good one
            if (resultCode == Activity.RESULT_OK) {
                if (data == null) {
                    // If there is not data, then we may have taken a photo
                    if (mCameraPhotoPath != null) {
                        results = new Uri[]{Uri.parse(mCameraPhotoPath)};
                    }
                } else {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
            }
            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
        } else if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
            if (requestCode != FILECHOOSER_RESULTCODE || mUploadMessage == null) {
                super.onActivityResult(requestCode, resultCode, data);
                return;
            }
            if (requestCode == FILECHOOSER_RESULTCODE) {
                if (null == this.mUploadMessage) {
                    return;
                }
                Uri result = null;
                try {
                    if (resultCode != RESULT_OK) {
                        result = null;
                    } else {
                        // retrieve from the private variable if the intent is null
                        result = data == null ? mCapturedImageURI : data.getData();
                    }
                } catch (Exception e) {
                    Toast.makeText(getApplicationContext(), "activity :" + e,
                            Toast.LENGTH_LONG).show();
                }
                mUploadMessage.onReceiveValue(result);
                mUploadMessage = null;
            }
        }
        return;
    }
}
