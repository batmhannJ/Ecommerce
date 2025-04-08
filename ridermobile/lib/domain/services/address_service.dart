import 'package:http/http.dart' as http;
import 'dart:convert';

class AddressService {
  final String baseUrl;

  AddressService(this.baseUrl);

  Future<List<dynamic>> regions() async {
    final response = await http.get(Uri.parse('$baseUrl/region.json'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load regions');
  }

  Future<List<dynamic>> provinces(String regionCode) async {
    final response = await http.get(Uri.parse('$baseUrl/province.json'));
    if (response.statusCode == 200) {
      final provinces = json.decode(response.body) as List<dynamic>;
      return provinces.where((p) => p['region_code'] == regionCode).toList();
    }
    throw Exception('Failed to load provinces');
  }

  Future<List<dynamic>> cities(String provinceCode) async {
    final response = await http.get(Uri.parse('$baseUrl/city.json'));
    if (response.statusCode == 200) {
      final cities = json.decode(response.body) as List<dynamic>;
      return cities.where((c) => c['province_code'] == provinceCode).toList();
    }
    throw Exception('Failed to load cities');
  }

  Future<List<dynamic>> barangays(String cityCode) async {
    final response = await http.get(Uri.parse('$baseUrl/barangay.json'));
    if (response.statusCode == 200) {
      final barangays = json.decode(response.body) as List<dynamic>;
      return barangays.where((b) => b['city_code'] == cityCode).toList();
    }
    throw Exception('Failed to load barangays');
  }
}