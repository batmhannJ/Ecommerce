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

class AccountSettingsView extends StatefulWidget {
  const AccountSettingsView({super.key});

  @override
  State<AccountSettingsView> createState() => _AccountSettingsViewState();
}

class _AccountSettingsViewState extends State<AccountSettingsView> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  String? currentName;
  String? currentPhone;
  String? currentEmail;

  @override
  void initState() {
    super.initState();
    
    final authViewModel = context.read<AuthViewModel>();

    authViewModel.fetchUserDetails().then((_) {
      setState(() {
        final currentUser = authViewModel.user;

        _nameController.text = currentUser?.name ?? ''; // Safe handling of null
        _phoneController.text = currentUser?.phone ?? ''; // Safe handling of null
        _emailController.text = currentUser?.email ?? ''; // Safe handling of null

        print('Name: ${currentUser?.name}');
        print('Phone: ${currentUser?.phone}');
        print('Email: ${currentUser?.email}');
      });
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
Widget build(BuildContext context) {
  return DefaultViewLayout(
    title: "Account Settings",
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
        onChanged: () {
          setState(() {
            currentName = _nameController.text;
            currentPhone = _phoneController.text;
            currentEmail = _emailController.text;
          });
        },
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Text(
                  "Personal Information",
                  style: AppTextStyles.subtitle2.copyWith(
                    color: AppColors.black,
                    fontSize: 28, // Title size slightly smaller for balance
                    fontWeight: FontWeight.bold, // Bold title
                  ),
                ),
              ),
              const SizedBox(height: 25),
              
              // Name Field
              CustomTextFormField(
                controller: _nameController,
                formStyle: AppFormStyles.defaultFormStyle,
                height: 48,
                hintText: "Your Name",
              ),
              const SizedBox(height: 20),
              
              // Phone Field
              CustomTextFormField(
                keyboardType: TextInputType.phone,
                controller: _phoneController,
                formStyle: AppFormStyles.defaultFormStyle,
                height: 48,
                hintText: "Phone or Mobile",
              ),
              const SizedBox(height: 20),
              
              // Email Field
              CustomTextFormField(
                keyboardType: TextInputType.emailAddress,
                controller: _emailController,
                formStyle: AppFormStyles.defaultFormStyle,
                height: 48,
                hintText: "Email",
              ),
              const SizedBox(height: 30),

              // Update Button
              Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      disabled: _nameController.text.isEmpty ||
                          _phoneController.text.isEmpty ||
                          _emailController.text.isEmpty,
                      isExpanded: true,
                      text: "Update",
                      textStyle: AppTextStyles.button,
                      command: () {
                        // Update user details via AuthViewModel
                        context.read<AuthViewModel>().updateUser(
                          name: _nameController.text,
                          phone: _phoneController.text,
                          email: _emailController.text,
                          context: context, // Pass the context here
                        );
                        Navigator.of(context).pop();
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
