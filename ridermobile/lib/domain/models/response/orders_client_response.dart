class OrdersClientResponse {
  final bool status;
  final String message;
  final List<OrdersClient> ordersClient;

  OrdersClientResponse({
    required this.status,
    required this.message,
    required this.ordersClient,
  });

  factory OrdersClientResponse.fromJson(Map<String, dynamic> json) => OrdersClientResponse(
        status: json['status'] == 'success',
        message: json['message']?.toString() ?? '',
        ordersClient: (json['data'] as List<dynamic>?)
                ?.map((x) => OrdersClient.fromJson(x as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

class OrdersClient {
  final String id;
  final double amount;
  final String status;
  final DateTime currentDate;
  final List<OrderItem> items;
  final Address address;

  OrdersClient({
    required this.id,
    required this.amount,
    required this.status,
    required this.currentDate,
    required this.items,
    required this.address,
  });

  factory OrdersClient.fromJson(Map<String, dynamic> json) {
    print('Parsing order JSON: $json');
    return OrdersClient(
      id: json['id']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      status: json['status']?.toString() ?? '',
      currentDate: DateTime.tryParse(json['currentDate']?.toString() ?? '') ?? DateTime.now(),
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      address: Address.fromJson(json['address'] as Map<String, dynamic>? ?? {}),
    );
  }
}
class Address {
  final String street;
  final String reference;
  final double latitude;
  final double longitude;
  final String country;

  Address({
    required this.street,
    required this.reference,
    required this.latitude,
    required this.longitude,
    required this.country,
  });

  factory Address.fromJson(Map<String, dynamic> json) => Address(
        street: json['street']?.toString() ?? 'Unknown',
        reference: json['reference']?.toString() ?? 'Unknown',
        latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
        longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
        country: json['country']?.toString() ?? 'Unknown',
      );
}

class OrderItem {
  final String productId;
  final String name;
  final double price;
  final int quantity;
  final String image;

  OrderItem({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.image,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        productId: json['productId']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        price: (json['price'] as num?)?.toDouble() ?? 0.0,
        quantity: (json['quantity'] as num?)?.toInt() ?? 0,
        image: json['image']?.toString() ?? '',
      );
}