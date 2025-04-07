import 'package:indigitech_shop/model/product.dart';
import 'package:indigitech_shop/services/product_api_service.dart';

class CartItem {
  final String productId;
  final String selectedSize;
  final double adjustedPrice;
  final int quantity;
  final String cartItemId; // Declare as String
  final Product? product;

  CartItem({
    required this.productId,
    required this.selectedSize,
    required this.adjustedPrice,
    required this.quantity,
    required this.cartItemId,
    this.product,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      productId: json['productId'].toString(), // Convert to string
      selectedSize: json['selectedSize'],
      adjustedPrice: json['adjustedPrice'],
      quantity: json['quantity'] as int,
      cartItemId: json['cartItemId'], // Convert to string
      product:
          json['product'] != null ? Product.fromJson(json['product']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'selectedSize': selectedSize,
      'adjustedPrice': adjustedPrice,
      'quantity': quantity,
      'cartItemId': cartItemId,
      'product': product?.toJson(),
    };
  }
}
