import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/widget/buttons/custom_filled_button.dart';
import 'package:indigitech_shop/services/product_api_service.dart';
import 'package:indigitech_shop/model/product.dart';

import 'package:indigitech_shop/view/product_view.dart';

class ShopTabView extends StatefulWidget {
  const ShopTabView({Key? key}) : super(key: key);

  @override
  State<ShopTabView> createState() => _ShopTabViewState();
}

class _ShopTabViewState extends State<ShopTabView>
    with AutomaticKeepAliveClientMixin {
  final _scrollController = ScrollController();
  final _newCollectionsKey = GlobalKey();
  late Future<List<Product>> _productsFuture;
  List<Product> _selectedProducts = [];

  void _updateSelectedProducts(List<Product> products) {
    setState(() {
      _selectedProducts = products;
    });
  }

  @override
  void initState() {
    super.initState();
    _productsFuture = ProductApiService.fetchProducts();
  }

  void _scrollToNewCollections() {
    final context = _newCollectionsKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return SingleChildScrollView(
      controller: _scrollController,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: <Color>[
              const Color(0xfff8e2fb),
              const Color(0xfff8f3f9),
              const Color(0xffd0d5d1),
              AppColors.primary,
              AppColors.primary.withOpacity(.7),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            stops: const <double>[.03, .1, .225, .275, 1],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            /*Center(
              child: Text(
                "WELCOME TO",
                style: AppTextStyles.subtitle1.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  fontSize: 28,
                ),
              ),
            ),
            const Gap(10),*/
            Stack(
              alignment: Alignment.center,
              children: [
                Image.asset(
                  "assets/images/bg_img.png",
                  fit: BoxFit.cover,
                ),
                /*Positioned(
                  bottom: 10,
                  child: Text(
                    "TIENDA",
                    style: AppTextStyles.headline4.copyWith(
                      fontSize: 40,
                      color: AppColors.red,
                      shadows: [
                        Shadow(
                          offset: const Offset(2, 2),
                          blurRadius: 5,
                          color: AppColors.black.withOpacity(0.5),
                        ),
                      ],
                    ),
                  ),
                ),*/
              ],
            ),
            const Gap(20),
            FutureBuilder<List<Product>>(
              future: _productsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const CircularProgressIndicator();
                } else if (snapshot.hasError) {
                  return Text('Error: ${snapshot.error}');
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Text('No products available');
                }

                List<Product> allProducts = snapshot.data!;
                List<Product> newProducts =
                    allProducts.where((product) => product.isNew).toList();

                return Column(
                  children: [
                    const Gap(10),
                    const Gap(10),
                    // Move the button above the SearchProductsWidget
                    CustomButton(
                      text: "Explore Latest Collection",
                      textStyle: AppTextStyles.button.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                      command: _scrollToNewCollections,
                      height: 48,
                      fillColor:
                          Color(0xFF778C62), // Maroon color for the button
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 30),
                      borderRadius: 30,
                      icon: const Icon(
                        Icons.arrow_forward_rounded,
                        color: AppColors.primary,
                      ),
                      iconPadding: 8,
                    ),
                    const Gap(20),
                    // Pass _updateSelectedProducts to SearchProductsWidget
                    SearchProductsWidget(
                      products: allProducts,
                      onProductSelected: _updateSelectedProducts,
                    ),
                    const Gap(20),
                    if (_selectedProducts.isNotEmpty)
                      Column(
                        children: _selectedProducts.map((product) {
                          return ListTile(
                            contentPadding: const EdgeInsets.all(8.0),
                            leading: Image.network(
                              'http://localhost:4000/upload/images/${product.image[0]}',
                              width: 50,
                              height: 50,
                              fit: BoxFit.cover,
                            ),
                            title: Text(product.name),
                            subtitle: Text(
                              '\₱${product.new_price}.00',
                              style: const TextStyle(
                                color: Color.fromARGB(255, 0, 0, 0),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    const Gap(20), // Adjust this to control the top spacing
                    Padding(
                      key: _newCollectionsKey,
                      padding: const EdgeInsets.symmetric(
                          vertical: 10), // Adjust as needed
                      child: Column(
                        children: [
                          Text(
                            "NEW COLLECTIONS",
                            style: AppTextStyles.headline5.copyWith(
                              color: AppColors.black,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(
                            width: 100,
                            child: Padding(
                              padding: EdgeInsets.symmetric(
                                  vertical: 5), // Adjust this to reduce space
                              child: Divider(
                                color: AppColors.black,
                                height: 0,
                                thickness: 3,
                              ),
                            ),
                          ),
                          const Gap(
                              20), // Adjust this to control the top spacing
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2, // Number of columns
                              childAspectRatio:
                                  0.75, // Adjust to control the aspect ratio of grid items
                              crossAxisSpacing:
                                  8.0, // Horizontal space between items
                              mainAxisSpacing:
                                  8.0, // Vertical space between items
                            ),
                            itemCount: allProducts.length,
                            itemBuilder: (context, index) {
                              final product = allProducts[index];

                              // Debugging: Log the product object to check its structure
                              print(
                                  'Product Data: ${product.toString()}'); // Check product data in the console

                              return Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10.0),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 4.0,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 8.0, horizontal: 8.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      GestureDetector(
                                        onTap: () {
                                          // Navigate to ProductView when the image is tapped
                                          Navigator.of(context).push(
                                            MaterialPageRoute(
                                              builder: (context) => ProductView(
                                                  product: product,
                                                  products: allProducts),
                                            ),
                                          );
                                        },
                                        child: Padding(
                                          padding: const EdgeInsets.all(
                                              8.0), // Reduced padding around the image
                                          child: ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(10.0),
                                            child: product.image.isNotEmpty
                                                ? Image.network(
                                                    'http://localhost:4000/upload/images/${product.image[0]}',
                                                    height:
                                                        200, // Height of the image
                                                    width: double
                                                        .infinity, // Width takes the full container width
                                                    fit: BoxFit
                                                        .cover, // Fill the space
                                                    errorBuilder: (context,
                                                        error, stackTrace) {
                                                      return Center(
                                                        child: Image.asset(
                                                            'assets/images/placeholder_food.png'), // Placeholder image path
                                                      );
                                                    },
                                                  )
                                                : Center(
                                                    child: Text(
                                                        "No image available")),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 4.0),
                                      Text(
                                        product.name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const SizedBox(height: 2.0),
                                      // Check that the correct price field is being used
                                      Text(
                                        '\₱${product.new_price}.00', // Ensure this is the correct price field
                                        style: const TextStyle(
                                          color: Color.fromARGB(255, 0, 0, 0),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}

class SearchProductsWidget extends StatefulWidget {
  final List<Product> products;
  final void Function(List<Product>) onProductSelected;

  const SearchProductsWidget({
    Key? key,
    required this.products,
    required this.onProductSelected,
  }) : super(key: key);

  @override
  _SearchProductsWidgetState createState() => _SearchProductsWidgetState();
}

class _SearchProductsWidgetState extends State<SearchProductsWidget> {
  String _searchQuery = '';
  List<Product> _filteredProducts = [];

  void _filterProducts(String query) {
    setState(() {
      _searchQuery = query.toLowerCase();
      _filteredProducts = widget.products.where((product) {
        // Check if the query matches the product name or any of the tags
        final matchesName = product.name.toLowerCase().contains(_searchQuery);
        final matchesTags =
            product.tags.any((tag) => tag.toLowerCase().contains(_searchQuery));
        return matchesName || matchesTags;
      }).toList();
    });
  }

  void _navigateToProductView(Product product) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductView(
          product: product,
          products: widget.products, // Pass the full list of products here
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          onChanged: _filterProducts,
          decoration: const InputDecoration(
            labelText: 'Search Products or Tags',
            prefixIcon: Icon(Icons.search),
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 200,
          child: _searchQuery.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.search,
                        size: 40.0, // Adjust size as needed
                        color: Colors.grey, // Optional: Set color
                      ),
                      const SizedBox(
                          height: 8.0), // Space between icon and text
                      const Text(
                        'Please enter a search term to find products.',
                        style: TextStyle(
                            color: Colors.grey), // Optional: Set color
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  itemCount: _filteredProducts.length,
                  itemBuilder: (context, index) {
                    final product = _filteredProducts[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          vertical: 4.0,
                          horizontal: 8.0), // Margin around the card
                      elevation: 2, // Optional: Shadow effect
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(
                            8.0), // Optional: Padding inside ListTile
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(
                              8.0), // Rounded corners for image
                          child: Image.network(
                            'http://localhost:4000/upload/images/${product.image[0]}', // Adjust image URL accordingly
                            width: 50, // Adjust width as needed
                            height: 50, // Adjust height as needed
                            fit: BoxFit.cover,
                          ),
                        ),
                        title: Text(product.name),
                        subtitle: Text(
                          '\₱${product.new_price}.00', // Display price here
                          style: const TextStyle(
                            color: Color.fromARGB(255, 0, 0, 0),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        onTap: () => _navigateToProductView(product),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
