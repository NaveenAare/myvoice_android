package com.speakcharai.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.getcapacitor.Plugin;
import java.util.ArrayList;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this);
        
        // Register plugins
        this.registerPlugin(PushNotificationsPlugin.class);
    }
}
