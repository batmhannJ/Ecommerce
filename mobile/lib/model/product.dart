import 'package:indigitech_shop/core/constant/enum/product_size.dart';
import 'package:indigitech_shop/model/review.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class Product {
  String id;
  final String name;
  final double old_price;
  final double new_price;
  final double discount;
  final String description;
  final List<Review> reviews;
  final Map<ProductSize, int> stocks; // Store stock levels per size
  int s_stock;
  int m_stock;
  int l_stock;
  int xl_stock;
  final String category;
  final List<String> tags;
  final List<String>
      image; // Change this to a list if you're expecting multiple images
  final bool available;
  final bool isNew;
  final double adjustedPrice; // Added to store adjusted price

  Product({
    required this.id,
    required this.name,
    required this.old_price,
    required this.new_price,
    required this.discount,
    required this.description,
    required this.reviews,
    required this.stocks,
    required this.s_stock,
    required this.m_stock,
    required this.xl_stock,
    required this.l_stock,
    required this.category,
    required this.tags,
    required this.image,
    required this.available,
    required this.isNew,
    required this.adjustedPrice,
  });

  double getRatingAverage() {
    double totalRate = 0;

    for (Review review in reviews) {
      totalRate += review.rate;
    }

    if (totalRate == 0) return 0;

    return totalRate / reviews.length;
  }

  double getPriceForSize(ProductSize size) {
    int sizeIndex = size.index; // s = 0, m = 1, l = 2, xl = 3
    return new_price + (sizeIndex * 100);
  }

  bool isInStock(ProductSize size) {
    return stocks[size]! > 0;
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Product &&
          runtimeType == other.runtimeType &&
          id == other.id; // Compare based on unique ID

  @override
  int get hashCode => id.hashCode; // Use ID for hash code

  // Convert a Product object into a JSON map.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'old_price': old_price,
      'new_price': new_price,
      'discount': discount,
      'description': description,
      'reviews': reviews
          .map((review) => review.toJson())
          .toList(), // Assuming Review has toJson
      'stocks': stocks.map((key, value) =>
          MapEntry(key.toString(), value)), // Convert Enum to String
      'category': category,
      's_stock': s_stock,
      'adjustedPrice': adjustedPrice,

      'm_stock': m_stock,
      'l_stock': l_stock,
      'xl_stock': xl_stock,
      'tags': tags,
      'image': image,
      'available': available,
      'isNew': isNew,
    };
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    try {
      return Product(
        id: json['id'].toString() ?? '', // Always convert id to String
        name: json['name'] ?? 'Unknown Product',
        old_price: (json['old_price'] ?? 0).toDouble(),
        new_price: (json['new_price'] ?? 0).toDouble(),
        adjustedPrice: (json['adjustedPrice'] ?? 0).toDouble(),
        discount: (json['discount'] ?? 0).toDouble(),
        description: json['description'] ?? 'No description available',
        reviews: json['reviews'] != null
            ? List<Review>.from(json['reviews']
                .map((reviewJson) => Review.fromJson(reviewJson)))
            : [],
        stocks: json['stocks'] != null
            ? Map<ProductSize, int>.from(json['stocks'].map((key, value) {
                ProductSize size = ProductSize.values.firstWhere(
                    (e) => e.toString() == 'ProductSize.$key',
                    orElse: () => ProductSize.S);
                return MapEntry(size, value ?? 0);
              }))
            : {},
        category: json['category'] ?? 'Uncategorized',
        s_stock: json['s_stock'] ?? 0,
        m_stock: json['m_stock'] ?? 0,
        l_stock: json['l_stock'] ?? 0,
        xl_stock: json['xl_stock'] ?? 0,
        tags: json['tags'] != null ? List<String>.from(json['tags']) : [],
        image: json['image'] is List
            ? List<String>.from(json['image'])
            : [json['image'] ?? 'assets/images/default.jpg'],
        available: json['available'] ?? false,
        isNew: json['isNew'] ?? false,
      );
    } catch (e) {
      print("Error deserializing Product: $e");
      throw Exception("Invalid Product data");
    }
  }

  Product copyWith({
    String? id,
    String? name,
    double? new_price,
    double? adjustedPrice,
    double? old_price,
    double? discount,
    String? description,
    List<Review>? reviews,
    Map<ProductSize, int>? stocks,
    int? s_stock,
    int? m_stock,
    int? l_stock,
    int? xl_stock,
    String? category,
    List<String>? tags,
    List<String>? image,
    bool? available,
    bool? isNew,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      adjustedPrice: adjustedPrice ?? this.adjustedPrice,
      new_price: new_price ?? this.new_price,
      old_price: old_price ?? this.old_price,
      discount: discount ?? this.discount,
      description: description ?? this.description,
      reviews: reviews ?? this.reviews,
      stocks: stocks ?? this.stocks,
      s_stock: s_stock ?? this.s_stock,
      m_stock: m_stock ?? this.m_stock,
      l_stock: l_stock ?? this.l_stock,
      xl_stock: xl_stock ?? this.xl_stock,
      category: category ?? this.category,
      tags: tags ?? this.tags,
      image: image ?? this.image,
      available: available ?? this.available,
      isNew: isNew ?? this.isNew,
    );
  }
}
