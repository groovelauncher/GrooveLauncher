package web.bmdominatezz.gravyservicestest;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import web.bmdominatezz.gravyservices.GravyClient;

public class MainActivity extends AppCompatActivity {
    GravyClient gravyClient;
    // Declare TextView variables for both keys and values
    private TextView keyAndroidVersion, valueAndroidVersion;
    private TextView keyGravyHostVersion, valueGravyHostVersion;
    private TextView keyGravyClientVersion, valueGravyClientVersion;
    private TextView keyTheme, valueTheme;
    private TextView keyUIScale, valueUIScale;
    private TextView keyAccentColor, valueAccentColor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });


        // Initialize the TextViews by finding them by ID
        keyAndroidVersion = findViewById(R.id.key_android_version);
        valueAndroidVersion = findViewById(R.id.value_android_version);

        keyGravyHostVersion = findViewById(R.id.key_gravy_host_version);
        valueGravyHostVersion = findViewById(R.id.value_gravy_host_version);

        keyGravyClientVersion = findViewById(R.id.key_gravy_client_version);
        valueGravyClientVersion = findViewById(R.id.value_gravy_client_version);

        keyUIScale = findViewById(R.id.key_ui_scale);
        valueUIScale = findViewById(R.id.value_ui_scale);

        keyTheme = findViewById(R.id.key_theme);
        valueTheme = findViewById(R.id.value_theme);

        keyAccentColor = findViewById(R.id.key_accent_color);
        valueAccentColor = findViewById(R.id.value_accent_color);

        // Set the values dynamically
        updateValues(getAndroidVersion(), "4.5.6", GravyClient.version.getVersion(), "Dark", "Light");
        gravyClient = new GravyClient() {
            @Override
            public void onReceive(Context context, Intent intent) {
                super.onReceive(context, intent);
                Log.d("GravyClient", "Received response: " + intent.getStringExtra("response_key"));
            }

            @Override
            public void applyUIScale(String uiScale) {
                super.applyUIScale(uiScale);
                valueUIScale.setText(uiScale);
            }

            @Override
            public void applyTheme(String theme) {
                super.applyTheme(theme);
                valueTheme.setText(theme);
            }

            @Override
            public void applyAccentColor(String accentColor) {
               super.applyAccentColor(accentColor);
               valueAccentColor.setText(accentColor);
            }

        };
        gravyClient.init(this);
        gravyClient.start();
        onButtonRefresh();
    }

    private String getAndroidVersion() {
        try {
            // Get the version of the Android OS
            String versionName = Build.VERSION.RELEASE; // Gets the version release string
            int sdkVersion = Build.VERSION.SDK_INT; // Gets the SDK version (API level)

            // Return a string with the version name and SDK level
            return "Android " + versionName + " (API " + sdkVersion + ")";
        } catch (Exception e) {
            // If an exception occurs, return a default value
            return "Unknown";
        }
    }

    private void updateValues(String androidVer, String gravyHostVer,
                              String gravyClientVer, String themeValue, String accentColorValue) {
        /*
        valueAndroidVersion.setText(androidVer);
        valueGravyHostVersion.setText(gravyHostVer);
        valueGravyClientVersion.setText(gravyClientVer);
        valueTheme.setText(themeValue);
        valueAccentColor.setText(accentColorValue);*/
    }
    public void onButtonRefresh(View view){
        onButtonRefresh();
    }
    public void onButtonRefresh(){
        valueAndroidVersion.setText(getAndroidVersion());
        valueGravyClientVersion.setText(GravyClient.version.getVersion());
        gravyClient.requestConfig();
    }
}