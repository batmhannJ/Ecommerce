import '/core/style/colors.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class CustomButton extends StatefulWidget {
  final String text;
  final TextStyle textStyle;
  final VoidCallback command;
  final double height;
  final double? width;
  final Color fillColor;
  final double borderRadius;
  final BorderSide borderSide;
  final Icon? icon;
  final double? iconPadding;
  final bool isExpanded;
  final EdgeInsetsGeometry contentPadding;
  final bool disabled;

  const CustomButton({
    required this.text,
    required this.textStyle,
    required this.command,
    required this.height,
    this.width,
    required this.fillColor,
    this.borderRadius = 0,
    this.borderSide = BorderSide.none,
    this.icon,
    this.iconPadding,
    this.isExpanded = false,
    this.contentPadding = EdgeInsets.zero,
    this.disabled = false,
    super.key,
  });

  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton> {
  @override
  Widget build(BuildContext context) {
    Widget button = Material(
      color: widget.disabled ? AppColors.greyAD : widget.fillColor,
      shape: RoundedRectangleBorder(
        side: widget.borderSide,
        borderRadius: BorderRadius.circular(widget.borderRadius),
      ),
      clipBehavior: Clip.hardEdge,
      child: InkWell(
        onTap: widget.disabled ? null : widget.command,
        child: Padding(
          padding: widget.contentPadding,
          child: Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.text,
                  style: widget.textStyle,
                ),
                Gap(widget.iconPadding ?? 0),
                Visibility(
                  visible: widget.icon != null,
                  child: widget.icon ?? const SizedBox.shrink(),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    return SizedBox(
      width: widget.width,
      height: widget.height,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          widget.isExpanded
              ? Expanded(
                  child: button,
                )
              : button,
        ],
      ),
    );
  }
}
