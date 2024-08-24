package web.bmdominatezz.gravy;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.drawable.Drawable;
import android.icu.text.SimpleDateFormat;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
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

public class GrooveWebView extends WebView {
    private Context m_context;
    public List<ResolveInfo> retrievedApps;
    PackageManager packageManager;
    public Insets lastInsets;
    WebEvents webEvents;

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
                                Drawable appIcon = resolveInfo.loadIcon(packageManager);
                                AdaptiveIconGenerator generator = new AdaptiveIconGenerator(m_context, appIcon);
                                // Generate the adaptive icon
                                Drawable resultDrawable = generator.generateIcon();
                                InputStream inputStream = Utils.loadDrawableAsStream(resultDrawable);
                                if (inputStream != null) {
                                    return new WebResourceResponse("image/png", "UTF-8", inputStream);
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

                } else {

                }

                return assetLoader.shouldInterceptRequest(requestUri);
            }
        });
        this.setWebChromeClient(new WebChromeClient() {

            // For Android 5.0
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> filePath,
                                             FileChooserParams fileChooserParams) {
                // Double check that we don't have any existing callbacks
                mainActivity.activityDispatchEvent = false;
                if (mainActivity.mFilePathCallback != null) {
                    mainActivity.mFilePathCallback.onReceiveValue(null);
                }
                mainActivity.mFilePathCallback = filePath;
                Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                if (takePictureIntent.resolveActivity(packageManager) != null) {
                    // Create the File where the photo should go
                    File photoFile = null;
                    try {
                        photoFile = createImageFile();
                        takePictureIntent.putExtra("PhotoPath", mainActivity.mCameraPhotoPath);
                    } catch (IOException ex) {
                        // Error occurred while creating the File
                        Log.e(mainActivity.TAG, "Unable to create Image File", ex);
                    }
                    // Continue only if the File was successfully created
                    if (photoFile != null) {
                        mainActivity.mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT,
                                Uri.fromFile(photoFile));
                    } else {
                        takePictureIntent = null;
                    }
                }
                Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentSelectionIntent.setType("image/*");
                Intent[] intentArray;
                if (takePictureIntent != null) {
                    intentArray = new Intent[] { takePictureIntent };
                } else {
                    intentArray = new Intent[0];
                }
                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Image Chooser");
                chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);
                mainActivity.startActivityForResult(chooserIntent, mainActivity.INPUT_FILE_REQUEST_CODE);
                return true;
            }

            // openFileChooser for Android 3.0+
            public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType) {
                mainActivity.activityDispatchEventAutoTimeout();
                mainActivity.mUploadMessage = uploadMsg;
                // Create AndroidExampleFolder at sdcard
                // Create AndroidExampleFolder at sdcard
                File imageStorageDir = new File(
                        Environment.getExternalStoragePublicDirectory(
                                Environment.DIRECTORY_PICTURES),
                        "AndroidExampleFolder");
                if (!imageStorageDir.exists()) {
                    // Create AndroidExampleFolder at sdcard
                    imageStorageDir.mkdirs();
                }
                // Create camera captured image file path and name
                File file = new File(
                        imageStorageDir + File.separator + "IMG_"
                                + String.valueOf(System.currentTimeMillis())
                                + ".jpg");
                mainActivity.mCapturedImageURI = Uri.fromFile(file);
                // Camera capture image intent
                final Intent captureIntent = new Intent(
                        android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, mainActivity.mCapturedImageURI);
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                // Create file chooser intent
                Intent chooserIntent = Intent.createChooser(i, "Image Chooser");
                // Set camera intent to file chooser
                chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Parcelable[] { captureIntent });
                // On select image call onActivityResult method of activity
                mainActivity.startActivityForResult(chooserIntent, mainActivity.FILECHOOSER_RESULTCODE);
            }

            // openFileChooser for Android < 3.0
            public void openFileChooser(ValueCallback<Uri> uploadMsg) {
                openFileChooser(uploadMsg, "");
            }

            // openFileChooser for other Android versions
            public void openFileChooser(ValueCallback<Uri> uploadMsg,
                                        String acceptType,
                                        String capture) {
                openFileChooser(uploadMsg, acceptType);
            }

        });
        WebSettings webViewSettings = this.getSettings();
        webViewSettings.setJavaScriptEnabled(true);
        webViewSettings.setDomStorageEnabled(true);

        // Assets are hosted under http(s)://appassets.androidplatform.net/assets/... .
        this.addJavascriptInterface(new WebInterface((MainActivity) mainActivity), "Groove");

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
