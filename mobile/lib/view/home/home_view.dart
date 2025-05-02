import 'package:flutter/material.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/view/auth/signup_view.dart';
import 'package:indigitech_shop/view/home/tabs/clothes_tab_view.dart';
import 'package:indigitech_shop/view/home/tabs/crafts_tab_view.dart';
import 'package:indigitech_shop/view/home/tabs/food_tab_view.dart';
import 'package:indigitech_shop/view/home/tabs/shop_tab_view.dart';
import 'package:indigitech_shop/view/auth/login_view.dart';
import 'package:indigitech_shop/view/cart_view.dart';
import 'package:indigitech_shop/view/profile_view.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:indigitech_shop/view_model/cart_view_model.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
      const CartView(),
      const ProfileView(),
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
      body: _screens(context)[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 15,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          child: BottomNavigationBar(
            elevation: 10,
            backgroundColor: Colors.white,
            type: BottomNavigationBarType.fixed,
            items: <BottomNavigationBarItem>[
              const BottomNavigationBarItem(
                icon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(
                    Symbols.home,
                    size: 28,
                  ),
                ),
                activeIcon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(
                    Symbols.home,
                    size: 28,
                    fill: 1.0,
                  ),
                ),
                label: "Home",
              ),
              BottomNavigationBarItem(
                icon: Builder(
                  builder: (context) {
                    int uniqueItemCount = context.select<CartViewModel, int>(
                      (value) => value.getUniqueItemCount(),
                    );

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Badge(
                        label: Text(
                          "$uniqueItemCount",
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        isLabelVisible: uniqueItemCount > 0,
                        backgroundColor: Colors.redAccent,
                        largeSize: 20,
                        padding: const EdgeInsets.symmetric(horizontal: 6),
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

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Badge(
                        label: Text(
                          "$uniqueItemCount",
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        isLabelVisible: uniqueItemCount > 0,
                        backgroundColor: Colors.redAccent,
                        largeSize: 20,
                        padding: const EdgeInsets.symmetric(horizontal: 6),
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
              const BottomNavigationBarItem(
                icon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(
                    Symbols.person,
                    size: 28,
                  ),
                ),
                activeIcon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(
                    Symbols.person,
                    size: 28,
                    fill: 1.0,
                  ),
                ),
                label: "Profile",
              ),
            ],
            currentIndex: _selectedIndex,
            onTap: _onItemTapped,
            selectedItemColor: Colors.orange,
            unselectedItemColor: Colors.grey[600],
            selectedIconTheme: const IconThemeData(
              color: Colors.orange,
              size: 28,
            ),
            unselectedIconTheme: const IconThemeData(
              color: Colors.grey,
              size: 28,
            ),
            selectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
            unselectedLabelStyle: const TextStyle(
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }
}

class HomeScreenTabs extends StatelessWidget {
  const HomeScreenTabs({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
          title: const Text(
            "Browse Categories",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 22,
              color: Colors.black87,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.search, color: Colors.black54, size: 26),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.notifications_none_rounded, color: Colors.black54, size: 26),
              onPressed: () {},
            ),
            const SizedBox(width: 4),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(60),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: TabBar(
                tabs: const [
                  Tab(
                    icon: Icon(Icons.store_rounded),
                    text: 'Shop',
                  ),
                  Tab(
                    icon: Icon(Icons.fastfood_rounded),
                    text: 'Food',
                  ),
                  Tab(
                    icon: Icon(Icons.brush_rounded),
                    text: 'Crafts',
                  ),
                  Tab(
                    icon: Icon(Icons.shopping_bag_rounded),
                    text: 'Clothes',
                  ),
                ],
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                labelColor: Colors.orange,
                unselectedLabelColor: Colors.grey[700],
                indicatorColor: Colors.orange,
                indicatorWeight: 3,
                indicatorSize: TabBarIndicatorSize.label,
                dividerColor: Colors.transparent,
                labelPadding: const EdgeInsets.symmetric(vertical: 8),
              ),
            ),
          ),
        ),
        body: Container(
          color: Colors.grey[50],
          child: const TabBarView(
            children: [
              ShopTabView(),
              FoodTabView(),
              CraftsTabView(),
              ClothesTabView(),
            ],
          ),
        ),
      ),
    );
  }
}