import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:indigitech_shop/model/product.dart';
import 'package:indigitech_shop/model/review.dart';
import 'package:indigitech_shop/core/constant/enum/product_size.dart';

Future<List<Product>> fetchProducts() async {
  final response =
      await http.get(Uri.parse('http://localhost:4000/allproducts'));

  if (response.statusCode == 200) {
    // Parse the JSON data
    List<dynamic> jsonResponse = json.decode(response.body);

    // Map the JSON response to a List<Product>
    List<Product> products = jsonResponse.map((data) {
      return Product(
        id: data['id']?.toString() ?? '', // Use the correct 'id' field
        name: data['name'] ?? '', // Default to empty string if null
        old_price:
            (data['old_price'] ?? 0.0) as double, // Default to 0.0 if null
        new_price:
            (data['new_price'] ?? 0.0) as double, // Default to 0.0 if null
        discount: (data['discount'] ?? 0.0) as double, // Default to 0.0 if null
        description:
            data['description'] ?? '', // Default to empty string if null
        reviews: (data['reviews'] as List?)
                ?.map((reviewData) => Review(
                      rate: reviewData['rate'] ?? 0, // Handle null for rate
                      comment: reviewData['comment'] ??
                          '', // Handle null for comment
                      name: '',
                    ))
                .toList() ??
            [], // Default to empty list if null
        stocks: (data['stocks'] as Map<String, dynamic>?)?.map((key, value) {
              return MapEntry(
                ProductSize.values
                    .firstWhere((e) => e.toString() == 'ProductSize.$key'),
                value,
              );
            }) ??
            {}, // Default to empty map if stocks is null
        s_stock: data['s_stock'] ?? 0,
        m_stock: data['m_stock'] ?? 0,
        l_stock: data['l_stock'] ?? 0,
        xl_stock: data['xl_stock'] ?? 0,
        adjustedPrice: data['adjustedPrice'] ?? 0,

        category: data['category'] ?? '', // Default to empty string if null
        tags: List<String>.from(
            data['tags'] ?? []), // Default to empty list if null
        image: (data['image'] is List)
            ? List<String>.from(
                data['image']) // Case when images are provided as a list
            : [
                data['image'] ?? ''
              ], // Case when images are a single string // Default to empty string if null
        available: data['available'] ?? false, // Default to false if null
        isNew: data['isNew'] ?? false, // Default to false if null
      );
    }).toList();

    return products;
  } else {
    throw Exception('Failed to load products');
  }
}
