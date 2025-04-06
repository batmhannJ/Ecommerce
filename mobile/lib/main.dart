import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/font_weights.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/model/address.dart';
import 'package:indigitech_shop/view/address_view.dart';
import 'package:indigitech_shop/view/cart_view.dart';
import 'package:indigitech_shop/view/checkout_view.dart';
import 'package:indigitech_shop/view/home/home_view.dart';
import 'package:indigitech_shop/view/auth/login_view.dart';
import 'package:indigitech_shop/view/auth/signup_view.dart';
import 'package:indigitech_shop/view/profile_view.dart';
import 'package:indigitech_shop/view_model/address_view_model.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:indigitech_shop/view_model/cart_view_model.dart';
import 'package:indigitech_shop/view_model/checkout_manager_model.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:indigitech_shop/view/checkout_result.dart';
import 'package:app_links/app_links.dart';
import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CheckoutManager()),
        ChangeNotifierProvider(create: (context) => CartViewModel()),
        ChangeNotifierProvider(create: (context) => AuthViewModel()),
        ChangeNotifierProvider(create: (context) => AddressViewModel()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  int _selectedIndex = 0;
  late final AppLinks _appLinks;
  StreamSubscription<Uri?>? _sub;

  @override
  void initState() {
    super.initState();
    _appLinks = AppLinks();
    _initDeepLink();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _handleWebRedirect();
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  void _initDeepLink() async {
    try {
      final initialUri = await _appLinks.getInitialAppLink();
      if (initialUri != null) {
        _handleDeepLink(initialUri);
      }
      _sub = _appLinks.uriLinkStream.listen((Uri? uri) {
        if (uri != null) {
          _handleDeepLink(uri);
        }
      }, onError: (err) {
        print('Deep link error: $err');
      });
    } catch (e) {
      print('Failed to initialize deep linking: $e');
    }
  }

  void _handleDeepLink(Uri uri) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('userId');
    if (uri.host == 'checkout-success') {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
            builder: (context) => CheckoutSuccessView(userId: userId!)),
      );
    } else if (uri.host == 'checkout-failure') {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => CheckoutFailureView()),
      );
    }
  }

  Future<void> _handleWebRedirect() async {
    if (!kIsWeb) return;
    final uri = Uri.base;
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('userId');
    if (uri.queryParameters['message'] == 'true') {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
            builder: (context) => CheckoutSuccessView(userId: userId!)),
      );
    } else if (uri.queryParameters['message'] == 'false') {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => CheckoutFailureView()),
      );
    }
  }

  Future<void> openPaymentUrl(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } else {
      Fluttertoast.showToast(msg: "Could not open payment link.");
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'Tienda',
      home: SafeArea(
        child: Scaffold(
          body: IndexedStack(
            index: _selectedIndex,
            children: _screens(context),
          ),
        ),
      ),
      builder: (context, child) {
        return MediaQuery.withNoTextScaling(
            child: child ?? const SizedBox.shrink());
      },
    );
  }

  List<Widget> _screens(BuildContext context) {
    final authViewModel = context.watch<AuthViewModel>();
    String? userId;
    SharedPreferences.getInstance().then((prefs) {
      userId = prefs.getString('userId');
    });
    return <Widget>[
      const HomeView(),
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
}