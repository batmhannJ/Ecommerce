import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> addToCart({
  required String userId,
  required int productId,
  required String selectedSize,
  required double adjustedPrice,
  required int quantity,
}) async {
  const String apiUrl =
      'http://localhost:4000/api/cart/save'; // Replace with your API URL
  try {
    final response = await http.post(
      Uri.parse(apiUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'productId': productId,
        'selectedSize': selectedSize,
        'adjustedPrice': adjustedPrice,
        'quantity': quantity,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      print('Item added to cart successfully');
    } else {
      print('Failed to add item to cart: ${response.body}');
    }
  } catch (e) {
    print('Error adding item to cart: $e');
  }
}
