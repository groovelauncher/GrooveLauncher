package web.bmdominatezz.gravy;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ComponentCallbacks;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
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
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.splashscreen.SplashScreen;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import fi.iki.elonen.NanoHTTPD;
import web.bmdominatezz.gravy.IconPack.IconPack;
import web.bmdominatezz.gravy.IconPack.IconPackManager;
import web.bmdominatezz.gravyservices.GravyServer;

public class MainActivity extends AppCompatActivity {
    private static MainActivity instance;
    public static String webEngine = BuildConfig.WEB_ENGINE;

    public static MainActivity getInstance() {
        return instance;
    }

    public WebEvents webEvents;
    public GravyServer gravyServer;
    public GrooveWebView webView;
    public GrooveGeckoView grooveView; // <-- keep this, but only use it if GeckoView is present
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
    public NotificationDelegate notificationDelegate;
    public IconPackManager iconPackManager;
    public String iconPack = "";
    public IconPack iconPackInstance;
    public LogcatReader logcatReader;

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
                    if (webEngine.equals("WebView")) {

                        webEvents.dispatchEvent(WebEvents.events.activityPause, null);
                    }
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
                    if (webEngine.equals("WebView"))
                        webEvents.dispatchEvent(WebEvents.events.activityResume, null);
                }
                activityPaused = false;
            }
            if (activityDispatchHomeEvent) {
                if (webEngine.equals("WebView"))
                    webEvents.dispatchEvent(WebEvents.events.homeButtonPress, null);
            }
            Log.d("groovelauncher", "homeButtonPress: ");
        } else {
            if (activityDispatchEvent) {
                if (webEngine.equals("WebView"))
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
        if (webEngine.equals("WebView"))
            webEvents.dispatchEvent(WebEvents.events.backButtonPress, null);
        // super.onBackPressed();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        notificationDelegate = new NotificationDelegate(this);
        instance = this;  // Set the instance
        if (webEngine.equals("WebView")) {
            SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
            splashScreen.setOnExitAnimationListener(splashScreenView -> {
                new android.os.Handler().postDelayed(() -> {
                    // Start your animation here
                    splashScreenView.remove();
                }, 100); // Delay in millisecon
            });
            // Keep the splash screen visible until the app is ready
            splashScreen.setKeepOnScreenCondition(() -> !isAppReady);
        }

        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        iconPackManager = new IconPackManager();
        iconPackManager.setContext(this);
        packageManager = getPackageManager();
        handler = new Handler();
        systemEvents = new SystemEvents(this);

        if (webEngine.equals("WebView")) {
            webView = new GrooveWebView(this);
            webView.setLayoutParams(new ConstraintLayout.LayoutParams(
                    ConstraintLayout.LayoutParams.MATCH_PARENT,
                    ConstraintLayout.LayoutParams.MATCH_PARENT));
            ConstraintLayout mainLayout = findViewById(R.id.main);
            mainLayout.addView(webView);

            webView.init(packageManager, this);
            // webView.setWebChromeClient(new ChromeClient());
            webEvents = webView.webEvents;
        } else if (webEngine.equals("GeckoView")) {
            grooveView = new GrooveGeckoView(this);
            grooveView.setLayoutParams(new ConstraintLayout.LayoutParams(
                    ConstraintLayout.LayoutParams.MATCH_PARENT,
                    ConstraintLayout.LayoutParams.MATCH_PARENT));
            ConstraintLayout mainLayout = findViewById(R.id.main);
            mainLayout.addView((android.view.View) grooveView);
            
            // Initialize GeckoView similar to WebView
            grooveView.init(packageManager, this);
        }
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            // Don't uncomment this cause webview itself will deal with inset paddings
            // v.setPadding(systemBars.left, systemBars.top, systemBars.right,
            // systemBars.bottom);
            if (webEngine.equals("WebView")) {
                webEvents.dispatchEvent(WebEvents.events.systemInsetsChange, null);
                webView.lastInsets = systemBars;
            }
            return insets;
        });

        try {
            myServer = new MyLocalServer(49666); // Choose your port
        } catch (IOException e) {
            e.printStackTrace();
        }
        gravyServer = new GravyServer() {

        };
        gravyServer.init(this);
        gravyServer.start();

