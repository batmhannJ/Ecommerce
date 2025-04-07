import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/constant/enum/product_size.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/font_weights.dart';
import 'package:indigitech_shop/core/style/form_styles.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/model/address.dart';
import 'package:indigitech_shop/model/cart.dart';
import 'package:indigitech_shop/model/user.dart';
import 'package:indigitech_shop/view/address_view.dart';
import 'package:indigitech_shop/view/auth/login_view.dart';
import 'package:indigitech_shop/view/auth/signup_view.dart';
import 'package:indigitech_shop/view/checkout_view.dart';
import 'package:indigitech_shop/widget/product_list.dart';
import 'package:indigitech_shop/view_model/address_view_model.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:indigitech_shop/view_model/cart_view_model.dart';
import 'package:indigitech_shop/widget/form_fields/custom_text_form_field.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../model/product.dart';
import '../widget/buttons/custom_filled_button.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CartView extends StatefulWidget {
  final User? user; // Allow null to handle cases where user may not be set
  final Address? address; // Assuming Address is your address model

  const CartView({super.key, this.user, this.address});

  @override
  State<CartView> createState() => _CartViewState();
}

class _CartViewState extends State<CartView> {
  Map<Product, ProductSize> selectedSizes = {};
  List<Map<String, dynamic>> cartItems =
      []; // This will store the API fetched cart items
  bool _isMounted = false;

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
    _isMounted = true; // Track when the widget is mounted

