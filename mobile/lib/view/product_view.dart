import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/extensions/string_extensions.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/font_weights.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/view_model/cart_view_model.dart';
import 'package:indigitech_shop/view/auth/login_view.dart';
import 'package:indigitech_shop/view/auth/signup_view.dart';
import 'package:indigitech_shop/view/home/home_view.dart';
import 'package:indigitech_shop/widget/buttons/custom_filled_button.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constant/enum/product_size.dart';
import '../products.dart';
import '../model/product.dart';
// import '../widget/image_carousel.dart';
import '../widget/product_list.dart';
import 'layout/default_view_layout.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import '../core/constant/enum/product_size.dart';
//import 'dart:js' as js;

class ProductView extends StatefulWidget {
  final Product product;
  final List<Product> products;

  const ProductView({
    super.key,
    required this.product,
    required this.products, // Pass the products as a parameter
  });

  @override
  State<ProductView> createState() => _ProductViewState();
}

class _ProductViewState extends State<ProductView> {
  late List<Product> _relatedProducts;
  ProductSize? _selectedSize;
  int _stockCount = 0;
  double adjustedPrice = 0.0;
  int _selectedQuantity = 1;
  @override
  void initState() {
    _relatedProducts = widget.products
        .where((element) =>
            element.name != widget.product.name &&
            element.category == widget.product.category &&
            element.tags
                .toSet()
                .intersection(widget.product.tags.toSet())
                .isNotEmpty)
        .toList();
    adjustedPrice = widget.product.new_price;

    super.initState();
  }