// Add a listener for configuration changes to detect system theme changes
        getResources().getConfiguration().uiMode &= Configuration.UI_MODE_NIGHT_MASK;

        String theme = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES ? "dark" : "light";
        Log.d("ThemeChange", "System theme changed: " + theme);
        try {
            if (webEngine.equals("WebView")) {
                webEvents.dispatchEvent(WebEvents.events.systemThemeChange, new JSONObject().put("theme", theme));
            }
        } catch (JSONException e) {
        }

        getApplicationContext().registerComponentCallbacks(new ComponentCallbacks() {
            @Override
            public void onConfigurationChanged(@NonNull Configuration newConfig) {
                String theme = (newConfig.uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES ? "dark" : "light";
                Log.d("ThemeChange", "System theme changed: " + theme);
                try {
                    if (webEngine.equals("WebView")) {
                        webEvents.dispatchEvent(WebEvents.events.systemThemeChange, new JSONObject().put("theme", theme));
                    }
                } catch (JSONException e) {
                }
            }

            @Override
            public void onLowMemory() {
                // Handle low memory situations if necessary
            }
        });

        logcatReader = new LogcatReader();
        logcatReader.start();
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
        if (logcatReader != null) {
            logcatReader.stopReader();
            logcatReader = null;
        }
        if (webEngine.equals("GeckoView") && grooveView != null) {
            grooveView.cleanup();
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
        if (webEngine.equals("WebView")) {
            webEvents.dispatchEvent(WebEvents.events.deepLink, argument);
        }
    }

    public void LogToUI(String type, String message) {
        if (webEngine.equals("WebView")) {
            try {
                JSONObject argument = new JSONObject();
                argument.put("type", type);
                argument.put("message", message);

                runOnUiThread(() -> {
                    webEvents.dispatchEvent(WebEvents.events.debugLog, argument);
                });

            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    public class LogcatReader {
        private Thread thread;
        private volatile boolean running = false;
        private Process process;
        private final int MAX_LOGS = 200;
        private final java.util.LinkedList<String> logBuffer = new java.util.LinkedList<>();
        private final java.util.List<String> pendingLogs = new java.util.ArrayList<>();
        private final Handler logHandler = new Handler();
        private final int LOG_UPDATE_INTERVAL_MS = 500; // Throttle UI updates to every 500ms

        public java.util.List<String> getLastLogs() {
            synchronized (logBuffer) {
                return new java.util.ArrayList<>(logBuffer);
            }
        }

        public void start() {
            running = true;
            thread = new Thread(() -> {
                try {
                    process = Runtime.getRuntime().exec("logcat");
                    BufferedReader reader = new BufferedReader(
                            new InputStreamReader(process.getInputStream()));
                    String line;
                    // Start periodic UI updater
                    logHandler.post(logUpdateRunnable);
                    while (running && (line = reader.readLine()) != null) {
                        String type = "V"; // default to Verbose
                        if (line.contains("/D")) type = "D";
                        else if (line.contains("/I")) type = "I";
                        else if (line.contains("/W")) type = "W";
                        else if (line.contains("/E")) type = "E";
                        else if (line.contains("/F")) type = "F";
                        synchronized (logBuffer) {
                            if (logBuffer.size() >= MAX_LOGS) logBuffer.removeFirst();
                            logBuffer.add(type + ": " + line);
                        }
                        synchronized (pendingLogs) {
                            pendingLogs.add(type + ": " + line);
                        }
                    }
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    if (process != null) process.destroy();
                }
            });
            thread.start();
        }

        private final Runnable logUpdateRunnable = new Runnable() {
            @Override
            public void run() {
                if (!running) return;
                java.util.List<String> logsToSend = new java.util.ArrayList<>();
                synchronized (pendingLogs) {
                    if (!pendingLogs.isEmpty()) {
                        logsToSend.addAll(pendingLogs);
                        pendingLogs.clear();
                    }
                }
                if (!logsToSend.isEmpty()) {
                    // Only send the last log line to UI to avoid flooding
                    String lastLog = logsToSend.get(logsToSend.size() - 1);
                    String type = "V";
                    if (lastLog.contains(": ")) {
                        int idx = lastLog.indexOf(": ");
                        type = lastLog.substring(0, idx);
                        lastLog = lastLog.substring(idx + 2);
                    }
                    LogToUI(type, lastLog);
                }
                logHandler.postDelayed(this, LOG_UPDATE_INTERVAL_MS);
            }
        };

        public void stopReader() {
            running = false;
            logHandler.removeCallbacks(logUpdateRunnable);
            if (process != null) process.destroy();
            if (thread != null) {
                try {
                    thread.join(500);
                } catch (InterruptedException ignored) {
                }
            }
        }
    }
}
