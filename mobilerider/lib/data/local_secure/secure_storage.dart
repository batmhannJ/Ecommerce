import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class SecureStorageFrave {
  final secureStorage = FlutterSecureStorage();
  
  Future<void> persistenToken(String token) async {
    await secureStorage.write(key: 'token', value: token);
    
    // Also extract and store the user ID from the token
    try {
      final userId = await extractUserIdFromToken(token);
      if (userId != null) {
        await secureStorage.write(key: 'userId', value: userId);
      }
    } catch (e) {
      print('Error storing user ID: $e');
    }
  }

  Future<void> persistenRolId(String role) async {
    await secureStorage.write(key: 'role', value: role);
  }

  Future<String?> readRolId() async {
    return await secureStorage.read(key: 'role');
  }

  Future<String?> readToken() async {
    return await secureStorage.read(key: 'token');
  }
  
  Future<String?> readUserId() async {
    String? userId = await secureStorage.read(key: 'userId');
    
    // If userId is not stored, try to extract it from the token
    if (userId == null) {
      final token = await readToken();
      if (token != null) {
        userId = await extractUserIdFromToken(token);
        if (userId != null) {
          await secureStorage.write(key: 'userId', value: userId);
        }
      }
    }
    
    return userId;
  }

  Future<void> deleteSecureStorage() async {
    await secureStorage.delete(key: 'token');
    await secureStorage.deleteAll();
  }

  // Helper method to extract user ID from JWT token
  Future<String?> extractUserIdFromToken(String token) async {
    try {
      // Split the token into its parts
      final parts = token.split('.');
      if (parts.length != 3) {
        throw Exception('Invalid token format');
      }
      
      // Decode the payload (second part)
      String payload = parts[1];
      // Add padding if needed
      while (payload.length % 4 != 0) {
        payload += '=';
      }
      
      // Base64 decode and convert to string
      final normalized = base64Url.normalize(payload);
      final decoded = utf8.decode(base64Url.decode(normalized));
      
      // Parse JSON and extract user ID
      final Map<String, dynamic> data = jsonDecode(decoded);
      return data['user']['id'];
    } catch (e) {
      print('Error extracting user ID: $e');
      return null;
    }
  }
}

final secureStorage = SecureStorageFrave();