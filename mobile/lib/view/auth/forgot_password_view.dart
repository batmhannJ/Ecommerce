// forgot_password_view.dart
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/form_styles.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/widget/form_fields/custom_text_form_field.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:indigitech_shop/view/auth/otp_forgot_password.dart'; // Import the OTP confirmation screen

class ForgotPasswordView extends StatefulWidget {
  @override
  _ForgotPasswordViewState createState() => _ForgotPasswordViewState();
}

class _ForgotPasswordViewState extends State<ForgotPasswordView> {
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _requestPasswordReset() async {
    String email = _emailController.text;
    if (email.isNotEmpty) {
      final response = await http.post(
        Uri.parse(
            'http://localhost:4000/forgot-password'), // Update to your API URL
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("OTP sent to your email.")),
        );
        // Navigate to OTP confirmation screen
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                OTPForgotPasswordView(email: email), // Pass email if needed
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text("Failed to send OTP. Please try again.")),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter your email address.")),
      );
    }
  }

@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text("Forgot Password"),
      backgroundColor: Colors.white,
    ),
    body: Center(
      child: Card(
        elevation: 5,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        color: AppColors.primary,
        margin: const EdgeInsets.symmetric(horizontal: 20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text("Email Verification", style: AppTextStyles.headline4),
                const SizedBox(height: 20),
                Text(
                  "Enter your email for a password reset code.",
                  style: AppTextStyles.body1,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                CustomTextFormField(
                  controller: _emailController,
                  formStyle: AppFormStyles.authFormStyle,
                  height: 48,
                  hintText: "Email Address",
                  icon: Icon(Icons.email, color: Colors.grey),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _requestPasswordReset,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF778C62), // Logout button color
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      minimumSize: const Size.fromHeight(55), // Sets button height
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                    child: Text(
                      "Send Reset Link",
                      style: AppTextStyles.button,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}


}
