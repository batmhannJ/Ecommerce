import 'package:flutter/material.dart';
import 'package:indigitech_shop/products.dart';
import 'package:indigitech_shop/widget/product_list.dart';
import 'package:indigitech_shop/model/product.dart'; // Adjust based on your project structure
import 'package:indigitech_shop/services/product_api_service.dart'; // Adjust based on your project structure

class CraftsTabView extends StatefulWidget {
  const CraftsTabView({super.key});

  @override
  State<CraftsTabView> createState() => _CraftsTabViewState();
}

class _CraftsTabViewState extends State<CraftsTabView>
    with AutomaticKeepAliveClientMixin {
  List<Product> products = []; // Store fetched products
  bool isLoading = true; // Loading state

  @override
  void initState() {
    super.initState();
    fetchAllProducts(); // Fetch products when the widget initializes
  }

  Future<void> fetchAllProducts() async {
    try {
      products = await fetchProducts(); // Call the fetchProducts function
      setState(() {
        isLoading = false; // Update loading state
      });
    } catch (e) {
      // Handle any errors here, e.g., show a message to the user
      print('Error fetching products: $e');
      setState(() {
        isLoading = false; // Stop loading even if there's an error
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
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
                  'CRAFTS',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                        fontSize: 24.0,
                      ),
                ),
              ),
            ),
          ),
          isLoading
              ? Center(child: CircularProgressIndicator()) // Show loading indicator
              : Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: ProductList(
                    products: products
                        .where((element) => element.category == "crafts")
                        .toList(),
                  ),
                ),
        ],
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}
