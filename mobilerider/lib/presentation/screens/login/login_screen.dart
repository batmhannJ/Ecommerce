import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/admin/admin_home_screen.dart';
import 'package:restaurant/presentation/screens/client/client_home_screen.dart';
import 'package:restaurant/presentation/screens/delivery/delivery_home_screen.dart';
import 'package:restaurant/presentation/screens/delivery/main_screen.dart';
import 'package:restaurant/presentation/screens/home/select_role_screen.dart';
import 'package:restaurant/presentation/screens/intro/intro_screen.dart';
import 'package:restaurant/presentation/screens/login/forgot_password_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late TextEditingController _emailController;
  late TextEditingController _passwordController;

  final _keyForm = GlobalKey<FormState>();

  @override
  void initState() {
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    _emailController.clear();
    _passwordController.clear();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authBloc = BlocProvider.of<AuthBloc>(context);
    final userBloc = BlocProvider.of<UserBloc>(context);
    final size = MediaQuery.of(context).size;
    final spacingScale = size.height < 480 ? 0.8 : size.height > 800 ? 1.2 : 1.0;

    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) async {
        print("AuthBloc state changed: $state");

        if (state is LoadingAuthState) {
          modalLoading(context);
        } else if (state is FailureAuthState) {
          Navigator.pop(context);
          errorMessageSnack(context, state.error);
        } else if (state is SuccessAuthState) {
          print("Success state detected, rolId: ${state.rolId}");
          userBloc.add(OnGetUserEvent(state.user!));
          Navigator.pop(context);

          if (state.rolId == '3') {
            print("Redirecting to Main Delivery Screen");
            Navigator.pushAndRemoveUntil(context, routeFrave(page: MainDeliveryLayout()), (route) => false);
          } else if (state.rolId == '2') {
            print("Redirecting to AdminHomeScreen");
            Navigator.pushAndRemoveUntil(context, routeFrave(page: AdminHomeScreen()), (route) => false);
          } else if (state.rolId == '1') {
            print("Redirecting to ClientHomeScreen");
            Navigator.pushAndRemoveUntil(context, routeFrave(page: ClientHomeScreen()), (route) => false);
          } else {
            print("No navigation for rolId: ${state.rolId}");
          }
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Form(
            key: _keyForm,
            child: ListView(
              physics: BouncingScrollPhysics(),
              padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0 * spacingScale),
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      InkWell(
                        onTap: () => Navigator.pushReplacement(context, routeFrave(page: IntroScreen())),
                        borderRadius: BorderRadius.circular(100.0),
                        child: Container(
                          height: 40,
                          width: 40,
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.arrow_back_ios_new_outlined, color: Colors.black, size: 20),
                        ),
                      ),
                      Row(
                        children: const [
                          TextCustom(text: 'Bizgo ', color: ColorsFrave.loadingColor, fontWeight: FontWeight.w500),
                          TextCustom(text: 'Rider', color: Colors.black87, fontWeight: FontWeight.w500),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 20.0 * spacingScale),
                Image.asset(
                  'Assets/Logo/bizgo.png',
                  height: size.width > 600 ? size.width * 0.4 : 150,
                ),
                SizedBox(height: 10.0 * spacingScale),
                Container(
                  alignment: Alignment.center,
                  child: TextCustom(
                    text: 'Welcome back!',
                    fontSize: 35 * (size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0),
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFFFB701),
                  ),
                ),
                SizedBox(height: 5.0 * spacingScale),
                Align(
                  alignment: Alignment.center,
                  child: TextCustom(
                    text: 'Use your credentials below and login to your account.',
                    textAlign: TextAlign.center,
                    color: Colors.black,
                    maxLine: 2,
                    fontSize: 16 * (size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0),
                  ),
                ),
                SizedBox(height: 50.0 * spacingScale),
                TextCustom(
                  text: 'Email Address',
                  fontSize: 16 * (size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0),
                ),
                SizedBox(height: 5.0 * spacingScale),
                _ModernTextField(
                  controller: _emailController,
                  hintText: 'email@bizgo.com',
                  keyboardType: TextInputType.emailAddress,
                  validator: validatedEmail,
                ),
                SizedBox(height: 20.0 * spacingScale),
                TextCustom(
                  text: 'Password',
                  fontSize: 16 * (size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0),
                ),
                SizedBox(height: 5.0 * spacingScale),
                _ModernTextField(
                  controller: _passwordController,
                  hintText: '********',
                  isPassword: true,
                  validator: passwordValidator,
                ),
                SizedBox(height: 10.0 * spacingScale),
                Align(
                  alignment: Alignment.centerRight,
                  child: InkWell(
                    onTap: () => Navigator.push(context, routeFrave(page: ForgotPasswordScreen())),
                    child: TextCustom(
                      text: 'Forgot Password?',
                      fontSize: 17 * (size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0),
                      color: ColorsFrave.primaryColor,
                    ),
                  ),
                ),
                SizedBox(height: 40.0 * spacingScale),
                BtnFrave(
                  text: 'Login',
                  fontSize: 21 * (size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0),
                  height: 50 * (size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0),
                  fontWeight: FontWeight.w500,
                  onPressed: () {
                    if (_keyForm.currentState!.validate()) {
                      authBloc.add(LoginEvent(_emailController.text, _passwordController.text, context));
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Modern Text Field with Neumorphic Pulse Design and Fixed Password Toggle
class _ModernTextField extends StatefulWidget {
  final TextEditingController controller;
  final String hintText;
  final bool isPassword;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  const _ModernTextField({
    required this.controller,
    required this.hintText,
    this.isPassword = false,
    this.keyboardType,
    this.validator,
  });

  @override
  __ModernTextFieldState createState() => __ModernTextFieldState();
}

class __ModernTextFieldState extends State<_ModernTextField> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scaleAnimation;
  bool _isFocused = false;
  bool _hasError = false;
  bool _showPassword = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.0, end: 6.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.03).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticIn),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final fontScale = size.width < 360 ? 0.9 : size.width > 600 ? 1.1 : 1.0;
    final paddingScale = size.width < 360 ? 12.0 : size.width > 600 ? 20.0 : 16.0;
    final maxWidth = size.width > 600 ? size.width * 0.85 : size.width - 40.0;
    final iconSize = size.width < 360 ? 20.0 : size.width > 600 ? 28.0 : 24.0;

    return AnimatedBuilder(
      animation: Listenable.merge([_pulseAnimation, _scaleAnimation]),
      builder: (context, child) {
        return Transform.scale(
          scale: _hasError ? _scaleAnimation.value : 1.0,
          child: Container(
            constraints: BoxConstraints(maxWidth: maxWidth),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(14),
              border: _isFocused && !_hasError
                  ? Border.all(color: ColorsFrave.primaryColor, width: 1)
                  : _hasError
                      ? Border.all(color: Color.fromARGB(255, 188, 0, 0), width: 1)
                      : null,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey[200]!,
                  offset: const Offset(4, 4),
                  blurRadius: 8,
                  spreadRadius: 1,
                ),
                const BoxShadow(
                  color: Colors.white,
                  offset: Offset(-4, -4),
                  blurRadius: 8,
                  spreadRadius: 1,
                ),
                if (_isFocused && !_hasError)
                  BoxShadow(
                    color: ColorsFrave.primaryColor.withOpacity(0.3),
                    blurRadius: _pulseAnimation.value,
                    spreadRadius: 2,
                  ),
                if (_hasError)
                  BoxShadow(
                    color: Color.fromARGB(255, 188, 0, 0).withOpacity(0.3),
                    blurRadius: _pulseAnimation.value,
                    spreadRadius: 2,
                  ),
              ],
            ),
            child: TextFormField(
              controller: widget.controller,
              obscureText: widget.isPassword && !_showPassword,
              keyboardType: widget.keyboardType,
              validator: (value) {
                final result = widget.validator?.call(value);
                setState(() => _hasError = result != null);
                if (result != null) {
                  _controller.forward().then((_) => _controller.reverse());
                }
                return result;
              },
              style: TextStyle(
                fontSize: 16 * fontScale,
                color: Colors.black87,
                fontWeight: FontWeight.w500,
              ),
              decoration: InputDecoration(
                hintText: widget.hintText,
                hintStyle: TextStyle(
                  color: ColorsFrave.primaryColor.withOpacity(0.7),
                  fontSize: 14 * fontScale,
                  fontWeight: FontWeight.w400,
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: paddingScale,
                  vertical: paddingScale,
                ).copyWith(right: widget.isPassword ? paddingScale + iconSize : paddingScale),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
                errorStyle: TextStyle(
                  color: Color.fromARGB(255, 188, 0, 0),
                  fontSize: 12 * fontScale,
                ),
                suffixIcon: widget.isPassword
                    ? Padding(
                        padding: EdgeInsets.only(right: paddingScale * 0.5),
                        child: GestureDetector(
                          onTap: () {
                            print('Toggle password visibility: $_showPassword -> ${!_showPassword}');
                            setState(() => _showPassword = !_showPassword);
                          },
                          child: AnimatedOpacity(
                            opacity: _showPassword ? 1.0 : 0.7,
                            duration: const Duration(milliseconds: 200),
                            child: Icon(
                              _showPassword ? Icons.visibility : Icons.visibility_off,
                              color: _showPassword ? ColorsFrave.primaryColor : Colors.grey[400],
                              size: iconSize,
                            ),
                          ),
                        ),
                      )
                    : null,
              ),
              onTap: () => setState(() => _isFocused = true),
              onEditingComplete: () => setState(() => _isFocused = false),
              onChanged: (_) => setState(() => _isFocused = false),
            ),
          ),
        );
      },
    );
  }
}