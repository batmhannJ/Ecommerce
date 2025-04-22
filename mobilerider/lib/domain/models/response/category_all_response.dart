
class CategoryAllResponse {

  final bool resp;
  final String msg;
  final List<Category> categories;

  CategoryAllResponse({
    required this.resp,
    required this.msg,
    required this.categories,
  });

  factory CategoryAllResponse.fromJson(Map<String, dynamic> json) => CategoryAllResponse(
    resp: json["resp"],
    msg: json["msg"],
    categories: json["categories"] != null ? List<Category>.from(json["categories"].map((x) => Category.fromJson(x))) : [],
  );
}

class Category {
  final String id;
  final String name;
  final String description;

  Category({required this.id, required this.name, required this.description});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
    );
  }
}
