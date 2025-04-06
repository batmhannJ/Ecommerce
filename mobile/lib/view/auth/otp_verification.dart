import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:http/http.dart' as http;
import 'package:indigitech_shop/view/cart_view.dart';
import 'package:indigitech_shop/view/home/home_view.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; // Import shared_preferences
import 'package:indigitech_shop/view/profile_view.dart';
import 'package:indigitech_shop/view/address_view.dart'; // Import your AddressView



class OTPVerificationScreen extends StatefulWidget {
  final String email;
  final VoidCallback onOTPVerified; // This will be called once OTP is verified

  const OTPVerificationScreen({super.key, 
    required this.email,
    required this.onOTPVerified,
  });

  @override
  _OTPVerificationScreenState createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends State<OTPVerificationScreen> {
  final _otpController = TextEditingController();

  Future<void> _verifyOTP() async {
  String otp = _otpController.text.trim(); // Trim the OTP input

  if (otp.isNotEmpty) {
    bool isVerified = await _verifyOTPRequest(widget.email, otp);
    if (isVerified) {
      // Redirect to HomeView after successful OTP verification
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const HomeView()),
      );

      // Call the onOTPVerified callback (optional, if needed elsewhere)
      widget.onOTPVerified();

      // Fetch userId after OTP verification
      String? userId = await _fetchUserId(widget.email);
      if (userId != null) {
        // Store the user ID and other details in SharedPreferences
        await _storeUserId(userId);
        await _storeLoginStatus(true); // Set login status to true

        // Optionally check if the user has an address set up
        bool hasAddress = await _checkUserAddress(userId);
        if (hasAddress) {
          print("User has an address, proceed with the flow.");
          // You can proceed with CartView or other logic here
        } else {
          print("User does not have an address, proceed to address setup.");
          // You can display a notification or message about setting the address
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("User ID not found. Please try again.")),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Invalid OTP. Please try again.")),
      );
    }
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Please enter the OTP.")),
    );
  }
}


  Future<void> _storeLoginStatus(bool isLoggedIn) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  await prefs.setBool('isLoggedIn', isLoggedIn); // Store login status
  print("Login status stored: $isLoggedIn"); // Debug line
}

Future<bool> _checkUserAddress(String userId) async {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:4000/check-user-address'), // Endpoint to check user address
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({'userId': userId}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['hasAddress']; // Assuming the response contains this field
      } else {
        print("Error checking address: ${response.statusCode}, ${response.body}");
        return false; // Return false if the request fails
      }
    } catch (e) {
      print("Exception while checking address: $e");
      return false; // Return false on exception
    }
  }

  Future<bool> _verifyOTPRequest(String email, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:4000/verify-otp-mobile'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'email': email,
          'otp': otp,
        }),
      );

      // Log the server response for debugging
      print("Server response: ${response.body}");

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['success']; // Return true if OTP verification succeeded
      } else {
        print("Error: ${response.statusCode}, ${response.body}");
        return false; // Return false if the response was not successful
      }
    } catch (e) {
      print("Exception: $e");
      return false; // Return false on exception
    }
  }

  Future<String?> _fetchUserId(String email) async {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:4000/get-user-id-by-email'), // New endpoint to fetch user ID by email
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({'email': email}),
      );

      // Log the server response for debugging
      print("Fetch User ID response: ${response.body}");
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['userId']; // Return user ID from response
      } else {
        print("Error fetching user ID: ${response.statusCode}, ${response.body}");
        return null; // Return null if the response was not successful
      }
    } catch (e) {
      print("Exception while fetching user ID: $e");
      return null; // Return null on exception
    }
  }

  Future<void> _storeUserId(String userId) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('userId', userId);
    print("User ID stored: $userId"); // Debug line
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text("Verify OTP"), // Title for the AppBar
      backgroundColor: Colors.white, // AppBar background color
      foregroundColor: Colors.black, // AppBar text color
    ),
    body: Center(
      child: Card(
        elevation: 5, // Card shadow elevation
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20), // Rounded corners for the card
        ),
        color: Colors.white, // Card background color
        margin: const EdgeInsets.symmetric(horizontal: 20), // Card margin
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36), // Padding inside the card
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center, // Center align text
              children: [
                Text(
                  "Verify OTP", // Header text
                  style: TextStyle(
                    fontSize: 30, // Reduced font size for header
                    fontWeight: FontWeight.normal, // Normal font weight
                    color: Colors.black, // Header color
                  ),
                  textAlign: TextAlign.center, // Center align header text
                ),
                const SizedBox(height: 20), // Space between header and next text
                Text(
                  "Enter the OTP sent to ${widget.email}", // Instruction text
                  style: TextStyle(
                    fontSize: 16, // Instruction text font size
                    color: Colors.black, // Instruction text color
                  ),
                  textAlign: TextAlign.center, // Center align instruction text
                ),
                const SizedBox(height: 20), // Space between instruction and input
                TextField(
                  controller: _otpController, // Controller for OTP input
                  keyboardType: TextInputType.number, // Numeric keyboard for OTP
                  decoration: InputDecoration(
                    border: OutlineInputBorder(), // Border for the text field
                    hintText: "OTP", // Hint text for the text field
                    hintStyle: TextStyle(color: Colors.grey), // Hint text color
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.grey), // Border color when not focused
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.blue), // Border color when focused
                    ),
                  ),
                ),
                const SizedBox(height: 20), // Space between input and button
                SizedBox(
                  width: double.infinity, // Full-width button
                  child: ElevatedButton(
                    onPressed: () {
                      _verifyOTP(); // Call the verify function
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF778C62), // Logout button color
                      foregroundColor: Colors.white, // Button text color
                      minimumSize: Size(double.infinity, 50), // Reduced button height
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.zero, // No rounded corners
                      ),
                      textStyle: TextStyle(
                           fontWeight: FontWeight.bold, // Button text weight
                        fontSize: 14, // Reduced button text size
                      ),
                    ),
                    child: const Text("Verify"), // Button text
                  ),
                ),
                const SizedBox(height: 15), // Space below the button
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

}
