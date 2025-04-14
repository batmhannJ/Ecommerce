class OrdersByStatusResponse {
  final bool resp;
  final String msg;
  final List<OrdersResponse> ordersResponse;

  OrdersByStatusResponse({
    required this.resp,
    required this.msg,
    required this.ordersResponse,
  });

  factory OrdersByStatusResponse.fromJson(Map<String, dynamic> json) => OrdersByStatusResponse(
    resp: json["resp"] ?? true,  // Provide default values when these fields are missing
    msg: json["msg"] ?? "Success",
    ordersResponse: json["orders"] != null 
      ? List<OrdersResponse>.from(json["orders"].map((x) => OrdersResponse.fromJson(x))) 
      : [],
  );
}
class OrdersResponse {
  final String id; // Map to _id
  final UserId userId; // Map to userId object
  final List<Item> items;
  final double amount;
  final Address address;
  final bool payment;
  final String status;
  final DateTime dateTime; // Map to dateTime
  final int orderId;
  final int deliveryId;
  final String delivery;
  final String deliveryImage;
  final int clientId;
  final String cliente;
  final String clientImage;
  final String clientPhone;
  final int addressId;
  final String street;
  final String reference;
  final String latitude;
  final String longitude;
  //final String status;
  final String payType;
  //final double amount;
  final DateTime currentDate;

  OrdersResponse({
    required this.id,
    required this.userId,
    required this.items,
    required this.amount,
    required this.address,
    required this.payment,
    required this.status,
    required this.dateTime,
    required this.orderId,
    required this.deliveryId,
    required this.delivery,
    required this.deliveryImage,
    required this.clientId,
    required this.cliente,
    required this.clientImage,
    required this.clientPhone,
    required this.addressId,
    required this.street,
    required this.reference,
    required this.latitude,
    required this.longitude,
    //required this.status,
    required this.payType,
    //required this.amount,
    required this.currentDate,
  });factory OrdersResponse.fromJson(Map<String, dynamic> json) => OrdersResponse(
  id: json['_id']?.toString() ?? '',
  // Handle the case where userId might be a string, an object with just id, or a full user object
  userId: json['userId'] != null ? UserId.fromJson(json['userId']) : UserId(id: '', name: '', phone: '', email: ''),
  // Handle items array that might be missing
  items: json['items'] != null 
    ? List<Item>.from((json['items'] as List).map((item) => Item.fromJson(item))) 
    : [],
  // Convert numeric amount to double, with fallback to 0.0
  amount: json['amount'] != null ? (json['amount'] as num).toDouble() : 0.0,
  // Updated address handling using your existing Address.fromJson method
  address: json['address'] != null ? Address.fromJson(json['address']) : Address(id: ''),
  // Handle boolean with fallback
  payment: json['payment'] ?? false,
  status: json['status'] ?? '',
  // Handle datetime with fallback
  dateTime: json['dateTime'] != null ? DateTime.parse(json['dateTime']) : DateTime.now(),
  orderId: json["order_id"] ?? 0,
  deliveryId: json["delivery_id"] ?? 0,
  delivery: json["delivery"] ?? '',
  deliveryImage: json["deliveryImage"] ?? '',
  clientId: json["client_id"] ?? 0,
  cliente: json["cliente"] ?? '',
  clientImage: json["clientImage"] ?? '',
  clientPhone: json["clientPhone"] ?? '',
  addressId: json["address_id"] ?? 0,
  street: json["street"] ?? '',
  reference: json["reference"] ?? '',
  latitude: json["Latitude"] ?? '',
  longitude: json["Longitude"] ?? '',
  payType: json["pay_type"] ?? '',
  currentDate: json["currentDate"] != null 
    ? DateTime.parse(json["currentDate"]) 
    : DateTime.now(),
);
}
class UserId {
  final String id;
  final String name;
  final String phone;
  final String email;

  UserId({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
  });

  factory UserId.fromJson(dynamic json) {
    // If userId is just a string or ObjectId, create a UserId with just the id
    if (json is String) {
      return UserId(
        id: json,
        name: '',
        phone: '',
        email: '',
      );
    }
    // If userId is an Object with _id property but no other fields
    else if (json is Map<String, dynamic> && json.containsKey('_id') && !json.containsKey('name')) {
      return UserId(
        id: json['_id'].toString(),
        name: '',
        phone: '',
        email: '',
      );
    }
    // Full object with all fields
    else if (json is Map<String, dynamic>) {
      return UserId(
        id: json['_id'].toString(),
        name: json['name'] ?? '',
        phone: json['phone'] ?? '',
        email: json['email'] ?? '',
      );
    }
    // Fallback
    return UserId(
      id: '',
      name: '',
      phone: '',
      email: '',
    );
  }
}

class Item {
  final String productId;
  final String name;
  final double price;
  final int quantity;
  final String? image;
  final String id;

  Item({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    this.image,
    required this.id,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      productId: json['productId'],
      name: json['name'],
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'],
      image: json['image'],
      id: json['_id'],
    );
  }
}

class Address {
  final String id;

  Address({required this.id});

  factory Address.fromJson(dynamic json) {
    // If address is just a string (ID), use that directly
    if (json is String) {
      return Address(id: json);
    }
    // Otherwise, assume it's a map with an 'id' field
    else if (json is Map<String, dynamic>) {
      return Address(id: json['id'] ?? '');
    }
    // Fallback for null or other unexpected types
    return Address(id: '');
  }
}