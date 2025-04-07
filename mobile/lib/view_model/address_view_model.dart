import 'package:flutter/cupertino.dart';
import '../model/address.dart';

class AddressViewModel extends ChangeNotifier {

  Address? _address;

  Address? get address => _address;

  AddressViewModel() {
    // TODO: Comment this for empty data. This is for testing purposes only.
    /*_address = Address(
      fullName: "John Doe",
      phoneNumber: "0123456789",
      postalCode: "1234",
      line1: "Test St.",
      province: dummyProvince.first,
      city: dummyCity.first,
      barangay: dummyBarangay.first,
    );*/
  }

  void updateAddress(Address address) {
    _address = address;
    notifyListeners();
  }
}
