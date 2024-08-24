package web.bmdominatezz.gravy;

import android.os.Handler;
import android.os.Looper;

public class TimerUtils {

    // setTimeout implementation
    public static Handler setTimeout(Runnable runnable, int delay) {
        Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(runnable, delay);
        return handler;
    }

    // clearTimeout implementation
    public static void clearTimeout(Handler handler) {
        handler.removeCallbacksAndMessages(null);
    }

    // setInterval implementation
    public static Handler setInterval(Runnable runnable, int interval) {
        Handler handler = new Handler(Looper.getMainLooper());
        Runnable runnableTask = new Runnable() {
            @Override
            public void run() {
                runnable.run();
                handler.postDelayed(this, interval);
            }
        };
        handler.postDelayed(runnableTask, interval);
        return handler;
    }

    // clearInterval implementation
    public static void clearInterval(Handler handler) {
        handler.removeCallbacksAndMessages(null);
    }
}