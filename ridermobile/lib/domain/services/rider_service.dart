import 'dart:convert';
import 'package:http/http.dart' as http;

class RiderService {
  // Base URL of your API
  static const String baseUrl = 'https://localhost:4000';

  // Get the vehicle type for a specific rider by ID
  static Future<String?> getVehicleTypeById(String riderId) async {
    try {
      // Make the API request to the public endpoint
      final response = await http.get(
        Uri.parse('$baseUrl/api/public/rider/$riderId/vehicle-type'),
        headers: {
          'Content-Type': 'application/json',
        },
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['vehicleType'];
      } else {
        print('Failed to load vehicle type: ${response.statusCode}');
        print('Response body: ${response.body}');
        return null;
      }
    } catch (e) {
      print('Error getting vehicle type: $e');
      return null;
    }
  }
}