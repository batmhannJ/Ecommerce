import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/view/accountSetings_view.dart';
import 'package:indigitech_shop/view/address_view.dart';
import 'package:indigitech_shop/view/auth/auth_view.dart';
import 'package:indigitech_shop/view/changePasswordView.dart';
import 'package:indigitech_shop/view/checkout_result.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../widget/buttons/custom_filled_button.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final isLoggedIn = context.watch<AuthViewModel>().isLoggedIn;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color.fromARGB(255, 243, 231, 231),
              Color.fromARGB(255, 217, 221, 221)
            ], // Cool gradient background
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: isLoggedIn
            ? Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header section
                    Text(
                      "Welcome Back!",
                      style: AppTextStyles.headline4.copyWith(
                        color: Colors.black87,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Gap(10),
                    Text(
                      "Manage your account and preferences below.",
                      style: AppTextStyles.subtitle1.copyWith(
                        color: Colors.black54,
                      ),
                    ),
                    const Gap(40),

                    // Cards section
                    _buildCardSection(
                      icon: Icons.account_circle,
                      label: "Account Settings",
                      onPressed: () =>
                          Navigator.of(context).push(MaterialPageRoute(
                        builder: (context) => const AccountSettingsView(),
                      )),
                    ),
                    const Gap(20),
                    _buildCardSection(
                      icon: Icons.location_on,
                      label: "Shipping Address",
                      onPressed: () =>
                          Navigator.of(context).push(MaterialPageRoute(
                        builder: (context) => const AddressView(),
                      )),
                    ),
                    const Gap(20),
                    _buildCardSection(
                      icon: Icons.lock,
                      label: "Change Password",
                      onPressed: () =>
                          Navigator.of(context).push(MaterialPageRoute(
                        builder: (context) => const ChangePasswordView(),
                      )),
                    ),
                    const Gap(20),
                    _buildCardSection(
                      icon: Icons.shopping_cart,
                      label: "My Orders",
                      onPressed: () async {
                        // Retrieve userId from SharedPreferences
                        SharedPreferences prefs =
                            await SharedPreferences.getInstance();
                        final userId = prefs.getString('userId');

                        // Check if userId exists
                        if (userId == null || userId.isEmpty) {
                          Fluttertoast.showToast(
                              msg:
                                  "User is not logged in. Redirecting to Login.");

                          return;
                        }

                        // Navigate to CheckoutSuccessView with the userId
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) =>
                                CheckoutSuccessView(userId: userId),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              )
            : const AuthView(fromProfile: true),
      ),
      bottomNavigationBar: isLoggedIn
          ? Container(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                onPressed: () {
                  context.read<AuthViewModel>().logout();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      const Color(0xFF778C62), // Logout button color
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(3),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  minimumSize:
                      const Size.fromHeight(50), // Increased button height
                ),
                child: Text(
                  "Logout",
                  style: AppTextStyles.button.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            )
          : null,
    );
  }

// Card-based layout for each action (e.g., "Shipping Address")
  Widget _buildCardSection({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white, // White background for the card
          borderRadius: BorderRadius.circular(12), // Smooth rounded corners
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.15), // Light shadow for depth
              spreadRadius: 2,
              blurRadius: 8,
              offset: const Offset(0, 4), // Slightly offset shadow
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 24,
              color:
                  const Color.fromARGB(255, 0, 0, 0), // Modern blue icon color
            ),
            const Gap(20),
            Text(
              label,
              style: AppTextStyles.subtitle1.copyWith(
                fontWeight: FontWeight.w500, // Medium font weight
                color: Colors.black87, // Neutral dark text
              ),
            ),
          ],
        ),
      ),
    );
  }
}
