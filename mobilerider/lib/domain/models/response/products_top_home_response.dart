class ProductsTopHomeResponse {
  final bool resp;
  final String msg;
  final List<Productsdb> productsdb;

  ProductsTopHomeResponse({
    required this.resp,
    required this.msg,
    required this.productsdb,
  });

  factory ProductsTopHomeResponse.fromJson(Map<String, dynamic> json) =>
      ProductsTopHomeResponse(
        resp: json["success"] ?? json["resp"] ?? false,
        msg: json["message"] ?? json["msg"] ?? "",
        productsdb: json["productsdb"] != null
            ? List<Productsdb>.from(
                json["productsdb"].map((x) => Productsdb.fromJson(x)))
            : [],
      );
}
class Productsdb {

  final int id;
  final String nameProduct;
  final String description;
  final double price;
  final int status;
  final String picture;
  final String category;
  final int categoryId;

  Productsdb({
    required this.id,
    required this.nameProduct,
    required this.description,
    required this.price,
    required this.status,
    required this.picture,
    required this.category,
    required this.categoryId
  });

factory Productsdb.fromJson(Map<String, dynamic> json) {
  // Debug the incoming JSON
  print('Processing JSON: $json');
  
  // Handle the ID field which could be an ObjectId
  var id = 0;
  if (json["id"] != null) {
    id = json["id"] is int ? json["id"] : int.tryParse(json["id"].toString()) ?? 0;
  } else if (json["_id"] != null) {
    // If it's an ObjectId, handle differently
    id = json["_id"] is Map ? 0 : int.tryParse(json["_id"].toString()) ?? 0;
  }
  
  // Handle numeric fields with parsing
  double price = 0.0;
  if (json['price'] != null) {
    price = json['price'] is double ? json['price'] : double.tryParse(json['price'].toString()) ?? 0.0;
  } else if (json['new_price'] != null) {
    price = json['new_price'] is double ? json['new_price'] : double.tryParse(json['new_price'].toString()) ?? 0.0;
  }
  
  // Handle status/available conversion
  int status = 0;
  if (json['status'] != null) {
    status = json['status'] is int ? json['status'] : int.tryParse(json['status'].toString()) ?? 0;
  } else if (json['available'] != null) {
    status = json['available'] == true ? 1 : 0;
  }
  
  return Productsdb(
    id: id,
    nameProduct: json['nameProduct'] ?? json['name'] ?? '',
    description: json["description"] ?? "",
    price: price,
    status: status,
    picture: json['picture'] ?? json['image'] ?? '',
    category: json["category"] ?? "",
    categoryId: json["category_id"] ?? json["categoryId"] ?? 0
  );
}
}
