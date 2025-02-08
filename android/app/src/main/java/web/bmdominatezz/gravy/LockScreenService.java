package web.bmdominatezz.gravy;

import android.accessibilityservice.AccessibilityService;
import android.os.Build;
import android.view.accessibility.AccessibilityEvent;

public class LockScreenService extends AccessibilityService {
    public static LockScreenService instance; // static field

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this; // assign instance when connected
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) { }

    @Override
    public void onInterrupt() { }

    public void lockDevice() {
        performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN);
    }
}