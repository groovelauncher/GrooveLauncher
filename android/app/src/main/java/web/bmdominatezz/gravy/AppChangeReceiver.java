package web.bmdominatezz.gravy;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;


public class AppChangeReceiver {
    static MainActivity mainActivity;

    AppChangeReceiver(MainActivity m) {
        this.mainActivity = m;
        Log.d("AG", "AppChangeReceiver: ekledik");
        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_PACKAGE_ADDED);
        filter.addAction(Intent.ACTION_PACKAGE_REMOVED);
        filter.addDataScheme("package");
        mainActivity.registerReceiver(new AppChangeBroadcastReceiver(), filter);
    }

    public static class AppChangeBroadcastReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (Intent.ACTION_PACKAGE_ADDED.equals(action)) {
                // App installed
                Uri data = intent.getData();
                String packageName = data != null ? data.getSchemeSpecificPart() : null;
                // Handle the app install here
                JSONObject argument = new JSONObject();
                try {
                    argument.put("packagename", packageName);
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                mainActivity.webEvents.dispatchEvent(WebEvents.events.appInstall, argument);
                Log.d("TAG", "onReceive: APP INSTALL");
            } else if (Intent.ACTION_PACKAGE_REMOVED.equals(action)) {
                // App uninstalled
                Uri data = intent.getData();
                String packageName = data != null ? data.getSchemeSpecificPart() : null;
                // Handle the app uninstall here
                JSONObject argument = new JSONObject();
                try {
                    argument.put("packagename", packageName);
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                mainActivity.webEvents.dispatchEvent(WebEvents.events.appUninstall, argument);
                Log.d("TAG", "onReceive: APP UNINSTALL");
            }
        }
    }

}
