import java.util.Properties
import java.io.FileInputStream
import java.io.ByteArrayOutputStream

plugins {
    alias(libs.plugins.android.application)
}

// Helper function to get the short commit hash
fun getGitCommitHash(): String {
    val stdout = ByteArrayOutputStream()
    exec {
        commandLine("git", "rev-parse", "--short", "HEAD")
        standardOutput = stdout
    }
    return stdout.toString().trim()
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
        minSdk = 26
        targetSdk = 34
        versionCode = 55
        versionName = "0.5.5-beta.5"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Add the API key
        buildConfigField(
            type = "String",
            name = "CAK",
            value = "\"${localProperties.getProperty("CAK", "")}\""
        )
        // Add the changelog for Nightly builds
        buildConfigField(
            type = "String",
            name = "CHANGELOG",
            value = "\"${localProperties.getProperty("CHANGELOG", "")}\""
        )
    }
    
    val commitHash = getGitCommitHash()

    flavorDimensions("default")
    productFlavors {
        create("regular") {
            dimension = "default"
            // Regular build uses the default application ID
            applicationId = "web.bmdominatezz.gravy"
            manifestPlaceholders["appIcon"] = "@mipmap/icon_default"
            manifestPlaceholders["appRoundIcon"] = "@mipmap/icon_default_round"
        }
        create("debugFlavor"){
            dimension = "default"
            // Debug build uses the default application ID
            applicationId = "web.bmdominatezz.gravy.debug"
            // Override app name for debug builds
            resValue("string", "app_name", "Groove Debug")
            manifestPlaceholders["appIcon"] = "@mipmap/icon_nightly"
            manifestPlaceholders["appRoundIcon"] = "@mipmap/icon_nightly_round"
            // Use the defaultConfig’s versionName + commit hash + -debug
            versionName = "$commitHash-debug"
        }
        create("nightly") {
            dimension = "default"
            // Change package name for nightly builds
            applicationId = "web.bmdominatezz.gravy.nightly"
            // Override app name for nightly builds
            resValue("string", "app_name", "Groove Nightly")
            manifestPlaceholders["appIcon"] = "@mipmap/icon_nightly"
            manifestPlaceholders["appRoundIcon"] = "@mipmap/icon_nightly_round"
            // Use the defaultConfig’s versionName + commit hash + -nightly
            versionName = "$commitHash-nightly"
        }
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
    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
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
    implementation(project(":GravyServices"))
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
    implementation(libs.core.splashscreen)
}