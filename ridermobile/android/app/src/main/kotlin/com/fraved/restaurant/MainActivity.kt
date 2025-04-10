package com.fraved.restaurant

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import com.baseflow.permissionhandler.PermissionHandlerPlugin

class MainActivity: FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        println("Registering PermissionHandlerPlugin...")
        flutterEngine.plugins.add(PermissionHandlerPlugin())
    }
}