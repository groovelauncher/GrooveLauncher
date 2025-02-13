package web.bmdominatezz.gravy;

import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.drawable.AdaptiveIconDrawable;
import android.graphics.drawable.Drawable;
import android.os.Build;

public class IconUtils {

    public static Drawable[] getAdaptiveIconLayers(Context context, String packageName) {
        PackageManager pm = context.getPackageManager();
        try {
            // Get the application icon drawable
            Drawable drawable = pm.getApplicationIcon(packageName);

            // Check if the drawable is an AdaptiveIconDrawable
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (drawable instanceof AdaptiveIconDrawable) {
                    AdaptiveIconDrawable adaptiveIcon = (AdaptiveIconDrawable) drawable;
                    return new Drawable[]{adaptiveIcon.getBackground(), adaptiveIcon.getForeground()};
                } else {
                    // Handle non-adaptive icons (just return the drawable as is or handle as needed)
                    return new Drawable[]{drawable, null}; // Return the single drawable and null for the other
                }
            } else {
                // Handle non-adaptive icons (just return the drawable as is or handle as needed)
                return new Drawable[]{drawable, null}; // Return the single drawable and null for the other
            }
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return new Drawable[]{null, null}; // Return nulls if the package is not found
        }
    }

    public static Drawable getMonochromeIcon(ResolveInfo info) {
        Context context = MainActivity.getInstance();
        if (info == null || info.activityInfo == null) {
            return null;
        }

        PackageManager pm = context.getPackageManager();

        try {
            ComponentName componentName = new ComponentName(
                    info.activityInfo.packageName,
                    info.activityInfo.name
            );

            Drawable icon = pm.getActivityIcon(componentName);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && icon instanceof AdaptiveIconDrawable) {
                AdaptiveIconDrawable adaptiveIcon = (AdaptiveIconDrawable) icon;
                Drawable monochrome = adaptiveIcon.getMonochrome();
                return monochrome;
            }

        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }

        return null;
    }

    public static boolean hasMonochromeIcon(ResolveInfo info) {
        Context context = MainActivity.getInstance();
        if (info == null || info.activityInfo == null) {
            return false;
        }

        PackageManager pm = context.getPackageManager();

        try {
            ComponentName componentName = new ComponentName(
                    info.activityInfo.packageName,
                    info.activityInfo.name
            );

            Drawable icon = pm.getActivityIcon(componentName);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && icon instanceof AdaptiveIconDrawable) {
                AdaptiveIconDrawable adaptiveIcon = (AdaptiveIconDrawable) icon;
                Drawable monochrome = adaptiveIcon.getMonochrome();
                return monochrome != null;
            }

        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }

        return false;
    }

}