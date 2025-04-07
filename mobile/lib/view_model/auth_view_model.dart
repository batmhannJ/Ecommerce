import 'package:flutter/material.dart';
import '../model/user.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; // Import shared_preferences
import '../model/address.dart';

class AuthViewModel extends ChangeNotifier {
  User? _user;
  Address? _address; // Holds the address

  User? get user => _user;
  Address? get address => _address; // Getter for the address

  bool _isLoggedIn = false;
  bool get isLoggedIn => _isLoggedIn;

  // User state variables
  String? _userId; // The ID of the current user
  String? _currentPassword; // The current password for the user

  void login() {
    _isLoggedIn = true;
    notifyListeners();
  }

  String? regionName;
  String? provinceName;
  String? cityName;
  String? barangayName;

  Future<void> logins() async {
    // Simulate a login process (e.g., API call)
    await Future.delayed(Duration(seconds: 2)); // Simulate a delay
    _isLoggedIn = true; // Set logged in state after a successful login
    notifyListeners(); // Notify listeners of the change
  }

  set isLoggedIn(bool value) {
    _isLoggedIn = value; // Setter for isLoggedIn
    notifyListeners(); // Notify listeners if you're using ChangeNotifier
  }

  void setUser(User newUser) {
    _user = newUser;
    notifyListeners();
  }

  void setUserId(String id) {
    _userId = id;
    notifyListeners();
  }

  void setAddress(Address newAddress) {
    // Method to set the address
    _address = newAddress;
    notifyListeners();
  }

  Future<void> updateUser({
    required String name,
    required String phone,
    required String email,
    required BuildContext context,
  }) async {
    if (_user != null) {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? userId = prefs.getString('userId');
      final url = 'http://localhost:4000/api/edituser-mobile/$userId';

      final userData = {
        'name': name,
        'phone': phone,
        'email': email,
      };

      try {
        final response = await http.patch(
          Uri.parse(url),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(userData),
        );

        if (response.statusCode == 200) {
          final updatedUser = jsonDecode(response.body);
          _user = _user!.copyWith(
            name: updatedUser['name'],
            phone: updatedUser['phone'],
            email: updatedUser['email'],
          );

          notifyListeners();
          _showSnackBar(context, 'User details updated successfully.');
        } else {
          _showSnackBar(context, 'Failed to update user. Please try again.',
              isSuccess: false);
        }
      } catch (e) {
        _showSnackBar(context, 'Error updating user: $e', isSuccess: false);
      }
    }
  }

  void _showSnackBar(BuildContext context, String message,
      {bool isSuccess = true}) {
    final snackBar = SnackBar(
      content: Text(message),
      backgroundColor: isSuccess
          ? Colors.green
          : Colors.red, // Green for success, red for error
      duration: const Duration(seconds: 3), // Duration of the SnackBar
    );

    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  Future<bool> updateAddress({
    required String region,
    required String province,
    required String municipality,
    required String barangay,
    required String zip,
    required String street,
  }) async {
    // Validate that user is logged in
    if (_user != null) {
      final newAddress = Address(
        region: region,
        province: province,
        municipality: municipality,
        barangay: barangay,
        zip: zip,
        street: street,
      );

      _address = newAddress;
      notifyListeners();

      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? userId = prefs.getString('userId');
      final url = 'http://localhost:4000/api/update-address/$userId';
      final addressData = newAddress.toJson();

      try {
        final response = await http.patch(
          Uri.parse(url),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(addressData),
        );

        if (response.statusCode == 200) {
          print('Address updated successfully.');
          return true; // Return true on success
        } else {
          print('Failed to update address: ${response.body}');
          return false; // Return false on failure
        }
      } catch (e) {
        print('Error updating address: $e');
        return false; // Return false on error
      }
    } else {
      print('User not logged in. Cannot update address.');
      return false; // Return false if the user is not logged in
    }
  }

  void logout() {
    _isLoggedIn = false;
    notifyListeners();
  }

  // Method to change the password

  Future<void> fetchUserDetails() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? userId =
        prefs.getString('userId'); // Ensure you retrieve the user ID

    if (userId != null) {
      try {
        final response = await http.get(
          Uri.parse('http://localhost:4000/api/get-user-details/$userId'),
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          setUser(User.fromJson(data)); // Set the user correctly
          print(
              'User fetched: ${data.toString()}'); // Include user ID in the output
          notifyListeners();
        } else {
          print('Failed to load user details');
        }
      } catch (e) {
        print('Exception: $e');
      }
    } else {
      print('User ID is null, cannot fetch user details');
    }
  }

  Future<void> fetchUserAddress() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? userId = prefs.getString('userId');

    if (userId != null) {
      try {
        final response = await http.get(
          Uri.parse('http://localhost:4000/get-user-address/$userId'),
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          // Ensure that you are checking the validity of data
          if (data != null) {
            setAddress(Address.fromJson(data));
            print('Address fetched: ${data.toString()}');
          } else {
            print('No address data found');
            setAddress(Address()); // Set to empty Address if null
          }
        } else {
          print('Failed to load user address: ${response.statusCode}');
          setAddress(Address()); // Also set to empty Address on failure
        }
      } catch (e) {
        print('Exception fetching address: $e');
        setAddress(Address()); // Set to empty Address on exception
      }
    } else {
      print('User ID is null, cannot fetch user address');
      setAddress(Address()); // Set to empty Address if user ID is null
    }
  }

  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    if (_userId == null) {
      throw Exception("User ID is not set");
    }

    // Simulate checking the old password locally (optional, could rely on backend-mob)
    if (_currentPassword != oldPassword) {
      throw Exception("Old password is incorrect");
    }

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? userId = prefs.getString('userId');
      final response = await http.post(
        Uri.parse('http://localhost:4000/updatepassword-mobile/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'password': newPassword}),
      );

      if (response.statusCode == 200) {
        _currentPassword = newPassword;
        notifyListeners();
        print("Password changed successfully!");
      } else {
        throw Exception("Failed to change password");
      }
    } catch (error) {
      print("Error changing password: $error");
      throw Exception("Error during password change");
    }
  }
}
