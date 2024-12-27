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

public class GravyServer extends BroadcastReceiver {
    public static final String ACTION_SEND = "web.bmdominatezz.gravy.server";
    public static final String ACTION_RECEIVE = "web.bmdominatezz.gravy.client";
    private Context context;
    private BroadcastReceiver responseReceiver;
    private boolean isStarted = false;

    public GravyServer() {
        context = null;
    }

    public void onReceive(Context context, Intent intent) {
        if (ACTION_SEND.equals(intent.getAction())) {
            String jsonData = intent.getStringExtra("data_key");
            try {
                JSONObject receivedData = new JSONObject(jsonData);
                Log.d("GravyServer", "Received JSON: " + receivedData.toString());
                // Process JSON data here as needed
            } catch (Exception e) {
                Log.e("GravyServer", "Invalid JSON received", e);
            }
        }
    }

    public void init(Context ncontext) {
        context = ncontext;
    }

    public void start() {
        if (isStarted) {
            Log.d("GravyServer", "Server is already started.");
            return;
        }

        responseReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (ACTION_RECEIVE.equals(intent.getAction())) {
                    String response = intent.getStringExtra("response_key");
                    Log.d("GravyServer", "Received response: " + response);
                }
            }
        };

        IntentFilter filter = new IntentFilter(ACTION_SEND);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12 (API level 31) and above
            context.registerReceiver(this, filter, Context.RECEIVER_EXPORTED); // Or Context.RECEIVER_NOT_EXPORTED
        } else {
            context.registerReceiver(this, filter);
        }
        IntentFilter responseFilter = new IntentFilter(ACTION_RECEIVE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12 (API level 31) and above
            context.registerReceiver(responseReceiver, filter, Context.RECEIVER_EXPORTED); // Or Context.RECEIVER_NOT_EXPORTED
        } else {
            context.registerReceiver(responseReceiver, responseFilter);
        }
        isStarted = true;
        Log.d("GravyServer", "Server started.");
    }

    public void stop() {
        if (!isStarted) {
            Log.d("GravyServer", "Server is not running.");
            return;
        }

        context.unregisterReceiver(this);
        context.unregisterReceiver(responseReceiver);
        responseReceiver = null;
        isStarted = false;

        Log.d("GravyServer", "Server stopped.");
    }

    public void sendAction(JSONObject data) {
        Intent intent = new Intent(ACTION_RECEIVE);
        intent.putExtra("data_key", data.toString());
        context.sendBroadcast(intent);
        Log.d("GravyServer", "Action sent with JSON: " + data.toString());
    }

    public void sendActionToApp(String packageName, String data) {
        Intent intent = new Intent(ACTION_SEND);
        intent.putExtra("data_key", data);
        intent.setPackage(packageName); // Target the specific app

        try {
            context.sendBroadcast(intent);
            Log.d("GravyServer", "Action sent to " + packageName + ": " + data);
        } catch (Exception e) {
            Log.e("GravyServer", "Failed to send action to " + packageName, e);
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