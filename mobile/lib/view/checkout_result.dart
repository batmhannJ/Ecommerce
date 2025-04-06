import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart'; // for toast notifications
import 'package:indigitech_shop/view/cart_view.dart';
import 'package:indigitech_shop/view/home/home_view.dart';
import 'package:indigitech_shop/view/profile_view.dart';
import 'package:indigitech_shop/viewmodels/bottom_nav_bar.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import shared_preferences

class CheckoutSuccessView extends StatefulWidget {
  final String userId;

  const CheckoutSuccessView({Key? key, required this.userId}) : super(key: key);

  @override
  _CheckoutSuccessViewState createState() => _CheckoutSuccessViewState();
}

class _CheckoutSuccessViewState extends State<CheckoutSuccessView> {
  List<dynamic> orders = [];
  bool loading = true;

  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    _navigateToScreen(index);
  }

  void _navigateToScreen(int index) {
    switch (index) {
      case 0:
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const HomeView()),
        );
        break;
      case 1:
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const CartView()),
        );
        break;
      case 2:
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const ProfileView()),
        );
        break;
    }
  }

  @override
  void initState() {
    super.initState();
    fetchUserOrders(); // Fetch user orders on initialization
  }

  // Function to get user ID from shared preferences
  Future<String> getUserIdFromPreferences() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId') ??
        ''; // Adjust this based on how you save user ID
  }

  // Function to fetch user orders from API
  Future<void> fetchUserOrders() async {
    final userId = widget.userId; // Directly use the passed userId
    if (userId.isEmpty) {
      Fluttertoast.showToast(msg: "User not logged in.");
      setState(() {
        loading = false;
      });
      return;
    }

    try {
      final response = await http.get(
        Uri.parse(
            'http://localhost:4000/api/transactions/userTransactions/$userId'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> fetchedOrders = json.decode(response.body);

        // Sort orders by date in descending order
        fetchedOrders.sort((a, b) {
          final dateA = DateTime.parse(a['date']);
          final dateB = DateTime.parse(b['date']);
          return dateB.compareTo(dateA); // Descending order
        });

        setState(() {
          orders = fetchedOrders;
          loading = false;
        });
      } else {
        Fluttertoast.showToast(msg: "Error fetching orders.");
        setState(() {
          loading = false;
        });
      }
    } catch (error) {
      print("Error fetching orders: $error");
      Fluttertoast.showToast(msg: "Error fetching orders.");
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My Orders", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        elevation: 1,
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : orders.isNotEmpty
              ? ListView.builder(
                  itemCount: orders.length,
                  itemBuilder: (context, index) {
                    final order = orders[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 3,
                      child: ExpansionTile(
                        tilePadding: const EdgeInsets.all(16),
                        title: Text(
                          "Item: ${order['item']}",
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildOrderDetail(
                                    "Order ID:", "${order['transactionId']}"),
                                _buildOrderDetail("Date:", "${order['date']}"),
                                _buildOrderDetail(
                                    "Quantity:", "${order['quantity']}"),
                                _buildOrderDetail(
                                    "Amount:", "\₱${order['amount']}",
                                    isAmount: true),
                                _buildOrderDetail(
                                    "Status:", "${order['status']}",
                                    isStatus: true),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                )
              : const Center(child: Text("No orders found")),
      bottomNavigationBar: BottomNavBar(
        selectedIndex: _selectedIndex,
        onItemTapped: _onItemTapped,
      ),
    );
  }

// Helper method to build order details
  Widget _buildOrderDetail(String label, String value,
      {bool isAmount = false, bool isStatus = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isAmount
                  ? Colors.green
                  : isStatus
                      ? Colors.blue
                      : Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}

class CheckoutFailureView extends StatefulWidget {
  @override
  _CheckoutFailureViewState createState() => _CheckoutFailureViewState();
}

class _CheckoutFailureViewState extends State<CheckoutFailureView> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    _navigateToScreen(index);
  }

  void _navigateToScreen(int index) {
    switch (index) {
      case 0:
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const HomeView()),
        );
        break;
      case 1:
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const CartView()),
        );
        break;
      case 2:
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const ProfileView()),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title:
            const Text("Payment Failed", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        elevation: 1,
      ),
      body: Center(
        child: Text(
          "There was an issue with your payment. Please try again.",
          style: TextStyle(fontSize: 18, color: Colors.red),
        ),
      ),
      bottomNavigationBar: BottomNavBar(
        selectedIndex: _selectedIndex,
        onItemTapped: _onItemTapped,
      ),
    );
  }
}
