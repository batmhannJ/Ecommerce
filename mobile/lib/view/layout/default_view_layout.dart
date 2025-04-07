import 'package:flutter/material.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';

class DefaultViewLayout extends StatelessWidget {
  final Widget content;
  final String title;
  final Color background;
  const DefaultViewLayout({
    super.key,
    required this.content,
    this.title = "",
    this.background = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.primary,
          elevation: 1,
          shadowColor: AppColors.black,
          title: title.isNotEmpty
              ? Text(
                  title,
                  style: AppTextStyles.headline6,
                )
              : null,
        ),
        body: Container(
          color: background,
          child: content,
        ),
      ),
    );
  }
}
