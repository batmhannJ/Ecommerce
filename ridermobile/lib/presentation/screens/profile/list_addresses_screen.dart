import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/domain/models/response/addresses_response.dart';
import 'package:restaurant/domain/services/services.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/client/profile_client_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:geolocator/geolocator.dart';

class ListAddressesScreen extends StatefulWidget {
  const ListAddressesScreen({super.key});  // Add const constructor
  @override
  _ListAddressesScreenState createState() => _ListAddressesScreenState();
}

class _ListAddressesScreenState extends State<ListAddressesScreen> with WidgetsBindingObserver {
late Future<List<ListAddress>> _addressesFuture;  // Add future as state

  @override
  void initState() {
      WidgetsBinding.instance.addObserver(this);
     super.initState();
     _addressesFuture = userServices.getAddresses();  // Initialize future
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
void didChangeAppLifecycleState(AppLifecycleState state) async {
  if (kIsWeb) {
    return; // Skip lifecycle handling on web
  }
  if (state == AppLifecycleState.resumed) {
    final status = await Permission.location.status;
    if (status.isGranted) {
      if (mounted) {
        Navigator.push(context, routeFrave(page: AddStreetAddressScreen()));
      }
    }
  }
}

void requestLocationPermission() async {
  try {
    if (await Permission.location.serviceStatus.isEnabled) {
      final status = await Permission.location.status;
      if (status.isGranted) {
        Navigator.push(context, routeFrave(page: AddStreetAddressScreen()));
      } else if (status.isDenied) {
        final result = await Permission.location.request();
        accessLocation(result);
      } else {
        accessLocation(status);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enable location services in your device settings.')),
      );
    }
  } catch (e) {
    print('Permission error: $e');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Unable to access location permissions. Please check app settings.')),
    );
  }
}

  void accessLocation(PermissionStatus status) {
  switch (status) {
    case PermissionStatus.granted:
      Navigator.push(context, routeFrave(page: AddStreetAddressScreen()));
      break;
    case PermissionStatus.denied:
    case PermissionStatus.restricted:
    case PermissionStatus.limited:
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Location permission is required to add an address.')),
      );
      break;
    case PermissionStatus.permanentlyDenied:
      openAppSettings(); // Direct user to settings if permission is permanently denied
      break;
  }
}

 @override
  Widget build(BuildContext context) {
    return BlocListener<UserBloc, UserState>(
      listener: (context, state) {
        if (state is LoadingUserState) {
          modalLoading(context);
        } else if (state is SuccessUserState) {
          Navigator.pop(context);
          setState(() {
            _addressesFuture = userServices.getAddresses();  // Refresh data
          });
        } else if (state is FailureUserState) {
          Navigator.pop(context);
          errorMessageSnack(context, state.error);
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          title: const TextCustom(text: 'List Addresses', fontSize: 19),
          centerTitle: true,
          elevation: 0,
          leadingWidth: 80,
          leading: TextButton(
            onPressed: () => Navigator.pushReplacement(context, routeFrave(page: ProfileClientScreen())), 
            child: const TextCustom(text: 'Cancel', color: ColorsFrave.primaryColor, fontSize: 17 )
          ),
          actions: [
            TextButton(
           onPressed: () async {
            if (kIsWeb) {
              try {
                bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
                if (!serviceEnabled) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Please enable location services in your browser')),
                  );
                  return;
                }
                LocationPermission permission = await Geolocator.checkPermission();
                if (permission == LocationPermission.denied) {
                  permission = await Geolocator.requestPermission();
                  if (permission == LocationPermission.denied) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Location permission denied')),
                    );
                    return;
                  }
                }
                if (permission == LocationPermission.deniedForever) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Location permission permanently denied. Please enable it in browser settings.')),
                  );
                  return;
                }
                Navigator.push(context, routeFrave(page: AddStreetAddressScreen()));
              } catch (e) {
                print('Web location error: $e');
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Unable to access location in web browser')),
                );
              }
            } else {
              try {
                final status = await Permission.location.request();
                accessLocation(status);
              } catch (e) {
                print('Permission error: $e');
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Unable to access location permissions')),
                );
              }
            }
          },
              child: const TextCustom(text: 'Add', color: ColorsFrave.primaryColor, fontSize: 17),
            ),
          ],
        ),
        // In ListAddressesScreen's build method, modify the FutureBuilder part:
      body: FutureBuilder<List<ListAddress>>(
          future: _addressesFuture,  // Use state variable
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const ShimmerFrave();
            }
            
            if (snapshot.hasError) {
              return Center(
                child: TextCustom(
                  text: 'Error: ${snapshot.error}',
                  color: Colors.red,
                ),
              );
            }
            
            final addresses = snapshot.data ?? [];
            return _ListAddresses(listAddress: addresses);
          },
        ),
      ),
    );
  }
}
class _ListAddresses extends StatelessWidget {
  
  final List<ListAddress> listAddress;

  const _ListAddresses({Key? key, required this.listAddress}) : super(key: key);

  @override
  Widget build(BuildContext context) {

    final userBloc = BlocProvider.of<UserBloc>(context);

    return ( listAddress.length  != 0 ) 
    ? ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
        itemCount: listAddress.length,
        itemBuilder: (_, i) 
          => Dismissible(
                key: Key(listAddress[i].id.toString()),
                direction: DismissDirection.endToStart,
                background: Container(),
                onDismissed: (direction) => userBloc.add( OnDeleteStreetAddressEvent(listAddress[i].id)),
                secondaryBackground: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20.0),
                  margin: const EdgeInsets.only(bottom: 20.0),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.only(topRight: Radius.circular(10.0), bottomRight: Radius.circular(10.0))
                  ),
                  child: const Icon(Icons.delete_sweep_rounded, color: Colors.white, size: 38),
                ),
                child: Container(
                  height: 70,
                  width: MediaQuery.of(context).size.width,
                  margin: const EdgeInsets.only(bottom: 20.0),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(10.0)
                  ),
                  child: ListTile(
                    leading: BlocBuilder<UserBloc, UserState>(
                      builder: (_, state) 
                        => ( state.uidAddress == listAddress[i].id ) ? Icon(Icons.radio_button_checked_rounded, color: ColorsFrave.primaryColor) : Icon(Icons.radio_button_off_rounded)
                    ),
                    title: TextCustom(text: listAddress[i].street, fontSize: 20, fontWeight: FontWeight.w500 ),
                    subtitle: TextCustom(text: listAddress[i].reference, fontSize: 16, color: ColorsFrave.secundaryColor ),
                    trailing: Icon(Icons.swap_horiz_rounded, color: Colors.red[300] ),
                    onTap: () => userBloc.add( OnSelectAddressButtonEvent( listAddress[i].id, listAddress[i].reference)),
                  ),
                ),
              )
        )
    : _WithoutListAddress();
  }
}



class _WithoutListAddress extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: MediaQuery.of(context).size.width,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset('Assets/my-location.svg', height: 400 ),
          const TextCustom(text: 'Without Address', fontSize: 25, fontWeight: FontWeight.w500, color: ColorsFrave.secundaryColor ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }
}