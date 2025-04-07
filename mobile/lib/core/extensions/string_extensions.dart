extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1).toLowerCase()}";
  }

  String removeTrailingZero() {
    return replaceAll(RegExp(r"([.]*0)(?!.*\d)"), "");
  }
}

extension NullableStringExtension on String? {
  String? nullIfEmpty(){
    return (this ?? "").trim().isEmpty ? null : this;
  }
}
