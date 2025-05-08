import 'package:flutter/material.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/view/auth/signup_view.dart';
import 'package:indigitech_shop/view/home/tabs/clothes_tab_view.dart';
import 'package:indigitech_shop/view/home/tabs/crafts_tab_view.dart';
import 'package:indigitech_shop/view/home/tabs/food_tab_view.dart';
import 'package:indigitech_shop/view/home/tabs/shop_tab_view.dart';
import 'package:indigitech_shop/view/auth/login_view.dart';
import 'package:indigitech_shop/view/cart_view.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:indigitech_shop/view_model/cart_view_model.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  List<Widget> _screens(BuildContext context) {
    final authViewModel = context.watch<AuthViewModel>();

    return <Widget>[
      const HomeScreenTabs(),
      const PartnerStoresView(),
      const CartView(),
      LoginView(
        onLogin: () {
          final authViewModel = context.read<AuthViewModel>();
          authViewModel.logins().then((_) async {
            if (authViewModel.isLoggedIn) {
              final userInfo = authViewModel.user;
              SharedPreferences prefs = await SharedPreferences.getInstance();
              await prefs.setString('userId', userInfo!.id);
              await prefs.setString('userName', userInfo.name);
              await prefs.setString('userEmail', userInfo.email);

              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (context) => const HomeView()),
              );
            }
          });
        },
        onCreateAccount: () {
          final authViewModel = context.read<AuthViewModel>();
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => SignupView(
                onLogin: () {
                  authViewModel.logins();
                },
              ),
            ),
          );
        },
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: _screens(context)[_selectedIndex],
      bottomNavigationBar: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 12,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          elevation: 0,
          backgroundColor: Colors.transparent,
          type: BottomNavigationBarType.fixed,
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: AnimatedScale(
                scale: _selectedIndex == 0 ? 1.2 : 1.0,
                duration: const Duration(milliseconds: 250),
                child: const Icon(
                  Symbols.home,
                  size: 28,
                ),
              ),
              activeIcon: AnimatedScale(
                scale: 1.2,
                duration: const Duration(milliseconds: 250),
                child: const Icon(
                  Symbols.home,
                  size: 28,
                  fill: 1.0,
                ),
              ),
              label: "Home",
            ),
            BottomNavigationBarItem(
              icon: AnimatedScale(
                scale: _selectedIndex == 1 ? 1.2 : 1.0,
                duration: const Duration(milliseconds: 250),
                child: const Icon(
                  Icons.store_rounded,
                  size: 28,
                ),
              ),
              activeIcon: AnimatedScale(
                scale: 1.2,
                duration: const Duration(milliseconds: 250),
                child: const Icon(
                  Icons.store_rounded,
                  size: 28,
                  fill: 1.0,
                ),
              ),
              label: "Shop",
            ),
            BottomNavigationBarItem(
              icon: Builder(
                builder: (context) {
                  int uniqueItemCount = context.select<CartViewModel, int>(
                    (value) => value.getUniqueItemCount(),
                  );

                  return AnimatedScale(
                    scale: _selectedIndex == 2 ? 1.2 : 1.0,
                    duration: const Duration(milliseconds: 250),
                    child: Badge(
                      label: Text(
                        "$uniqueItemCount",
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      isLabelVisible: uniqueItemCount > 0,
                      backgroundColor: const Color(0xFFFFAB91),
                      largeSize: 18,
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      offset: const Offset(10, -10),
                      child: const Icon(
                        Symbols.shopping_cart,
                        size: 28,
                      ),
                    ),
                  );
                },
              ),
              activeIcon: Builder(
                builder: (context) {
                  int uniqueItemCount = context.select<CartViewModel, int>(
                    (value) => value.getUniqueItemCount(),
                  );

                  return AnimatedScale(
                    scale: 1.2,
                    duration: const Duration(milliseconds: 250),
                    child: Badge(
                      label: Text(
                        "$uniqueItemCount",
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      isLabelVisible: uniqueItemCount > 0,
                      backgroundColor: const Color(0xFFFFAB91),
                      largeSize: 18,
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      offset: const Offset(10, -10),
                      child: const Icon(
                        Symbols.shopping_cart,
                        size: 28,
                        fill: 1.0,
                      ),
                    ),
                  );
                },
              ),
              label: "Cart",
            ),
            BottomNavigationBarItem(
              icon: AnimatedScale(
                scale: _selectedIndex == 3 ? 1.2 : 1.0,
                duration: const Duration(milliseconds: 250),
                child: const Icon(
                  Symbols.person,
                  size: 28,
                ),
              ),
              activeIcon: AnimatedScale(
                scale: 1.2,
                duration: const Duration(milliseconds: 250),
                child: const Icon(
                  Symbols.person,
                  size: 28,
                  fill: 1.0,
                ),
              ),
              label: "Account",
            ),
          ],
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          selectedItemColor: const Color(0xFFffccbc),
          unselectedItemColor: Colors.grey[600],
          selectedIconTheme: const IconThemeData(
            color: Color(0xFFffccbc),
            size: 28,
          ),
          unselectedIconTheme: const IconThemeData(
            color: Colors.grey,
            size: 28,
          ),
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 12,
          ),
          showUnselectedLabels: false,
        ),
      ),
    );
  }
}

