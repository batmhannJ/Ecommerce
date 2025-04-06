import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:indigitech_shop/view_model/cart_view_model.dart';

class BottomNavBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemTapped;

  const BottomNavBar({
    Key? key,
    required this.selectedIndex,
    required this.onItemTapped,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: BottomNavigationBar(
        elevation: 10,
        items: <BottomNavigationBarItem>[
          const BottomNavigationBarItem(
            icon: Icon(Icons.home, size: 30),
            label: "Home",
          ),
          BottomNavigationBarItem(
            icon: Builder(
              builder: (context) {
                int itemCount = context
                    .select<CartViewModel, int>((value) => value.items.length);

                return Badge(
                  label: Text("$itemCount"),
                  isLabelVisible: itemCount > 0,
                  child: const Icon(Icons.shopping_cart, size: 30),
                );
              },
            ),
            label: "Cart",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person, size: 30),
            label: "Profile",
          ),
        ],
        currentIndex: selectedIndex,
        onTap: onItemTapped,
        selectedIconTheme: const IconThemeData(
          color: Colors.orange,
          size: 30,
        ),
        unselectedIconTheme: const IconThemeData(
          color: Colors.grey,
          size: 30,
        ),
      ),
    );
  }
}
