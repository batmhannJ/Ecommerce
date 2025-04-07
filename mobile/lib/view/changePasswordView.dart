import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/view/layout/default_view_layout.dart';
import 'package:indigitech_shop/view_model/auth_view_model.dart';
import 'package:provider/provider.dart';
import '../core/style/form_styles.dart';
import '../widget/buttons/custom_filled_button.dart';
import '../widget/form_fields/custom_text_form_field.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; // Import shared_preferences

class ChangePasswordView extends StatefulWidget {
  const ChangePasswordView({super.key});

  @override
  State<ChangePasswordView> createState() => _ChangePasswordViewState();
}

class _ChangePasswordViewState extends State<ChangePasswordView> {
  
  final _oldPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String? errorMessage; // To show error messages
  bool isButtonDisabled = true; // To track button state
Future<bool> comparePassword(String oldPassword) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  String? userId = prefs.getString('userId'); // Retrieve user ID

  if (userId != null) {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:4000/compare-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'oldPassword': oldPassword, // Send the old password for comparison
        }),
      );

      if (response.statusCode == 200) {
        print('Password matched');
        return true; // Password is correct
      } else {
        print('Old password is incorrect');
        return false; // Incorrect old password
      }
    } catch (e) {
      print('Exception: $e');
      return false; // Error occurred
    }
  } else {
    print('User ID is null');
    return false; // User ID not found
  }
}


  Future<void> _changePassword() async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  String? userId = prefs.getString('userId'); // Retrieve user ID

  String oldPassword = _oldPasswordController.text.trim();
  String newPassword = _newPasswordController.text.trim();
  String confirmPassword = _confirmPasswordController.text.trim();

  if (newPassword != confirmPassword) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("New passwords do not match.")),
    );
    return;
  }

  // Check if old password is correct using comparePassword function
  bool isOldPasswordCorrect = await comparePassword(oldPassword);

  if (!isOldPasswordCorrect) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Old password is incorrect.")),
    );
    return; // Stop further execution if old password is wrong
  }

  if (userId != null) {
    final success = await _changePasswordRequest(userId, oldPassword, newPassword);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Password changed successfully.")),
      );
      Navigator.of(context).pop(); // Go back after successful password change
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to change password.")),
      );
    }
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("User ID not found.")),
    );
  }
}

  void _checkFormValidity() {
    final isValid = _oldPasswordController.text.isNotEmpty &&
        _newPasswordController.text.isNotEmpty &&
        _confirmPasswordController.text.isNotEmpty &&
        (_newPasswordController.text == _confirmPasswordController.text);

    setState(() {
      isButtonDisabled = !isValid; // Enable button if form is valid
    });
  }


 Future<bool> _changePasswordRequest(String userId, String oldPassword, String newPassword) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
  String? userId = prefs.getString('userId'); // Retrieve user ID
  try {
    final response = await http.post(
      Uri.parse('http://localhost:4000/updatepassword-mobile/$userId'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'oldPassword': oldPassword,
        'newPassword': newPassword,
      }),
    );

    print("API Response: ${response.body}");

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['success']) {
        // Display the message from the API in a SnackBar
        await ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'])),
        ).closed;
        return true; // Password change successful
      } else {
        // Display an error message in a SnackBar
       await ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'])),
        ).closed;
        return false;
      }
    } else {
      print("Failed Response: ${response.statusCode}");
      return false;
    }
  } catch (e) {
    print("Exception while changing password: $e");
    return false;
  }
}

// Old Password Field
bool _isOldPasswordVisible = false;

// New Password Field
bool _isNewPasswordVisible = false;

// Confirm New Password Field
bool _isConfirmPasswordVisible = false;

  @override
  void initState() {
    super.initState();
   final authViewModel = context.read<AuthViewModel>();

    // Add listeners to text controllers to update the button state
    _oldPasswordController.addListener(_checkFormValidity);
    _newPasswordController.addListener(_checkFormValidity);
    _confirmPasswordController.addListener(_checkFormValidity);
      // Fetch user details and set the old password
  _loadUserDetails(authViewModel);
  }

  Future<void> _loadUserDetails(AuthViewModel authViewModel) async {
  await authViewModel.fetchUserDetails();
  setState(() {
    final currentUser = authViewModel.user;
    _oldPasswordController.text = currentUser?.password ?? '';
    print('Password set in controller: ${currentUser?.password}');
  });
}

  @override
  void dispose() {
    _oldPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

 @override
Widget build(BuildContext context) {
  return DefaultViewLayout(
    title: "Change Password",
    content: Container(
      // Container for the main card style
      decoration: BoxDecoration(
        color: Colors.white, // White background
        borderRadius: BorderRadius.circular(12), // Rounded corners
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1), // Subtle shadow
            spreadRadius: 2,
            blurRadius: 15,
            offset: Offset(0, 4), // Shadow position
          ),
        ],
      ),
      padding: const EdgeInsets.all(30), // Padding around the container
      margin: const EdgeInsets.symmetric(vertical: 40, horizontal: 24), // Centered with margins
      child: Form(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 12), // Adjust padding if needed
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Text(
                  "Change Password",
                  style: AppTextStyles.subtitle2.copyWith(
                    color: AppColors.black,
                    fontSize: 28, // Title size slightly smaller for balance
                    fontWeight: FontWeight.bold, // Bold title
                  ),
                ),
              ),
              const Gap(20),

              CustomTextFormField(
  controller: _oldPasswordController,
  formStyle: AppFormStyles.defaultFormStyle,
  height: 48,
  hintText: "Old Password",
  obscureText: !_isOldPasswordVisible,
  suffixIcon: IconButton(
    icon: Icon(
      _isOldPasswordVisible ? Icons.visibility : Icons.visibility_off,
      color: Colors.grey,
    ),
    onPressed: () {
      setState(() {
        _isOldPasswordVisible = !_isOldPasswordVisible;
      });
    },
  ),
),
const Gap(20),

             CustomTextFormField(
  controller: _newPasswordController,
  formStyle: AppFormStyles.defaultFormStyle,
  height: 48,
  hintText: "New Password",
  obscureText: !_isNewPasswordVisible,
  suffixIcon: IconButton(
    icon: Icon(
      _isNewPasswordVisible ? Icons.visibility : Icons.visibility_off,
      color: Colors.grey,
    ),
    onPressed: () {
      setState(() {
        _isNewPasswordVisible = !_isNewPasswordVisible;
      });
    },
  ),
),
const Gap(20),


              CustomTextFormField(
  controller: _confirmPasswordController,
  formStyle: AppFormStyles.defaultFormStyle,
  height: 48,
  hintText: "Confirm New Password",
  obscureText: !_isConfirmPasswordVisible,
  suffixIcon: IconButton(
    icon: Icon(
      _isConfirmPasswordVisible ? Icons.visibility : Icons.visibility_off,
      color: Colors.grey,
    ),
    onPressed: () {
      setState(() {
        _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
      });
    },
  ),
),
const Gap(20),
              // Display any error messages
              if (errorMessage != null)
                Text(
                  errorMessage!,
                  style: TextStyle(color: Colors.red),
                ),
              const Gap(30),

              Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      disabled: isButtonDisabled, // Use isButtonDisabled to manage button state
                      isExpanded: true,
                      text: "Change Password",
                      textStyle: AppTextStyles.button,
                      command: () async {
                        String oldPassword = _oldPasswordController.text;
                        await comparePassword(oldPassword);
                        await _changePassword();
                      },
                      height: 48,
                      fillColor: Color(0xFF778C62), // Maroon color for the button
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

}
