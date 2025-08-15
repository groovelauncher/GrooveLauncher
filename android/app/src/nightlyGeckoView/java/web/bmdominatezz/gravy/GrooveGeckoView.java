package web.bmdominatezz.gravy;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.util.Log;

import org.mozilla.geckoview.GeckoRuntime;
import org.mozilla.geckoview.GeckoSession;
import org.mozilla.geckoview.GeckoView;
import org.mozilla.geckoview.WebExtension;

import java.util.List;

public class GrooveGeckoView extends GeckoView {
    private static final String TAG = "GrooveGeckoView";
    private Context context;
    private GeckoRuntime runtime;
    private GeckoSession session;
    private MainActivity mainActivity;
    private PackageManager packageManager;
    private AssetServer assetServer;
    public List<ResolveInfo> retrievedApps;

    public GrooveGeckoView(Context context) {
        super(context);
        this.context = context;
    }

    public void init(PackageManager pm, MainActivity mainActivity) {
        this.packageManager = pm;
        this.mainActivity = mainActivity;
        
        try {
            Log.d(TAG, "Initializing GeckoView...");
            
            // Initialize GeckoRuntime
            runtime = GeckoRuntime.create(context);
            Log.d(TAG, "GeckoRuntime created successfully");
            
            // Create and configure GeckoSession
            session = new GeckoSession();
            Log.d(TAG, "GeckoSession created");
            
            // Configure session settings
            session.getSettings().setAllowJavascript(true);
            session.getSettings().setUseTrackingProtection(false);
            Log.d(TAG, "GeckoSession settings configured");
            
            // Set up content delegate for handling page events
            session.setContentDelegate(new GeckoContentDelegate(mainActivity, this));
            Log.d(TAG, "Content delegate set");
            
            // Open session and set it to the view
            session.open(runtime);
            setSession(session);
            Log.d(TAG, "GeckoSession opened and set to view");
            
            // Start HTTP server for assets
            assetServer = new AssetServer(context, 8080);
            assetServer.startServer();
            
            // Load the web content from HTTP server
            String serverUrl = assetServer.getServerUrl();
            Log.d(TAG, "Loading URL: " + serverUrl);
            session.loadUri(serverUrl);
            
            // Retrieve apps like WebView does
            retrieveApps();
            Log.d(TAG, "Apps retrieved, count: " + (retrievedApps != null ? retrievedApps.size() : 0));
            
            Log.d(TAG, "GeckoView initialization completed successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error initializing GeckoView", e);
        }
    }

    public void retrieveApps() {
        // Same logic as GrooveWebView
        final Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        retrievedApps = packageManager.queryIntentActivities(mainIntent, 0);
    }

    public void cleanup() {
        Log.d(TAG, "Cleaning up GeckoView resources...");
        try {
            if (assetServer != null) {
                assetServer.stopServer();
            }
            if (session != null) {
                Log.d(TAG, "Closing GeckoSession");
                session.close();
                session = null;
            }
            if (runtime != null) {
                Log.d(TAG, "Shutting down GeckoRuntime");
                runtime.shutdown();
                runtime = null;
            }
            Log.d(TAG, "GeckoView cleanup completed");
        } catch (Exception e) {
            Log.e(TAG, "Error during GeckoView cleanup", e);
        }
    }
}
