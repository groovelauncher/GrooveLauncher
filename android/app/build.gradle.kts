import java.util.Properties
import java.io.FileInputStream

plugins {
    alias(libs.plugins.android.application)
}

val localProperties = Properties().apply {
    val localPropertiesFile = rootProject.file("gradle.local.properties")
    if (localPropertiesFile.exists()) {
        load(FileInputStream(localPropertiesFile))
    }
}

android {
    namespace = "web.bmdominatezz.gravy"
    compileSdk = 34

    buildFeatures {
        buildConfig = true  // Enable BuildConfig generation
    }

    defaultConfig {
        applicationId = "web.bmdominatezz.gravy"
        minSdk = 24
        targetSdk = 34
        versionCode = 49
        versionName = "0.4.9-beta.4"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // Add the API key
        buildConfigField(
            type = "String",
            name = "CAK",
            value = "\"${localProperties.getProperty("CAK", "")}\""
        )
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

dependencies {

    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    implementation(libs.webkit)
    implementation("org.nanohttpd:nanohttpd:2.3.1")
    implementation("dev.rikka.shizuku:api:13.1.5")
    implementation("dev.rikka.shizuku:provider:13.1.5")
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}