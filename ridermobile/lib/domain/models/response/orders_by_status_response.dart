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
  final String id;
  final String date;
  final String name;
  final String contact;
  final String item;
  final int quantity;
  final double amount;
  final String address;
  final String transactionId;
  final String status;
  final String userId;
  final String riderId;
  final double markupValue;
  final double deliveryFee;
  final double deliveryComm;
  final String? email; // Optional if not available
  final String? phone; // Map from contact
  
  final String sellerName;
  final String shopName;
  final String businessLocation;
  final String sellerPhone;

  OrdersResponse({
    required this.id,
    required this.date,
    required this.name,
    this.email,
    this.phone,
    required this.contact,
    required this.item,
    required this.quantity,
    required this.amount,
    required this.address,
    required this.transactionId,
    required this.status,
    required this.userId,
    required this.riderId,
    required this.markupValue,
    required this.deliveryFee,
    required this.deliveryComm,
    
    this.sellerName = '',
    this.shopName = '',
    this.businessLocation = '',
    this.sellerPhone = '',
  });

  factory OrdersResponse.fromJson(Map<String, dynamic> json) => OrdersResponse(
  id: json["_id"] ?? '',
  date: json["date"] ?? '',
  name: json["name"] ?? '',
  email: json["email"], // Already nullable
  phone: json["phone"] ?? 'N/A',
  contact: json["contact"] ?? '',
  item: json["item"] ?? '',
  quantity: json["quantity"] ?? 0,
  amount: (json["amount"] ?? 0).toDouble(),
  address: json["address"] ?? '',
  transactionId: json["transactionId"] ?? '',
  status: json["status"] ?? '',
  userId: json["userId"] ?? '',
  riderId: json["riderId"] ?? '',
  markupValue: (json["markupValue"] ?? 0).toDouble(),
  deliveryFee: (json["deliveryFee"] ?? 0).toDouble(),
  deliveryComm: (json["deliveryComm"] ?? 0).toDouble(),
  sellerName: json['sellerName'] ?? '',
  shopName: json['shopName'] ?? '',
  businessLocation: json['businessLocation'] ?? '',
  sellerPhone: json['sellerPhone'] ?? '',
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