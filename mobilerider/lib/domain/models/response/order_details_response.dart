
class OrderDetailsResponse {

  final bool resp;
  final String msg;
  final List<DetailsOrder> detailsOrder;

  OrderDetailsResponse({
    required this.resp,
    required this.msg,
    required this.detailsOrder,
  });    

  factory OrderDetailsResponse.fromJson(Map<String, dynamic> json) => OrderDetailsResponse(
    resp: json["resp"],
    msg: json["msg"],
    detailsOrder: json["detailsOrder"] != null ? List<DetailsOrder>.from(json["detailsOrder"].map((x) => DetailsOrder.fromJson(x))) : [],
  );
}

// First, make sure your DetailsOrder model matches the API response format:
class DetailsOrder {
  final String id;
  final String nameProduct;
  final String picture;
  final double price;
  final int quantity;
  final String total;

  DetailsOrder({
    required this.id,
    required this.nameProduct,
    required this.picture,
    required this.price,
    required this.quantity,
    required this.total,
  });

  factory DetailsOrder.fromJson(Map<String, dynamic> json) => DetailsOrder(
    id: json["id"],
    nameProduct: json["nameProduct"],
    picture: json["picture"],
    price: json["price"] is int ? json["price"].toDouble() : json["price"],
    quantity: json["quantity"],
    total: json["total"],
  );
}
