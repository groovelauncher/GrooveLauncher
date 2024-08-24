package web.bmdominatezz.gravy;

import static androidx.core.content.ContextCompat.registerReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.util.Log;


public class AppChangeReceiver {
    MainActivity mainActivity;

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
                Log.d("TAG", "onReceive: APP INSTALL");
            } else if (Intent.ACTION_PACKAGE_REMOVED.equals(action)) {
                // App uninstalled
                Uri data = intent.getData();
                String packageName = data != null ? data.getSchemeSpecificPart() : null;
                // Handle the app uninstall here
                Log.d("TAG", "onReceive: APP UNINSTALL");
            }
        }
    }

}
