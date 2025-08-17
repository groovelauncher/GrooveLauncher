package web.bmdominatezz.gravy;

import static web.bmdominatezz.gravy.SystemEvents.mainActivity;
import static web.bmdominatezz.gravy.UriEncode.decodeURIComponent;
import static web.bmdominatezz.gravy.UriEncode.encodeURIComponent;

import android.app.Notification;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Drawable;
import android.media.MediaMetadata;
import android.media.MediaMetadataRetriever;
import android.media.session.MediaController;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.net.Uri;
import android.os.Build;
import android.provider.ContactsContract;
import android.provider.MediaStore;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import web.bmdominatezz.gravy.IconPack.IconPack;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ContentServer extends WebViewClientCompat {
    private final GrooveWebView grooveWebView;
    private final WebViewAssetLoader assetLoader;
    private final String TAG = "ContentServer";

    public ContentServer(GrooveWebView grooveWebView, WebViewAssetLoader assetLoader) {
        this.grooveWebView = grooveWebView;
        this.assetLoader = assetLoader;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri requestUri;
        if (Build.VERSION.SDK_INT >= 21) {
            requestUri = request.getUrl();
        } else {
            requestUri = Uri.parse(request.toString());
        }

        String path = requestUri.getPath(); // Get the path part of the URL
        // Split the path into segments
        String[] segments = path.split("/");
        if (segments.length == 4) {
            String key = segments[2];
            String iconFileName = segments[3];
            switch (key) {
                case "icons":
                    if (iconFileName.length() > 5) {
                        String iconPackageNameWithIntent = iconFileName.substring(0, iconFileName.length() - 5);
                        String[] parts = iconPackageNameWithIntent.split("\\|");
                        String iconPackageName = parts[0];
                        Intent intent;

                        if (parts.length > 1) {
                            // If there's an intent ID specified, use it
                            String intentId = parts[1];
                            intent = grooveWebView.packageManager.getLaunchIntentForPackage(iconPackageName);
                            if (intent != null) {
                                intent.setAction(intentId);
                            }
                        } else {
                            // If no intent ID, just get the default launch intent
                            intent = grooveWebView.packageManager.getLaunchIntentForPackage(iconPackageName);
                        }

                        if (intent != null) {
                            ResolveInfo resolveInfo = grooveWebView.packageManager.resolveActivity(intent,
                                    PackageManager.MATCH_DEFAULT_ONLY);
                            if (resolveInfo != null) {
                                InputStream inputStream = null;
                                Bitmap dra = grooveWebView.getAppIcon(grooveWebView.packageManager,
                                        iconPackageNameWithIntent);
                                
                                // Check per-app icon pack first
                                if (mainActivity.iconPackPerApp.containsKey(iconPackageName) && 
                                    mainActivity.iconPackPerApp.get(iconPackageName) != null &&
                                    !mainActivity.iconPackPerApp.get(iconPackageName).isEmpty()) {
                                    
                                    String perAppIconPack = mainActivity.iconPackPerApp.get(iconPackageName);
                                    IconPack perAppIconPackInstance = new IconPack();
                                    perAppIconPackInstance.packageName = perAppIconPack;
                                    perAppIconPackInstance.setContext(mainActivity);
                                    perAppIconPackInstance.load();
                                    
                                    if (perAppIconPackInstance.hasIconForPackage(iconPackageName)) {
                                        dra = perAppIconPackInstance.getIconForPackage(iconPackageName, dra);
                                    }
                                } else if (mainActivity.iconPack != "") {
                                    // Fall back to global icon pack
                                    if (mainActivity.iconPackInstance.hasIconForPackage(iconPackageName)) {
                                        dra = mainActivity.iconPackInstance.getIconForPackage(iconPackageName, dra);
                                    }
                                }
                                
                                if (dra != null)
                                    inputStream = Utils.loadBitmapAsStream(dra);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/webp", "UTF-8", inputStream);
                                }
                            } else {
                                Log.d("ResolveInfo", "No resolve info found.");
                            }
                        } else {
                            Log.d("ResolveInfo", "Intent is null. Package may not be installed.");
                        }
                    }
                    break;
                case "icons-bg":
                    if (iconFileName.length() > 5) {
                        String iconPackageNameWithIntent = iconFileName.substring(0, iconFileName.length() - 5);
                        String[] parts = iconPackageNameWithIntent.split("\\|");
                        String iconPackageName = parts[0];
                        Intent intent;

                        if (parts.length > 1) {
                            // If there's an intent ID specified, use it
                            String intentId = parts[1];
                            intent = grooveWebView.packageManager.getLaunchIntentForPackage(iconPackageName);
                            if (intent != null) {
                                intent.setAction(intentId);
                            }
                        } else {
                            // If no intent ID, just get the default launch intent
                            intent = grooveWebView.packageManager.getLaunchIntentForPackage(iconPackageName);
                        }
                        if (intent != null) {
                            ResolveInfo resolveInfo = grooveWebView.packageManager.resolveActivity(intent,
                                    PackageManager.MATCH_DEFAULT_ONLY);
                            if (resolveInfo != null) {
                                InputStream inputStream = null;
                                Bitmap dra = grooveWebView.getAppIconBackground(grooveWebView.packageManager,
                                        iconPackageNameWithIntent);
                                
                                // Check per-app icon pack first
                                if (mainActivity.iconPackPerApp.containsKey(iconPackageName) && 
                                    mainActivity.iconPackPerApp.get(iconPackageName) != null &&
                                    !mainActivity.iconPackPerApp.get(iconPackageName).isEmpty()) {
                                    
                                    String perAppIconPack = mainActivity.iconPackPerApp.get(iconPackageName);
                                    IconPack perAppIconPackInstance = new IconPack();
                                    perAppIconPackInstance.packageName = perAppIconPack;
                                    perAppIconPackInstance.setContext(mainActivity);
                                    //perAppIconPackInstance.load();
                                    
                                    if (perAppIconPackInstance.hasIconForPackage(iconPackageName)) {
                                        return new WebResourceResponse(null, null, null);
                                    }
                                } else if (mainActivity.iconPack != "") {
                                    // Fall back to global icon pack
                                    if (mainActivity.iconPackInstance.hasIconForPackage(iconPackageName)) {
                                        return new WebResourceResponse(null, null, null);
                                    }
                                }
                                
                                if (dra != null)
                                    inputStream = Utils.loadBitmapAsStream(dra);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/webp", "UTF-8", inputStream);
                                }
                            } else {
                                Log.d("ResolveInfo", "No resolve info found.");
                            }
                        } else {
                            Log.d("ResolveInfo", "Intent is null. Package may not be installed.");
                        }
                    }
                    break;

                case "contact-icon":
                    if (iconFileName.length() > 5) {
                        String phoneNumber = iconFileName.substring(0, iconFileName.length() - 5);
                        List<Contact> contacts = getContactsByPhoneNumber(grooveWebView.getContext(), phoneNumber);
                        if (!contacts.isEmpty()) {
                            long contactId = contacts.get(0).getId(); // Assuming you want the first contact
                            // Now query for the contact's photo using the contact ID
                            Uri contactUri = Uri.withAppendedPath(ContactsContract.Contacts.CONTENT_URI,
                                    String.valueOf(contactId));
                            Cursor cursor = grooveWebView.getContext().getContentResolver().query(
                                    contactUri,
                                    new String[]{ContactsContract.Contacts.PHOTO_URI},
                                    null,
                                    null,
                                    null);
                            String photoUri = null;
                            if (cursor != null) {
                                if (cursor.moveToFirst()) {
                                    int photoUriIndex = cursor.getColumnIndex(ContactsContract.Contacts.PHOTO_URI);
                                    if (photoUriIndex != -1) {
                                        photoUri = cursor.getString(photoUriIndex);
                                    } else {
                                        Log.d("contact-icon", "PHOTO_URI column not found.");
                                    }
                                }
                                cursor.close();
                            } else {
                                Log.d("contact-icon", "Cursor is null.");
                            }

                            if (photoUri != null) {
                                try {
                                    InputStream inputStream = grooveWebView.getContext().getContentResolver()
                                            .openInputStream(Uri.parse(photoUri));
                                    if (inputStream != null) {
                                        // Convert the InputStream to a Bitmap
                                        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                                        if (bitmap != null) {
                                            // Convert Bitmap to InputStream for WebResourceResponse
                                            InputStream webpStream = Utils.loadBitmapAsStream(bitmap);
                                            return new WebResourceResponse("image/webp", "UTF-8", webpStream);
                                        }
                                    }
                                } catch (FileNotFoundException e) {
                                    Log.e("contact-icon", "File not found for photo URI: " + photoUri, e);
                                } catch (Exception e) {
                                    Log.e("contact-icon", "Error retrieving contact photo: " + e.getMessage(), e);
                                }
                            } else {
                                Log.d("contact-icon", "Photo URI is null.");
                            }
                        }
                    }
                    break;
                case "photos":
                    final double sizeScale = .5;
                    if (iconFileName.length() > 5) {
                        String photoId = iconFileName.substring(0, iconFileName.length() - 5); // Extract photo ID
                        Uri photoUri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                                Long.parseLong(photoId));

                        Cursor cursor = grooveWebView.getContext().getContentResolver().query(
                                photoUri,
                                new String[]{MediaStore.Images.Media.DATA},
                                null,
                                null,
                                null);

                        String photoPath = null;
                        if (cursor != null) {
                            if (cursor.moveToFirst()) {
                                int dataIndex = cursor.getColumnIndex(MediaStore.Images.Media.DATA);
                                if (dataIndex != -1) {
                                    photoPath = cursor.getString(dataIndex);
                                }
                            }
                            cursor.close();
                        }

                        if (photoPath != null) {
                            try {
                                InputStream inputStream = grooveWebView.getContext().getContentResolver()
                                        .openInputStream(photoUri);
                                if (inputStream != null) {
                                    // Convert the InputStream to a Bitmap
                                    Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                                    if (bitmap != null) {
                                        // Resize the Bitmap
                                        int width = bitmap.getWidth();
                                        int height = bitmap.getHeight();
                                        int newWidth = (int) (width * sizeScale); // Resize to 50%
                                        int newHeight = (int) (height * sizeScale); // Resize to 50%
                                        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight,
                                                true);

                                        // Convert resized Bitmap to InputStream for WebResourceResponse
                                        InputStream webpStream = Utils.loadBitmapAsStream(resizedBitmap);
                                        return new WebResourceResponse("image/webp", "UTF-8", webpStream);
                                    }
                                }
                            } catch (FileNotFoundException e) {
                                Log.e("photos", "File not found for photo URI: " + photoUri, e);
                            } catch (Exception e) {
                                Log.e("photos", "Error retrieving photo: " + e.getMessage(), e);
                            }
                        } else {
                            Log.d("photos", "Photo URI is null.");
                        }
                    }
                    break;
                case "album-art":
                    StatusBarNotification sbn = mainActivity.notificationDelegate.getNotificationById(iconFileName.substring(0, iconFileName.length() - 5));
                    if (sbn != null) {
                        MediaSession.Token token = sbn.getNotification().extras.getParcelable(Notification.EXTRA_MEDIA_SESSION);

                        if (token != null) {
                            MediaController mediaController = new MediaController(mainActivity, token);
                            MediaMetadata metadata = mediaController.getMetadata();
                            PlaybackState playbackState = mediaController.getPlaybackState();

                            if (metadata != null) {
                                Bitmap albumArt = metadata.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART);
                                if (albumArt != null) {
                                    InputStream inputStream = Utils.loadBitmapAsStream(albumArt);
                                    return new WebResourceResponse("image/webp", "UTF-8", inputStream);
                                }
                            }
                        }
                    }
                    break;
                case "notification-image":
                    StatusBarNotification sbn2 = mainActivity.notificationDelegate.getNotificationById(iconFileName.substring(0, iconFileName.length() - 5));
                    Bitmap bitmap = sbn2.getNotification().extras.getParcelable(Notification.EXTRA_PICTURE);
                    if (bitmap != null) {
                        InputStream inputStream = Utils.loadBitmapAsStream(bitmap);
                        return new WebResourceResponse("image/webp", "UTF-8", inputStream);
                    }
                    break;
                default:
                    break;
            }
        }
        return assetLoader.shouldInterceptRequest(requestUri);
    }

    public List<Contact> getContactsByPhoneNumber(Context context, String phoneNumber) {
        List<Contact> contacts = new ArrayList<>();
        ContentResolver contentResolver = context.getContentResolver();
        Uri uri = ContactsContract.CommonDataKinds.Phone.CONTENT_URI;
        String selection = ContactsContract.CommonDataKinds.Phone.NUMBER + " = ?";
        String[] selectionArgs = {phoneNumber};
        String[] projection = {
                ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME
        };

        Cursor cursor = contentResolver.query(uri, projection, selection, selectionArgs, null);
        if (cursor != null && cursor.moveToFirst()) {
            do {
                long contactId = cursor
                        .getLong(cursor.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.CONTACT_ID));
                String displayName = cursor
                        .getString(cursor.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME));
                contacts.add(new Contact(contactId, displayName));
            } while (cursor.moveToNext());
            cursor.close();
        }

        return contacts;
    }

    public static class Contact {
        private long id;
        private String displayName;

        public Contact(long id, String displayName) {
            this.id = id;
            this.displayName = displayName;
        }

        public long getId() {
            return id;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