class HomeScreenTabs extends StatefulWidget {
  const HomeScreenTabs({Key? key}) : super(key: key);

  @override
  State<HomeScreenTabs> createState() => _HomeScreenTabsState();
}

class _HomeScreenTabsState extends State<HomeScreenTabs> {
  String _userAddress = "Fetching location...";

  @override
  void initState() {
    super.initState();
    _fetchUserAddress();
  }

  Future<void> _fetchUserAddress() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? businessLocation = prefs.getString('businessLocation') ?? 'Location not set';
    setState(() {
      _userAddress = businessLocation;
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        backgroundColor: Colors.grey[200],
        body: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                color: const Color(0xFFffccbc),
                padding: const EdgeInsets.only(top: 20, bottom: 10, left: 16, right: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on,
                          color: Colors.white,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _userAddress,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                              color: Colors.white,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: TabBar(
                  isScrollable: true,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  tabs: [
                    _buildTab("Home", Icons.local_offer, 0),
                    _buildTab("Food", Icons.fastfood_rounded, 2),
                    _buildTab("Crafts", Icons.brush_rounded, 3),
                    _buildTab("Clothes", Icons.shopping_bag_rounded, 4),
                  ],
                  labelColor: const Color(0xFFFFAB91),
                  unselectedLabelColor: Colors.grey[600],
                  indicator: BoxDecoration(
                    color: const Color(0xFFFFAB91).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  indicatorPadding: const EdgeInsets.symmetric(vertical: 4),
                  splashBorderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
            SliverFillRemaining(
              child: Container(
                color: Colors.white,
                child: const TabBarView(
                  children: [
                    ShopTabView(),
                    ShopTabView(),
                    FoodTabView(),
                    CraftsTabView(),
                    ClothesTabView(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String title, IconData icon, int index) {
    return Tab(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
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

class PartnerStoresView extends StatefulWidget {
  const PartnerStoresView({Key? key}) : super(key: key);

  @override
  State<PartnerStoresView> createState() => _PartnerStoresViewState();
}

class _PartnerStoresViewState extends State<PartnerStoresView> {
  late Future<List<PartnerStore>> _partnerStoresFuture;
  String _searchQuery = '';
  List<PartnerStore> _filteredStores = [];

  @override
  void initState() {
    super.initState();
    _partnerStoresFuture = fetchPartnerStores();
  }

  void _filterStores(String query, List<PartnerStore> stores) {
    setState(() {
      _searchQuery = query.toLowerCase();
      _filteredStores = stores.where((store) {
        return store.shopName.toLowerCase().contains(_searchQuery);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        title: Text(
          "Partner Stores",
          style: AppTextStyles.headline5.copyWith(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: TextField(
              onChanged: (query) async {
                final stores = await _partnerStoresFuture;
                _filterStores(query, stores);
              },
              decoration: InputDecoration(
                hintText: 'Search Stores',
                prefixIcon: Icon(Icons.search, color: Colors.grey.shade600),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                filled: true,
                fillColor: Colors.grey.shade100,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                hintStyle: AppTextStyles.subtitle1.copyWith(
                  color: Colors.grey.shade500,
                  fontSize: 14,
                ),
              ),
              style: AppTextStyles.subtitle1.copyWith(fontSize: 14),
            ),
          ),
          Expanded(
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
                        Text('Loading partner stores...'),
                      ],
                    ),
                  );
                } else if (snapshot.hasError) {
                  return Center(
                    child: Text(
                      'Error loading partner stores',
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
                final displayStores = _searchQuery.isEmpty ? stores : _filteredStores;

                if (displayStores.isEmpty && _searchQuery.isNotEmpty) {
                  return Center(
                    child: Text(
                      "No stores found",
                      style: AppTextStyles.subtitle1.copyWith(
                        color: Colors.black54,
                        fontSize: 16,
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: displayStores.length,
                  itemBuilder: (context, index) {
                    final store = displayStores[index];
                    return GestureDetector(
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text("Visit ${store.shopName}")),
                        );
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeInOut,
                        transform: Matrix4.identity()..rotateZ(0.01),
                        transformAlignment: Alignment.center,
                        child: Card(
                          elevation: 4,
                          margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Container(
                            height: 90,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              gradient: LinearGradient(
                                colors: [
                                  Colors.white,
                                  AppColors.primary.withOpacity(0.1),
                                ],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                            ),
                            child: Row(
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: AppColors.primary.withOpacity(0.3),
                                        width: 1.5,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.1),
                                          blurRadius: 6,
                                          offset: const Offset(2, 2),
                                        ),
                                      ],
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.network(
                                        store.idPicture.isNotEmpty
                                            ? store.idPicture
                                            : 'http://localhost:4000/upload/images/placeholder.png',
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
                                  ),
                                ),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          store.shopName,
                                          style: AppTextStyles.subtitle1.copyWith(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: Colors.black87,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          store.businessLocation,
                                          style: AppTextStyles.subtitle1.copyWith(
                                            fontSize: 12,
                                            color: Colors.grey.shade600,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}