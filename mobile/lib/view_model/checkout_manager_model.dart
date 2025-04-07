import 'package:flutter/material.dart';
import 'package:indigitech_shop/model/address.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:indigitech_shop/view_model/cart_view_model.dart';
import 'package:provider/provider.dart';
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class CheckoutManager extends ChangeNotifier {
  List<Map<String, dynamic>> cartItems = [];
  double totalAmount = 0.0;
  Address? userAddress;
  String referenceNumber = '';

  late Future<void> Function(
    List<Map<String, dynamic>>,
    double,
    Address,
    String,
  ) saveTransactionCallback;

  late Future<void> Function(
    List<Map<String, dynamic>>,
    CartViewModel,
  ) updateStockInDatabaseCallback;

  late Future<void> Function(
    List<Map<String, dynamic>>,
  ) deleteCartItemsCallback;

  void setCartData(List<Map<String, dynamic>> items, double amount,
      Address? address, String reference) {
    print(
        "Received cartItems: $items, totalAmount: $amount, address: $address, reference: $reference");

    if (items.isEmpty) {
      throw Exception("Cart items are missing.");
    }
    if (amount <= 0) {
      throw Exception("Total amount is invalid.");
    }
    if (address == null) {
      throw Exception("User address is missing.");
    }
    cartItems = items.isNotEmpty ? items : [];
    totalAmount = amount;
    userAddress = address;
    referenceNumber =
        reference.isNotEmpty ? reference : generateReferenceNumber();
    if (userAddress == null) {
      throw Exception("User address is missing.");
    }
    print("setCartData called:");
    print("Cart Items: $cartItems");
    print("Total Amount: $totalAmount");
    print("User Address: $userAddress");
    print("Reference Number: $referenceNumber");

    notifyListeners();
  }

  void setFunctions({
    required Future<void> Function(
      List<Map<String, dynamic>>,
      double,
      Address,
      String,
    ) saveTransactionCallback,
    required Future<void> Function(
      List<Map<String, dynamic>>,
      CartViewModel,
    ) updateStockInDatabaseCallback,
    required Future<void> Function(
      List<Map<String, dynamic>>,
    ) deleteCartItemsCallback,
  }) {
    this.saveTransactionCallback = saveTransactionCallback;
    this.updateStockInDatabaseCallback = updateStockInDatabaseCallback;
    this.deleteCartItemsCallback = deleteCartItemsCallback;

    print("setFunctions called:");
    print(
        "saveTransactionCallback is ${this.saveTransactionCallback != null ? 'set' : 'not set'}");
    print(
        "updateStockInDatabaseCallback is ${this.updateStockInDatabaseCallback != null ? 'set' : 'not set'}");
    print(
        "deleteCartItemsCallback is ${this.deleteCartItemsCallback != null ? 'set' : 'not set'}");
    notifyListeners();
  }

  String generateReferenceNumber() {
    return DateTime.now().millisecondsSinceEpoch.toString();
  }

  Future<void> fetchRequiredData(BuildContext context) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final authViewModel = context.read<AuthViewModel>();

    // Fetch user details and address
    await authViewModel.fetchUserDetails();

    userAddress = authViewModel.address;
    if (userAddress == null) {
      throw Exception("User address is missing.");
    }

    // Calculate total amount
    final cartViewModel = context.read<CartViewModel>();
    totalAmount = cartViewModel.getSubtotal();

    if (totalAmount <= 0) {
      throw Exception("Total amount is invalid.");
    }

    notifyListeners();

    print("fetchRequiredData completed:");
    print("User Address: $userAddress");
    print("Total Amount: $totalAmount");
  }

  Future<void> processCheckout(
      BuildContext context, CartViewModel cartViewModel) async {
    print("Starting processCheckout...");
    if (cartItems.isEmpty || userAddress == null || referenceNumber.isEmpty) {
      throw Exception(
          "Cart items, user address, or reference number is missing.");
    }
    print("User Address in processCheckout:");
    print("Region: ${userAddress?.region}");
    print("Province: ${userAddress?.province}");
    print("Municipality: ${userAddress?.municipality}");
    print("Barangay: ${userAddress?.barangay}");
    print("Street: ${userAddress?.street}");
    print("ZIP: ${userAddress?.zip}");

    print("Processing checkout...");
    print("Cart Items: $cartItems");
    print("Total Amount: $totalAmount");
    print("User Address: $userAddress");
    print("Reference Number: $referenceNumber");

    try {
      // Fetch user address and ensure the total amount is valid
      if (userAddress == null) {
        SharedPreferences prefs = await SharedPreferences.getInstance();
        final authViewModel = context.read<AuthViewModel>();
        await authViewModel.fetchUserDetails();
        userAddress = authViewModel.address;

        if (userAddress == null) {
          throw Exception("User address is missing.");
        }
      }
      notifyListeners();

      print("User Address: $userAddress");
      print("Total Amount: $totalAmount");

      // Proceed with callbacks
      print("Calling saveTransaction...");
      try {
        await saveTransactionCallback(
            cartItems, totalAmount, userAddress!, referenceNumber);
        print("saveTransaction successful.");
      } catch (e) {
        print("Error in saveTransaction: $e");
      }

      try {
        await updateStockInDatabaseCallback(cartItems, cartViewModel);
      } catch (e) {
        print("Error in updateStockInDatabaseCallback: $e");
      }

      try {
        await deleteCartItemsCallback(cartItems);
      } catch (e) {
        print("Error in deleteCartItemsCallback: $e");
      }
      notifyListeners();
      print("Checkout process completed successfully.");
    } catch (e) {
      print("Error during checkout process: $e");
      rethrow;
    }
  }
}
