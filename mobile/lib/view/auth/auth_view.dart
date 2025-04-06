import 'package:flutter/material.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/view/auth/signup_view.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:provider/provider.dart';

import 'login_view.dart';

class AuthView extends StatefulWidget {
  final bool fromProfile;
  const AuthView({
    super.key,
    this.fromProfile = false,
  });

  @override
  State<AuthView> createState() => _AuthViewState();
}

class _AuthViewState extends State<AuthView> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: !widget.fromProfile
          ? AppBar(
              backgroundColor: AppColors.primary,
            )
          : null,
      body: SafeArea(
        child: IndexedStack(
          index: _currentIndex,
          children: [
            LoginView(
              onCreateAccount: () {
                setState(() {
                  _currentIndex = 1;
                });
              },
              onLogin: () {
                context.read<AuthViewModel>().login();

                if (widget.fromProfile) return;
                Navigator.of(context).pop();
              },
            ),
            SignupView(
              onLogin: () {
                setState(() {
                  _currentIndex = 0;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
