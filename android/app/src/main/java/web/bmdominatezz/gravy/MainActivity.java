package web.bmdominatezz.gravy;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.os.Handler;
import android.webkit.ValueCallback;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.splashscreen.SplashScreen;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import fi.iki.elonen.NanoHTTPD;
import web.bmdominatezz.gravyservices.GravyServer;

public class MainActivity extends AppCompatActivity {

    public WebEvents webEvents;
    public GravyServer gravyServer;
    public GrooveWebView webView;
    public PackageManager packageManager;
    private Handler handler;
    private Runnable pauseRunnable;
    public final static String TAG = "groovelauncher";
    Boolean activityPaused = false;
    public Boolean activityDispatchEvent = true;
    public Boolean activityDispatchHomeEvent = true;
    SystemEvents systemEvents;
    public static final int INPUT_FILE_REQUEST_CODE = 1;
    public static final int FILECHOOSER_RESULTCODE = 1;
    public ValueCallback<Uri> mUploadMessage;
    public Uri mCapturedImageURI = null;
    public ValueCallback<Uri[]> mFilePathCallback;
    public String mCameraPhotoPath;
    private MyLocalServer myServer;
    public boolean isAppReady = false;

    public class MyLocalServer extends NanoHTTPD {

        public MyLocalServer(int port) throws IOException {
            super(port);
            start(SOCKET_READ_TIMEOUT, false);
            System.out.println("Server started on port: " + port);
        }

        @Override
        public Response serve(IHTTPSession session) {
            String response = "Error";
            try {
                response = webView.evaluateJavascriptSync("GrooveBoard.backendMethods.serveConfig()");
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            Response res = newFixedLengthResponse(response);
            res.addHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
            res.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
            res.addHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers
            return res;
        }
    }

    @Override
    protected void onPause() {
        pauseRunnable = new Runnable() {
            @Override
            public void run() {
                activityPaused = true;
                if (activityDispatchEvent) {
                    webEvents.dispatchEvent(WebEvents.events.activityPause, null);
                }
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
                if (activityDispatchEvent) {
                    webEvents.dispatchEvent(WebEvents.events.activityResume, null);
                }
                activityPaused = false;
            }
            if (activityDispatchHomeEvent) {
                webEvents.dispatchEvent(WebEvents.events.homeButtonPress, null);
            }
            Log.d("groovelauncher", "homeButtonPress: ");
        } else {
            if (activityDispatchEvent) {
                webEvents.dispatchEvent(WebEvents.events.activityResume, null);
            }
            activityPaused = false;
            Log.d("groovelauncher", "onResume: ");
        }
        super.onResume();
    }

    @SuppressLint("MissingSuperCall")
    @Override
    public void onBackPressed() {
        webEvents.dispatchEvent(WebEvents.events.backButtonPress, null);
        // super.onBackPressed();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        String accentColor = getSharedPreferences("GrooveLauncherPrefs", MODE_PRIVATE).getString("accent_color", "#AA00FF");
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        splashScreen.setOnExitAnimationListener(splashScreenView -> {
            new android.os.Handler().postDelayed(() -> {
                // Start your animation here
                splashScreenView.remove();
            }, 100); // Delay in millisecon
        });
        // Keep the splash screen visible until the app is ready
        splashScreen.setKeepOnScreenCondition(() -> !isAppReady);

        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        webView = (GrooveWebView) findViewById(R.id.webview);
        packageManager = getPackageManager();
        handler = new Handler();
        webView.init(packageManager, this);
        // webView.setWebChromeClient(new ChromeClient());
        systemEvents = new SystemEvents(this);
        webEvents = webView.webEvents;
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            // Don't uncomment this cause webview itself will deal with inset paddings
            // v.setPadding(systemBars.left, systemBars.top, systemBars.right,
            // systemBars.bottom);
            webEvents.dispatchEvent(WebEvents.events.systemInsetsChange, null);
            webView.lastInsets = systemBars;
            return insets;
        });

        try {
            myServer = new MyLocalServer(49666); // Choose your port
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Simulate some initialization work
        /*
         * handler.postDelayed(() -> {
         * isAppReady = true;
         * }, 3000); // Delay of 3 seconds
         */
        gravyServer = new GravyServer() {

        };
        gravyServer.init(this);
        gravyServer.start();
    }

    Handler activityDispatchEventTimeout;

    public void activityDispatchEventAutoTimeout() {
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

    @Override
    protected void onDestroy() {
        super.onDestroy();
        systemEvents.onDestroy();
        //remove and free systemEvents
        systemEvents = null;
        if (myServer != null) {
            myServer.stop();
        }
    }

    @Override
    public boolean onCreateThumbnail(Bitmap outBitmap, Canvas canvas) {
        String response = "1";
        try {
            response = new JSONObject(webView.evaluateJavascriptSync("GrooveBoard.backendMethods.serveConfig()")).optString("theme", "1");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        //Create a black bitmap with the desired dimensions
        Bitmap blackBitmap = Bitmap.createBitmap(outBitmap.getWidth(), outBitmap.getHeight(), Bitmap.Config.ARGB_8888);
        blackBitmap.eraseColor(response == "1" ? Color.BLACK : Color.WHITE);

        // Draw the black bitmap onto the canvas
        canvas.drawBitmap(blackBitmap, 0, 0, null);

        // Return true to indicate that you've created a custom thumbnail
        return true;
    }

    @Override
    protected void onNewIntent(@NonNull Intent intent) {
        super.onNewIntent(intent);

        Uri data = intent.getData();
        if (data != null) {
            String url = data.toString();
            try {
                handleGrooveUrl(url);
            } catch (JSONException ignored) {
                Toast.makeText(this, "Error parsing URL", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void handleGrooveUrl(String url) throws JSONException {
        JSONObject argument = new JSONObject();
        argument.put("url", url);
        webEvents.dispatchEvent(WebEvents.events.deepLink, argument);
    }
}
