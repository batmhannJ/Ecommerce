import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:form_field_validator/form_field_validator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/helpers/navigator_route_fade_in.dart';
import 'package:restaurant/presentation/screens/profile/list_addresses_screen.dart';
import 'package:restaurant/presentation/screens/profile/maps/map_address_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
class AddStreetAddressScreen extends StatefulWidget {
  @override
  _AddStreetAddressScreenState createState() => _AddStreetAddressScreenState();
}

class _AddStreetAddressScreenState extends State<AddStreetAddressScreen> {
  late TextEditingController _streetAddressController;
  final _keyForm = GlobalKey<FormState>();
  late TextEditingController _referenceController;
  bool _isLoading = false; // Add this line to define the variable

@override
void initState() {
  super.initState();
  _streetAddressController = TextEditingController();
  _referenceController = TextEditingController();
  final userBloc = BlocProvider.of<UserBloc>(context);
  print('User ID in initState: ${userBloc.state.user?.uid}');
}

  Future<Position?> getCurrentLocation() async {
    if (kIsWeb) {
      try {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const Center(child: CircularProgressIndicator()),
        );

        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        );

        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }

        return position;
      } catch (e) {
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }

        print('Web location error: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not access location. Please enter address manually.')),
        );
        return null;
      }
    } else {
      try {
        final status = await Permission.location.status;
        if (status.isGranted) {
          return await Geolocator.getCurrentPosition();
        } else {
          final result = await Permission.location.request();
          if (result.isGranted) {
            return await Geolocator.getCurrentPosition();
          }
        }
      } catch (e) {
        print('Mobile location error: $e');
      }
      return null;
    }
  }

