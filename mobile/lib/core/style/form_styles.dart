import '/core/style/colors.dart';
import '/core/style/text_styles.dart';
import 'package:flutter/material.dart';

class FormStyle {
  final TextStyle? hintTextStyle;
  final TextStyle textStyle;
  final double borderRadius;
  final Color? fillColor;
  final TextAlign textAlign;
  final Border? defaultBorder;
  final Border? errorBorder;
  final TextStyle? labelTextStyle;
  final double? labelPadding;
  final EdgeInsetsGeometry? contentPadding;

  const FormStyle({
    this.hintTextStyle,
    required this.textStyle,
    this.borderRadius = 0,
    this.fillColor,
    this.textAlign = TextAlign.start,
    this.defaultBorder,
    this.errorBorder,
    this.labelTextStyle,
    this.labelPadding,
    this.contentPadding,
  });

  FormStyle copyWith({
    TextStyle? hintTextStyle,
    TextStyle? textStyle,
    double? borderRadius,
    Color? fillColor,
    TextAlign? textAlign,
    Border? defaultBorder,
    Border? errorBorder,
    TextStyle? labelTextStyle,
    double? labelPadding,
    EdgeInsetsGeometry? contentPadding,
  }) =>
      FormStyle(
        hintTextStyle: hintTextStyle ?? this.hintTextStyle,
        textStyle: textStyle ?? this.textStyle,
        borderRadius: borderRadius ?? this.borderRadius,
        fillColor: fillColor ?? this.fillColor,
        textAlign: textAlign ?? this.textAlign,
        defaultBorder: defaultBorder ?? this.defaultBorder,
        errorBorder: errorBorder ?? this.errorBorder,
        labelTextStyle: labelTextStyle ?? this.labelTextStyle,
        labelPadding: labelPadding ?? this.labelPadding,
        contentPadding: contentPadding ?? this.contentPadding,
      );
}

abstract final class AppFormStyles {
  static final authFormStyle = FormStyle(
    textStyle: AppTextStyles.body1,
    hintTextStyle: AppTextStyles.body1.copyWith(color: AppColors.greyAD),
    contentPadding: const EdgeInsets.symmetric(horizontal: 15),
    defaultBorder: Border.all(color: AppColors.lightGrey, width: 1.5)
  );

  static final defaultFormStyle = FormStyle(
    textStyle: AppTextStyles.subtitle2,
    hintTextStyle:
    AppTextStyles.subtitle2.copyWith(color: AppColors.greyAD),
    contentPadding: const EdgeInsets.symmetric(horizontal: 15),
    defaultBorder: Border.all(color: AppColors.greyAD),
  );

}