    _fetchUserCart();
  }

  @override
  void dispose() {
    _isMounted = false; // Mark as not mounted
    super.dispose();
  }

  Future<String?> getUserIdFromPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }

  void _checkLoginStatus() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    bool isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

    if (!isLoggedIn) {
      final authViewModel = context.watch<AuthViewModel>();
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => LoginView(
            onLogin: () async {
              await prefs.setBool('isLoggedIn', true);

              String? userId =
                  prefs.getString('userId'); // Ensure userId is stored
              if (userId != null) {
                await _fetchUserCart(); // Call the method to fetch cart items
              }

              _navigateToCheckout(authViewModel.address);
            },
            onCreateAccount: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => SignupView(
                    onLogin: () {
                      _navigateToCheckout(authViewModel.address);
                    },
                  ),
                ),
              );
            },
          ),
        ),
      );
    } else {
      String? userId = prefs.getString('userId'); // Ensure userId is stored
      if (userId != null) {
        await _fetchUserCart(); // Call the method to fetch cart items
      }
    }
  }

  Future<void> _fetchUserCart() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId');

      if (userId == null) {
        print("No userId found in SharedPreferences.");
        return;
      }

      final apiUrl = 'http://localhost:4000/api/carts/$userId';
      final response = await http.get(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        print("Fetched cart data: $data");

        if (data['cartItems'] != null && data['cartItems'] is List) {
          List<CartItem> fetchedItems = (data['cartItems'] as List)
              .map((item) => CartItem.fromJson(item))
              .toList();

          if (mounted) {
            setState(() {
              cartItems = fetchedItems
                  .where((item) => item.quantity > 0)
                  .map((item) => {
                        'productId': item.productId,
                        'selectedSize': item.selectedSize,
                        'adjustedPrice': item.adjustedPrice,
                        'quantity': item.quantity,
                        'cartItemId': item.cartItemId,
                        'product': item.product,
                      })
                  .toList();
            });

            // Pass the CartItem list to CartViewModel
            context
                .read<CartViewModel>()
                .updateCartItemsFromDatabase(fetchedItems);
          }
        } else {
          print("No valid cart items found in the response.");
        }
      } else {
        print("Failed to fetch cart: ${response.statusCode}");
      }
    } catch (e) {
      print("Error fetching cart items: $e");
    }
  }

  void _navigateToCheckout(Address? userAddress) {
    final cartItems = context.read<CartViewModel>().cartItemsList.map((entry) {
      final product = entry.key;
      final details = entry.value;

      return {
        'name': product.name,
        'selectedSize': details['selectedSize'] ?? '',
        'quantity': details['quantity'] ?? 0,
        'adjustedPrice': details['adjustedPrice'] ?? 0.0,
        'image': product.image.isNotEmpty ? product.image[0] : '',
      };
    }).toList();

    final subtotal = calculateSubtotal();

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CheckoutView(
          key: checkoutViewKey,
          address: userAddress,
          cartItems: cartItems,
          subtotal: subtotal, // Pass subtotal to CheckoutView
        ),
      ),
    );
  }

  double calculateSubtotal() {
    return cartItems.fold(0.0, (total, item) {
      double adjustedPrice = item['adjustedPrice'] ?? 0.0;
      int quantity = item['quantity'] ?? 0;
      return total + (adjustedPrice * quantity);
    });
  }

  @override
  Widget build(BuildContext context) {
    double subtotal = calculateSubtotal();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cart'),
        backgroundColor: AppColors.primary,
      ),
      body: Container(
        color: AppColors.lightGrey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Center(
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.9,
                    height: 50.0,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10.0),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 5.0,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(10.0),
                    child: Center(
                      child: Text(
                        'CART',
                        style: AppTextStyles.headline5.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                          fontSize: 24.0,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              cartItems.isEmpty
                  ? const Center(
                      child: Text('No items in the cart'),
                    )
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: cartItems.length,
                      itemBuilder: (context, index) {
                        final entry = cartItems[index];
                        final product = entry['product'];

                        if (product == null || product is! Product) {
                          return ListTile(
                            title: const Text('Product not found'),
                            subtitle: Text('Quantity: ${entry['quantity']}'),
                          );
                        }
                        final String baseUrl =
                            'http://localhost:4000/images/'; // Update with your actual base URL
                        final String imageUrl = product.image.isNotEmpty
                            ? '$baseUrl${product.image[0]}'
                            : '';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 5,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(8),
                            leading: Image.network(
                              imageUrl,
                              errorBuilder: (context, error, stackTrace) {
                                print("Error loading image: $error");
                                return Image.asset(
                                    'assets/images/bg_img.jpg'); // Fallback image
                              },
                            ),
                            title: Text(
                              product.name,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.body2.copyWith(
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Size: ${entry['selectedSize'] ?? 'N/A'}",
                                    style: AppTextStyles.body2.copyWith(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 2, horizontal: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.transparent,
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          "₱${entry['adjustedPrice']}",
                                          style: AppTextStyles.body2.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                          ),
                                        ),
                                      ),
                                      QuantitySelector(
                                        product: product,
                                        quantity: entry[
                                            'quantity'], // Pass the quantity here
                                        selectedSize: entry['selectedSize'] ??
                                            '', // Provide a default value if null
                                        cartItemId: entry[
                                            'cartItemId'], // Pass cartItemId explicitly
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 5,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Cart Totals",
                      style: AppTextStyles.headline5.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Subtotal",
                          style: AppTextStyles.body2.copyWith(fontSize: 14),
                        ),
                        Text(
                          "₱${subtotal.toStringAsFixed(2)}",
                          style: AppTextStyles.body2.copyWith(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Divider(
                        color: AppColors.greyAD.withAlpha(100),
                        height: 0,
                        thickness: 1.5,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Total",
                          style: AppTextStyles.subtitle1.copyWith(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          "₱${subtotal.toStringAsFixed(2)}", // For now, Total is the same as Subtotal
                          style: AppTextStyles.subtitle1.copyWith(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    CustomButton(
                      disabled: cartItems.isEmpty,
                      text: "PROCEED TO CHECKOUT",
                      textStyle: AppTextStyles.button,
                      height: 50,
                      fillColor:
                          Color(0xFF778C62), // Maroon color for the button
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 14),
                      command: () async {
                        final authViewModel = context.read<AuthViewModel>();
                        final addressViewModel = context.read<AuthViewModel>();

                        if (!authViewModel.isLoggedIn) {
                          // Prompt user to log in
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  "You need to log in to proceed to checkout"),
                            ),
                          );
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LoginView(
                                onLogin: () async {
                                  SharedPreferences prefs =
                                      await SharedPreferences.getInstance();
                                  await prefs.setBool(
                                      'isLoggedIn', true); // Save login state
                                  _navigateToCheckout(addressViewModel
                                      .address); // Proceed to CheckoutView after login
                                },
                                onCreateAccount: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                        builder: (context) =>
                                            SignupView(onLogin: () {
                                              _navigateToCheckout(addressViewModel
                                                  .address); // Proceed to CheckoutView after account creation
                                            })),
                                  );
                                },
                              ),
                            ),
                          );
                        } else {
                          _navigateToCheckout(addressViewModel.address);
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class QuantitySelector extends StatelessWidget {
  final Product product;
  final int quantity; // Initial quantity from the database
  final String selectedSize; // Selected size for the product
  final String? cartItemId; // Add cartItemId here

  const QuantitySelector({
    super.key,
    required this.product,
    required this.quantity,
    required this.selectedSize,
    this.cartItemId,
  });

  void _showSnackBar(BuildContext context, String message,
      {bool isError = false}) {
    final snackBar = SnackBar(
      content: Text(message),
      backgroundColor: isError ? Colors.red : Colors.green,
      duration: const Duration(seconds: 2),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.lightGrey,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: AppColors.greyAD.withAlpha(100)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: () {
              if (selectedSize.isNotEmpty && cartItemId != null) {
                context
                    .read<CartViewModel>()
                    .subtractItem(product, selectedSize);
              } else {
                print(
                  "Error: Missing data. Selected Size: $selectedSize, Cart Item ID: $cartItemId, Product: $product",
                );
              }
            },
            child: Container(
              color: Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 5),
              child: Icon(
                quantity > 1 ? Symbols.remove : Symbols.delete,
                size: 15,
              ),
            ),
          ),
          Consumer<CartViewModel>(
            builder: (context, cartViewModel, child) {
              // Use CartViewModel value if available; otherwise, default to database quantity
              int itemCount =
                  cartViewModel.cartItems[product]?['quantity'] ?? quantity;

              return Container(
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  border: Border(
                    left: BorderSide(color: AppColors.greyAD.withAlpha(100)),
                    right: BorderSide(color: AppColors.greyAD.withAlpha(100)),
                  ),
                ),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                  child: Text(
                    "$itemCount",
                    style: AppTextStyles.caption
                        .copyWith(fontWeight: AppFontWeights.bold),
                  ),
                ),
              );
            },
          ),
          GestureDetector(
            onTap: () {
              if (selectedSize.isNotEmpty) {
                final cartViewModel = context.read<CartViewModel>();

                // Fetch the current quantity for the product and selected size
                final currentQuantity =
                    cartViewModel.cartItems[product]?['quantity'] ?? 0;

                // Increment the quantity directly without conditional checks
                cartViewModel.addItem(
                    context, // Pass context
                    product,
                    selectedSize,
                    quantity: currentQuantity + 1);
              } else {
                print("Error: Size must be selected for the product.");
              }
            },
            child: Container(
              color: Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 5),
              child: const Icon(
                Symbols.add,
                size: 15,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
