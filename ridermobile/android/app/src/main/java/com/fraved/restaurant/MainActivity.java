package com.fraved.restaurant;

import io.flutter.embedding.android.FlutterActivity;
import io.flutter.embedding.engine.FlutterEngine;
import com.baseflow.permissionhandler.PermissionHandlerPlugin;

public class MainActivity extends FlutterActivity {
    @Override
    public void configureFlutterEngine(FlutterEngine flutterEngine) {
        super.configureFlutterEngine(flutterEngine);
        System.out.println("Registering PermissionHandlerPlugin...");
        flutterEngine.getPlugins().add(new PermissionHandlerPlugin());
    }
}