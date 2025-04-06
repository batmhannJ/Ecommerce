import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:flutter/material.dart';

import '../core/style/colors.dart';
import '../core/style/text_styles.dart';

class CustomDropdown<T> extends StatefulWidget {
  final GlobalKey<FormFieldState> formFieldKey;
  final T? initialValue;
  final List<T> items;
  final String hint;

  const CustomDropdown({
    super.key,
    required this.formFieldKey,
    required this.initialValue,
    required this.items,
    this.hint = "Select Item",
  });

  @override
  State<CustomDropdown> createState() => CustomDropdownState<T>();
}

class CustomDropdownState<T> extends State<CustomDropdown> {
  @override
  void didUpdateWidget(covariant CustomDropdown oldWidget) {
    if (widget.initialValue != oldWidget.initialValue) {
      WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
        widget.formFieldKey.currentState!.didChange(widget.initialValue);
      });
    }
    super.didUpdateWidget(oldWidget);
  }

  @override
  Widget build(BuildContext context) {
    return FormField<T>(
      key: widget.formFieldKey,
      initialValue: widget.initialValue,
      autovalidateMode: AutovalidateMode.always,
      builder: (field) {
        return DropdownButtonHideUnderline(
          child: DropdownButton2<T>(
            isExpanded: true,
            buttonStyleData: ButtonStyleData(
                height: 36,
                decoration:
                    BoxDecoration(border: Border.all(color: AppColors.greyAD))),
            value: field.value,
            hint: Text(
              widget.hint,
              style: AppTextStyles.subtitle2.copyWith(color: AppColors.greyAD),
            ),
            items: widget.items
                .map((e) => DropdownMenuItem<T>(
                      value: e,
                      child: Text(
                        e.toString(),
                        style: AppTextStyles.subtitle2,
                      ),
                    ))
                .toList(),
            onChanged: (value) {
              widget.formFieldKey.currentState!.didChange(value);
            },
          ),
        );
      },
    );
  }
}
