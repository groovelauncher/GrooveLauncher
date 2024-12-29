package web.bmdominatezz.gravyservices;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Build;
import android.util.Log;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class GravyClient extends BroadcastReceiver {
    public static final String ACTION_SEND = "web.bmdominatezz.gravy.server";
    public static final String ACTION_RECEIVE = "web.bmdominatezz.gravy.client";

    private Context context;
    private BroadcastReceiver responseReceiver;
    private boolean isStarted = false;

    public GravyClient() {
        context = null;
    }

    public void onReceive(Context context, Intent intent) {
        if (ACTION_RECEIVE.equals(intent.getAction())) {
            String jsonData = intent.getStringExtra("data_key");
            try {
                JSONObject receivedData = new JSONObject(jsonData);
                onReceive(receivedData);
                Log.d("GravyClient", "Received JSON: " + receivedData.toString());
                // Process JSON data here as needed
            } catch (Exception e) {
                Log.e("GravyClient", "Invalid JSON received", e);
            }
        }
    }

    public void onReceive(JSONObject data) {
        Log.d("GravyClient", "Received JSON: " + data.toString());
        // Apply changes dynamically
        if (data.has("uiscale")) {
            String uiScale = data.optString("uiscale", ".8");
            applyUIScale(uiScale);
        }
        if (data.has("theme")) {
            String theme = data.optString("theme", "1");
            applyTheme(theme);
        }
        if (data.has("accentcolor")) {
            String accentColor = data.optString("accentcolor", "#AA00FF");
            applyAccentColor(accentColor);
        }
    }

    public void applyUIScale(String uiScale) {
        // Code to adjust UI scale
        Log.d("GravyClient", "Applied UI scale: " + uiScale);
    }

    public void applyTheme(String theme) {
        // Code to switch themes
        Log.d("GravyClient", "Applied theme: " + theme);
    }

    public void applyAccentColor(String accentColor) {
        // Code to change accent color
        Log.d("GravyClient", "Applied accent color: " + accentColor);
    }

    public void init(Context ncontext) {
        context = ncontext;
    }

    public void start() {
        if (isStarted) {
            Log.d("GravyClient", "Client is already started.");
            return;
        }

        responseReceiver = this;

        IntentFilter filter = new IntentFilter(ACTION_RECEIVE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12 (API level 31) and above
            context.registerReceiver(responseReceiver, filter, Context.RECEIVER_EXPORTED); // Or Context.RECEIVER_NOT_EXPORTED
        } else {
            context.registerReceiver(responseReceiver, filter);
        }
        isStarted = true;
        Log.d("GravyClient", "Client started.");
        requestConfig();
    }

    public void stop() {
        if (!isStarted) {
            Log.d("GravyClient", "Client is not running.");
            return;
        }

        context.unregisterReceiver(responseReceiver);
        responseReceiver = null;
        isStarted = false;

        Log.d("GravyClient", "Client stopped.");
    }
    public void requestConfig(){
        JSONObject data = new JSONObject();
        try {
            data.put("request", "config");
        } catch (Exception e) {
            Log.e("GravyClient", "Failed to create JSON object", e);
        }
        sendRequest(data);
    }
    public void sendRequest(JSONObject data) {
        Intent intent = new Intent(ACTION_SEND);
        intent.putExtra("data_key", data.toString());
        context.sendBroadcast(intent);
        Log.d("GravyClient", "Request sent with JSON: " + data.toString());
    }

    // Send a request to a specific server app
    public void sendRequestToServer(String packageName, String data) {
        Intent intent = new Intent(ACTION_SEND);
        intent.putExtra("data_key", data);
        intent.setPackage(packageName); // Target the specific server app

        try {
            context.sendBroadcast(intent);
            Log.d("GravyClient", "Request sent to " + packageName + ": " + data);
        } catch (Exception e) {
            Log.e("GravyClient", "Failed to send request to " + packageName, e);
        }
    }

    public List<String> queryClientApps() {
        List<String> clientApps = new ArrayList<>();
        PackageManager packageManager = context.getPackageManager();

        // Create an intent for the action you are querying
        Intent intent = new Intent(ACTION_RECEIVE);

        // Query apps that handle this action
        List<ResolveInfo> receivers = packageManager.queryBroadcastReceivers(intent, 0);

        for (ResolveInfo receiver : receivers) {
            String packageName = receiver.activityInfo.packageName;
            clientApps.add(packageName);
            Log.d("GravyServer", "Discovered client app: " + packageName);
        }

        return clientApps;
    }

    public List<String> queryServerApps() {
        List<String> clientApps = new ArrayList<>();
        PackageManager packageManager = context.getPackageManager();

        // Create an intent for the action you are querying
        Intent intent = new Intent(ACTION_SEND);

        // Query apps that handle this action
        List<ResolveInfo> receivers = packageManager.queryBroadcastReceivers(intent, 0);

        for (ResolveInfo receiver : receivers) {
            String packageName = receiver.activityInfo.packageName;
            clientApps.add(packageName);
            Log.d("GravyServer", "Discovered client app: " + packageName);
        }

        return clientApps;
    }

    public static class version {
        public static String getVersion() {
            return BuildConfig.VERSION_NAME;
        }
    }
}