Future<String?> getAddressFromCoordinatesWeb(double lat, double lng) async {
  final apiKey = 'AIzaSyCfeMqzu93-w0aWnBTs1TTU62_Od49c9iI';  
  final url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=$lat,$lng&key=$apiKey';
  
  try {
    print('Making API request to: $url');
    final response = await http.get(Uri.parse(url));
    print('API response status: ${response.statusCode}');
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print('API response data: ${response.body}');
      
      if (data['results'] != null && data['results'].isNotEmpty) {
        final address = data['results'][0]['formatted_address'];
        print('Found address: $address');
        return address;
      } else {
        print('No results found in API response');
      }
    }
    return null;
  } catch (e) {
    print('Web geocoding API error: $e');
    return null;
  }
}

  Future<void> _handleWebLocationSelection() async {
  final myLocationBloc = BlocProvider.of<MylocationmapBloc>(context);
  final position = await getCurrentLocation();

  if (position != null) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Fetching address...'), duration: Duration(seconds: 60)),
    );

    try {
      String address;
      if (kIsWeb) {
        final webAddress = await getAddressFromCoordinatesWeb(position.latitude, position.longitude);
        address = webAddress ?? "Location near (${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)})";
      } else {
        List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
        address = placemarks.isNotEmpty
            ? "${placemarks[0].street}, ${placemarks[0].locality}, ${placemarks[0].postalCode}, ${placemarks[0].country}"
            : "Unknown location";
      }

      _referenceController.text = address;
      myLocationBloc.add(OnChangeLocationEvent(
        LatLng(position.latitude, position.longitude),
        address, // Pass the fetched address, not an empty string
      ));

      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Location selected successfully')),
      );

      print('After location selection - Address: $address, Location: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      final fallbackAddress = "Selected location";
      _referenceController.text = fallbackAddress;
      myLocationBloc.add(OnChangeLocationEvent(
        LatLng(position.latitude, position.longitude),
        fallbackAddress,
      ));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not determine exact address. Using generic name instead.')),
      );
    }
  }
}

  @override
  void dispose() {
    _streetAddressController.clear();
    _streetAddressController.dispose();
    _referenceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final userBloc = BlocProvider.of<UserBloc>(context);
    final myLocationBloc = BlocProvider.of<MylocationmapBloc>(context);

return BlocListener<UserBloc, UserState>(
  listener: (context, state) {
    print('Current UserBloc state: $state'); 
    
    if (state is LoadingUserState) {
      if (!_isLoading) {
        _isLoading = true;
        modalLoading(context);
      }
    } else if (state is SuccessUserState) {
      _isLoading = false;
      // Make sure we safely dismiss any open dialogs
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      
      // Wait for any pending state transitions to complete
      Future.delayed(Duration(milliseconds: 300), () {
        modalSuccess(
          context, 
          'Street Address added successfully',
          () => Navigator.pushReplacement(context, routeFrave(page: ListAddressesScreen()))
        );
      });
    } else if (state is FailureUserState) {
      _isLoading = false;
      // Make sure we safely dismiss any open dialogs
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: TextCustom(text: state.error, color: Colors.white),
        backgroundColor: Colors.red
      ));
    }
  },
  child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          title: const TextCustom(text: 'New Address', fontSize: 19),
          centerTitle: true,
          elevation: 0,
          leadingWidth: 80,
          leading: TextButton(
              onPressed: () => Navigator.pushReplacement(context, routeFrave(page: ListAddressesScreen())),
              child: const TextCustom(text: 'Cancel', color: ColorsFrave.primaryColor, fontSize: 17)),
          actions: [
TextButton(
  onPressed: () async {
    final userBloc = BlocProvider.of<UserBloc>(context);
    print('User ID before save: ${userBloc.state.user?.uid}');

    if (_keyForm.currentState!.validate()) {
      print('User ID: ${userBloc.state.user!.uid}');
      print('Before save - locationCentral: ${myLocationBloc.state.locationCentral}');
      print('Before save - addressName: ${myLocationBloc.state.addressName}');

      if (myLocationBloc.state.locationCentral == null || myLocationBloc.state.addressName.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please select a location reference')),
        );
        return;
      }

      userBloc.add(
        OnAddNewAddressEvent(
          _streetAddressController.text.trim(),
          myLocationBloc.state.addressName,
          myLocationBloc.state.locationCentral!,
        ),
      );
    }
  },
  child: const TextCustom(text: 'Save', color: ColorsFrave.primaryColor, fontSize: 17),
),
          ],
        ),
        body: SafeArea(
          child: Form(
            key: _keyForm,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const TextCustom(text: 'Street Address'),
                  const SizedBox(height: 5.0),
                  FormFieldFrave(
                    controller: _streetAddressController,
                    validator: RequiredValidator(errorText: 'Street Address is required'),
                  ),
                  const SizedBox(height: 20.0),
                  const TextCustom(text: 'Reference'),
                  const SizedBox(height: 5.0),
                  if (kIsWeb)
                    Column(
                      children: [
                        TextField(
                          controller: _referenceController,
                          decoration: InputDecoration(
                            hintText: 'Enter reference or use location button',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (value) async {
                            if (value.isNotEmpty) {
                              try {
                                List<Location> locations = await locationFromAddress(value);
                                if (locations.isNotEmpty) {
                                  final location = locations.first;
                                  myLocationBloc.add(OnChangeLocationEvent(
                                    LatLng(location.latitude, location.longitude),
                                    value,
                                  ));
                                } else {
                                  myLocationBloc.add(OnChangeLocationEvent(
                                    null,
                                    value,
                                  ));
                                }
                              } catch (e) {
                                print('Geocoding error for manual input: $e');
                                myLocationBloc.add(OnChangeLocationEvent(
                                  null,
                                  value,
                                ));
                              }
                            }
                          },
                        ),
                        SizedBox(height: 10),
                        ElevatedButton.icon(
                          onPressed: _handleWebLocationSelection,
                          icon: Icon(Icons.location_on),
                          label: Text('Use My Current Location'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ColorsFrave.primaryColor,
                            minimumSize: Size(double.infinity, 50),
                          ),
                        ),
                        SizedBox(height: 5.0),
                        BlocBuilder<MylocationmapBloc, MylocationmapState>(
                          builder: (_, state) => state.addressName.isNotEmpty
                              ? Container(
                                  padding: EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(Icons.check_circle, color: Colors.green),
                                      SizedBox(width: 10),
                                      Expanded(
                                        child: TextCustom(
                                          text: "Selected: ${state.addressName}",
                                          fontSize: 14,
                                          maxLine: 2,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              : SizedBox.shrink(),
                        ),
                      ],
                    )
                  else
                    Column(
                      children: [
                        InkWell(
                          onTap: () async {
                            final permissionGPS = await Permission.location.isGranted;
                            final gpsActive = await Geolocator.isLocationServiceEnabled();

                            if (!gpsActive) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Please enable GPS to select a location.')),
                              );
                              return;
                            }

                            if (!permissionGPS) {
                              final result = await Permission.location.request();
                              if (result.isGranted) {
                                Navigator.push(context, navigatorPageFadeInFrave(context, MapLocationAddressScreen()));
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Location permission is required to select a location.')),
                                );
                              }
                              return;
                            }

                            Navigator.push(context, navigatorPageFadeInFrave(context, MapLocationAddressScreen()));
                          },
                          child: Container(
                            padding: const EdgeInsets.only(left: 10.0),
                            alignment: Alignment.centerLeft,
                            height: 50,
                            width: MediaQuery.of(context).size.width,
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey, width: .5),
                              borderRadius: BorderRadius.circular(5.0),
                            ),
                            child: BlocBuilder<MylocationmapBloc, MylocationmapState>(
                              builder: (_, state) => TextCustom(text: state.addressName),
                            ),
                          ),
                        ),
                        SizedBox(height: 5.0),
                        Align(
                          alignment: Alignment.centerRight,
                          child: const TextCustom(
                            text: 'Press to select direction',
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}