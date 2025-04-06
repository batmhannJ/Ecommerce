import '/core/style/colors.dart';
import 'package:flutter/material.dart';

abstract final class StyleUtils {
  static TextStyle getTextStyle({
    Color? textColor = AppColors.black,
    required String? fontFamily,
    required FontWeight fontWeight,
    required double fontSize,
    double? letterSpacing,
    textShadow,
    fontStyle = FontStyle.normal,
  }) {
    return TextStyle(
      overflow: TextOverflow.ellipsis,
      color: textColor,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      fontSize: fontSize,
      shadows: textShadow ?? [],
      fontStyle: fontStyle,
      letterSpacing: letterSpacing,
    );
  }
}
