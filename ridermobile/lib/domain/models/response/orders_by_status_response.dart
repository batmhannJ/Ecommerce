
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
    resp: json["resp"],
    msg: json["msg"],
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
  });
factory OrdersResponse.fromJson(Map<String, dynamic> json) => OrdersResponse(
  id: json['_id'],
  userId: UserId.fromJson(json['userId']),
  items: (json['items'] as List).map((item) => Item.fromJson(item)).toList(),
  amount: (json['amount'] as num).toDouble(),
  address: Address.fromJson(json['address']),
  payment: json['payment'],
  status: json['status'],
  dateTime: DateTime.parse(json['dateTime']),
  orderId: json["order_id"] ?? 0,  // Add null check with default value
  deliveryId: json["delivery_id"] ?? 0,
  delivery: json["delivery"] ?? '',
  deliveryImage: json["deliveryImage"] ?? '',
  clientId: json["client_id"] ?? 0,  // Add null check with default value
  cliente: json["cliente"] ?? '',  // Add null check with default value
  clientImage: json["clientImage"] ?? '',  // Add null check with default value
  clientPhone: json["clientPhone"] ?? '',
  addressId: json["address_id"] ?? 0,  // Add null check with default value
  street: json["street"] ?? '',  // Add null check with default value
  reference: json["reference"] ?? '',  // Add null check with default value
  latitude: json["Latitude"] ?? '',  // Add null check with default value
  longitude: json["Longitude"] ?? '',  // Add null check with default value
  payType: json["pay_type"] ?? '',  // Add null check with default value
  currentDate: json["currentDate"] != null 
    ? DateTime.parse(json["currentDate"]) 
    : DateTime.now(),  // Add null check with default value
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

  factory UserId.fromJson(Map<String, dynamic> json) {
    return UserId(
      id: json['_id'],
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
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

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(id: json['id']);
  }
}