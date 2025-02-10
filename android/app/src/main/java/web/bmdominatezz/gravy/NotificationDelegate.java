package web.bmdominatezz.gravy;

import static web.bmdominatezz.gravy.MainActivity.TAG;
import static web.bmdominatezz.gravy.UriEncode.encodeURIComponent;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class NotificationDelegate {
    MainActivity mainActivity;

    public NotificationDelegate(MainActivity zmainActivity) {
        this.mainActivity = zmainActivity;
        NotificationManager notificationManager = (NotificationManager) zmainActivity.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notifications = new ArrayList<>(List.of(notificationManager.getActiveNotifications()));
        } else {
            notifications = new ArrayList<>();
        }
    }

    public JSONObject statusBarNotificationToJSON(StatusBarNotification sbn) {
        JSONObject json = new JSONObject();
        try {
            json.put("title", sbn.getNotification().extras.getString("android.title"));
            json.put("description", sbn.getNotification().extras.getString("android.text"));
            json.put("longDescription", sbn.getNotification().extras.getString("android.bigText"));
            json.put("image", "https://appassets.androidplatform.net/assets/notification-image/" + sbn.getId() + ".webp");
            JSONObject song = new JSONObject();
            MediaSession.Token token = sbn.getNotification().extras.getParcelable(Notification.EXTRA_MEDIA_SESSION);
            if (token != null) {
                MediaController mediaController = new MediaController(mainActivity, token);
                MediaMetadata metadata = mediaController.getMetadata();
                PlaybackState playbackState = mediaController.getPlaybackState();

                if (metadata != null) {
                    String artist = metadata.getString(MediaMetadata.METADATA_KEY_ARTIST);
                    String album = metadata.getString(MediaMetadata.METADATA_KEY_ALBUM);
                    String title = metadata.getString(MediaMetadata.METADATA_KEY_TITLE);
                    String albumArtUri = metadata.getString(MediaMetadata.METADATA_KEY_ALBUM_ART_URI);
                    Log.d(TAG, "ORIGINAL CONTENT URI: " + metadata.getString(MediaMetadata.METADATA_KEY_ALBUM_ART_URI));
                    albumArtUri = "https://appassets.androidplatform.net/assets/album-art/" + sbn.getId() + ".webp";
                    long duration = metadata.getLong(MediaMetadata.METADATA_KEY_DURATION);
                    song.put("artist", artist);
                    song.put("songName", title);
                    song.put("albumName", album);
                    song.put("albumCover", albumArtUri);
                    song.put("songDuration", duration);
                    song.put("currentPlayback", playbackState.getPosition());
                }

                if (playbackState != null) {
                    int state = playbackState.getState();
                    // Check if state == PlaybackState.STATE_PLAYING, etc.
                }
            }

            json.put("song", song);
            json.put("packageName", sbn.getPackageName());
            json.put("postTime", sbn.getPostTime());
            json.put("id", sbn.getId());
            json.put("tag", sbn.getTag());
            json.put("key", sbn.getKey());
            json.put("groupKey", sbn.getGroupKey());
            json.put("isOngoing", sbn.isOngoing());
            json.put("isClearable", sbn.isClearable());
            json.put("notification", sbn.getNotification());
        } catch (Exception e) {
            Log.e("NotificationDelegate", "Error converting StatusBarNotification to JSON: " + e.getMessage());
        }
        return json;
    }

    public List<StatusBarNotification> notifications = new ArrayList<>();

    public void onNotificationPosted(StatusBarNotification sbn) {
        for (int i = 0; i < notifications.size(); i++) {
            if (notifications.get(i).getId() == sbn.getId()) {
                notifications.set(i, sbn);
                mainActivity.webEvents.dispatchEvent(WebEvents.events.notificationPosted, statusBarNotificationToJSON(sbn));
                return;
            }
        }
        notifications.add(sbn);
        mainActivity.webEvents.dispatchEvent(WebEvents.events.notificationPosted, statusBarNotificationToJSON(sbn));
    }

    public void onNotificationRemoved(StatusBarNotification sbn) {
        notifications.remove(sbn);
    }

    public List<StatusBarNotification> getAllNotifications() {
        return notifications;
    }

    public String getAllNotificationsJSON() {
        List<JSONObject> jsonList = new ArrayList<>();
        for (StatusBarNotification sbn : getAllNotifications()) {
            jsonList.add(statusBarNotificationToJSON(sbn));
        }
        return jsonList.toString();
    }

    public StatusBarNotification getNotificationById(String iconFileName) {
        for (StatusBarNotification sbn : getAllNotifications()) {
            if (sbn.getId() == Integer.parseInt(iconFileName)) {
                return sbn;
            }
        }
        return null;
    }
}
