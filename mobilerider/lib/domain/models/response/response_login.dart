
import 'package:restaurant/domain/models/response/address_one_response.dart';

class ResponseLogin {

  final bool resp;
  final String msg;
  final User user;
  final String token;

  ResponseLogin({
    required this.resp,
    required this.msg,
    required this.token,
    required this.user,
  });

  factory ResponseLogin.fromJson(Map<String, dynamic> json) => ResponseLogin(
    resp: json["resp"],
    msg: json["msg"],
    user: User.fromJson(json["user"] ?? {}),
    token: json["token"] ?? '',
  );

}

class User {
    
  final String uid;
  final String name;
  final String firstName;
  final String lastName;
  final String image;
  final String email;
  final String phone;
  final int rolId;
  final String notificationToken;
  final Address? address; // Add this
  final bool? isSeller; // Add this property
  final String? shopName; // Add this property
  final bool isApproved; // Add this property

  // Address fields
  final String country;
  final String street;
  final String region;
  final String province;
  final String municipality;
  final String barangay;
  final String zip;

  User({
    required this.uid,
    required this.name,
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.image,
    required this.email,
    required this.rolId,
    required this.notificationToken,
    this.address,
    this.country = '',
    this.street = '',
    this.region = '',
    this.province = '',
    this.municipality = '',
    this.barangay = '',
    this.zip = '',
    this.isSeller,
    this.shopName,
    this.isApproved = true, // Default to true
  });

  factory User.fromJson(Map<String, dynamic> json) {
  final Map<String, dynamic>? addressData = 
      json["address"] is Map<String, dynamic> ? json["address"] : null;
      
  return User(
    uid: json["uid"] ?? json["_id"] ?? '',
    name: json["name"] ?? '',
    firstName: json["firstName"] ?? '',
    lastName: json["lastName"] ?? '',
    phone: json["phone"] ?? '',
    image: json["image"] ?? '',
    email: json["email"] ?? '',
    rolId: json["rolId"] ?? 0,
    isApproved: json['isApproved'] ?? true,
    isSeller: json['isSeller'] ?? false,
    shopName: json['shopName'],
    notificationToken: json["notification_token"] ?? '',
    address: addressData != null ? Address.fromJson(addressData) : null,
    // Parse address fields
    country: json["country"] ?? addressData?["country"] ?? '',
    street: json["street"] ?? addressData?["street"] ?? '',
    region: json["region"] ?? addressData?["region"] ?? '',
    province: json["province"] ?? addressData?["province"] ?? '',
    municipality: json["municipality"] ?? addressData?["municipality"] ?? '',
    barangay: json["barangay"] ?? addressData?["barangay"] ?? '',
    zip: json["zip"] ?? addressData?["zip"] ?? '',
  );
}

  @override
  String toString() {
    return '{uid: $uid, email: $email, rolId: $rolId, name: $name, firstName: $firstName, lastName: $lastName, phone: $phone, image: $image, notificationToken: $notificationToken, address: {country: $country, street: $street, region: $region, province: $province, municipality: $municipality, barangay: $barangay, zip: $zip}}';
  }

  // Helper method to get formatted address
  String getFormattedAddress() {
    List<String> addressParts = [];
    if (street.isNotEmpty) addressParts.add(street);
    if (barangay.isNotEmpty) addressParts.add(barangay);
    if (municipality.isNotEmpty) addressParts.add(municipality);
    if (province.isNotEmpty) addressParts.add(province);
    if (region.isNotEmpty) addressParts.add(region);
    if (country.isNotEmpty) addressParts.add(country);
    if (zip.isNotEmpty) addressParts.add('ZIP: $zip');
    
    return addressParts.join(', ');
  }
}