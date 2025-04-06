import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/font_weights.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/model/user.dart';
import 'package:indigitech_shop/services/address_service.dart';
import 'package:indigitech_shop/view/address_view.dart';
import 'package:indigitech_shop/view/auth/login_view.dart';
import 'package:indigitech_shop/view/auth/signup_view.dart';
import 'package:indigitech_shop/view/layout/default_view_layout.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:indigitech_shop/view_model/checkout_manager_model.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http; // Add this import
import 'package:webview_flutter/webview_flutter.dart';
import 'dart:convert';
import '../model/address.dart';
import '../model/product.dart';
import '../view_model/cart_view_model.dart';
import '../widget/buttons/custom_filled_button.dart';
import 'package:indigitech_shop/view/checkout_result.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:math';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:fluttertoast/fluttertoast.dart';
//import 'dart:html' as html; // For monitoring window location on the web
import 'package:flutter/foundation.dart'; // For kIsWeb

final GlobalKey<CheckoutViewState> checkoutViewKey =
    GlobalKey<CheckoutViewState>();

class CheckoutView extends StatefulWidget {
  final User? user; // User information passed from AddressView
  final Address? address;
  final List<Map<String, dynamic>>
      cartItems; // List of items with product name, size, and quantity
  final double subtotal; // Add subtotal parameter

  const CheckoutView({
    super.key,
    this.user,
    this.address,
    required this.cartItems, // Make cartItems required
    required this.subtotal,
  });

  @override
  State<CheckoutView> createState() => CheckoutViewState();
}

class CheckoutViewState extends State<CheckoutView> {
  final AddressService _addressService =
      AddressService('https://isaacdarcilla.github.io/philippine-addresses');
  int? _stockCount;
  double shippingFee = 0.0; // Non-nullable, default to 0.0

  Future<Map<String, double>?> fetchCoordinates(String address) async {
    const apiKey = '1e898dd6e9c8d306350d701870c5e1a8';
    final url =
        'http://api.positionstack.com/v1/forward?access_key=$apiKey&query=$address&country=PH';

    print("Fetching coordinates for address: $address");

    try {
      // Delay bago magpadala ng request
      await Future.delayed(Duration(seconds: 2));

      final response = await http.get(Uri.parse(url));
      print("Response status: ${response.statusCode}");
      print("Response body: ${response.body}");

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['data'] != null && data['data'].isNotEmpty) {
          try {
            // Prioritize results with high confidence
            final result = data['data'].firstWhere(
              (entry) =>
                  entry['confidence'] != null && entry['confidence'] > 0.7,
              orElse: () => data['data'][0], // Fallback to the first result
            );

            if (result['country_code'] == 'PHL') {
              print("Fetched Coordinates: $result");
              return {
                'latitude': result['latitude'],
                'longitude': result['longitude'],
              };
            } else {
              print("Address is outside the Philippines.");
              Fluttertoast.showToast(
                  msg: "Address must be in the Philippines.");
            }
          } catch (e) {
            print("Error filtering results: $e");
            Fluttertoast.showToast(msg: "Error processing coordinates.");
          }
        } else {
          print("No data found for the address.");
          Fluttertoast.showToast(msg: "Unable to resolve address.");
        }
      }
    } catch (error) {
      print("Error fetching coordinates: $error");
      Fluttertoast.showToast(msg: "Error fetching coordinates.");
    }

    return null; // Return null if unsuccessful
  }

  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double earthRadiusKm = 6371;

    final dLat = _degreesToRadians(lat2 - lat1);
    final dLon = _degreesToRadians(lon2 - lon1);

    final a = (sin(dLat / 2) * sin(dLat / 2)) +
        cos(_degreesToRadians(lat1)) *
            cos(_degreesToRadians(lat2)) *
            (sin(dLon / 2) * sin(dLon / 2));

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadiusKm * c; // Returns distance in kilometers
  }

  double _degreesToRadians(double degrees) {
    return degrees * (pi / 180);
  }

  Future<void> calculateShippingFee(BuildContext context) async {
    const mainOfficeLat = 14.628488;
    const mainOfficeLon = 121.03342;
    const double baseFeeSameRegion = 20.0;
    const double baseFeeOtherRegion = 40.0;
    const double feePerMileSameRegion = 2.0;
    const double feePerMileOtherRegion = 3.0;
    const double maxFeeSameRegion = 100.0;
    const double maxFeeOtherRegion = 200.0;
    const double kmToMileConversion = 0.621371;
    final authViewModel = context.read<AuthViewModel>();
    final userAddress = authViewModel.address;

    if (userAddress == null) {
      print("User address is null");
      Fluttertoast.showToast(msg: "Please provide a valid shipping address.");
      return;
    }

    const double baseRate = 50.0;
    const double ratePerKm = 5.0;

    // Get readable names for the address components
    final regionName = getRegionName(userAddress.region);
    final provinceName = getProvinceName(userAddress.province);
    final cityName = getCityName(userAddress.municipality);
    final barangayName = getBarangayName(userAddress.barangay);

    // Construct the full address using readable names
    final fullAddress =
        '$barangayName, $cityName, $provinceName, $regionName, Philippines';

    print("Fetching coordinates for address: $fullAddress");

    // Fetch coordinates based on the formatted address
    final userCoordinates = await fetchCoordinates(fullAddress);

    if (userCoordinates == null) {
      print("Failed to fetch coordinates.");
      Fluttertoast.showToast(
          msg: "Unable to calculate shipping fee. Please try again.");
      return;
    }

    final distanceKm = calculateDistance(
      mainOfficeLat,
      mainOfficeLon,
      userCoordinates['latitude']!,
      userCoordinates['longitude']!,
    );

    final distanceMiles = distanceKm * kmToMileConversion;
    final isSameRegion =
        userAddress.region == "Metro Manila" || userAddress.region == "NCR";
    final baseFee = isSameRegion ? baseFeeSameRegion : baseFeeOtherRegion;
    final feePerMile =
        isSameRegion ? feePerMileSameRegion : feePerMileOtherRegion;

    // Calculate total fee
    double totalFee = baseFee + feePerMile * distanceMiles.ceil();
    final maxDeliveryFee = isSameRegion ? maxFeeSameRegion : maxFeeOtherRegion;
    totalFee = totalFee > maxDeliveryFee ? maxDeliveryFee : totalFee;

    if (distanceKm > 1000) {
      print("Invalid distance: $distanceKm km");
      Fluttertoast.showToast(msg: "Address is outside the serviceable area.");
      return;
    }

    //final fee = baseRate + (distanceKm * ratePerKm);

    setState(() {
      shippingFee = double.parse(totalFee.toStringAsFixed(2));
    });

    print("Calculated Shipping Fee: PHP $shippingFee");
  }
