package web.bmdominatezz.gravy;

import android.content.ContentResolver;
import android.content.Context;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.provider.ContactsContract;
import android.provider.MediaStore;

import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class GrooveExperience {
    public static String getContacts(Context mainActivity) throws JSONException {
        JSONArray contacts = new JSONArray();

        // Check for READ_CONTACTS permission
        if (ContextCompat.checkSelfPermission(mainActivity,
                android.Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
            // Permission not granted, return empty JSON array
            return contacts.toString();
        }

        ContentResolver contentResolver = mainActivity.getContentResolver();
        Cursor cursor = contentResolver.query(ContactsContract.Contacts.CONTENT_URI, null, null, null, null);

        int contactCount = 0; // Initialize contact counter

        if (cursor != null && cursor.getCount() > 0) {
            while (cursor.moveToNext() && contactCount < 500) { // Limit to 500 contacts
                int idIndex = cursor.getColumnIndex(ContactsContract.Contacts._ID);
                int nameIndex = cursor.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME_PRIMARY);
                int photoUriIndex = cursor.getColumnIndex(ContactsContract.Contacts.PHOTO_URI);

                // Check if the column indexes are valid
                if (idIndex != -1 && nameIndex != -1 && photoUriIndex != -1) {
                    String id = cursor.getString(idIndex); // This is the contact ID
                    String name = cursor.getString(nameIndex);
                    String photoUri = cursor.getString(photoUriIndex);
                    boolean hasAvatar = (photoUri != null);

                    // Query for the phone number associated with this contact
                    Cursor phoneCursor = contentResolver.query(
                            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                            null,
                            ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = ?",
                            new String[] { id },
                            null);

                    String phoneNumber = "";
                    if (phoneCursor != null && phoneCursor.moveToFirst()) {
                        int phoneIndex = phoneCursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);
                        if (phoneIndex != -1) {
                            phoneNumber = phoneCursor.getString(phoneIndex);
                        }
                        phoneCursor.close();
                    }

                    JSONObject contact = new JSONObject();
                    contact.put("name", name);
                    contact.put("id", phoneNumber); // Use phone number as ID
                    contact.put("hasAvatar", hasAvatar);
                    contacts.put(contact);
                    contactCount++; // Increment the contact counter
                }
            }
            cursor.close();
        }

        return contacts.toString();
    }

    public static String getPhotos(Context mainActivity) throws JSONException {
        // Check for READ_MEDIA_IMAGES and READ_EXTERNAL_STORAGE permissions
        if (ContextCompat.checkSelfPermission(mainActivity, 
                android.Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(mainActivity, 
                android.Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            // Permission not granted, return empty JSON array
            return new JSONArray().toString(); // Return an empty array if permissions are not granted
        }

        JSONArray photos = new JSONArray();
        ContentResolver contentResolver = mainActivity.getContentResolver();

        // Query the MediaStore for images
        Cursor cursor = contentResolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                null,
                null,
                null,
                MediaStore.Images.Media.DATE_TAKEN + " DESC" // Order by date taken
        );

        int photoCount = 0; // Initialize photo counter

        if (cursor != null && cursor.getCount() > 0) {
            while (cursor.moveToNext() && photoCount < 500) { // Limit to 500 photos
                int idIndex = cursor.getColumnIndex(MediaStore.Images.Media._ID);
                int uriIndex = cursor.getColumnIndex(MediaStore.Images.Media.DATA);

                if (idIndex != -1 && uriIndex != -1) {
                    String id = cursor.getString(idIndex); // This is the photo ID
                    String photoUri = cursor.getString(uriIndex); // This is the photo URI

                    JSONObject photo = new JSONObject();
                    photo.put("id", id);
                    photo.put("uri", photoUri);
                    photos.put(photo);
                    photoCount++; // Increment the photo counter
                }
            }
            cursor.close();
        }

        return photos.toString();
    }
}
