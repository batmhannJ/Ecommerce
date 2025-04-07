import 'package:flutter/services.dart';

import '/core/style/colors.dart';
import '/core/style/form_styles.dart';
import '/core/style/text_styles.dart';
import 'package:flutter/material.dart';

class CustomTextFormField extends StatefulWidget {
  final TextEditingController controller;
  final String? initialValue;
  final double height;
  final String? hintText;
  final FormStyle formStyle;
  final bool disabled;
  final bool canTapOutside;
  final bool obscureText;
  final Icon? icon;
  final Widget? suffixIcon;
  final bool required;
  final String? Function(Object?)? validator;
  final AutovalidateMode autoValidateMode;
  final TextInputType keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  const CustomTextFormField({
    required this.controller,
    this.initialValue,
    this.height = 32,
    this.hintText,
    required this.formStyle,
    this.disabled = false,
    this.canTapOutside = false,
    this.obscureText = false,
    this.icon,
    this.suffixIcon,
    this.required = false,
    this.validator,
    this.autoValidateMode = AutovalidateMode.onUserInteraction,
    this.keyboardType = TextInputType.text,
    this.inputFormatters,
    super.key,
  });

  @override
  State<CustomTextFormField> createState() => _CustomTextFormFieldState();
}

class _CustomTextFormFieldState extends State<CustomTextFormField> {
  final FocusNode textFormFieldFocusNode = FocusNode();
  FocusNode get focusNode => textFormFieldFocusNode;

  final GlobalKey<FormFieldState> formFieldKey = GlobalKey<FormFieldState>();

  late String? _initialValue;

  @override
  void initState() {
    _initialValue = widget.initialValue;

    _setControllerText();
    super.initState();
  }

  @override
  void dispose() {
    textFormFieldFocusNode.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant CustomTextFormField oldWidget) {
    if (widget.initialValue != _initialValue) {
      _initialValue = widget.initialValue;
      WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
        _setControllerText();
      });
    }
    super.didUpdateWidget(oldWidget);
  }

  void _setControllerText() {
    widget.controller.text = _initialValue ?? "";
  }

  @override
  Widget build(BuildContext context) {
    Widget textFormField = FormField(
      key: formFieldKey,
      initialValue: _initialValue,
      validator: (value) {
        String? errorMessage;

        if (widget.validator != null) {
          errorMessage = widget.validator!(value);
        }

        return errorMessage;
      },
      autovalidateMode: widget.autoValidateMode,
      builder: (field) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: widget.height,
              child: Stack(
                children: [
                  GestureDetector(
                    onTap: () {
                      if (!textFormFieldFocusNode.hasFocus) {
                        textFormFieldFocusNode.requestFocus();
                      }
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: widget.formStyle.fillColor,
                        borderRadius: BorderRadius.all(
                          Radius.circular(widget.formStyle.borderRadius),
                        ),
                        border: field.errorText == null
                            ? widget.formStyle.defaultBorder
                            : widget.formStyle.errorBorder,
                      ),
                    ),
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: TextFormField(
                      keyboardType: widget.keyboardType,
                      inputFormatters:
                          widget.inputFormatters, // Use widget.inputFormatters
                      focusNode: textFormFieldFocusNode,
                      obscureText: widget.obscureText,
                      enabled: !widget.disabled,
                      controller: widget.controller,
                      style: widget.formStyle.textStyle.copyWith(height: 1),
                      textAlignVertical: TextAlignVertical.center,
                      cursorColor: AppColors.black,
                      textAlign: widget.formStyle.textAlign,
                      decoration: InputDecoration(
                        prefixIcon: widget.icon,
                        suffixIcon: widget.suffixIcon,
                        hintText: widget.hintText,
                        hintStyle: widget.formStyle.hintTextStyle,
                        border: InputBorder.none,
                        isDense: true,
                        isCollapsed: true,
                        contentPadding: widget.formStyle.contentPadding,
                      ),
                      onChanged: (value) {
                        formFieldKey.currentState!.didChange(value);
                      },
                      onTapOutside: widget.canTapOutside
                          ? (event) => FocusScope.of(context).unfocus()
                          : null,
                    ),
                  )
                ],
              ),
            ),
            if (field.errorText != null)
              Padding(
                padding: const EdgeInsets.only(top: 5),
                child: Text(
                  field.errorText!,
                  overflow: TextOverflow.visible,
                  style: AppTextStyles.caption.copyWith(color: AppColors.red),
                ),
              ),
          ],
        );
      },
    );

    return textFormField;
  }
}
