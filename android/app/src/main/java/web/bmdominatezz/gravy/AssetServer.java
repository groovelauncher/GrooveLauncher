package web.bmdominatezz.gravy;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import fi.iki.elonen.NanoHTTPD;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

public class AssetServer extends NanoHTTPD {
    private static final String TAG = "AssetServer";
    private Context context;
    private AssetManager assetManager;

    public AssetServer(Context context, int port) {
        super(port);
        this.context = context;
        this.assetManager = context.getAssets();
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Log.d(TAG, "Serving request for: " + uri);

        // Remove leading slash
        if (uri.startsWith("/")) {
            uri = uri.substring(1);
        }

        // Default to index.html if root is requested
        if (uri.isEmpty()) {
            uri = "index.html";
        }

        // Handle special paths for android directory files
        if (uri.startsWith("android/")) {
            return serveAndroidFile(uri);
        }

        try {
            InputStream inputStream = assetManager.open(uri);
            String mimeType = getMimeType(uri);
            
            Log.d(TAG, "Successfully serving: " + uri + " with mime type: " + mimeType);
            return newChunkedResponse(Response.Status.OK, mimeType, inputStream);
        } catch (IOException e) {
            Log.e(TAG, "Asset not found: " + uri, e);
            return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Asset not found: " + uri);
        }
    }

    private Response serveAndroidFile(String uri) {
        try {
            // Special handling for gradle.local.properties - return empty content if not found
            if (uri.equals("android/gradle.local.properties")) {
                Log.d(TAG, "Serving empty gradle.local.properties");
                return newFixedLengthResponse(Response.Status.OK, "text/plain", "");
            }
            
            // Get the app's data directory and navigate to the project root
            File appDir = context.getFilesDir();
            // Navigate up to find the project root (this might need adjustment based on your setup)
            File projectRoot = appDir.getParentFile().getParentFile().getParentFile().getParentFile();
            
            // Remove "android/" prefix and construct the file path
            String relativePath = uri.substring(8); // Remove "android/" prefix
            File targetFile = new File(projectRoot, "android/" + relativePath);
            
            Log.d(TAG, "Attempting to serve android file: " + targetFile.getAbsolutePath());
            
            if (targetFile.exists() && targetFile.isFile()) {
                InputStream inputStream = new FileInputStream(targetFile);
                String mimeType = getMimeType(uri);
                
                Log.d(TAG, "Successfully serving android file: " + uri + " with mime type: " + mimeType);
                return newChunkedResponse(Response.Status.OK, mimeType, inputStream);
            } else {
                Log.e(TAG, "Android file not found: " + targetFile.getAbsolutePath());
                return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Android file not found: " + uri);
            }
        } catch (IOException e) {
            Log.e(TAG, "Error serving android file: " + uri, e);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "Error serving android file: " + uri);
        }
    }

    private String getMimeType(String uri) {
        if (uri.endsWith(".html")) {
            return "text/html";
        } else if (uri.endsWith(".css")) {
            return "text/css";
        } else if (uri.endsWith(".js")) {
            return "application/javascript";
        } else if (uri.endsWith(".png")) {
            return "image/png";
        } else if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (uri.endsWith(".svg")) {
            return "image/svg+xml";
        } else if (uri.endsWith(".webp")) {
            return "image/webp";
        } else if (uri.endsWith(".json")) {
            return "application/json";
        } else if (uri.endsWith(".properties")) {
            return "text/plain";
        } else if (uri.endsWith(".woff") || uri.endsWith(".woff2")) {
            return "font/woff";
        } else if (uri.endsWith(".ttf")) {
            return "font/ttf";
        }
        return "application/octet-stream";
    }

    public void startServer() {
        try {
            start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
            Log.d(TAG, "Asset server started on port " + getListeningPort());
        } catch (IOException e) {
            Log.e(TAG, "Failed to start asset server", e);
        }
    }

    public void stopServer() {
        stop();
        Log.d(TAG, "Asset server stopped");
    }

    public String getServerUrl() {
        return "http://localhost:" + getListeningPort() + "/";
    }
}