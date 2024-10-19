package web.bmdominatezz.gravy;

import android.content.Context;
import android.content.pm.PackageManager;
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
                }else{
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
}