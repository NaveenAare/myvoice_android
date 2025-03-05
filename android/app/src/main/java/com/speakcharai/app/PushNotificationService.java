package com.speakcharai.app;

import android.util.Log;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.Bridge;
import org.json.JSONObject;

public class PushNotificationService extends FirebaseMessagingService {
    private static final String TAG = "PushNotificationService";

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "Refreshed FCM token: " + token);
        
        try {
            // Create JSON object with token
            JSONObject tokenData = new JSONObject();
            tokenData.put("value", token);
            
            // Notify the Capacitor plugin about the new token
            Bridge bridge = getBridge();
            if (bridge != null) {
                bridge.triggerWindowJSEvent("registration", tokenData.toString());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sending token to Capacitor", e);
        }
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "Message received from: " + remoteMessage.getFrom());

        try {
            // Create notification data
            JSONObject notificationData = new JSONObject();
            if (remoteMessage.getNotification() != null) {
                notificationData.put("title", remoteMessage.getNotification().getTitle());
                notificationData.put("body", remoteMessage.getNotification().getBody());
            }
            if (remoteMessage.getData().size() > 0) {
                notificationData.put("data", new JSONObject(remoteMessage.getData()));
            }

            // Notify Capacitor about the received message
            Bridge bridge = getBridge();
            if (bridge != null) {
                bridge.triggerWindowJSEvent("pushNotificationReceived", notificationData.toString());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing message", e);
        }
    }

    private Bridge getBridge() {
        try {
            if (getApplication() instanceof com.getcapacitor.BridgeActivity) {
                return ((com.getcapacitor.BridgeActivity) getApplication()).getBridge();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting bridge", e);
        }
        return null;
    }
} 