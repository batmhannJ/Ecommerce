import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/services/product_api_service.dart';
import 'package:indigitech_shop/model/product.dart';
import 'package:indigitech_shop/view/product_view.dart';
import 'dart:async';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ShopTabView extends StatefulWidget {
  const ShopTabView({Key? key}) : super(key: key);

  @override
  State<ShopTabView> createState() => _ShopTabViewState();
}

class PartnerStore {
  final String id;
  final String shopName;
  final String idPicture;
  final String businessLocation;

  PartnerStore({
    required this.id,
    required this.shopName,
    required this.idPicture,
    required this.businessLocation,
  });

  factory PartnerStore.fromJson(Map<String, dynamic> json) {
    return PartnerStore(
      id: json['_id'] ?? '',
      shopName: json['shopName'] ?? 'Unknown Store',
      idPicture: json['idPicture'] ?? '',
      businessLocation: json['businessLocation'] ?? 'Location not available',
    );
  }
}

late Future<List<PartnerStore>> _partnerStoresFuture;

Future<List<PartnerStore>> fetchPartnerStores() async {
  try {
    final response = await http.get(Uri.parse('http://localhost:4000/partner-stores'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => PartnerStore.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load partner stores');
    }
  } catch (e) {
    print('Error fetching partner stores: $e');
    return [];
  }
}

class _ShopTabViewState extends State<ShopTabView>
    with AutomaticKeepAliveClientMixin {
  final _scrollController = ScrollController();
  final _newCollectionsKey = GlobalKey();
  late Future<List<Product>> _productsFuture;
  List<Product> _selectedProducts = [];

  // Partner Stores Carousel
  final _pageController = PageController(viewportFraction: 0.85);
  int _currentPage = 0;
  Timer? _autoScrollTimer;

  // Background Image Slideshow
  final _bgPageController = PageController();
  int _currentBgPage = 0;
  Timer? _bgAutoScrollTimer;

  // Mock background images for slideshow
  final List<String> _backgroundImages = [
    'assets/images/bg_img.png',
    'assets/images/bg_img3.jpg',
    'assets/images/bg_img2.jpg',
  ];

  // Mock categories data
  final List<Map<String, String>> _categories = [
    {'name': 'Snacks', 'icon': 'assets/icons/snacks.png'},
    {'name': 'Beverages', 'icon': 'assets/icons/beverages.png'},
    {'name': 'Groceries', 'icon': 'assets/icons/groceries.png'},
    {'name': 'Personal Care', 'icon': 'assets/icons/personal_care.png'},
    {'name': 'Household', 'icon': 'assets/icons/household.png'},
  ];

  // Mock promotional deals data
  final List<Map<String, String>> _promotionalDeals = [
    {
      'title': 'Flash Sale: 50% Off Snacks!',
      'image': 'assets/images/deal_snacks.png',
      'description': 'Hurry, ends in 2 hours!',
    },
    {
      'title': 'Buy 1 Get 1 Free on Beverages',
      'image': 'assets/images/deal_beverages.png',
      'description': 'Limited time offer!',
    },
  ];

  void _updateSelectedProducts(List<Product> products) {
    setState(() {
      _selectedProducts = products;
    });
  }

  @override
  void initState() {
    super.initState();
    _productsFuture = ProductApiService.fetchProducts();
    _partnerStoresFuture = fetchPartnerStores();

    // Auto-scroll for background image slideshow
    if (_backgroundImages.isNotEmpty) {
      _bgAutoScrollTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
        if (_currentBgPage < _backgroundImages.length - 1) {
          _currentBgPage++;
        } else {
          _currentBgPage = 0;
        }
        _bgPageController.animateToPage(
          _currentBgPage,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      });
    }
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

  void _showSearchDialog(BuildContext context, List<Product> products) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          padding: const EdgeInsets.all(16),
          constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.7),
          child: SearchProductsWidget(
            products: products,
            onProductSelected: _updateSelectedProducts,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _pageController.dispose();
    _bgPageController.dispose();
    _autoScrollTimer?.cancel();
    _bgAutoScrollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      body: Stack(
        children: [
          SingleChildScrollView(
            controller: _scrollController,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: <Color>[
                    const Color(0xFFFEE6F6),
                    const Color(0xFFE8F0FE),
                    const Color(0xFFB3C8E8),
                    AppColors.primary.withOpacity(0.9),
                    AppColors.primary.withOpacity(0.6),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  stops: const <double>[0.05, 0.15, 0.3, 0.5, 1],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Gap(80), // Space for sticky header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: SizedBox(
                      height: 180,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          PageView.builder(
                            controller: _bgPageController,
                            itemCount: _backgroundImages.length,
                            onPageChanged: (index) {
                              setState(() {
                                _currentBgPage = index;
                              });
                            },
                            itemBuilder: (context, index) {
                              return AnimatedOpacity(
                                opacity: _currentBgPage == index ? 1.0 : 0.5,
                                duration: const Duration(milliseconds: 500),
                                child: Image.asset(
                                  _backgroundImages[index],
                                  fit: BoxFit.cover,
                                  height: 180,
                                  width: double.infinity,
                                ),
                              );
                            },
                          ),
                          Positioned(
                            bottom: 8,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                _backgroundImages.length,
                                (index) => Container(
                                  width: _currentBgPage == index ? 10 : 6,
                                  height: 6,
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  decoration: BoxDecoration(
                                    color: _currentBgPage == index ? Colors.white : Colors.white.withOpacity(0.5),
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Gap(24),
                  // Explore Button (Moved above Partner Stores)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: GestureDetector(
                      onTap: _scrollToNewCollections,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 600),
                        height: 52,
                        decoration: BoxDecoration(
                          color: const Color.fromARGB(255, 7, 96, 138), // Solid color as specified
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Explore Now",
                              style: AppTextStyles.button.copyWith(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 10),
                            const Icon(
                              Icons.explore,
                              color: Colors.white,
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const Gap(24),
                  // Partner Stores Carousel
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Text(
                          "Partner Stores",
                          style: AppTextStyles.headline5.copyWith(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 160,
                        child: FutureBuilder<List<PartnerStore>>(
                          future: _partnerStoresFuture,
                          builder: (context, snapshot) {
                            if (snapshot.connectionState == ConnectionState.waiting) {
                              return const Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CircularProgressIndicator(),
                                    Gap(8),
                                    Text('Loading partners...'),
                                  ],
                                ),
                              );
                            } else if (snapshot.hasError) {
                              return Center(
                                child: Text(
                                  'Error loading partners',
                                  style: AppTextStyles.subtitle1.copyWith(
                                    color: Colors.black54,
                                    fontSize: 16,
                                  ),
                                ),
                              );
                            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                              return Center(
                                child: Text(
                                  "No partner stores available",
                                  style: AppTextStyles.subtitle1.copyWith(
                                    color: Colors.black54,
                                    fontSize: 16,
                                  ),
                                ),
                              );
                            }

                            final stores = snapshot.data!;
                            return Stack(
                              children: [
                                PageView.builder(
                                  controller: _pageController,
                                  itemCount: stores.length,
                                  onPageChanged: (index) {
                                    setState(() {
                                      _currentPage = index;
                                    });
                                  },
                                  itemBuilder: (context, index) {
                                    final store = stores[index];
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 8),
                                      child: GestureDetector(
                                        onTap: () {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text("Visit ${store.shopName}")),
                                          );
                                        },
                                        child: AnimatedContainer(
                                          duration: const Duration(milliseconds: 400),
                                          curve: Curves.easeInOut,
                                          decoration: BoxDecoration(
                                            gradient: LinearGradient(
                                              colors: [
                                                Colors.white,
                                                AppColors.primary.withOpacity(0.05),
                                              ],
                                              begin: Alignment.topLeft,
                                              end: Alignment.bottomRight,
                                            ),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Row(
                                            children: [
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      store.shopName,
                                                      style: AppTextStyles.headline5.copyWith(
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.w700,
                                                        color: Colors.black87,
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                    const Gap(6),
                                                    Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                      decoration: BoxDecoration(
                                                        color: Colors.grey.shade100,
                                                        borderRadius: BorderRadius.circular(8),
                                                      ),
                                                      child: Text(
                                                        store.businessLocation,
                                                        style: AppTextStyles.subtitle1.copyWith(
                                                          fontSize: 11,
                                                          color: Colors.grey.shade700,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Padding(
                                                padding: const EdgeInsets.only(right: 12),
                                                child: ClipRRect(
                                                  borderRadius: BorderRadius.circular(12),
                                                  child: Image.network(
                                                    store.idPicture.isNotEmpty
                                                        ? store.idPicture
                                                        : 'http://localhost:4000/upload/images/placeholder.png',
                                                    width: 120,
                                                    height: 120,
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (context, error, stackTrace) => Image.asset(
                                                      'assets/images/placeholder_food.png',
                                                      width: 120,
                                                      height: 120,
                                                      fit: BoxFit.cover,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                Positioned(
                                  bottom: 8,
                                  right: 16,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(
                                      stores.length,
                                      (index) => AnimatedContainer(
                                        duration: const Duration(milliseconds: 300),
                                        width: _currentPage == index ? 8 : 5,
                                        height: 5,
                                        margin: const EdgeInsets.symmetric(horizontal: 2),
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: _currentPage == index ? AppColors.primary : Colors.grey.shade300,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const Gap(24),
                  // Categories Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Shop by Category",
                          style: AppTextStyles.headline5.copyWith(
                            color: Colors.black87,
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                          ),
                        ),
                        const SizedBox(
                          width: 120,
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 6),
                            child: Divider(
                              color: Colors.black87,
                              height: 0,
                              thickness: 3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Gap(16),
                  SizedBox(
                    height: 100,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      itemCount: _categories.length,
                      itemBuilder: (context, index) {
                        final category = _categories[index];
                        return Padding(
                          padding: const EdgeInsets.only(right: 16),
                          child: GestureDetector(
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text("Navigating to ${category['name']}")),
                              );
                            },
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Image.asset(
                                    category['icon']!,
                                    width: 40,
                                    height: 40,
                                    errorBuilder: (context, error, stackTrace) => const Icon(
                                      Icons.category,
                                      size: 40,
                                      color: Colors.black54,
                                    ),
                                  ),
                                ),
                                const Gap(8),
                                Text(
                                  category['name']!,
                                  style: AppTextStyles.subtitle1.copyWith(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const Gap(24),
                  // Promotional Deals Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Hot Deals",
                          style: AppTextStyles.headline5.copyWith(
                            color: Colors.black87,
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                          ),
                        ),
                        const SizedBox(
                          width: 120,
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 6),
                            child: Divider(
                              color: Colors.black87,
                              height: 0,
                              thickness: 3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Gap(16),
                  SizedBox(
                    height: 150,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      itemCount: _promotionalDeals.length,
                      itemBuilder: (context, index) {
                        final deal = _promotionalDeals[index];
                        return Container(
                          width: MediaQuery.of(context).size.width * 0.75,
                          margin: const EdgeInsets.only(right: 16),
                          child: GestureDetector(
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text("Viewing ${deal['title']}")),
                              );
                            },
                            child: Card(
                              elevation: 4,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: Image.asset(
                                      deal['image']!,
                                      fit: BoxFit.cover,
                                      width: double.infinity,
                                      height: double.infinity,
                                      errorBuilder: (context, error, stackTrace) => Container(
                                        color: Colors.grey.shade200,
                                        child: const Center(
                                          child: Icon(
                                            Icons.image_not_supported,
                                            size: 40,
                                            color: Colors.black54,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(16),
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.black.withOpacity(0.6),
                                          Colors.transparent,
                                        ],
                                        begin: Alignment.bottomCenter,
                                        end: Alignment.topCenter,
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 12,
                                    left: 12,
                                    right: 12,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          deal['title']!,
                                          style: AppTextStyles.headline5.copyWith(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const Gap(4),
                                        Text(
                                          deal['description']!,
                                          style: AppTextStyles.subtitle1.copyWith(
                                            color: Colors.white,
                                            fontSize: 12,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const Gap(24),
                  FutureBuilder<List<Product>>(
                    future: _productsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      } else if (snapshot.hasError) {
                        return Center(child: Text('Error: ${snapshot.error}'));
                      } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                        return const Center(child: Text('No products available'));
                      }

                      List<Product> allProducts = snapshot.data!;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Selected Products
                          if (_selectedProducts.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 24),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Selected Products",
                                    style: AppTextStyles.headline5.copyWith(
                                      color: Colors.black87,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 20,
                                    ),
                                  ),
                                  const SizedBox(
                                    width: 120,
                                    child: Padding(
                                      padding: EdgeInsets.symmetric(vertical: 6),
                                      child: Divider(
                                        color: Colors.black87,
                                        height: 0,
                                        thickness: 3,
                                      ),
                                    ),
                                  ),
                                  const Gap(12),
                                  ..._selectedProducts.map((product) {
                                    return Card(
                                      elevation: 2,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      margin: const EdgeInsets.symmetric(vertical: 8),
                                      child: ListTile(
                                        contentPadding: const EdgeInsets.all(12),
                                        leading: ClipRRect(
                                          borderRadius: BorderRadius.circular(8),
                                          child: Image.network(
                                            'http://localhost:4000/upload/images/${product.image[0]}',
                                            width: 60,
                                            height: 60,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) => Image.asset(
                                              'assets/images/placeholder_food.png',
                                              width: 60,
                                              height: 60,
                                              fit: BoxFit.cover,
                                            ),
                                          ),
                                        ),
                                        title: Text(
                                          product.name,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16,
                                          ),
                                        ),
                                        subtitle: Text(
                                          '\₱${product.new_price}.00',
                                          style: const TextStyle(
                                            color: Colors.black87,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ],
                              ),
                            ),
                          const Gap(24),
                          // New Collections
                          Padding(
                            key: _newCollectionsKey,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "New Collections",
                                  style: AppTextStyles.headline5.copyWith(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 22,
                                  ),
                                ),
                                const SizedBox(
                                  width: 120,
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(vertical: 6),
                                    child: Divider(
                                      color: Colors.black87,
                                      height: 0,
                                      thickness: 3,
                                    ),
                                  ),
                                ),
                                const Gap(16),
                                GridView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    childAspectRatio: 0.75,
                                    crossAxisSpacing: 16,
                                    mainAxisSpacing: 16,
                                  ),
                                  itemCount: allProducts.length,
                                  itemBuilder: (context, index) {
                                    final product = allProducts[index];
                                    return GestureDetector(
                                      onTap: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (context) => ProductView(
                                              product: product,
                                              products: allProducts,
                                            ),
                                          ),
                                        );
                                      },
                                      child: Card(
                                        elevation: 3,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Expanded(
                                              child: ClipRRect(
                                                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                                child: Image.network(
                                                  'http://localhost:4000/upload/images/${product.image[0]}',
                                                  fit: BoxFit.cover,
                                                  width: double.infinity,
                                                  loadingBuilder: (context, child, loadingProgress) {
                                                    if (loadingProgress == null) return child;
                                                    return const Center(child: CircularProgressIndicator());
                                                  },
                                                  errorBuilder: (context, error, stackTrace) => Image.asset(
                                                    'assets/images/placeholder_food.png',
                                                    fit: BoxFit.cover,
                                                    width: double.infinity,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Padding(
                                              padding: const EdgeInsets.all(12),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    product.name,
                                                    style: const TextStyle(
                                                      fontWeight: FontWeight.w600,
                                                      fontSize: 15,
                                                    ),
                                                    maxLines: 2,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  const Gap(4),
                                                  Text(
                                                    '\₱${product.new_price}.00',
                                                    style: const TextStyle(
                                                      color: Colors.black87,
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 14,
                                                    ),
                                                  ),
                                                ],
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
                          const Gap(80),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.95),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: SafeArea(
                child: GestureDetector(
                  onTap: () async {
                    final snapshot = await _productsFuture;
                    _showSearchDialog(context, snapshot);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search, color: Colors.grey.shade600),
                        const SizedBox(width: 8),
                        Text(
                          'Search Products or Tags',
                          style: AppTextStyles.subtitle1.copyWith(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _scrollToNewCollections,
        backgroundColor: const Color(0xFF6B7280),
        child: const Icon(Icons.explore, color: Color.fromARGB(255, 14, 9, 9)),
        tooltip: 'Explore New Collections',
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
        final matchesName = product.name.toLowerCase().contains(_searchQuery);
        final matchesTags = product.tags.any((tag) => tag.toLowerCase().contains(_searchQuery));
        return matchesName || matchesTags;
      }).toList();
    });
  }

  void _navigateToProductView(Product product) {
    Navigator.pop(context);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductView(
          product: product,
          products: widget.products,
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
          decoration: InputDecoration(
            labelText: 'Search Products or Tags',
            prefixIcon: Icon(Icons.search, color: Colors.grey.shade600),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            filled: true,
            fillColor: Colors.grey.shade100,
          ),
        ),
        const Gap(16),
        Expanded(
          child: _searchQuery.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.search,
                        size: 40,
                        color: Colors.grey.shade600,
                      ),
                      const Gap(8),
                      Text(
                        'Enter a search term to find products',
                        style: AppTextStyles.subtitle1.copyWith(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                )
              : _filteredProducts.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search_off,
                            size: 40,
                            color: Colors.grey.shade600,
                          ),
                          const Gap(8),
                          Text(
                            'No products found',
                            style: AppTextStyles.subtitle1.copyWith(color: Colors.grey.shade600),
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
                          margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(8),
                            leading: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                'http://localhost:4000/upload/images/${product.image[0]}',
                                width: 50,
                                height: 50,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Image.asset(
                                  'assets/images/placeholder_food.png',
                                  width: 50,
                                  height: 50,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                            title: Text(
                              product.name,
                              style: AppTextStyles.subtitle1.copyWith(fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text(
                              '\₱${product.new_price}.00',
                              style: AppTextStyles.subtitle1.copyWith(
                                color: Colors.grey.shade600,
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