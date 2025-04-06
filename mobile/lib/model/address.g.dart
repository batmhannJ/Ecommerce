// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'address.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Address _$AddressFromJson(Map<String, dynamic> json) => Address(
      province: json['province'] as String? ?? '',
      municipality: json['municipality'] as String? ?? '',
      barangay: json['barangay'] as String? ?? '',
      zip: json['zip'] as String? ?? '',
      street: json['street'] as String? ?? '',
    );

Map<String, dynamic> _$AddressToJson(Address instance) => <String, dynamic>{
      'province': instance.province,
      'municipality': instance.municipality,
      'barangay': instance.barangay,
      'zip': instance.zip,
      'street': instance.street,
    };
