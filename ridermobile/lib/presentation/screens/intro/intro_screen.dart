import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/screens/login/login_screen.dart';
import 'package:restaurant/presentation/screens/login/register_client_screen.dart';

class IntroScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(height: size.height * 0.1),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 15.0),
                  height: size.height * 0.55,
                  width: size.width,
                  child: Image.asset(
                    'Assets/Logo/introbg.png',
                    fit: BoxFit.contain,
                  ),
                ),
                Column(
                  children: [
                    _BtnSocial(
                      icon: FontAwesomeIcons.envelope,
                      text: 'Sign up with Email ID',
                      backgroundColor: Colors.transparent,
                      textColor: Colors.white,
                      onPressed: () => Navigator.push(context, routeFrave(page: RegisterClientScreen())),
                      gradient: const LinearGradient(
                        colors: [Color.fromARGB(255, 211, 124, 1), Color(0xFFFFB701)],
                      ),
                    ),
                    const SizedBox(height: 15.0), // Reduced top margin
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: BtnFrave(
                        text: 'Login',
                        fontWeight: FontWeight.w500,
                        borderRadius: 12.0,
                        height: 50,
                        fontSize: 20,
                        color: const Color(0xFF3F51B5), // Indigo color
                        onPressed: () => Navigator.push(context, routeFrave(page: LoginScreen())),
                      ),
                    ),
                    const SizedBox(height: 50.0),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Modified _BtnSocial with new modern design and elevated effect
class _BtnSocial extends StatefulWidget {
  final IconData icon;
  final String text;
  final VoidCallback? onPressed;
  final Color backgroundColor;
  final Color textColor;
  final bool isBorder;
  final LinearGradient? gradient;

  const _BtnSocial({
    required this.icon,
    required this.text,
    this.onPressed,
    this.backgroundColor = const Color(0xffF5F5F5),
    this.textColor = Colors.black,
    this.isBorder = false,
    this.gradient,
  });

  @override
  __BtnSocialState createState() => __BtnSocialState();
}

class __BtnSocialState extends State<_BtnSocial> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isSmallScreen = size.width < 360;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) {
          setState(() => _isPressed = false);
          widget.onPressed?.call();
        },
        onTapCancel: () => setState(() => _isPressed = false),
        child: AnimatedScale(
          duration: const Duration(milliseconds: 150),
          scale: _isPressed ? 0.97 : 1.0,
          child: Container(
            height: isSmallScreen ? 48.0 : 50.0,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: widget.gradient,
              color: widget.gradient == null ? widget.backgroundColor : null,
              border: widget.isBorder ? Border.all(color: Colors.grey, width: 0.7) : null,
              borderRadius: BorderRadius.circular(12.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(_isPressed ? 0.15 : 0.3),
                  blurRadius: 10.0,
                  offset: Offset(0, _isPressed ? 3 : 6),
                ),
              ],
            ),
            child: Row(
              children: [
                SizedBox(width: isSmallScreen ? 20.0 : 30.0),
                Icon(
                  widget.icon,
                  color: widget.isBorder ? Colors.black87 : widget.textColor,
                  size: isSmallScreen ? 18 : 20,
                ),
                SizedBox(width: isSmallScreen ? 15.0 : 20.0),
                TextCustom(
                  text: widget.text,
                  color: widget.textColor,
                  fontSize: isSmallScreen ? 16 : 17,
                  fontWeight: FontWeight.w500,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}