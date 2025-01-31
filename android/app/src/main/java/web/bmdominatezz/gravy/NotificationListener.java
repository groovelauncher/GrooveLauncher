package web.bmdominatezz.gravy;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

public class NotificationListener extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        Log.d("NotificationListener", "Notification received: " + sbn.getPackageName());
        // You can extract title, text, and other details from sbn.getNotification().extras
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        Log.d("NotificationListener", "Notification removed: " + sbn.getPackageName());
    }
}