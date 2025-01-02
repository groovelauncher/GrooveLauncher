package web.bmdominatezz.gravy;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.ContentObserver;
import android.net.Uri;
import android.os.Handler;
import android.provider.Settings;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;


public class SystemEvents {
    static MainActivity mainActivity;
    private AppChangeBroadcastReceiver appChangeBroadcastReceiver;
    private AnimationScaleObserver animationScaleObserver;

    SystemEvents(MainActivity m) {
        this.mainActivity = m;
        Log.d("AG", "AppChangeReceiver: ekledik");
        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_PACKAGE_ADDED);
        filter.addAction(Intent.ACTION_PACKAGE_REMOVED);
        filter.addDataScheme("package");
        appChangeBroadcastReceiver = new AppChangeBroadcastReceiver();
        mainActivity.registerReceiver(appChangeBroadcastReceiver, filter);
        animationScaleObserver = new AnimationScaleObserver(new Handler(), mainActivity);
        mainActivity.getContentResolver().registerContentObserver(
                Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE),
                true,
                animationScaleObserver
        );
    }

    public void onDestroy() {
        mainActivity.unregisterReceiver(appChangeBroadcastReceiver);
        mainActivity.getContentResolver().unregisterContentObserver(animationScaleObserver);
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

    public class AnimationScaleObserver extends ContentObserver {
        private final Context context;

        public AnimationScaleObserver(Handler handler, Context context) {
            super(handler);
            this.context = context;
        }

        @Override
        public void onChange(boolean selfChange) {
            super.onChange(selfChange);
            float scale = Settings.Global.getFloat(
                    context.getContentResolver(),
                    Settings.Global.ANIMATOR_DURATION_SCALE,
                    1.0f // Default value
            );
            Log.d("AnimationScaleObserver", "Animation duration scale changed: " + scale);
            // Handle the change as needed
            mainActivity.webEvents.dispatchEvent(WebEvents.events.animationDurationScaleChange);
        }
    }
}