Future<void> proceedToPayment(BuildContext context) async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final authViewModel = context.read<AuthViewModel>();
    final cartViewModel = context.read<CartViewModel>();

    final userId = prefs.getString('userId');
    await authViewModel.fetchUserDetails();
    final currentUser = authViewModel.user;
    final userAddress = authViewModel.address;

    if (userAddress == null || currentUser == null) {
      Fluttertoast.showToast(msg: "Please complete your profile and address.");
      return;
    }

    // Save cart items to SharedPreferences
    final items = cartViewModel.cartItemsList.map((entry) {
      final product = entry.key;
      final details = entry.value;
      return {
        'name': product.name,
        'selectedSize': details['selectedSize'],
        'quantity': details['quantity'],
        'cartItemId': details['cartItemId'],
      };
    }).toList();
    prefs.setString('items', json.encode(items));

    print("✅ User ID: $userId");
    print("✅ Saving cart data to SharedPreferences...");

    prefs.setString(
      'cartItems',
      json.encode(widget.cartItems.map((item) {
        return {
          "name": item['name'],
          "quantity": item['quantity'],
          "selectedSize": item['selectedSize'],
          "adjustedPrice": item['adjustedPrice'],
        };
      }).toList()),
    );

    // Prepare line items
    final lineItems = widget.cartItems.map((item) {
      return {
        "name": item['name'],
        "description": "Size: ${item['selectedSize']}",
        "amount": ((item['adjustedPrice'] ?? 0.0) * 100).toInt(),
        "quantity": item['quantity'],
        "currency": "PHP",
      };
    }).toList();

    final deliveryFeeItem = {
      "name": "Delivery Fee",
      "description": "Delivery to your address",
      "amount": (shippingFee * 100).toInt(),
      "quantity": 1,
      "currency": "PHP",
    };

    // Save address to SharedPreferences
    prefs.setString('region', getRegionName(userAddress!.region));
    prefs.setString('province', getProvinceName(userAddress.province));
    prefs.setString('municipality', getCityName(userAddress.municipality));
    prefs.setString('barangay', getBarangayName(userAddress.barangay));
    prefs.setString('street', userAddress.street ?? '');
    prefs.setString('zip', userAddress.zip ?? '');
    prefs.setDouble('shippingFee', shippingFee);
    prefs.setDouble('totalAmount', widget.subtotal + shippingFee);

    print("✅ Address saved: ${userAddress.region}, ${userAddress.province}, ${userAddress.municipality}, ${userAddress.barangay}, ${userAddress.street}, ${userAddress.zip}");
    
    final referenceNumber = DateTime.now().millisecondsSinceEpoch.toString();
    prefs.setString('referenceNumber', referenceNumber);

    final payload = {
      "data": {
        "attributes": {
          "amount": ((widget.subtotal + shippingFee) * 100).toInt(),
          "description": "Payment for Order $referenceNumber",
          "currency": "PHP",
          "payment_method_types": ["gcash", "grab_pay", "paymaya", "card"],
          "livemode": false,
          "statement_descriptor": "Tienda",
          "success_url": "https://yourwebsite.com/success",
          "cancel_url": "https://yourwebsite.com/cancel",
          "line_items": [...lineItems, deliveryFeeItem],
        },
      },
    };

    // 🟢 API Request to PayMongo
    final response = await http.post(
      Uri.parse("https://api.paymongo.com/v1/checkout_sessions"),
      headers: {
        "Content-Type": "application/json",
        "Authorization":
            "Basic ${base64Encode(utf8.encode('sk_test_fp78egyq6UtfYJMVaRf8DX2v:'))}",
      },
      body: json.encode(payload),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final responseData = json.decode(response.body);
      final checkoutUrl = responseData['data']['attributes']['checkout_url'];

      if (checkoutUrl != null &&
          checkoutUrl.startsWith("https://checkout.paymongo.com/")) {
        if (kIsWeb) {
          // 🌐 Web: Open checkout in browser
          launchUrl(Uri.parse(checkoutUrl), mode: LaunchMode.platformDefault);
        } else {
          // 📱 Mobile: Open checkout in external browser
          if (await canLaunchUrl(Uri.parse(checkoutUrl))) {
            await launchUrl(Uri.parse(checkoutUrl),
                mode: LaunchMode.externalApplication);
          } else {
            Fluttertoast.showToast(msg: "Could not open payment link.");
          }
        }
      } else {
        Fluttertoast.showToast(msg: "Invalid checkout URL");
      }
    } else {
      Fluttertoast.showToast(msg: "Payment failed: ${response.body}");
    }

    // 🟢 Checkout Process
    final checkoutManager = context.read<CheckoutManager>();

    print("🚀 Starting checkout process...");
    await checkoutManager.processCheckout(context, cartViewModel);
    print("✅ Checkout process completed successfully.");

  } catch (e) {
    print("❌ Error during checkout: $e");
    Fluttertoast.showToast(msg: "An error occurred during checkout.");
  }
}

  Future<void> _deleteCartItems(List<Map<String, dynamic>> cartItems) async {
    print("Executing deleteCartItems in CheckoutViewState...");

    final List<String> cartItemIds = [];

    for (var item in cartItems) {
      if (item.containsKey('cartItemId') && item['cartItemId'] != null) {
        cartItemIds.add(item['cartItemId'] as String); // Collect 'cartItemId'
      } else {
        print("No cartItemId found for item: $item");
      }
    }

    if (cartItemIds.isEmpty) {
      print("No valid cartItemIds found for deletion.");
      return;
    }

    try {
      print("Payload to API: ${json.encode({"cartItemIds": cartItemIds})}");

      final response = await http.post(
        Uri.parse("http://localhost:4000/api/cart/removeItems"),
        headers: {"Content-Type": "application/json"},
        body: json.encode({"cartItemIds": cartItemIds}),
      );

      if (response.statusCode == 200) {
        print("Items successfully removed from cart: $cartItemIds");
      } else if (response.statusCode == 404) {
        print("No items found to remove: ${response.body}");
      } else {
        print(
            "Failed to remove items: ${response.statusCode}, ${response.body}");
      }
    } catch (error) {
      print("Error removing items from cart: $error");
    }
  }

  List<dynamic> regions = [];
  List<dynamic> provinces = [];
  List<dynamic> cities = [];
  List<dynamic> barangays = [];

  String? selectedRegion;
  String? selectedProvince;
  String? selectedCity;
  String? selectedBarangay;

  @override
  void initState() {
    super.initState();

    _reloadUserSession();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final checkoutManager = context.read<CheckoutManager>();
      final authViewModel = context.read<AuthViewModel>();
      final cartViewModel = context.read<CartViewModel>();

      // Validate data
      print("AuthViewModel User Address: ${authViewModel.address}");
      print("CartViewModel Cart Items: ${cartViewModel.cartItemsList}");
      print("CheckoutManager Initialized: ${checkoutManager != null}");

      registerCheckoutManager(checkoutManager);
    });
    final authViewModel = context.read<AuthViewModel>();

    authViewModel.fetchUserAddress().then((_) async {
      final userAddress = authViewModel.address;

      if (userAddress != null) {
        setState(() {
          selectedRegion = userAddress.region;
          selectedProvince = userAddress.province;
          selectedCity = userAddress.municipality;
          selectedBarangay = userAddress.barangay;
        });

        await Future.wait([
          if (selectedRegion != null) fetchProvinces(selectedRegion!),
          if (selectedProvince != null) fetchCities(selectedProvince!),
          if (selectedCity != null) fetchBarangays(selectedCity!),
        ]);

        await calculateShippingFee(
            context); // Wait for shipping fee calculation
        _initializeCheckoutView(); // Call initialization only after shipping fee is ready
      } else {
        print("User address is null");
      }
    });

    fetchRegions();
    _loadStockCount();
  }

  Future<void> _initializeCheckoutView() async {
    try {
      final checkoutManager = context.read<CheckoutManager>();
      registerCheckoutManager(checkoutManager); // Register the manager

      final authViewModel = context.read<AuthViewModel>();
      await authViewModel.fetchUserDetails();

      final userAddress = authViewModel.address;
      if (userAddress == null) {
        throw Exception(
            "Address is missing. Fetch or provide a valid address.");
      }
      // Ensure shippingFee is calculated
      if (shippingFee <= 0) {
        throw Exception("Shipping fee is not calculated properly.");
      }
      final double totalAmount = widget.subtotal + shippingFee;
      print("Subtotal: ${widget.subtotal}");
      print("Shipping Fee: $shippingFee");
      print("Total Amount: ${widget.subtotal + shippingFee}");

      // Register the callback functions
      checkoutManager.setFunctions(
        saveTransactionCallback: saveTransaction,
        updateStockInDatabaseCallback: _updateStockInDatabase,
        deleteCartItemsCallback: _deleteCartItems,
      );

      checkoutManager.setCartData(
        widget.cartItems,
        totalAmount,
        userAddress, // Fallback to a default address
        checkoutManager.generateReferenceNumber(),
      );

      print(
          "Initializing CheckoutView with: ${widget.cartItems}, ${widget.subtotal}, ${widget.address}");

      _reloadUserSession();

      //final userAddress = authViewModel.address;
      if (userAddress != null) {
        setState(() {
          selectedRegion = userAddress.region;
          selectedProvince = userAddress.province;
          selectedCity = userAddress.municipality;
          selectedBarangay = userAddress.barangay;
        });

        Future.wait([
          if (selectedRegion != null) fetchProvinces(selectedRegion!),
          if (selectedProvince != null) fetchCities(selectedProvince!),
          if (selectedCity != null) fetchBarangays(selectedCity!),
        ]).then((_) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            calculateShippingFee(context);
          });
        });
      } else {
        print("User address is null");
      }
    } catch (e) {
      print("Initialization error in CheckoutViewState: $e");
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final checkoutManager = context.read<CheckoutManager>();
      print(
          "CheckoutManager available in didChangeDependencies: $checkoutManager");

      if (checkoutManager.saveTransactionCallback == null) {
        registerCheckoutManager(checkoutManager);
        print("Callbacks registered in didChangeDependencies.");
      }
    });
  }

  Future<void> _reloadUserSession() async {
    final authViewModel = context.read<AuthViewModel>();
    await authViewModel.fetchUserDetails(); // Ensure user details are reloaded
    if (authViewModel.user == null) {
      print("User session expired. Redirecting to LoginView.");
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => LoginView(
            onLogin: () {
              final authViewModel = context.read<AuthViewModel>();
              authViewModel.logins().then((_) async {
                if (authViewModel.isLoggedIn) {
                  // Get user info from authViewModel
                  final userInfo = authViewModel
                      .user; // Assuming this is where user info is stored

                  // Store user info in SharedPreferences
                  SharedPreferences prefs =
                      await SharedPreferences.getInstance();
                  await prefs.setString(
                      'userId', userInfo!.id); // Replace 'id' with actual field
                  await prefs.setString('userName',
                      userInfo.name); // Replace 'name' with actual field
                  await prefs.setString('userEmail',
                      userInfo.email); // Replace 'email' with actual field
                  // Add other user details as needed

                  // Redirect to HomeView after successful login
                  /*Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (context) => const MyApp()),
              );*/
                }
              });
            },
            onCreateAccount: () {
              final authViewModel = context.read<AuthViewModel>();
              // Navigate to the Signup View
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
        ),
      );
    }
  }

  Future<void> _loadStockCount() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _stockCount = prefs.getInt('stockCount');
    });
  }

  Future<String?> fetchProductIdByName(String productName) async {
    try {
      final response = await http
          .get(Uri.parse('http://localhost:4000/product/$productName'));
      if (response.statusCode == 200) {
        final productJson = jsonDecode(response.body);
        print('API Response: $productJson'); // Log the API response

        // Extract 'id' directly from the JSON response
        final productId = productJson['id'] as String?;
        if (productId != null) {
          print('Fetched Product ID: $productId');
          return productId;
        } else {
          print('Product ID not found in the response.');
          return null;
        }
      } else {
        print('Failed to fetch product: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Error fetching product: $e');
      return null;
    }
  }

  Future<void> _updateStockInDatabase(
      List<Map<String, dynamic>> cartItems, CartViewModel cartViewModel) async {
    print("Executing updateStockInDatabase in CheckoutViewState...");

    final List<Map<String, dynamic>> stockUpdates = [];

    for (var item in cartItems) {
      final productName = item['name'];
      final quantity = item['quantity'];
      final selectedSize = item['selectedSize'] ?? "N/A";

      // Fetch product ID if it is missing

      // Fetch product ID by name
      final productId = await fetchProductIdByName(productName);
      if (productId == null) {
        throw Exception("Product ID could not be fetched for: $productName");
      }

      // Add to stock updates list
      stockUpdates.add({
        "id": productId,
        "name": productName,
        "size": selectedSize,
        "quantity": quantity,
      });
    }

    // Log and send payload to API
    print("Payload to API: ${json.encode({"updates": stockUpdates})}");

    final response = await http.post(
      Uri.parse("http://localhost:4000/api/updateStock"),
      headers: {"Content-Type": "application/json"},
      body: json.encode({"updates": stockUpdates}),
    );

    if (response.statusCode != 200) {
      print("Error response: ${response.body}");
      throw Exception("Failed to update stock: ${response.body}");
    }
  }

  Future<void> saveTransaction(
    List<Map<String, dynamic>> cartItems,
    double totalAmount,
    Address userAddress,
    String referenceNumber,
  ) async {
    print("saveTransaction invoked:");
    print("Cart Items: $cartItems");
    print("Total Amount: $totalAmount");
    print("User Address: $userAddress");
    print("Reference Number: $referenceNumber");

    SharedPreferences prefs = await SharedPreferences.getInstance();
    final authViewModel = context.read<AuthViewModel>();
    final userId = prefs.getString('userId');

    // Fetch user details and address
    await authViewModel.fetchUserDetails();
    final currentUser = authViewModel.user;
    final fetchedUserAddress = authViewModel.address;

    if (userId == null) {
      Fluttertoast.showToast(msg: "User ID not found. Please log in.");
      return;
    }

    if (currentUser == null) {
      Fluttertoast.showToast(msg: "User details not found. Please log in.");
      return;
    }

    if (fetchedUserAddress == null) {
      Fluttertoast.showToast(msg: "User address not found.");
      return;
    }

    final regionName = getRegionName(fetchedUserAddress.region);
    final provinceName = getProvinceName(fetchedUserAddress.province);
    final cityName = getCityName(fetchedUserAddress.municipality);
    final barangayName = getBarangayName(fetchedUserAddress.barangay);

    final serializedItems = cartItems.map((item) {
      return {
        "name": item['name'].trim(),
        "size": item['selectedSize'] ?? "N/A",
        "quantity": item['quantity'] ?? 0,
        "price": item['adjustedPrice'] ?? 0.0,
      };
    }).toList();
    print("Serialized Items: $serializedItems");

    // Construct payload
    final transactionPayload = {
      "userId": userId,
      "status": "Cart Processing",
      "amount": serializedItems.fold(
          0.0, (sum, item) => sum + (item['price'] * item['quantity'])),
      "quantity": serializedItems.length,
      "transactionId": referenceNumber,
      "date": DateTime.now().toIso8601String(),
      "item": serializedItems
          .map((item) => item['name'])
          .join("; "), // Only include names, separated by "; "
      "totalAmount": totalAmount,
      "contact": currentUser.phone ?? '',
      "name": currentUser.name ?? '',
      "address":
          "${fetchedUserAddress.street}, $barangayName, $cityName, $provinceName, ${fetchedUserAddress.zip}",
    };
    try {
      print("Sending Transaction Payload: ${json.encode(transactionPayload)}");
      print("Transaction Endpoint: http://localhost:4000/api/transactions");

      final response = await http.post(
        Uri.parse('http://localhost:4000/api/transactions'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(transactionPayload),
      );

      print(
          "Transaction API Response: ${response.statusCode}, ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        Fluttertoast.showToast(msg: "Transaction saved successfully.");
        print("Transaction saved: $transactionPayload");
      } else {
        Fluttertoast.showToast(
            msg: "Error saving transaction. Code: ${response.statusCode}");
        print(
            "Error saving transaction: ${response.statusCode}, ${response.body}");
      }
    } catch (error) {
      Fluttertoast.showToast(msg: "Error saving transaction: $error");
      print("Error saving transaction: $error");
    }
  }

  void registerCheckoutManager(CheckoutManager manager) {
    print("registerCheckoutManager invoked...");

    if (manager == null) {
      print("CheckoutManager is null!");
      throw Exception(
          "CheckoutManager instance is null. Check Provider setup.");
    }

    manager.setFunctions(
      saveTransactionCallback: saveTransaction,
      updateStockInDatabaseCallback: _updateStockInDatabase,
      deleteCartItemsCallback: _deleteCartItems,
    );
    manager.notifyListeners();

    print("Callbacks registered successfully:\n"
        "saveTransactionCallback=${manager.saveTransactionCallback != null},\n"
        "updateStockInDatabaseCallback=${manager.updateStockInDatabaseCallback != null},\n"
        "deleteCartItemsCallback=${manager.deleteCartItemsCallback != null}");
  }

  Future<void> callSaveTransactionAndUpdateStock() async {
    print("Starting callSaveTransactionAndUpdateStock...");
    final authViewModel = context.read<AuthViewModel>();
    final userAddress = authViewModel.address;

    if (userAddress == null) {
      print("Error: User address is null.");
      return;
    }

    final cartViewModel = context.read<CartViewModel>();
    final items = cartViewModel.cartItemsList.map((entry) {
      final product = entry.key;
      final details = entry.value;
      return {
        'name': product.name,
        'selectedSize': details['selectedSize'],
        'quantity': details['quantity'],
        'cartItemId': details['cartItemId'], // Ensure this is included
      };
    }).toList();
    final subtotal = cartViewModel.getSubtotal();
    final referenceNumber = DateTime.now().millisecondsSinceEpoch.toString();

    try {
      print("Calling saveTransaction...");
      await saveTransaction(widget.cartItems, widget.subtotal + shippingFee,
          userAddress, referenceNumber);
      print("saveTransaction executed successfully.");

      print("Calling _updateStockInDatabase...");
      await _updateStockInDatabase(widget.cartItems, cartViewModel);
      print("_updateStockInDatabase executed successfully.");

      print("Calling _deleteCartItems...");
      await _deleteCartItems(items);
      print("_deleteCartItems executed successfully.");
    } catch (e) {
      print("Error in callSaveTransactionAndUpdateStock: $e");
      rethrow;
    }
  }

  Future<void> fetchRegions() async {
    try {
      regions = await _addressService.regions();
      setState(() {
        if (selectedRegion != null &&
            regions.any((region) => region['region_code'] == selectedRegion)) {
          selectedRegion = selectedRegion;
        } else if (regions.isNotEmpty) {
          selectedRegion = regions[0]['region_code'];
        } else {
          selectedRegion = null; // Handle the case when there are no regions
        }
      });
    } catch (error) {
      print("Error fetching regions: $error");
    }
  }

  Future<void> fetchProvinces(String regionCode) async {
    try {
      List<dynamic> fetchedProvinces =
          await _addressService.provinces(regionCode);
      setState(() {
        provinces.clear(); // Clear previous provinces to avoid duplicates
        provinces.addAll(fetchedProvinces);
        if (provinces
            .any((province) => province['province_code'] == selectedProvince)) {
          selectedProvince = selectedProvince;
        } else {
          selectedProvince = provinces.isNotEmpty
              ? provinces[0]['province_code']
              : null; // Default to first province
        }
      });
    } catch (error) {
      print("Error fetching provinces: $error");
    }
  }

  Future<void> fetchCities(String provinceCode) async {
    try {
      List<dynamic> fetchedCities = await _addressService.cities(provinceCode);
      setState(() {
        cities.clear(); // Clear previous cities to avoid duplicates
        cities.addAll(fetchedCities);
        // Reset selectedCity if it's not found in the new list
        if (cities.any((city) => city['city_code'] == selectedCity)) {
          // If selectedCity exists in the new cities
          selectedCity = selectedCity;
        } else {
          selectedCity = cities.isNotEmpty
              ? cities[0]['city_code']
              : null; // Default to first city
        }
        if (selectedCity != null) {
          fetchBarangays(selectedCity!);
        }
      });
    } catch (error) {
      print("Error fetching cities: $error");
    }
  }

  Future<void> fetchBarangays(String cityCode) async {
    try {
      List<dynamic> fetchedBarangays =
          await _addressService.barangays(cityCode);
      setState(() {
        barangays.clear(); // Clear previous barangays to avoid duplicates
        barangays.addAll(fetchedBarangays);
        if (barangays
            .any((barangay) => barangay['brgy_code'] == selectedBarangay)) {
          selectedBarangay = selectedBarangay; // Keep it as is if found
        } else {
          selectedBarangay = barangays.isNotEmpty
              ? barangays[0]['brgy_code']
              : null; // Default to first barangay
        }
      });
    } catch (error) {
      print("Error fetching barangays: $error");
    }
  }

  String getRegionName(String? regionCode) {
    final region = regions.firstWhere(
      (r) => r['region_code'] == regionCode,
      orElse: () =>
          {'region_name': "Not provided"}, // Ensure a valid map is returned
    ) as Map<String, dynamic>; // Cast to the expected type

    return region['region_name'] ?? "Not provided";
  }

  String getProvinceName(String? provinceCode) {
    final province = provinces.firstWhere(
      (p) => p['province_code'] == provinceCode,
      orElse: () =>
          {'province_name': "Not provided"}, // Ensure a valid map is returned
    ) as Map<String, dynamic>; // Cast to the expected type

    return province['province_name'] ?? "Not provided";
  }

  String getCityName(String? cityCode) {
    final city = cities.firstWhere(
      (c) => c['city_code'] == cityCode,
      orElse: () =>
          {'city_name': "Not provided"}, // Ensure a valid map is returned
    ) as Map<String, dynamic>; // Cast to the expected type

    return city['city_name'] ?? "Not provided";
  }

  String getBarangayName(String? barangayCode) {
    final barangay = barangays.firstWhere(
      (b) => b['brgy_code'] == barangayCode,
      orElse: () =>
          {'brgy_name': "Not provided"}, // Ensure a valid map is returned
    ) as Map<String, dynamic>; // Cast to the expected type

    return barangay['brgy_name'] ?? "Not provided";
  }

  @override
  Widget build(BuildContext context) {
    /*print("CheckoutView is being built...");
    try {
      final checkoutManager =
          Provider.of<CheckoutManager>(context, listen: false);
      print("CheckoutManager accessed in build: $checkoutManager");
    } catch (e) {
      print("Error accessing CheckoutManager in build: $e");
    }
    final checkoutManager =
        Provider.of<CheckoutManager>(context, listen: false);

// Manually call registerCheckoutManager
    WidgetsBinding.instance.addPostFrameCallback((_) {
      registerCheckoutManager(checkoutManager);
    });*/

    final authViewModel = context.read<AuthViewModel>();
    final userAddress = authViewModel.address;

    return DefaultViewLayout(
      title: "Checkout",
      background: AppColors.coolGrey,
      content: Stack(
        fit: StackFit.expand,
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              children: [
                orderDetailsCard(),
                itemsOrderedCard(context),
                userAddress != null
                    ? shippingInformationCard(context)
                    : addressPromptCard(
                        context), // Show address prompt if no address
                orderSummaryCard(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget addressPromptCard(BuildContext context) {
    return InfoCard(
      title: "SET SHIPPING ADDRESS",
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "You haven't set a shipping address yet. Please set your address to proceed.",
            style: AppTextStyles.body2,
          ),
          const Gap(10),
          CustomButton(
            isExpanded: true,
            text: "Set Address",
            textStyle: AppTextStyles.button,
            command: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => AddressView()),
            ),
            height: 48,
            fillColor: AppColors.red,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12),
          ),
        ],
      ),
    );
  }

  Widget orderDetailsCard() {
    String formattedDate = DateFormat('MMMM dd, yyyy').format(DateTime.now());

    return Container(
      padding: const EdgeInsets.all(16), // Padding inside the container
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12), // Rounded corners
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3), // Subtle shadow
            blurRadius: 4,
            offset: const Offset(0, 2), // Shadow position
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "ORDER DETAILS",
            style: AppTextStyles.headline4.copyWith(
              fontWeight: AppFontWeights.bold,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 16), // Space below title
          _buildDetailRow(Icons.calendar_today, "Date", formattedDate),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String title, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(
          vertical: 8, horizontal: 12), // Row padding
      decoration: BoxDecoration(
        color: Colors.grey.shade100, // Light background color for row
        borderRadius: BorderRadius.circular(8), // Rounded corners for row
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.black), // Black icon
          const SizedBox(width: 10), // Space between icon and title
          Expanded(
            // Use Expanded to take available space
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.body2.copyWith(
                    fontWeight: AppFontWeights.semiBold,
                  ),
                ),
                Text(
                  value,
                  style: AppTextStyles.body2,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget itemsOrderedCard(BuildContext context) {
    return Card(
      elevation: 4, // Adds shadow
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12), // Rounded corners
      ),
      margin: const EdgeInsets.symmetric(vertical: 10), // Card margin
      child: Padding(
        padding: const EdgeInsets.all(16), // Card padding
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "ITEMS ORDERED",
              style: AppTextStyles.headline4.copyWith(
                fontWeight: AppFontWeights.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 10), // Space between title and content
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: widget.cartItems.length,
              itemBuilder: (context, index) {
                final item = widget.cartItems[index];
                print("Cart Items: ${widget.cartItems}");

                return Padding(
                  padding: EdgeInsets.only(top: index != 0 ? 20 : 0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius:
                            BorderRadius.circular(10), // Rounded image
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.greyAD),
                          ),
                          child: item['image'] != null &&
                                  item['image'].isNotEmpty
                              ? Image.network(
                                  'http://localhost:4000/upload/images/${item['image']}',
                                  width: 50,
                                  height: 50,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Center(
                                      child: Image.asset(
                                        'assets/images/placeholder_food.png',
                                        width: 50,
                                        height: 50,
                                        fit: BoxFit.cover,
                                      ),
                                    );
                                  },
                                )
                              : const Center(
                                  child: Text(
                                    "No image available",
                                    style: TextStyle(
                                        fontSize: 12, color: Colors.grey),
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(
                          width: 10), // Spacing between image and text
                      Expanded(
                        child: SizedBox(
                          height: 80,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                item['name'],
                                style: AppTextStyles.body2.copyWith(
                                  fontWeight: AppFontWeights.bold,
                                  fontSize: 16, // Adjusted size
                                ),
                              ),
                              Text(
                                'Size: ${item['selectedSize'] ?? 'N/A'}',
                                style: AppTextStyles.subtitle2.copyWith(
                                  color: AppColors
                                      .greyAD, // Lighter color for size
                                ),
                              ),
                              RichText(
                                text: TextSpan(
                                  style: AppTextStyles.subtitle2,
                                  text: "Quantity:  ",
                                  children: [
                                    TextSpan(
                                      text: "${item['quantity']}",
                                      style: const TextStyle(
                                        fontWeight: AppFontWeights.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget shippingInformationCard(BuildContext context) {
    final authViewModel = context.read<AuthViewModel>();
    final userAddress = authViewModel.address;

    return Container(
      padding: const EdgeInsets.all(16), // Padding inside the container
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12), // Rounded corners
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3), // Subtle shadow
            blurRadius: 4,
            offset: const Offset(0, 2), // Shadow position
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "SHIPPING INFORMATION",
            style: AppTextStyles.headline4.copyWith(
              fontWeight: AppFontWeights.bold,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 16), // Space below title
          _buildShippingRow(
              Icons.home, 'Street', userAddress?.street ?? "Not provided"),
          const SizedBox(height: 10), // Space between rows
          _buildShippingRow(Icons.location_city, 'Barangay',
              getBarangayName(selectedBarangay)),
          const SizedBox(height: 10), // Space between rows
          _buildShippingRow(
              Icons.location_on, 'City', getCityName(selectedCity)),
          const SizedBox(height: 10), // Space between rows
          _buildShippingRow(
              Icons.map, 'Province', getProvinceName(selectedProvince)),
          const SizedBox(height: 10), // Space between rows
          _buildShippingRow(
              Icons.flag, 'Region', getRegionName(selectedRegion)),
          const SizedBox(height: 10), // Space between rows
          _buildShippingRow(
              Icons.mail, 'Zip', userAddress?.zip ?? "Not provided"),
        ],
      ),
    );
  }

  Widget _buildShippingRow(IconData icon, String title, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(
          vertical: 10, horizontal: 12), // Row padding
      decoration: BoxDecoration(
        color: Colors.grey.shade100, // Light background color for row
        borderRadius: BorderRadius.circular(8), // Rounded corners for row
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.black), // Black icon
          const SizedBox(width: 10), // Space between icon and title
          Expanded(
            // Use Expanded to take available space
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600, // Semi-bold for the title
                    fontSize: 16,
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                      fontSize: 14,
                      color: Colors
                          .grey), // Slightly smaller and grey for the value
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String getFullAddress(Address userAddress,
      {String? barangay,
      String? municipality,
      String? province,
      String? region}) {
    final street = userAddress.street ?? "";
    final zip = userAddress.zip ?? "";

    return '$street${barangay != null ? ', $barangay' : ''}'
        '${municipality != null ? ', $municipality' : ''}'
        '${province != null ? ', $province' : ''}'
        '${region != null ? ', $region' : ''}'
        '${zip.isNotEmpty ? ', $zip' : ''}';
  }

  Widget orderSummaryCard(BuildContext context) {
    final double shippingFee =
        this.shippingFee; // Use the shippingFee from the state variable
    final double subtotal = widget.subtotal; // Use passed subtotal
    final total = subtotal + shippingFee;
    final checkoutManager = context.read<CheckoutManager>();
    final referenceNumber = DateTime.now().millisecondsSinceEpoch.toString();

    // Check if userAddress is valid
    final authViewModel = context.read<AuthViewModel>();
    final userAddress = authViewModel.address;

    final isAddressComplete = userAddress != null &&
        userAddress.street?.isNotEmpty == true &&
        userAddress.zip?.isNotEmpty == true &&
        selectedBarangay != null &&
        selectedCity != null &&
        selectedProvince != null &&
        selectedRegion != null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "ORDER SUMMARY",
            style: AppTextStyles.headline4.copyWith(
              fontWeight: AppFontWeights.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 16),
          Divider(color: Colors.grey.shade300), // Divider for separation
          const SizedBox(height: 8),
          _buildSummaryRow("Subtotal:", "₱${subtotal.toStringAsFixed(2)}",
              Icons.monetization_on),
          _buildSummaryRow("Shipping:", "₱${shippingFee.toStringAsFixed(2)}",
              Icons.local_shipping),
          Divider(color: Colors.grey.shade300), // Divider for total section
          _buildSummaryRow(
              "Total:", "₱${total.toStringAsFixed(2)}", Icons.payment,
              isTotal: true),
          const SizedBox(height: 25),
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  isExpanded: true,
                  text: "Proceed to Payment",
                  textStyle: AppTextStyles.button.copyWith(color: Colors.white),
                  command: () async {
                    if (isAddressComplete) {
                      proceedToPayment(
                          context); // Proceed to payment if address is complete
                    } else {
                      // Show a reminder dialog or snackbar
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text("Incomplete Address"),
                          content: Text(
                              "Please set your shipping address before proceeding to payment."),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(),
                              child: Text("OK"),
                            ),
                          ],
                        ),
                      );
                    }
                  },
                  height: 48,
                  fillColor: isAddressComplete
                      ? AppColors.red
                      : Colors.grey, // Change color based on state
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, IconData icon,
      {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: isTotal ? Colors.green : Colors.black54),
              const SizedBox(width: 8), // Space between icon and text
              Text(
                label,
                style: AppTextStyles.subtitle2.copyWith(
                  fontWeight: isTotal ? AppFontWeights.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: AppTextStyles.body2.copyWith(
              color: isTotal ? Colors.green : Colors.black54,
            ),
          ),
        ],
      ),
    );
  }
}

class InfoCard extends StatelessWidget {
  final String title;
  final Widget content;
  const InfoCard({
    super.key,
    required this.title,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          child: Text(
            title,
            style: AppTextStyles.subtitle1.copyWith(
              fontWeight: AppFontWeights.bold,
            ),
          ),
        ),
        Container(
          width: double.infinity,
          color: AppColors.primary,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: content,
        ),
      ],
    );
  }
}
