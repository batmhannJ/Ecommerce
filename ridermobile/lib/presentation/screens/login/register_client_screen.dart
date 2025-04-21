import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:form_field_validator/form_field_validator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/login/login_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';
import 'package:flutter/services.dart';

class RegisterClientScreen extends StatefulWidget {
  @override
  _RegisterClientScreenState createState() => _RegisterClientScreenState();
}

class _RegisterClientScreenState extends State<RegisterClientScreen> {
  late TextEditingController _nameController;
  late TextEditingController _lastnameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;

  final _keyForm = GlobalKey<FormState>();

  @override
  void initState() {
    _nameController = TextEditingController();
    _lastnameController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    clearForm();
    _nameController.dispose();
    _lastnameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void clearForm() {
    _nameController.clear();
    _lastnameController.clear();
    _phoneController.clear();
    _emailController.clear();
    _passwordController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final userBloc = BlocProvider.of<UserBloc>(context);
    final size = MediaQuery.of(context).size;

    return BlocListener<UserBloc, UserState>(
      listener: (context, state) {
        if (state is LoadingUserState) {
          modalLoading(context);
        } else if (state is SuccessUserState) {
          Navigator.pop(context);
          modalSuccess(context, 'Client Registered successfully',
              () => Navigator.pushReplacement(context, routeFrave(page: LoginScreen())));
        } else if (state is FailureUserState) {
          Navigator.pop(context);
          errorMessageSnack(context, state.error);
        }
      },
      child: Scaffold(
        backgroundColor: Colors.grey[100],
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
          flexibleSpace: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [ColorsFrave.primaryColor.withOpacity(0.1), Colors.white],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          leading: InkWell(
            onTap: () {
              clearForm();
              Navigator.pop(context);
            },
            borderRadius: BorderRadius.circular(16.0),
            child: Container(
              height: 32,
              width: 32,
              decoration: BoxDecoration(
                color: Colors.grey[50],
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back_ios_new_outlined, color: Colors.black, size: 16),
            ),
          ),
          actions: [
            const SizedBox(width: 10),
          ],
        ),
        body: Stack(
          children: [
            // Background Image
            Container(
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('Assets/Logo/loginbg.png'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            // Main Content
            SafeArea(
              child: Form(
                key: _keyForm,
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        const SizedBox(height: 20),
                        Text(
                          'Create Account',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Align(
                          alignment: Alignment.center,
                          child: _ModernPictureRegister(),
                        ),
                        const SizedBox(height: 30),
                        _ModernTextField(
                          controller: _nameController,
                          label: 'Name',
                          hint: 'Enter your name',
                          validator: RequiredValidator(errorText: 'Name is required'),
                        ),
                        const SizedBox(height: 20),
                        _ModernTextField(
                          controller: _lastnameController,
                          label: 'Lastname',
                          hint: 'Enter your lastname',
                          validator: RequiredValidator(errorText: 'Lastname is required'),
                        ),
                        const SizedBox(height: 20),
                        _ModernTextField(
                          controller: _phoneController,
                          label: 'Phone',
                          hint: '000-000-000',
                          keyboardType: TextInputType.number,
                          validator: validatedPhoneForm,
                        ),
                        const SizedBox(height: 20),
                        _ModernTextField(
                          controller: _emailController,
                          label: 'Email',
                          hint: 'email@frave.com',
                          keyboardType: TextInputType.emailAddress,
                          validator: validatedEmail,
                        ),
                        const SizedBox(height: 20),
                        _ModernTextField(
                          controller: _passwordController,
                          label: 'Password',
                          hint: '********',
                          isPassword: true,
                          validator: passwordValidator,
                        ),
                        const SizedBox(height: 20),
                        Align(
                          alignment: Alignment.center,
                          child: SizedBox(
                            width: size.width * 0.75, // Save button 75% of screen width
                            child: _ModernButton(
                              text: 'Save',
                              isPrimary: true,
                              onPressed: () {
                                if (_keyForm.currentState!.validate()) {
                                  userBloc.add(OnRegisterClientEvent(
                                    _nameController.text,
                                    _lastnameController.text,
                                    _phoneController.text,
                                    _emailController.text,
                                    _passwordController.text,
                                    userBloc.state.pictureProfilePath,
                                  ));
                                }
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Modern Button for Content
class _ModernButton extends StatelessWidget {
  final String text;
  final bool isPrimary;
  final VoidCallback onPressed;

  const _ModernButton({
    required this.text,
    required this.onPressed,
    this.isPrimary = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isPrimary ? ColorsFrave.primaryColor : Colors.grey[200],
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            if (isPrimary)
              BoxShadow(
                color: ColorsFrave.primaryColor.withOpacity(0.3),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isPrimary ? Colors.white : Colors.black87,
            fontSize: 15,
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}

// Modern Text Field with Material 3 Styling and Toggle Eye for Password
class _ModernTextField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final bool isPassword;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  const _ModernTextField({
    required this.controller,
    required this.label,
    required this.hint,
    this.isPassword = false,
    this.keyboardType,
    this.validator,
  });

  @override
  _ModernTextFieldState createState() => _ModernTextFieldState();
}

class _ModernTextFieldState extends State<_ModernTextField> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final fontScale = size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0;

    return TextFormField(
      controller: widget.controller,
      obscureText: widget.isPassword ? _obscureText : false,
      keyboardType: widget.keyboardType,
      validator: widget.validator,
      style: TextStyle(
        fontSize: 16 * fontScale,
        color: Colors.black87,
        fontFamily: 'Poppins',
      ),
      decoration: InputDecoration(
        labelText: widget.label,
        labelStyle: TextStyle(
          color: Colors.grey[600],
          fontSize: 14 * fontScale,
          fontWeight: FontWeight.w500,
        ),
        hintText: widget.hint,
        hintStyle: TextStyle(
          color: Colors.grey[400],
          fontSize: 14 * fontScale,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: ColorsFrave.primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
        suffixIcon: widget.isPassword
            ? IconButton(
                icon: Icon(
                  _obscureText ? Icons.visibility : Icons.visibility_off,
                  color: Colors.grey[600],
                ),
                onPressed: () {
                  setState(() {
                    _obscureText = !_obscureText;
                  });
                },
              )
            : null,
      ),
    );
  }
}

// Modern Picture Register with Animation
class _ModernPictureRegister extends StatefulWidget {
  @override
  __ModernPictureRegisterState createState() => __ModernPictureRegisterState();
}

class __ModernPictureRegisterState extends State<_ModernPictureRegister>
    with SingleTickerProviderStateMixin {
  final ImagePicker _picker = ImagePicker();
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _showModernPhotoModal(context),
      borderRadius: BorderRadius.circular(60),
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            height: 120,
            width: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  ColorsFrave.primaryColor.withOpacity(0.2),
                  ColorsFrave.primaryColor.withOpacity(0.4),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: BlocBuilder<UserBloc, UserState>(
              builder: (context, state) => Container(
                margin: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                ),
                child: state.pictureProfilePath == ''
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.add_a_photo,
                            size: 40,
                            color: ColorsFrave.primaryColor,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Add Photo',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      )
                    : ClipOval(
                        child: Image.file(
                          File(state.pictureProfilePath),
                          fit: BoxFit.cover,
                          height: 112,
                          width: 112,
                        ),
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showModernPhotoModal(BuildContext context) {
    final userBloc = BlocProvider.of<UserBloc>(context);
    final size = MediaQuery.of(context).size;
    final fontScale = size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0;

    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.6),
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          width: size.width * 0.8,
          padding: EdgeInsets.all(size.width * 0.06),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Select Photo Source',
                style: TextStyle(
                  fontSize: 20 * fontScale,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                  fontFamily: 'Poppins',
                ),
              ),
              SizedBox(height: size.height * 0.02),
              _ModalOptionButton(
                icon: Icons.photo_library,
                text: 'Gallery',
                fontScale: fontScale,
                onPressed: () async {
                  final permissionGallery = await Permission.photos.request();
                  switch (permissionGallery) {
                    case PermissionStatus.granted:
                      Navigator.pop(context);
                      final XFile? imagePath = await _picker.pickImage(source: ImageSource.gallery);
                      if (imagePath != null) userBloc.add(OnSelectPictureEvent(imagePath.path));
                      break;
                    case PermissionStatus.denied:
                    case PermissionStatus.restricted:
                    case PermissionStatus.limited:
                    case PermissionStatus.permanentlyDenied:
                      openAppSettings();
                      break;
                  }
                },
              ),
              SizedBox(height: size.height * 0.015),
              _ModalOptionButton(
                icon: Icons.camera_alt,
                text: 'Camera',
                fontScale: fontScale,
                onPressed: () async {
                  final permissionPhotos = await Permission.camera.request();
                  switch (permissionPhotos) {
                    case PermissionStatus.granted:
                      Navigator.pop(context);
                      final XFile? photoPath = await _picker.pickImage(source: ImageSource.camera);
                      if (photoPath != null) userBloc.add(OnSelectPictureEvent(photoPath.path));
                      break;
                    case PermissionStatus.denied:
                    case PermissionStatus.restricted:
                    case PermissionStatus.limited:
                    case PermissionStatus.permanentlyDenied:
                      openAppSettings();
                      break;
                  }
                },
              ),
              SizedBox(height: size.height * 0.02),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  'Cancel',
                  style: TextStyle(
                    fontSize: 16 * fontScale,
                    fontWeight: FontWeight.w600,
                    color: Colors.red,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Modal Option Button with Modern Animation
class _ModalOptionButton extends StatefulWidget {
  final IconData icon;
  final String text;
  final double fontScale;
  final VoidCallback onPressed;

  const _ModalOptionButton({
    required this.icon,
    required this.text,
    required this.fontScale,
    required this.onPressed,
  });

  @override
  __ModalOptionButtonState createState() => __ModalOptionButtonState();
}

class __ModalOptionButtonState extends State<_ModalOptionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onPressed();
      },
      onTapCancel: () => _controller.reverse(),
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ColorsFrave.primaryColor.withOpacity(0.3)),
              boxShadow: [
                BoxShadow(
                  color: ColorsFrave.primaryColor.withOpacity(0.2),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  widget.icon,
                  color: ColorsFrave.primaryColor,
                  size: 24 * widget.fontScale,
                ),
                const SizedBox(width: 12),
                Text(
                  widget.text,
                  style: TextStyle(
                    fontSize: 16 * widget.fontScale,
                    fontWeight: FontWeight.w600,
                    color: ColorsFrave.primaryColor,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}