  Future<void> _updateStockCount(ProductSize size) async {
    setState(() {
      switch (size) {
        case ProductSize.S:
          _stockCount = widget.product.s_stock;
          adjustedPrice = widget.product.new_price; // Base price for S
          break;
        case ProductSize.M:
          _stockCount = widget.product.m_stock;
          adjustedPrice = widget.product.new_price + 100; // Add 100 for M
          break;
        case ProductSize.L:
          _stockCount = widget.product.l_stock;
          adjustedPrice = widget.product.new_price + 200; // Add 100 for M

          break;
        case ProductSize.XL:
          _stockCount = widget.product.xl_stock;
          adjustedPrice = widget.product.new_price + 300; // Add 100 for M

          break;
      }
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('stockCount', _stockCount);
  }

  Future<void> _saveToCart(Product product) async {
    print('Product Debug: ${product.toJson()}');

    if (_selectedSize == null) {
      print("Error: No size selected.");
      return;
    }
    if (_stockCount == 0) {
      print("Error: Out of stock.");
      return;
    }

    final userId = await _getUserId();
    if (userId == null) {
      print("Error: User not logged in.");
      return;
    }

    // Convert the String id to an int (productId) for the backend-mob
    final int? productId = int.tryParse(product.id);

    if (productId == null) {
      print(
          "Error: Invalid product ID. Cannot convert '${product.id}' to an integer.");
      return;
    }

    final cartItem = {
      'userId': userId,
      'cartItems': [
        {
          'productId': productId, // Send as an integer
          'selectedSize': _selectedSize!.name,
          'adjustedPrice': adjustedPrice,
          'quantity': _selectedQuantity,
          'cartItemId': null, // backend-mob will generate this
        }
      ]
    };

    try {
      final response = await http.post(
        Uri.parse('http://localhost:4000/api/cart/save'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(cartItem),
      );

      if (response.statusCode == 201) {
        print('Cart item saved to database successfully: ${response.body}');
      } else {
        print('Failed to save cart item: ${response.body}');
      }
    } catch (e) {
      print('Error saving cart item: $e');
    }
  }

  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }

  @override
  Widget build(BuildContext context) {
    return DefaultViewLayout(
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name
                  Text(
                    widget.product.name,
                    style: AppTextStyles.headline4.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Gap(5),
                  // Product Image
                  if (widget.product.image.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          'http://localhost:4000/upload/images/${widget.product.image[0]}',
                          width: double.infinity,
                          height: 200,
                          fit: BoxFit.contain, // Changed to BoxFit.contain
                          errorBuilder: (context, error, stackTrace) {
                            return Center(
                              child: Image.asset(
                                'assets/images/placeholder_food.png',
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                              ),
                            );
                          },
                        ),
                      ),
                    ),

                  // Price Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₱${adjustedPrice.toStringAsFixed(2)}',
                        style: widget.product.discount != 0
                            ? AppTextStyles.body1.copyWith(
                                color: AppColors.greyAD,
                                decoration: TextDecoration.lineThrough,
                                decorationColor: AppColors.greyAD,
                              )
                            : AppTextStyles.body1,
                      ),
                      if (widget.product.discount != 0)
                        Text(
                          '₱${(widget.product.old_price - (widget.product.new_price * widget.product.discount)).toStringAsFixed(2)}',
                          style: AppTextStyles.body1.copyWith(
                            color: AppColors.red,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                  const Gap(20),

                  // Product Description
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[200], // Changed to a lighter grey
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      widget.product.description,
                      overflow: TextOverflow.clip,
                      style: AppTextStyles.body2,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Size Picker Section
                  Text(
                    'Select Size:',
                    style: AppTextStyles.body1.copyWith(
                      fontWeight: FontWeight.bold,
                      color: const Color.fromARGB(255, 255, 255, 255),
                    ),
                  ),
                  const Gap(10),
                  SizePicker(
                    sizes: const [
                      ProductSize.S,
                      ProductSize.M,
                      ProductSize.L,
                      ProductSize.XL,
                    ],
                    onSizeSelected: (value) {
                      setState(() {
                        _selectedSize = value;
                      });
                      if (value != null) {
                        _updateStockCount(value);
                      }
                    },
                  ),
                  const Gap(10),

                  // Quantity Selector
                  if (_selectedSize != null)
                    QuantitySelector(
                      initialQuantity:
                          _selectedQuantity, // Start with selected quantity
                      stockCount: _stockCount,
                      onQuantityChanged: (quantity) {
                        setState(() {
                          _selectedQuantity = quantity; // Update quantity
                        });
                      },
                    ),

                  // Stock Count Display
                  if (_selectedSize != null)
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.green),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Available stock: $_stockCount',
                        style: AppTextStyles.body1.copyWith(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  const Gap(20),

                  // Add to Cart Button
                  CustomButton(
                    // Disable button if there is no stock for the selected size or if no size is selected
                    disabled: _selectedSize == null || _stockCount == 0,
                    text: "ADD TO CART",
                    textStyle: AppTextStyles.button.copyWith(fontSize: 14),
                    command: () async {
                      final prefs = await SharedPreferences.getInstance();
                      final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

                      if (isLoggedIn) {
                        final updatedProduct =
                            widget.product.copyWith(new_price: adjustedPrice);
                        context.read<CartViewModel>().addItem(
                              context, // Pass context

                              updatedProduct,
                              _selectedSize?.name ?? '',
                              quantity: _selectedQuantity, // Pass the quantity
                            );
                        ;
                        if (_selectedSize != null) {
                          await _saveToCart(updatedProduct);
                        }
                      } else {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => LoginView(
                              onLogin: () async {
                                final authViewModel =
                                    context.read<AuthViewModel>();
                                await authViewModel.logins();
                                if (authViewModel.isLoggedIn) {
                                  final userInfo = authViewModel.user!;
                                  await prefs.setString('userId', userInfo.id);
                                  await prefs.setString(
                                      'userName', userInfo.name);
                                  await prefs.setString(
                                      'userEmail', userInfo.email);
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                        builder: (context) => const HomeView()),
                                  );
                                }
                              },
                              onCreateAccount: () {
                                final authViewModel =
                                    context.read<AuthViewModel>();
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => SignupView(
                                      onLogin: () => authViewModel.logins(),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        );
                      }
                    },
                    height: 48,
                    fillColor: Color(0xFF778C62), // Maroon color for the button
                    contentPadding: const EdgeInsets.symmetric(horizontal: 24),
                  ),
                  const Gap(20),
                  Divider(color: Colors.grey, thickness: 1),
                  const Gap(10),

                  // Category
                  RichText(
                    text: TextSpan(
                      text: "Category: ",
                      style: AppTextStyles.body1
                          .copyWith(fontWeight: AppFontWeights.bold),
                      children: [
                        TextSpan(
                          text: widget.product.category.capitalize(),
                          style: const TextStyle(
                              fontWeight: AppFontWeights.regular),
                        ),
                      ],
                    ),
                  ),
                  const Gap(10),

                  // Tags
                  RichText(
                    text: TextSpan(
                      text: "Tags: ",
                      style: AppTextStyles.body1
                          .copyWith(fontWeight: AppFontWeights.bold),
                      children: [
                        TextSpan(
                          text: widget.product.tags
                              .map((e) => e.capitalize())
                              .join(", "),
                          style: const TextStyle(
                              fontWeight: AppFontWeights.regular),
                        ),
                      ],
                    ),
                  ),
                  const Gap(20),

                  // Related Products
                  if (_relatedProducts.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 20),
                      child: Center(
                        child: Column(
                          children: [
                            Text(
                              "Related Products",
                              style: AppTextStyles.headline5,
                            ),
                            const SizedBox(
                              width: 100,
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 10),
                                child: Divider(
                                  color: AppColors.black,
                                  height: 0,
                                  thickness: 2.5,
                                ),
                              ),
                            ),
                            ProductList(
                              products: _relatedProducts,
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SizePicker extends StatefulWidget {
  final List<ProductSize>
      sizes; // Expecting ProductSize enums (e.g., S, M, L, XL)
  final ValueChanged<ProductSize?> onSizeSelected;

  const SizePicker({
    super.key,
    required this.sizes,
    required this.onSizeSelected,
  });

  @override
  State<SizePicker> createState() => _SizePickerState();
}

class _SizePickerState extends State<SizePicker> {
  ProductSize? _selectedSize;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Select Size",
          style: AppTextStyles.headline6.copyWith(color: AppColors.greyAD),
        ),
        const Gap(10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: List.generate(widget.sizes.length, (index) {
            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedSize = widget.sizes[index];
                  widget.onSizeSelected(
                      _selectedSize); // Notify parent about the selected size
                });
              },
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _selectedSize == widget.sizes[index]
                      ? AppColors.greyAD
                      : AppColors.lightGrey,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(
                    color: AppColors
                        .black, // Optional: add border for better visibility
                  ),
                ),
                child: Center(
                  child: Text(
                    widget.sizes[index].name
                        .toUpperCase(), // Make sure to convert the enum to string properly
                    style: AppTextStyles.button.copyWith(
                      color: _selectedSize == widget.sizes[index]
                          ? AppColors.primary
                          : AppColors.black,
                    ),
                  ),
                ),
              ),
            );
          }),
        )
      ],
    );
  }
}

