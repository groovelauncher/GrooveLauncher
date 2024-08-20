package web.bmdominatezz.gravy;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;

import java.util.HashMap;
import java.util.Map;

public class AdaptiveIconGenerator {

    private Context context;
    private Drawable maskedDrawable;
    private int outputSize = 500;

    public AdaptiveIconGenerator(Context context, Drawable maskedDrawable) {
        this.context = context;
        this.maskedDrawable = maskedDrawable;
    }

    public Drawable generateIcon() {
        // Convert Drawable to Bitmap
        Bitmap bitmap = drawableToBitmap(maskedDrawable);

        // Resize Bitmap to the specified outputSize
        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, outputSize, outputSize, true);

        // Calculate the most used color
        int mostUsedColor = calculateMostUsedColor(resizedBitmap);

        // Create a mutable Bitmap with the resized dimensions
        Bitmap mutableBitmap = resizedBitmap.copy(Bitmap.Config.ARGB_8888, true);

        // Create a Canvas to draw on the mutable Bitmap
        Canvas canvas = new Canvas(mutableBitmap);

        // Paint to fill the transparent parts
        Paint paint = new Paint();
        paint.setColor(mostUsedColor);
        paint.setStyle(Paint.Style.FILL);

        // Use a PorterDuffXfermode to fill the transparent areas
        Rect rect = new Rect(0, 0, mutableBitmap.getWidth(), mutableBitmap.getHeight());
        canvas.drawRect(rect, paint);
        canvas.drawBitmap(resizedBitmap, 0, 0, null);

        // Return a new Drawable from the modified Bitmap
        return new BitmapDrawable(context.getResources(), mutableBitmap);
    }

    private Bitmap drawableToBitmap(Drawable drawable) {
        if (drawable instanceof BitmapDrawable) {
            return ((BitmapDrawable) drawable).getBitmap();
        }
        Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
        drawable.draw(canvas);
        return bitmap;
    }

    private Bitmap resizeBitmap(Bitmap bitmap, int maxWidth, int maxHeight) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        float aspectRatio = (float) width / height;

        if (width > maxWidth || height > maxHeight) {
            if (aspectRatio > 1) {
                height = (int) (maxWidth / aspectRatio);
                width = maxWidth;
            } else {
                width = (int) (maxHeight * aspectRatio);
                height = maxHeight;
            }
        }

        return Bitmap.createScaledBitmap(bitmap, width, height, true);
    }

    private int calculateMostUsedColor(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int pixelCount = width * height;
        int[] pixels = new int[pixelCount];

        // Sample every nth pixel
        int sampleRate = 20; // Adjust this value as needed
        int sampledPixelCount = 0;
        for (int y = 0; y < height; y += sampleRate) {
            for (int x = 0; x < width; x += sampleRate) {
                pixels[sampledPixelCount++] = bitmap.getPixel(x, y);
            }
        }

        Map<Integer, Integer> colorCountMap = new HashMap<>();
        for (int i = 0; i < sampledPixelCount; i++) {
            int color = pixels[i];
            if (Color.alpha(color) > 0) {
                colorCountMap.put(color, colorCountMap.getOrDefault(color, 0) + 1);
            }
        }

        int mostUsedColor = Color.WHITE;
        int maxCount = 0;
        for (Map.Entry<Integer, Integer> entry : colorCountMap.entrySet()) {
            if (entry.getValue() > maxCount) {
                mostUsedColor = entry.getKey();
                maxCount = entry.getValue();
            }
        }

        return mostUsedColor;
    }
}