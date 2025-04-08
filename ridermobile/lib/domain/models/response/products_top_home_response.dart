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

  factory Productsdb.fromJson(Map<String, dynamic> json) => Productsdb(
  id: json["id"] ?? json["_id"] ?? 0,
  nameProduct: json['nameProduct'] ?? json['name'] ?? '',
  description: json["description"] ?? "",
  price: (json['price'] ?? json['new_price'] ?? 0).toDouble(),
  status: json["status"] ?? (json["available"] == true ? 1 : 0),
  picture: json['picture'] ?? json['image'] ?? '',
  category: json["category"] ?? "",
  categoryId: json["category_id"] ?? json["categoryId"] ?? 0
);
}
