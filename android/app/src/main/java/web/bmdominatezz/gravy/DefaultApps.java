package web.bmdominatezz.gravy;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.provider.ContactsContract;
import android.provider.Telephony;
import android.telecom.TelecomManager;
import android.util.Log;

import java.util.List;

public class DefaultApps {
    public static String getDefaultPhoneAppPackageName(Context context) {
        TelecomManager telecomManager = (TelecomManager) context.getSystemService(Context.TELECOM_SERVICE);
        if (telecomManager != null) {
            String packageName = telecomManager.getDefaultDialerPackage();
            if (packageName != null) {
                return packageName;
            }
        }
        return "Unknown";
    }

    public static String getDefaultMessagingAppPackageName(Context context) {
        // Get the package name of the default SMS app
        String defaultMessagingAppPackage = Telephony.Sms.getDefaultSmsPackage(context);
        if (defaultMessagingAppPackage != null) {
            return defaultMessagingAppPackage;
        }
        return "Unknown";
    }

    public static String getDefaultBrowserPackageName(Context context) {
        PackageManager packageManager = context.getPackageManager();

        // Create an intent to open a web URL
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        intent.setData(android.net.Uri.parse("http://"));

        // Query for the default browser
        List<ResolveInfo> resolveInfos = packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
        if (!resolveInfos.isEmpty()) {
            ResolveInfo resolveInfo = resolveInfos.get(0); // Take the first matching activity
            String packageName = resolveInfo.activityInfo.packageName;
            return packageName;
        }
        return "Unknown";
    }

    public static String getDefaultMailAppPackageName(Context context) {
        Intent intent = new Intent(Intent.ACTION_SENDTO);
        intent.setData(android.net.Uri.parse("mailto:")); // Mailto scheme

        PackageManager packageManager = context.getPackageManager();
        List<ResolveInfo> resolveInfos = packageManager.queryIntentActivities(intent, 0);

        if (!resolveInfos.isEmpty()) {
            ResolveInfo resolveInfo = resolveInfos.get(0);
            String packageName = resolveInfo.activityInfo.packageName;
            return packageName;
        }
        return "Unknown";
    }

    public static String getDefaultStoreAppPackageName(Context context) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(android.net.Uri.parse("market://details?id=dummy"));

        PackageManager packageManager = context.getPackageManager();
        List<ResolveInfo> resolveInfos = packageManager.queryIntentActivities(intent, 0);

        if (!resolveInfos.isEmpty()) {
            ResolveInfo resolveInfo = resolveInfos.get(0);
            String packageName = resolveInfo.activityInfo.packageName;
            return packageName;
        }
        return "Unknown";
    }

    public static String getDefaultContactsAppPackageName(Context context) {
        Intent intent = new Intent(Intent.ACTION_PICK, ContactsContract.Contacts.CONTENT_URI);

        PackageManager packageManager = context.getPackageManager();
        List<ResolveInfo> resolveInfos = packageManager.queryIntentActivities(intent, 0);

        if (!resolveInfos.isEmpty()) {
            ResolveInfo resolveInfo = resolveInfos.get(0);
            String packageName = resolveInfo.activityInfo.packageName;
            return packageName;
        }
        return "Unknown";
    }

    public static String getDefaultMusicPlayerAppPackageName(Context context) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setType("audio/*"); // Specify audio MIME type

        PackageManager packageManager = context.getPackageManager();
        List<ResolveInfo> resolveInfos = packageManager.queryIntentActivities(intent, 0);

        if (!resolveInfos.isEmpty()) {
            ResolveInfo resolveInfo = resolveInfos.get(0);
            String packageName = resolveInfo.activityInfo.packageName;
            return packageName;
        }
        return "Unknown";
    }

    public static String getDefaultGalleryAppPackageName(Context context) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(android.net.Uri.parse("content://media/external/images/media"), "image/*");

        PackageManager packageManager = context.getPackageManager();
        List<ResolveInfo> resolveInfos = packageManager.queryIntentActivities(intent, 0);

        if (!resolveInfos.isEmpty()) {
            ResolveInfo resolveInfo = resolveInfos.get(0);
            String packageName = resolveInfo.activityInfo.packageName;
            return packageName;
        }
        return "Unknown";
    }
}
