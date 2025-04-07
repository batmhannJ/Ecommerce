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
      body: _screens(
          context)[_selectedIndex], // Show selected screen based on index
      bottomNavigationBar: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        child: BottomNavigationBar(
          elevation: 10,
          items: <BottomNavigationBarItem>[
            const BottomNavigationBarItem(
              icon: Icon(
                Symbols.home,
                size: 30,
              ),
              label: "Home",
            ),
            BottomNavigationBarItem(
              icon: Builder(
                builder: (context) {
                  int uniqueItemCount = context.select<CartViewModel, int>(
                    (value) => value
                        .getUniqueItemCount(), // Use getUniqueItemCount() instead
                  );

                  return Badge(
                    label: Text("$uniqueItemCount"),
                    isLabelVisible: uniqueItemCount > 0,
                    child: const Icon(
                      Symbols.shopping_cart,
                      size: 30,
                    ),
                  );
                },
              ),
              label: "Cart",
            ),
            const BottomNavigationBarItem(
              icon: Icon(
                Symbols.person,
                size: 30,
              ),
              label: "Profile",
            ),
          ],
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          selectedIconTheme: const IconThemeData(
            color: Colors.orange,
            size: 30,
          ),
          unselectedIconTheme: const IconThemeData(
            color: Colors.grey,
            size: 30,
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
          bottom: TabBar(
            tabs: const [
              Tab(icon: Icon(Icons.store), text: 'Shop'),
              Tab(icon: Icon(Icons.fastfood), text: 'Food'),
              Tab(icon: Icon(Icons.brush), text: 'Crafts'),
              Tab(icon: Icon(Icons.shopping_bag), text: 'Clothes'),
            ],
            labelStyle:
                const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            labelColor: Colors.black,
            unselectedLabelColor: Colors.grey[700],
          ),
        ),
        body: const TabBarView(
          children: [
            ShopTabView(),
            FoodTabView(),
            CraftsTabView(),
            ClothesTabView(),
          ],
        ),
      ),
    );
  }
}