class QuantitySelector extends StatefulWidget {
  final int initialQuantity;
  final int stockCount;
  final ValueChanged<int> onQuantityChanged;

  const QuantitySelector({
    Key? key,
    required this.initialQuantity,
    required this.stockCount,
    required this.onQuantityChanged,
  }) : super(key: key);

  @override
  State<QuantitySelector> createState() => _QuantitySelectorState();
}

class _QuantitySelectorState extends State<QuantitySelector> {
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    _quantity = widget.initialQuantity;
  }

  void _increaseQuantity() {
    if (_quantity < widget.stockCount) {
      setState(() {
        _quantity++;
      });
      widget.onQuantityChanged(_quantity);
    } else {
      // Show a Snackbar when the quantity exceeds stock
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('You cannot add more than ${widget.stockCount} items.'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _decreaseQuantity() {
    if (_quantity > 1) {
      setState(() {
        _quantity--;
      });
      widget.onQuantityChanged(_quantity);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          icon: Icon(Icons.remove, color: AppColors.black),
          onPressed: _decreaseQuantity,
        ),
        Text(
          '$_quantity',
          style: AppTextStyles.body1,
        ),
        IconButton(
          icon: Icon(Icons.add, color: AppColors.black),
          onPressed: _increaseQuantity,
        ),
      ],
    );
  }
}
