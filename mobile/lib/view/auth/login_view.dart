import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/font_weights.dart';
import 'package:indigitech_shop/core/style/form_styles.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/view/auth/forgot_password_view.dart';
import 'package:indigitech_shop/widget/form_fields/custom_text_form_field.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../widget/buttons/custom_filled_button.dart';
import 'package:indigitech_shop/view/auth/otp_verification.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import shared_preferences

// Adjust the path according to your project structure

class LoginView extends StatefulWidget {
  final VoidCallback onCreateAccount;
  final VoidCallback onLogin;

  const LoginView({
    super.key,
    required this.onCreateAccount,
    required this.onLogin,
  });

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _doAgreeToTerms = false;

  bool _isNewPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<bool> _validateCredentials(String email, String password) async {
    final response = await http.post(
      Uri.parse(
          'http://localhost:4000/login'), // Update this to match your API URL
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['success']) {
        // Save the token and user ID as needed
        String token = data['token'];
        String userId = data['userId'];
        print("Login successful: Token: $token, User ID: $userId");
        // Save userId in SharedPreferences
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('userId', userId);

        return true; // Credentials are valid
      } else {
        print("Login failed: ${data['errors']}");
        return false; // Invalid credentials
      }
    } else {
      print(
          "Failed to validate credentials. Server response: ${response.body}");
      return false;
    }
  }

  Future<bool> _sendOTP(String email) async {
    final response = await http.post(
      Uri.parse(
          'http://localhost:4000/send-otp-mobile'), // Replace with your API URL
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({'email': email}),
    );

    if (response.statusCode == 200) {
      print(
          "OTP sent: ${json.decode(response.body)['otp']}"); // For testing purposes
      return true;
    } else {
      print("Failed to send OTP. Server response: ${response.body}");
      return false;
    }
  }

@override
Widget build(BuildContext context) {
  return Scaffold(
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
          child: Form(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text("Login", style: AppTextStyles.headline4),
                  const SizedBox(height: 20),
                  CustomTextFormField(
                    controller: _emailController,
                    formStyle: AppFormStyles.authFormStyle,
                    height: 48,
                    hintText: "Email Address",
                    icon: const Icon(Icons.email, color: Colors.grey), // Email icon
                  ),
                  const SizedBox(height: 15),
                  CustomTextFormField(
                    controller: _passwordController,
                     obscureText: !_isConfirmPasswordVisible,
                    formStyle: AppFormStyles.authFormStyle,
                    height: 48,
                    hintText: "Password", // Keep this as is
                    icon: const Icon(Icons.lock, color: Colors.grey), // Password icon
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
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ForgotPasswordView(),
                          ),
                        );
                      },
                      child: Text(
                        "Forgot Password?",
                        style: AppTextStyles.body2.copyWith(
                          color: AppColors.red,
                          fontWeight: AppFontWeights.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  CustomButton(
                    disabled: !_doAgreeToTerms,
                    isExpanded: true,
                    text: "Continue",
                    textStyle: AppTextStyles.button,
                    command: () async {
                      String email = _emailController.text;
                      String password = _passwordController.text;
                      if (email.isNotEmpty && password.isNotEmpty) {
                        final response = await http.post(
                          Uri.parse('http://localhost:4000/login'),
                          headers: {'Content-Type': 'application/json'},
                          body: json.encode({'email': email, 'password': password}),
                        );
                        if (response.statusCode == 200) {
                          final data = json.decode(response.body);
                          if (data['success']) {
                            bool otpSent = await _sendOTP(email);
                            if (otpSent) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => OTPVerificationScreen(
                                    email: email,
                                    onOTPVerified: widget.onLogin,
                                  ),
                                ),
                              );
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text("Failed to send OTP. Please try again.")),
                              );
                            }
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(data['errors'])),
                            );
                          }
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Failed to log in. Please try again.")),
                          );
                        }
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Please enter both email and password.")),
                        );
                      }
                    },
                    height: 48,
                    fillColor: Color(0xFF778C62), // Maroon color for the button
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                  ),
                  const SizedBox(height: 20),
                  CheckboxListTile(
                    activeColor: AppColors.black,
                    value: _doAgreeToTerms,
                    controlAffinity: ListTileControlAffinity.leading,
                    contentPadding: EdgeInsets.zero,
                    visualDensity: VisualDensity.compact,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    title: Text(
                      "By continuing, I agree to the terms of use & privacy policy.",
                      style: AppTextStyles.body2,
                      overflow: TextOverflow.clip,
                    ),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          _doAgreeToTerms = value;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 15),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Create an account? ", style: AppTextStyles.body2),
                      TextButton(
                        onPressed: widget.onCreateAccount,
                        style: TextButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          padding: EdgeInsets.zero,
                        ),
                        child: Text(
                          "Click here",
                          style: AppTextStyles.body2.copyWith(
                            color: AppColors.red,
                            fontWeight: AppFontWeights.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
}


}
