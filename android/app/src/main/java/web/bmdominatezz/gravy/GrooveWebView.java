package web.bmdominatezz.gravy;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.AdaptiveIconDrawable;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.icu.text.SimpleDateFormat;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.Parcelable;
import android.provider.MediaStore;
import android.util.AttributeSet;
import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.RequiresApi;
import androidx.constraintlayout.helper.widget.Layer;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import web.bmdominatezz.gravy.Utils.*;
import web.bmdominatezz.gravy.MainActivity;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CountDownLatch;

public class GrooveWebView extends WebView {
    private Context m_context;
    public List<ResolveInfo> retrievedApps;
    PackageManager packageManager;
    public Insets lastInsets;
    WebEvents webEvents;

    public String evaluateJavascriptSync(final String script) throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        final String[] resultHolder = new String[1];

        this.post(() -> this.evaluateJavascript(script, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                resultHolder[0] = value;
                latch.countDown();
            }
        }));

        try {
            latch.await();  // Wait until the JavaScript result is available
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return resultHolder[0];
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    public Bitmap getAppIcon(PackageManager mPackageManager, String packageName) {
        Drawable drawable = null;
        try {
            drawable = mPackageManager.getApplicationIcon(packageName);
        } catch (PackageManager.NameNotFoundException e) {
            Log.d("groovelauncher", "getAppIcon:  OLMADI " + packageName);
            throw new RuntimeException(e);
        }

        if (drawable instanceof BitmapDrawable) {
            return ((BitmapDrawable) drawable).getBitmap();
        } else if (drawable instanceof AdaptiveIconDrawable) {
            Drawable foregroundDr = ((AdaptiveIconDrawable) drawable).getForeground();

            if (foregroundDr == null) {
                Bitmap transparentBitmap = Bitmap.createBitmap(10, 10, Bitmap.Config.ARGB_8888);
                transparentBitmap.eraseColor(android.graphics.Color.TRANSPARENT);
                return transparentBitmap;
            } else {
                double zoom = 1.5;
                // Create a bitmap with specified width and height
                Bitmap bitmap = Bitmap.createBitmap(200, 200, Bitmap.Config.ARGB_8888);
                // Create a canvas to draw on the bitmap
                Canvas canvas = new Canvas(bitmap);
                // Calculate the size after zoom
                int width = (int) (canvas.getWidth() * zoom);
                int height = (int) (canvas.getHeight() * zoom);
                // Calculate the offsets to center the zoomed drawable
                int offsetX = (canvas.getWidth() - width) / 2;
                int offsetY = (canvas.getHeight() - height) / 2;
                // Set the bounds of the drawable with zoom
                foregroundDr.setBounds(offsetX, offsetY, offsetX + width, offsetY + height);
                // Draw the drawable onto the canvas
                foregroundDr.draw(canvas);
                return bitmap;
            }


        }
        Log.d("groovalauncher", "getAppIcon: invalid " + packageName);
        return null;


    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    public Bitmap getAppIconBackground(PackageManager mPackageManager, String packageName) {
        Drawable drawable = null;
        try {
            drawable = mPackageManager.getApplicationIcon(packageName);
        } catch (PackageManager.NameNotFoundException e) {
            Log.d("groovelauncher", "getAppIcon:  OLMADI " + packageName);
            throw new RuntimeException(e);
        }
        if (drawable instanceof AdaptiveIconDrawable) {
            Drawable foregroundDr = ((AdaptiveIconDrawable) drawable).getBackground();
            if (foregroundDr == null) {
                Bitmap transparentBitmap = Bitmap.createBitmap(10, 10, Bitmap.Config.ARGB_8888);
                transparentBitmap.eraseColor(android.graphics.Color.TRANSPARENT);
                return transparentBitmap;
            } else {
                Bitmap bitmap = Bitmap.createBitmap(200, 200, Bitmap.Config.ARGB_8888);
                Canvas canvas = new Canvas(bitmap);
                foregroundDr.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                foregroundDr.draw(canvas);
                return bitmap;
            }

        }
        Bitmap transparentBitmap = Bitmap.createBitmap(10, 10, Bitmap.Config.ARGB_8888);
        transparentBitmap.eraseColor(android.graphics.Color.TRANSPARENT);
        return transparentBitmap;


    }

    public GrooveWebView(Context context) {
        super(context);
        m_context = context;
    }

    public GrooveWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        m_context = context;
    }

    public GrooveWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        m_context = context;
    }

    public void retrieveApps() {
        // are these categories even enough 💀 idk hope it is
        final Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        retrievedApps = packageManager.queryIntentActivities(mainIntent, 0);
    }

    public void init(PackageManager pm, MainActivity mainActivity) {
        packageManager = pm;
        webEvents = new WebEvents(m_context, this);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(m_context))
                .build();

        this.setWebViewClient(new WebViewClientCompat() {


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

                if (segments.length == 4 && "icons".equals(segments[2])) {
                    String iconFileName = segments[3];
                    if (iconFileName.length() > 5) {
                        String iconPackageName = iconFileName.substring(0, iconFileName.length() - 5);
                        Intent intent = packageManager.getLaunchIntentForPackage(iconPackageName);
                        if (intent != null) {
                            ResolveInfo resolveInfo = packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);
                            if (resolveInfo != null) {
                                // Drawable appIcon = resolveInfo.loadIcon(packageManager);
                                // AdaptiveIconGenerator generator = new AdaptiveIconGenerator(m_context, appIcon);
                                // Generate the adaptive icon
                                // Drawable resultDrawable = generator.generateIcon();
                                InputStream inputStream = null;
                                Bitmap dra = getAppIcon(packageManager, iconPackageName);
                                if (dra != null) inputStream = Utils.loadBitmapAsStream(dra);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/webp", "UTF-8", inputStream);
                                }
                            } else {
                                Log.d("ResolveInfo", "No resolve info found.");
                            }
                        } else {
                            Log.d("ResolveInfo", "Intent is null. Package may not be installed.");
                        }

                       /* couldnt decide which one is faster :(
                        for (ResolveInfo resolveInfo : retrievedApps) {
                            if (iconPackageName.equals(resolveInfo.activityInfo.packageName)) {

                                Drawable appIcon = resolveInfo.activityInfo.loadIcon(packageManager);

                                InputStream inputStream = loadDrawableAsStream(appIcon);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/png", "UTF-8", inputStream);
                                }
                            }
                        }*/


                    } else {

                    }

                } else if (segments.length == 4 && "icons-bg".equals(segments[2])) {
                    String iconFileName = segments[3];
                    if (iconFileName.length() > 5) {
                        String iconPackageName = iconFileName.substring(0, iconFileName.length() - 5);
                        Intent intent = packageManager.getLaunchIntentForPackage(iconPackageName);
                        if (intent != null) {
                            ResolveInfo resolveInfo = packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);
                            if (resolveInfo != null) {
                                InputStream inputStream = null;
                                Bitmap dra = getAppIconBackground(packageManager, iconPackageName);
                                if (dra != null) inputStream = Utils.loadBitmapAsStream(dra);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/webp", "UTF-8", inputStream);
                                }
                            } else {
                                Log.d("ResolveInfo", "No resolve info found.");
                            }
                        } else {
                            Log.d("ResolveInfo", "Intent is null. Package may not be installed.");
                        }
                    } else {

                    }

                }

                return assetLoader.shouldInterceptRequest(requestUri);
            }
        });
        this.setWebChromeClient(new WebChromeClient() {

            // For Android 5.0+
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> filePath,
                                             FileChooserParams fileChooserParams) {
                mainActivity.activityDispatchEvent = false;

                if (mainActivity.mFilePathCallback != null) {
                    mainActivity.mFilePathCallback.onReceiveValue(null);
                }
                mainActivity.mFilePathCallback = filePath;

                // Check if the accept type is for font files
                String[] acceptTypes = fileChooserParams.getAcceptTypes();
                boolean isFontFile = acceptTypes != null && acceptTypes.length > 0 &&
                        (acceptTypes[0].contains("font") ||
                                acceptTypes[0].equals(".ttf") ||
                                acceptTypes[0].equals(".otf") ||
                                acceptTypes[0].equals(".woff") ||
                                acceptTypes[0].equals(".woff2"));

                Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);

                if (isFontFile) {
                    // If it's a font file, accept font file types
                    contentSelectionIntent.setType("font/*");
                    contentSelectionIntent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{
                            "application/x-font-ttf",
                            "application/x-font-woff",
                            "application/x-font-woff2",
                            "font/otf",
                            "font/ttf",
                            "font/woff",
                            "font/woff2"});
                } else {
                    // If it's not a font file, fall back to image chooser
                    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    File photoFile = null;
                    try {
                        photoFile = createImageFile();
                        takePictureIntent.putExtra("PhotoPath", mainActivity.mCameraPhotoPath);
                    } catch (IOException ex) {
                        Log.e(mainActivity.TAG, "Unable to create Image File", ex);
                    }

                    if (photoFile != null) {
                        mainActivity.mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(photoFile));
                    } else {
                        takePictureIntent = null;
                    }

                    contentSelectionIntent.setType("image/*");

                    Intent[] intentArray = takePictureIntent != null ? new Intent[]{takePictureIntent} : new Intent[0];
                    Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                    chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);
                    chooserIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    chooserIntent.putExtra(Intent.EXTRA_TITLE, "File Chooser");
                    mainActivity.startActivityForResult(chooserIntent, mainActivity.INPUT_FILE_REQUEST_CODE);
                    return true;
                }

                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Font Chooser");
                mainActivity.startActivityForResult(chooserIntent, mainActivity.INPUT_FILE_REQUEST_CODE);
                return true;
            }

            // openFileChooser for Android 3.0+
            public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType) {
                mainActivity.activityDispatchEventAutoTimeout();
                mainActivity.mUploadMessage = uploadMsg;

                if (acceptType.contains("font")) {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("font/*");
                    i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{
                            "application/x-font-ttf",
                            "application/x-font-woff",
                            "application/x-font-woff2",
                            "font/otf",
                            "font/ttf",
                            "font/woff",
                            "font/woff2"
                    });
                    Intent chooserIntent = Intent.createChooser(i, "Font Chooser");
                    mainActivity.startActivityForResult(chooserIntent, mainActivity.FILECHOOSER_RESULTCODE);
                } else {
                    // Default to image chooser
                    File imageStorageDir = new File(
                            Environment.getExternalStoragePublicDirectory(
                                    Environment.DIRECTORY_PICTURES),
                            "AndroidExampleFolder");
                    if (!imageStorageDir.exists()) {
                        imageStorageDir.mkdirs();
                    }
                    File file = new File(
                            imageStorageDir + File.separator + "IMG_" + System.currentTimeMillis() + ".jpg");
                    mainActivity.mCapturedImageURI = Uri.fromFile(file);

                    Intent captureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, mainActivity.mCapturedImageURI);

                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("image/*");

                    Intent chooserIntent = Intent.createChooser(i, "Image Chooser");
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Parcelable[]{captureIntent});
                    mainActivity.startActivityForResult(chooserIntent, mainActivity.FILECHOOSER_RESULTCODE);
                }
            }

            // openFileChooser for Android < 3.0
            public void openFileChooser(ValueCallback<Uri> uploadMsg) {
                openFileChooser(uploadMsg, "");
            }

            // openFileChooser for other Android versions
            public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType, String capture) {
                openFileChooser(uploadMsg, acceptType);
            }
        });

        WebSettings webViewSettings = this.getSettings();
        webViewSettings.setJavaScriptEnabled(true);
        webViewSettings.setDomStorageEnabled(true);

        // Assets are hosted under http(s)://appassets.androidplatform.net/assets/... .
        this.addJavascriptInterface(new WebInterface((MainActivity) mainActivity, this), "Groove");

        this.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        retrieveApps();
    }

    private File createImageFile() throws IOException {
        // Create an image file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_PICTURES);
        File imageFile = File.createTempFile(
                imageFileName, /* prefix */
                ".jpg", /* suffix */
                storageDir /* directory */
        );
        return imageFile;
    }
}
