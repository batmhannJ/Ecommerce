import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:restaurant/domain/services/address_service.dart';
class AddressOneResponse {
  final bool resp;
  final String msg;
  final Address address;

  AddressOneResponse({
    required this.resp,
    required this.msg,
    required this.address,
  });

  factory AddressOneResponse.fromJson(Map<String, dynamic> json) => AddressOneResponse(
    resp: json["resp"] ?? false,
    msg: json["msg"] ?? '',
    address: Address.fromJson(json["address"] ?? {}),
  );
}

class AddressHelper {
  static final AddressService _addressService =
      AddressService('https://isaacdarcilla.github.io/philippine-addresses');
  static List<dynamic> _regions = [];
  static List<dynamic> _provinces = [];
  static List<dynamic> _cities = [];
  static List<dynamic> _barangays = [];

  // Initialize the address data
  static Future<void> initialize() async {
    try {
      _regions = await _addressService.regions();
      _provinces = await _addressService.provinces(''); // Fetch all provinces initially
      _cities = await _addressService.cities(''); // Fetch all cities initially
      _barangays = await _addressService.barangays(''); // Fetch all barangays initially
    } catch (e) {
      print('Error initializing address data: $e');
    }
  }

  static String getRegionName(String? regionCode) {
    final region = _regions.firstWhere(
      (r) => r['region_code'] == regionCode,
      orElse: () => {'region_name': 'Unknown Region'},
    );
    return region['region_name'] as String? ?? 'Unknown Region';
  }

  static String getProvinceName(String? provinceCode) {
    final province = _provinces.firstWhere(
      (p) => p['province_code'] == provinceCode,
      orElse: () => {'province_name': 'Unknown Province'},
    );
    return province['province_name'] as String? ?? 'Unknown Province';
  }

  static String getCityName(String? cityCode) {
    final city = _cities.firstWhere(
      (c) => c['city_code'] == cityCode,
      orElse: () => {'city_name': 'Unknown City'},
    );
    return city['city_name'] as String? ?? 'Unknown City';
  }

  static String getBarangayName(String? barangayCode) {
    final barangay = _barangays.firstWhere(
      (b) => b['brgy_code'] == barangayCode,
      orElse: () => {'brgy_name': 'Unknown Barangay'},
    );
    return barangay['brgy_name'] as String? ?? 'Unknown Barangay';
  }

  // Helper to fetch provinces for a specific region
  static Future<void> fetchProvinces(String regionCode) async {
    _provinces = await _addressService.provinces(regionCode);
  }

  // Helper to fetch cities for a specific province
  static Future<void> fetchCities(String provinceCode) async {
    _cities = await _addressService.cities(provinceCode);
  }

  // Helper to fetch barangays for a specific city
  static Future<void> fetchBarangays(String cityCode) async {
    _barangays = await _addressService.barangays(cityCode);
  }
}

class Address {
  final String country;
  final String region;
  final String province;
  final String municipality;
  final String barangay;
  final String zip;
  final int id;
  final String street;
  final String reference;
  final String latitude;
  final String longitude;
  final int personaId;

  Address({
    required this.country,
    required this.region,
    required this.province,
    required this.municipality,
    required this.barangay,
    required this.zip,
    required this.id,
    required this.street,
    required this.reference,
    required this.latitude,
    required this.longitude,
    required this.personaId,
  });

  factory Address.fromJson(Map<String, dynamic> json) => Address(
    id: json["id"] as int? ?? 0, // Default to 0 if missing or null
    street: json["street"] as String? ?? '',
    reference: json["reference"] as String? ?? '',
    latitude: json["latitude"] as String? ?? json["Latitude"] as String? ?? '', // Handle both cases
    longitude: json["longitude"] as String? ?? json["Longitude"] as String? ?? '', // Handle both cases
    personaId: json["persona_id"] as int? ?? 0, // Default to 0 if missing or null
    country: json["country"] as String? ?? '',
    region: json["region"] as String? ?? '',
    province: json["province"] as String? ?? '',
    municipality: json["municipality"] as String? ?? '',
    barangay: json["barangay"] as String? ?? '',
    zip: json["zip"] as String? ?? '',
  );

  // Helper method to get formatted address
 String getFormattedAddress() {
    final regionName = AddressHelper.getRegionName(region);
    final provinceName = AddressHelper.getProvinceName(province);
    final cityName = AddressHelper.getCityName(municipality);
    final barangayName = AddressHelper.getBarangayName(barangay);

    List<String> parts = [];
    if (street.isNotEmpty) parts.add(street);
    if (barangayName != 'Unknown Barangay') parts.add(barangayName);
    if (cityName != 'Unknown City') parts.add(cityName);
    if (provinceName != 'Unknown Province') parts.add(provinceName);
    if (regionName != 'Unknown Region') parts.add(regionName);
    if (country.isNotEmpty) parts.add(country);
    if (zip.isNotEmpty) parts.add('ZIP: $zip');
    return parts.join(', ');
  }
}