import 'package:indigitech_shop/core/style/colors.dart';

import '/core/style/font_weights.dart';
import '/core/style/fonts.dart';
import 'package:flutter/material.dart';

import '../utils/style_utils.dart';

abstract final class AppTextStyles {
  static final TextStyle headline1 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.light,
    fontSize: 93,
    letterSpacing: -1.5,
  );

  static final TextStyle headline2 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.light,
    fontSize: 58,
    letterSpacing: -0.5,
  );

  static final TextStyle headline3 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.regular,
    fontSize: 47,
    letterSpacing: 0,
  );

  static final TextStyle headline4 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.regular,
    fontSize: 33,
    letterSpacing: 0.25,
  );

  static final TextStyle headline5 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.regular,
    fontSize: 23,
    letterSpacing: 0,
  );

  static final TextStyle headline6 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.medium,
    fontSize: 19,
    letterSpacing: 0.15,
  );

  static final TextStyle subtitle1 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.regular,
    fontSize: 16,
    letterSpacing: 0.15,
  );

  static final TextStyle subtitle2 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.poppins,
    fontWeight: AppFontWeights.medium,
    fontSize: 14,
    letterSpacing: 0.1,
  );

  static final TextStyle body1 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.inter,
    fontWeight: AppFontWeights.regular,
    fontSize: 16,
    letterSpacing: 0.5,
  );

  static final TextStyle body2 = StyleUtils.getTextStyle(
    fontFamily: AppFonts.inter,
    fontWeight: AppFontWeights.regular,
    fontSize: 14,
    letterSpacing: 0.25,
  );

  static final TextStyle button = StyleUtils.getTextStyle(
    fontFamily: AppFonts.inter,
    fontWeight: AppFontWeights.bold,
    fontSize: 12,
    letterSpacing: 1.25,
    textColor: AppColors.primary,
  );

  static final TextStyle caption = StyleUtils.getTextStyle(
    fontFamily: AppFonts.inter,
    fontWeight: AppFontWeights.regular,
    fontSize: 12,
    letterSpacing: 0.4,
  );

  static final TextStyle overline = StyleUtils.getTextStyle(
    fontFamily: AppFonts.inter,
    fontWeight: AppFontWeights.regular,
    fontSize: 10,
    letterSpacing: 1.5,
  );
}
