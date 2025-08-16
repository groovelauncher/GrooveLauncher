package web.bmdominatezz.gravy;

import android.util.Log;
import org.mozilla.geckoview.GeckoSession;

/**
 * Unified Content delegate for GeckoView to handle page loading events
 * JavaScript interface is now handled by the WebExtension
 */
public class GeckoContentDelegate implements GeckoSession.ContentDelegate {
    private static final String TAG = "GeckoContentDelegate";
    private final MainActivity mainActivity;
    private final GrooveGeckoView geckoView;

    public GeckoContentDelegate(MainActivity mainActivity, GrooveGeckoView geckoView) {
        this.mainActivity = mainActivity;
        this.geckoView = geckoView;
    }

    @Override
    public void onFirstComposite(GeckoSession session) {
        Log.d(TAG, "First composite - page rendering started");
    }

    @Override
    public void onFirstContentfulPaint(GeckoSession session) {
        Log.d(TAG, "First contentful paint - WebExtension will handle JavaScript interface");
        // JavaScript interface is now handled by the WebExtension
        // No need to inject JavaScript here as the content script will do it
    }

    @Override
    public void onTitleChange(GeckoSession session, String title) {
        Log.d(TAG, "Title changed: " + title);
    }

    @Override
    public void onFocusRequest(GeckoSession session) {
        Log.d(TAG, "Focus requested");
    }

    @Override
    public void onCloseRequest(GeckoSession session) {
        Log.d(TAG, "Close requested");
    }

    @Override
    public void onFullScreen(GeckoSession session, boolean fullScreen) {
        Log.d(TAG, "Full screen: " + fullScreen);
    }

    @Override
    public void onMetaViewportFitChange(GeckoSession session, String viewportFit) {
        Log.d(TAG, "Viewport fit changed: " + viewportFit);
    }
}