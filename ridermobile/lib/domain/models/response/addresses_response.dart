
class AddressesResponse {
  final bool success;  // Changed from resp to match API 'success'
  final String? message;  // Made nullable since your API might not always return a message
  final bool? resp;
  final String? msg;
  final List<ListAddress>? listAddresses;

  AddressesResponse({
    this.message,  // Made optional
    required this.success,
    required this.resp,
    required this.msg,
    required this.listAddresses,
  });

  factory AddressesResponse.fromJson(Map<String, dynamic> json) => AddressesResponse(
    success: json["success"] as bool? ?? false,  // Default to false if null
    message: json["message"] as String?,         // Nullable
    resp: json["resp"] as bool?,                 // Nullable, not in your response
    msg: json["msg"] as String?,                 // Nullable, not in your response
    listAddresses: json["listAddresses"] != null
        ? List<ListAddress>.from(
            (json["listAddresses"] as List).map((x) => ListAddress.fromJson(x)))
        : null,  // Handle null or missing listAddresses
  );
}

class ListAddress {
    
  final String id;  // Changed from int to String to match API response
  final String street;
  final String reference;
  final double latitude;  // Changed to double to match API response numbers
  final double longitude;

  ListAddress({
    required this.id,
    required this.street,
    required this.reference,
    required this.latitude,
    required this.longitude
  });

factory ListAddress.fromJson(Map<String, dynamic> json) => ListAddress(
    id: json["id"]?.toString() ?? '',  // String in API response
    street: json["street"] ?? '',
    reference: json["reference"] ?? '',
    latitude: (json["latitude"] as num?)?.toDouble() ?? 0.0,  // Fixed key name and type
    longitude: (json["longitude"] as num?)?.toDouble() ?? 0.0,
  );
}
