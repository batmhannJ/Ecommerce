import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/domain/models/response/orders_by_status_response.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/profile/edit_Prodile_screen.dart';
import 'package:restaurant/presentation/screens/profile/change_password_screen.dart';
import 'package:restaurant/presentation/screens/home/select_role_screen.dart';
import 'package:restaurant/presentation/screens/delivery/list_orders_delivery_screen.dart';
import 'package:restaurant/presentation/screens/delivery/order_on_way_screen.dart';
import 'package:restaurant/presentation/screens/delivery/order_delivered_screen.dart';
import 'package:restaurant/presentation/screens/intro/checking_login_screen.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'dart:convert';
import 'package:location/location.dart' as loc;
import 'package:geolocator/geolocator.dart' as geo;
import 'dart:math' show pi, sin, cos, asin, atan2;
import 'package:geocoding/geocoding.dart' as geocoding;

class MainDeliveryLayout extends StatefulWidget {
  const MainDeliveryLayout({super.key});

  @override
  State<MainDeliveryLayout> createState() => _MainDeliveryLayoutState();
}

class _MainDeliveryLayoutState extends State<MainDeliveryLayout> {
  int _currentIndex = 0;
  String _statusKey = UniqueKey().toString();

  List<Widget> get _screens => [
        const StatusScreen(),
        DeliveriesScreen(),
        MapScreen(),
        HistoryScreen(),
        WalletScreen(),
      ];

  final List<String> _titles = [
    'Status',
    'Deliveries',
    'Map',
    'History',
    'Wallet'
  ];

  @override
  Widget build(BuildContext context) {
    print("MainDeliveryLayout: Building with statusKey: $_statusKey");
    final shiftProvider = Provider.of<ShiftProvider>(context, listen: false);

      return Scaffold(
        appBar: AppBar(
          title: Text(_titles[_currentIndex]),
          actions: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: Colors.yellowbg),
              onPressed: () {},
            ),
          ],
        ),
        drawer: const Drawer(
          child: DeliveryHomeScreenAsDrawer(),
        ),
        body: IndexedStack(
          key: ValueKey(_statusKey),
          index: _currentIndex,
          children: _screens,
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          selectedItemColor: Colors.yellowbg,
          unselectedItemColor: Colors.grey,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.check_circle_outline),
              activeIcon: Icon(Icons.check_circle),
              label: 'Status',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.delivery_dining_outlined),
              activeIcon: Icon(Icons.delivery_dining),
              label: 'Deliveries',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.map_outlined),
              activeIcon: Icon(Icons.map),
              label: 'Map',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.history_outlined),
              activeIcon: Icon(Icons.history),
              label: 'History',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'Wallet',
            ),
          ],
        ),
    );
  }

  void updateStatusKey() {
    print("MainDeliveryLayout: Updating status key to force rebuild");
    setState(() {
      _statusKey = UniqueKey().toString();
      _currentIndex = 0; // Ensure StatusScreen is visible
    });
  }
}

class DeliveryHomeScreenAsDrawer extends StatelessWidget {
  const DeliveryHomeScreenAsDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authBloc = BlocProvider.of<AuthBloc>(context);

    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is LoadingAuthState) {
          modalLoading(context);
        } else if (state is SuccessAuthState) {
          Navigator.pop(context);
          modalSuccess(
            context,
            'Picture Change Successfully',
            () => Navigator.pop(context),
          );
        } else if (state is FailureAuthState) {
          Navigator.pop(context);
          errorMessageSnack(context, state.error);
        }
      },
      child: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
        children: [
          const SizedBox(height: 20.0),
          Align(
            alignment: Alignment.center,
            child: ImagePickerFrave(),
          ),
          const SizedBox(height: 20.0),
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is SuccessAuthState && state.user != null) {
                return Column(
                  children: [
                    Center(
                      child: TextCustom(
                        text: '${state.user!.firstName} ${state.user!.lastName}',
                        fontSize: 25,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 5.0),
                    Center(
                      child: TextCustom(
                        text: state.user!.email,
                        fontSize: 20,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                );
              }
              return const Column(
                children: [
                  Center(
                    child: TextCustom(
                      text: 'Loading...',
                      fontSize: 25,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 5.0),
                  Center(
                    child: TextCustom(
                      text: 'Loading...',
                      fontSize: 20,
                      color: Colors.grey,
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 15.0),
          const TextCustom(text: 'Account', color: Colors.grey),
          const SizedBox(height: 10.0),
          ItemAccount(
            text: 'Profile setting',
            icon: Icons.person,
            colorIcon: 0xff01C58C,
            onPressed: () => Navigator.push(context, routeFrave(page: EditProfileScreen())),
          ),
          ItemAccount(
            text: 'Change Password',
            icon: Icons.lock_rounded,
            colorIcon: 0xff1B83F5,
            onPressed: () => Navigator.push(context, routeFrave(page: ChangePasswordScreen())),
          ),
          ItemAccount(
            text: 'Change Role',
            icon: Icons.swap_horiz_rounded,
            colorIcon: 0xffE62755,
            onPressed: () => Navigator.pushAndRemoveUntil(context, routeFrave(page: SelectRoleScreen()), (route) => false),
          ),
          const ItemAccount(
            text: 'Dark mode',
            icon: Icons.dark_mode_rounded,
            colorIcon: 0xff051E2F,
          ),
          const SizedBox(height: 15.0),
          const TextCustom(text: 'Delivery', color: Colors.grey),
          const SizedBox(height: 10.0),
          ItemAccount(
            text: 'Orders',
            icon: Icons.checklist_rounded,
            colorIcon: 0xff5E65CD,
            onPressed: () => Navigator.push(context, routeFrave(page: ListOrdersDeliveryScreen())),
          ),
          ItemAccount(
            text: 'On Way',
            icon: Icons.delivery_dining_rounded,
            colorIcon: 0xff1A60C1,
            onPressed: () => Navigator.push(context, routeFrave(page: OrderOnWayScreen())),
          ),
          ItemAccount(
            text: 'Delivered',
            icon: Icons.check_rounded,
            colorIcon: 0xff4BB17B,
            onPressed: () => Navigator.push(context, routeFrave(page: OrderDeliveredScreen())),
          ),
          const SizedBox(height: 15.0),
          const TextCustom(text: 'Personal', color: Colors.grey),
          const SizedBox(height: 10.0),
          const ItemAccount(
            text: 'Privacy & Policy',
            icon: Icons.policy_rounded,
            colorIcon: 0xff6dbd63,
          ),
          const ItemAccount(
            text: 'Security',
            icon: Icons.lock_outline_rounded,
            colorIcon: 0xff1F252C,
          ),
          const ItemAccount(
            text: 'Term & Conditions',
            icon: Icons.description_outlined,
            colorIcon: 0xff458bff,
          ),
          const ItemAccount(
            text: 'Help',
            icon: Icons.help_outline,
            colorIcon: 0xff4772e6,
          ),
          const Divider(),
          ItemAccount(
            text: 'Sign Out',
            icon: Icons.power_settings_new_sharp,
            colorIcon: 0xffF02849,
            onPressed: () {
              authBloc.add(LogOutEvent());
              Navigator.pushAndRemoveUntil(context, routeFrave(page: CheckingLoginScreen()), (route) => false);
            },
          ),
        ],
      ),
    );
  }
}

class StatusScreen extends StatelessWidget {
  const StatusScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    print("StatusScreen: Building widget tree");
    
    return Consumer<ShiftProvider>(
      builder: (context, shiftProvider, _) {
        print("StatusScreen: Consumer rebuilding with isShiftActive: ${shiftProvider.isShiftActive}");
        final DateTime now = DateTime.now();
        final Map<String, dynamic> nextShift = getNextShift(now);

        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: shiftProvider.isShiftActive ? Colors.green[100] : Colors.grey[200],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  shiftProvider.isShiftActive ? 'Ready' : 'Not Working',
                  style: TextStyle(
                    color: shiftProvider.isShiftActive ? Colors.green[700] : Colors.grey[700],
                    fontWeight: shiftProvider.isShiftActive ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              if (shiftProvider.isShiftActive && shiftProvider.activeShift != null)
                _buildCurrentShiftUI(context, shiftProvider)
              else
                _buildUpcomingShiftUI(context, nextShift),
            ],
          ),
        );
      },
    );
  }


  Widget _buildCurrentShiftUI(BuildContext context, ShiftProvider shiftProvider) {
    final activeShift = shiftProvider.activeShift!;
    final DateTime now = DateTime.now();
    final bool isToday = activeShift['date'].day == now.day &&
        activeShift['date'].month == now.month &&
        activeShift['date'].year == now.year;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Current Shift',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 60,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          Text(_getMonth(activeShift['date']),
                              style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                          Text(activeShift['date'].day.toString(),
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                          Text(isToday ? 'Today' : _getWeekday(activeShift['date']),
                              style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${activeShift['startTime']} - ${activeShift['endTime']} (${activeShift['hours']}h)',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Row(
                          children: [
                            Icon(Icons.check_circle, color: Colors.green, size: 16),
                            SizedBox(width: 4),
                            Text(
                              'Ongoing',
                              style: TextStyle(color: Colors.green, fontSize: 14),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 8),
                Text('Settings', style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Available for Shift Extension',
                      style: TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
                    ),
                    Switch(
                      value: shiftProvider.isAvailableForExtension,
                      onChanged: (value) {
                        shiftProvider.setAvailabilityForExtension(value);
                      },
                      activeColor: Colors.yellowbg,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    shiftProvider.endShift();
                    final mainDeliveryLayoutState =
                        context.findAncestorStateOfType<_MainDeliveryLayoutState>();
                    mainDeliveryLayoutState?.updateStatusKey();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.yellowbg,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'End Shift',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUpcomingShiftUI(BuildContext context, Map<String, dynamic> nextShift) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Upcoming Shift',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              'View All',
              style: TextStyle(color: Colors.yellowbg, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          Text(_getMonth(nextShift['date']),
                              style: TextStyle(color: Colors.grey[600])),
                          Text(nextShift['date'].day.toString(),
                              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          Text(_getWeekday(nextShift['date']),
                              style: TextStyle(color: Colors.grey[600])),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${nextShift['startTime']} - ${nextShift['endTime']} (${nextShift['hours']}h)',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Starting in ${formatTimeRemaining(nextShift['minutesUntilStart'])}',
                          style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Are you ready?'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StartShiftScreen(
                          nextShift: nextShift,
                          onShiftStarted: () {
                            final mainDeliveryLayoutState = context.findAncestorStateOfType<_MainDeliveryLayoutState>();
                            mainDeliveryLayoutState?.updateStatusKey();
                          },
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.yellowbg,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Start Shift Now',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _getMonth(DateTime date) {
    switch (date.month) {
      case 1:
        return 'Jan';
      case 2:
        return 'Feb';
      case 3:
        return 'Mar';
      case 4:
        return 'Apr';
      case 5:
        return 'May';
      case 6:
        return 'Jun';
      case 7:
        return 'Jul';
      case 8:
        return 'Aug';
      case 9:
        return 'Sep';
      case 10:
        return 'Oct';
      case 11:
        return 'Nov';
      case 12:
        return 'Dec';
      default:
        return '';
    }
  }

  String _getWeekday(DateTime date) {
    switch (date.weekday) {
      case 1:
        return 'Mon';
      case 2:
        return 'Tue';
      case 3:
        return 'Wed';
      case 4:
        return 'Thu';
      case 5:
        return 'Fri';
      case 6:
        return 'Sat';
      case 7:
        return 'Sun';
      default:
        return '';
    }
  }

  
  Map<String, dynamic> getNextShift(DateTime now) {
  final List<Map<String, dynamic>> shifts = [
    {
      'name': '1st shift',
      'startHour': 7,
      'startMinute': 0,
      'endHour': 11,
      'endMinute': 0,
      'hours': 4
    },
    {
      'name': '2nd shift',
      'startHour': 11,
      'startMinute': 0,
      'endHour': 16,
      'endMinute': 0,
      'hours': 5
    },
    {
      'name': '3rd shift',
      'startHour': 16,
      'startMinute': 0,
      'endHour': 21,
      'endMinute': 0,
      'hours': 5
    },
    {
      'name': '4th shift',
      'startHour': 21,
      'startMinute': 0,
      'endHour': 2,
      'endMinute': 0,
      'hours': 5
    },
  ];
  
  final int currentHour = now.hour;
  final int currentMinute = now.minute;
  
  bool isWorkingNow = false;
  String currentShiftName = '';
  
  for (var shift in shifts) {
    final startHour = shift['startHour'];
    final endHour = shift['endHour'];
    
    if (shift['name'] == '4th shift') {
      if ((currentHour >= startHour) || (currentHour < endHour)) {
        isWorkingNow = true;
        currentShiftName = shift['name'];
        break;
      }
    } 
    else if (currentHour >= startHour && currentHour < endHour) {
      isWorkingNow = true;
      currentShiftName = shift['name'];
      break;
    }
  }

  Map<String, dynamic> nextShift = {
    'name': '1st shift',
    'startHour': 7,
    'startMinute': 0,
    'endHour': 11,
    'endMinute': 0,
    'hours': 4,
    'date': now
  };
  
  DateTime shiftDate = now;
  if (currentHour >= 21 || currentHour < 2) {
    if (currentHour >= 21) {
      shiftDate = DateTime(now.year, now.month, now.day + 1);
    } else {
      shiftDate = DateTime(now.year, now.month, now.day);
    }
    nextShift = {
      'name': '1st shift',
      'startHour': 7,
      'startMinute': 0,
      'endHour': 11,
      'endMinute': 0,
      'hours': 4,
      'date': shiftDate
    };
  }
  else if (currentHour >= 2 && currentHour < 7) {
    nextShift = {
      'name': '1st shift',
      'startHour': 6,
      'startMinute': 0,
      'endHour': 11,
      'endMinute': 0,
      'hours': 5,
      'date': shiftDate
    };
  }
  else if (currentHour >= 7 && currentHour < 11) {
    nextShift = {
      'name': '2nd shift',
      'startHour': 11,
      'startMinute': 0,
      'endHour': 16,
      'endMinute': 0,
      'hours': 5,
      'date': shiftDate
    };
  }
  else if (currentHour >= 11 && currentHour < 16) {
    nextShift = {
      'name': '3rd shift',
      'startHour': 16,
      'startMinute': 0,
      'endHour': 21,
      'endMinute': 0,
      'hours': 5,
      'date': shiftDate
    };
  }
  else if (currentHour >= 16 && currentHour < 21) {
    nextShift = {
      'name': '4th shift',
      'startHour': 21,
      'startMinute': 0,
      'endHour': 2,
      'endMinute': 0,
      'hours': 5,
      'date': shiftDate
    };
  }
  
  DateTime nextShiftStartTime = DateTime(
    shiftDate.year,
    shiftDate.month,
    shiftDate.day,
    nextShift['startHour'],
    nextShift['startMinute']
  );
  
  int minutesUntilStart = nextShiftStartTime.difference(now).inMinutes;
  
  if (minutesUntilStart < 0) {
    nextShiftStartTime = DateTime(
      shiftDate.year,
      shiftDate.month,
      shiftDate.day + 1,
      nextShift['startHour'],
      nextShift['startMinute']
    );
    minutesUntilStart = nextShiftStartTime.difference(now).inMinutes;
  }
  
  String formatTime(int hour, int minute) {
    String period = hour >= 12 ? 'PM' : 'AM';
    int displayHour = hour % 12;
    if (displayHour == 0) displayHour = 12;
    return '$displayHour:${minute.toString().padLeft(2, '0')} $period';
  }
  
  String startTime = formatTime(nextShift['startHour'], nextShift['startMinute']);
  String endTime = formatTime(nextShift['endHour'], nextShift['endMinute']);
  
  return {
    'name': nextShift['name'],
    'startTime': startTime,
    'endTime': endTime,
    'hours': nextShift['hours'],
    'date': shiftDate,
    'isWorkingNow': isWorkingNow,
    'currentShiftName': currentShiftName,
    'minutesUntilStart': minutesUntilStart
  };
}
String formatTimeRemaining(int minutes) {
  if (minutes < 60) {
    return '$minutes mins';
  } else {
    int hours = minutes ~/ 60;
    int remainingMins = minutes % 60;
    
    if (remainingMins == 0) {
      return '$hours hr';
    } else {
      return '$hours hr and $remainingMins mins';
    }
  }
}
}

class StartShiftScreen extends StatefulWidget {
  final Map<String, dynamic> nextShift;
  final VoidCallback onShiftStarted;
  const StartShiftScreen({Key? key, required this.nextShift, required this.onShiftStarted}) : super(key: key);

  @override
  _StartShiftScreenState createState() => _StartShiftScreenState();
}

class _StartShiftScreenState extends State<StartShiftScreen> {
  String selectedBagType = 'Standard box';
  bool agreeToPrivacyPolicy = false;
  bool availableForExtension = false;
  String? vehicleType;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchRiderData();
  }

  Future<void> fetchRiderData() async {
    setState(() {
      isLoading = true;
    });

    try {
      final riderId = await secureStorage.readUserId();
      if (riderId == null) {
        throw Exception('User ID not found in secure storage');
      }

      const String baseUrl = 'http://localhost:4000';
      final response = await http.get(
        Uri.parse('$baseUrl/api/public/rider/$riderId/vehicle-type'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          vehicleType = _formatVehicleType(data['vehicleType']);
          isLoading = false;
        });
      } else {
        setState(() {
          vehicleType = 'Unknown';
          isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not load vehicle information'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        vehicleType = 'Unknown';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load vehicle information: $e'), backgroundColor: Colors.red),
      );
    }
  }

  String _formatVehicleType(String? type) {
    if (type == null || type.isEmpty) return 'Unknown';
    return type[0].toUpperCase() + type.substring(1);
  }

  IconData _getVehicleIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'motorcycle':
        return Icons.motorcycle;
      case 'bicycle':
        return Icons.pedal_bike;
      case 'car':
        return Icons.directions_car;
      case 'van':
        return Icons.airport_shuttle;
      default:
        return Icons.help_outline;
    }
  }

 void _handleStartShift() {
  print("StartShiftScreen: Starting shift with vehicle: $vehicleType, bag: $selectedBagType, shift: ${widget.nextShift}");

  final shiftProvider = Provider.of<ShiftProvider>(context, listen: false);
  print("StartShiftScreen: Using ShiftProvider instance: $shiftProvider");
  shiftProvider.startShift(widget.nextShift, vehicleType ?? 'Unknown', selectedBagType);
  print("StartShiftScreen: After startShift, isShiftActive: ${shiftProvider.isShiftActive}");

  widget.onShiftStarted();
  Navigator.of(context).pop();
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Start Shift'),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
          ),
        ],
        automaticallyImplyLeading: false,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.yellowbg))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Vehicle Type', style: TextStyle(color: Colors.grey[700])),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.yellowbg.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.yellowbg, width: 2),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _getVehicleIcon(vehicleType),
                          color: Colors.yellowbg,
                          size: 32,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          vehicleType ?? 'Unknown',
                          style: const TextStyle(
                            color: Colors.yellowbg,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 16),
                  Text('Bag Type', style: TextStyle(color: Colors.grey[700])),
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildBagOption('Standard box', Icons.work),
                        const SizedBox(width: 10),
                        _buildBagOption('Large box', Icons.cases),
                        const SizedBox(width: 10),
                        _buildBagOption('Backpack', Icons.backpack),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Checkbox(
                        value: agreeToPrivacyPolicy,
                        onChanged: (value) {
                          setState(() {
                            agreeToPrivacyPolicy = value!;
                          });
                        },
                        activeColor: Colors.yellowbg,
                      ),
                      const Expanded(child: Text('I agree to the Privacy Policy')),
                      const Icon(Icons.launch, size: 16, color: Colors.yellowbg),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('I am available to extend my shift'),
                      Switch(
                        value: availableForExtension,
                        onChanged: (value) {
                          setState(() {
                            availableForExtension = value;
                          });
                        },
                        activeColor: Colors.yellowbg,
                      ),
                    ],
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: agreeToPrivacyPolicy ? _handleStartShift : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.yellowbg,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Start',
                      style: TextStyle(fontSize: 16, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
    );
  }

  Widget _buildBagOption(String type, IconData icon) {
    final isSelected = selectedBagType == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedBagType = type;
        });
      },
      child: Container(
        width: 100,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.yellowbg.withOpacity(0.1) : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
          border: isSelected ? Border.all(color: Colors.yellowbg, width: 2) : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? Colors.yellowbg : Colors.grey[700], size: 32),
            const SizedBox(height: 8),
            Text(type, style: TextStyle(color: isSelected ? Colors.yellowbg : Colors.grey[700])),
          ],
        ),
      ),
    );
  }
}

class ShiftProvider with ChangeNotifier {
  static final ShiftProvider _instance = ShiftProvider._internal();
  factory ShiftProvider() => _instance;
  ShiftProvider._internal();

  bool _isShiftActive = false;
  Map<String, dynamic>? _activeShift;
  String _vehicleType = '';
  String _bagType = '';
  bool _isAvailableForExtension = false;

  bool get isShiftActive => _isShiftActive;
  Map<String, dynamic>? get activeShift => _activeShift;
  String get vehicleType => _vehicleType;
  String get bagType => _bagType;
  bool get isAvailableForExtension => _isAvailableForExtension;

  void startShift(Map<String, dynamic> shift, String vehicle, String bag) {
    print("ShiftProvider: Starting shift with data: $shift");
    _isShiftActive = true;
    _activeShift = Map<String, dynamic>.from(shift);
    _vehicleType = vehicle;
    _bagType = bag;
    _isAvailableForExtension = false;

    print("ShiftProvider: isShiftActive set to $_isShiftActive");
    print("ShiftProvider: activeShift set to $_activeShift");
    notifyListeners();

    _updateOnlineStatus(true);

    Future.delayed(const Duration(milliseconds: 100), () {
      print("ShiftProvider: Forcing additional notification");
      notifyListeners();
    });
  }

  void endShift() {
    print("ShiftProvider: Ending shift");
    _isShiftActive = false;
    _activeShift = null;
    _isAvailableForExtension = false;
    notifyListeners();
    _updateOnlineStatus(false);
  }
  
  void setAvailabilityForExtension(bool isAvailable) {
    _isAvailableForExtension = isAvailable;
    notifyListeners();
    
    _updateExtensionAvailability(isAvailable);
  }
  
  Future<void> _updateOnlineStatus(bool isOnline) async {
    try {
      final riderId = await secureStorage.readUserId();
      
      if (riderId == null) {
        throw Exception('User ID not found in secure storage');
      }
      const String baseUrl = 'http://localhost:4000';
      
      final response = await http.put(
        Uri.parse('$baseUrl/api/rider/$riderId/online-status'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'isOnline': isOnline,
        }),
      );
      
      if (response.statusCode != 200) {
        print('Failed to update online status: ${response.statusCode}');
        print('Response body: ${response.body}');
      }
    } catch (e) {
      print('Error updating online status: $e');
    }
  }

  Future<void> _updateExtensionAvailability(bool isAvailable) async {
    try {
      final riderId = await secureStorage.readUserId();
      
      if (riderId == null) {
        throw Exception('User ID not found in secure storage');
      }
      
      const String baseUrl = 'http://localhost:4000';
      
      final response = await http.put(
        Uri.parse('$baseUrl/api/rider/$riderId/extension-availability'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'isAvailableForExtension': isAvailable,
        }),
      );
      
      if (response.statusCode != 200) {
        print('Failed to update extension availability: ${response.statusCode}');
        print('Response body: ${response.body}');
      }
    } catch (e) {
      print('Error updating extension availability: $e');
    }
  }
}

class DeliveriesScreen extends StatefulWidget {
  @override
  _DeliveriesScreenState createState() => _DeliveriesScreenState();
}

class _DeliveriesScreenState extends State<DeliveriesScreen> {
  List<OrdersResponse> pendingOrders = [];
  bool isLoading = true;
  String? riderId;

  @override
  void initState() {
    super.initState();
    _loadRiderInfo();
  }

  Future<void> _loadRiderInfo() async {
    try {
      final riderId = await secureStorage.readUserId();

      
      if (riderId != null) {
        await fetchPendingOrders();
      }
    } catch (e) {
      print('Error loading rider info: $e');
    }
  }

  Future<void> fetchPendingOrders() async {
  setState(() {
    isLoading = true;
  });

  try {
    // Fetch orders with status "CART_PROCESSING"
    final response = await http.get(
      Uri.parse('http://localhost:4000/api/get-orders-by-status/Cart%20Processing'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      
      final responseData = json.decode(response.body);
      print('API Response: $responseData'); // Debug log
      final ordersResponse = OrdersByStatusResponse.fromJson(json.decode(response.body));
      
      if (ordersResponse.resp) {
        // Filter orders that haven't been assigned to any rider yet
        final unassignedOrders = ordersResponse.ordersResponse
            .where((order) => order.riderId.isEmpty)
            .toList();
        
        // For each order, fetch product and seller information
        final List<OrdersResponse> enrichedOrders = [];
        for (final order in unassignedOrders) {
          try {
            // Fetch product and seller details
            final detailsResponse = await http.get(
              Uri.parse('http://localhost:4000/api/get-details-order-by-id/${order.transactionId}'),
              headers: {'Content-Type': 'application/json'},
            );
            
            if (detailsResponse.statusCode == 200) {
              final detailsData = json.decode(detailsResponse.body);
              if (detailsData is List && detailsData.isNotEmpty) {
                final productDetails = detailsData[0];
                
                // If sellerId is available in the details, fetch seller information
                if (productDetails['sellerId'] != null) {
                  final sellerResponse = await http.get(
                    Uri.parse('http://localhost:4000/api/seller/${productDetails['sellerId']}'),
                    headers: {'Content-Type': 'application/json'},
                  );
                  
                  if (sellerResponse.statusCode == 200) {
                    final sellerData = json.decode(sellerResponse.body);
                    
                    // Create a new order with seller information
                    final enrichedOrder = OrdersResponse(
                      id: order.id,
                      date: order.date,
                      name: order.name,
                      contact: order.contact,
                      item: order.item,
                      quantity: order.quantity,
                      amount: order.amount,
                      address: order.address,
                      transactionId: order.transactionId,
                      status: order.status,
                      userId: order.userId,
                      riderId: order.riderId,
                      markupValue: order.markupValue,
                      deliveryFee: order.deliveryFee,
                      deliveryComm: order.deliveryComm,
                      sellerName: sellerData['name'] ?? '',
                      shopName: sellerData['shopName'] ?? '',
                      businessLocation: sellerData['businessLocation'] ?? '',
                      sellerPhone: sellerData['phone'] ?? '',
                    );
                    
                    enrichedOrders.add(enrichedOrder);
                  } else {
                    enrichedOrders.add(order);
                  }
                } else {
                  enrichedOrders.add(order);
                }
              } else {
                enrichedOrders.add(order);
              }
            } else {
              enrichedOrders.add(order);
            }
          } catch (e) {
            print('Error fetching details for order ${order.id}: $e');
            enrichedOrders.add(order);
          }
        }
        
        setState(() {
          pendingOrders = enrichedOrders;
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
        print('API Error: ${ordersResponse.msg}');
      }
    } else {
      setState(() {
        isLoading = false;
      });
      print('Failed to load pending orders: ${response.statusCode}');
    }
  } catch (e) {
    setState(() {
      isLoading = false;
    });
    print('Error fetching pending orders: $e');
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Deliveries'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: fetchPendingOrders,
          )
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : pendingOrders.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.delivery_dining, size: 80, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        'No pending orders available',
                        style: TextStyle(fontSize: 18, color: Colors.grey),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: pendingOrders.length,
                  itemBuilder: (context, index) {
                    return NewOrderCard(
                      order: pendingOrders[index],
                      onAccept: () => _acceptOrder(pendingOrders[index].id),
                      onDecline: () => _declineOrder(pendingOrders[index].id),
                    );
                  },
                ),
    );
  }

  Future<void> _acceptOrder(String orderId) async {
    try {
      final response = await http.patch(
        Uri.parse('http://localhost:4000/api/orders/assign-rider'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'orderId': orderId,
          'riderId': riderId,
        }),
      );

      if (response.statusCode == 200) {
        // Order accepted successfully
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order accepted!')),
        );
        await fetchPendingOrders(); // Refresh the orders list
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to accept order. Please try again.')),
        );
      }
    } catch (e) {
      print('Error accepting order: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('An error occurred. Please try again.')),
      );
    }
  }

  Future<void> _declineOrder(String orderId) async {
    // Remove the order from local list only, since declining just means the rider won't take it
    setState(() {
      pendingOrders.removeWhere((order) => order.id == orderId);
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Order declined')),
    );
  }
}
class NewOrderCard extends StatelessWidget {
  final OrdersResponse order;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const NewOrderCard({
    Key? key,
    required this.order,
    required this.onAccept,
    required this.onDecline,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('MMM d, yyyy');
    String formattedDate = '';
    
    try {
      final DateTime date = DateTime.parse(order.date);
      formattedDate = formatter.format(date);
    } catch (e) {
      formattedDate = order.date;
    }
    
    // For demonstration, we'll use fixed locations based on address
    // In a real application, you would get actual coordinates from your backend
    const LatLng pickupLocation = LatLng(14.5995, 120.9842); // Example location
    const LatLng dropoffLocation = LatLng(14.6091, 120.9976); // Example location
    
    // Get seller information or use a default value
    final String shopDisplay = order.shopName.isNotEmpty 
        ? order.shopName 
        : "Shop information not available";
    
    final String locationDisplay = order.businessLocation.isNotEmpty
        ? order.businessLocation
        : "Location not available";
    
    return Card(
      margin: const EdgeInsets.all(12),
      elevation: 3,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'New Order',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: onDecline,
                  child: const Text(
                    'Decline',
                    style: TextStyle(
                      color: Colors.pink,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            height: 150,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: GoogleMap(
                initialCameraPosition: CameraPosition(
                  target: LatLng(
                    (pickupLocation.latitude + dropoffLocation.latitude) / 2,
                    (pickupLocation.longitude + dropoffLocation.longitude) / 2,
                  ),
                  zoom: 13.0,
                ),
                markers: {
                  Marker(
                    markerId: const MarkerId('pickup'),
                    position: pickupLocation,
                    infoWindow: const InfoWindow(title: 'Pickup'),
                    icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
                  ),
                  Marker(
                    markerId: const MarkerId('dropoff'),
                    position: dropoffLocation,
                    infoWindow: const InfoWindow(title: 'Drop-off'),
                    icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
                  ),
                },
                myLocationEnabled: false,
                zoomControlsEnabled: false,
                mapToolbarEnabled: false,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Delivery Details',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.store, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Pickup', style: TextStyle(color: Colors.grey)),
                          Text(shopDisplay),
                          if (order.businessLocation.isNotEmpty)
                            Text(
                              locationDisplay,
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                        ],
                      ),
                    ),
                    const Text('1 min'),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Drop-off', style: TextStyle(color: Colors.grey)),
                          Text(order.address),
                        ],
                      ),
                    ),
                    const Text('7 mins'),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  height: 1,
                  color: Colors.grey.shade300,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'You will earn ',
                        style: TextStyle(fontSize: 16),
                      ),
                      Text(
                        '₱ ${order.deliveryComm} ',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text(
                      'Accept Order',
                      style: TextStyle(fontSize: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                // Order details summary
                ExpansionTile(
                  title: const Text('Order Summary'),
                  children: [
                    ListTile(
                      title: const Text('Customer'),
                      subtitle: Text(order.name),
                      leading: const Icon(Icons.person),
                    ),
                    ListTile(
                      title: const Text('Contact'),
                      subtitle: Text(order.contact),
                      leading: const Icon(Icons.phone),
                    ),
                    if (order.sellerName.isNotEmpty)
                      ListTile(
                        title: const Text('Seller'),
                        subtitle: Text(order.sellerName),
                        leading: const Icon(Icons.business),
                      ),
                    if (order.sellerPhone.isNotEmpty)
                      ListTile(
                        title: const Text('Seller Contact'),
                        subtitle: Text(order.sellerPhone),
                        leading: const Icon(Icons.phone),
                      ),
                    ListTile(
                      title: const Text('Item'),
                      subtitle: Text(order.item),
                      leading: const Icon(Icons.shopping_bag),
                    ),
                    ListTile(
                      title: const Text('Quantity'),
                      subtitle: Text('${order.quantity}'),
                      leading: const Icon(Icons.format_list_numbered),
                    ),
                    ListTile(
                      title: const Text('Amount'),
                      subtitle: Text('₱${order.amount.toStringAsFixed(2)}'),
                      leading: const Icon(Icons.attach_money),
                    ),
                    ListTile(
                      title: const Text('Delivery Fee'),
                      subtitle: Text('₱${order.deliveryFee.toStringAsFixed(2)}'),
                      leading: const Icon(Icons.delivery_dining),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


class MapScreen extends StatefulWidget {
  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _controller;
  Set<Polygon> _polygons = {};
  Set<Marker> _markers = {};
  bool _isLoading = true;
  bool _mapInitialized = false;
  String? _currentMunicipality;
  
  // Location data
  geo.Position? _currentPosition;
  StreamSubscription<geo.Position>? _positionStreamSubscription;
  
  @override
  void initState() {
    super.initState();
    // Slight delay to ensure widgets are properly initialized before accessing location
    Future.delayed(const Duration(milliseconds: 300), () {
      _initializeLocation();
    });
  }
  
  @override
  void dispose() {
    // Make sure to cancel subscription before disposing
    if (_positionStreamSubscription != null) {
      _positionStreamSubscription!.cancel();
      _positionStreamSubscription = null;
    }
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _initializeLocation() async {
    try {
      setState(() {
        _isLoading = true;
      });
      
      // Check if location is available
      bool serviceEnabled = await geo.Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (!kIsWeb) {
          serviceEnabled = await geo.Geolocator.openLocationSettings();
        }
        if (!serviceEnabled) {
          throw 'Location services are disabled';
        }
      }
      
      // Check permissions
      geo.LocationPermission permission = await geo.Geolocator.checkPermission();
      if (permission == geo.LocationPermission.denied) {
        permission = await geo.Geolocator.requestPermission();
        if (permission == geo.LocationPermission.denied) {
          throw 'Location permissions are denied';
        }
      }
      
      if (permission == geo.LocationPermission.deniedForever) {
        throw 'Location permissions are permanently denied';
      }
      
      // Increase timeout period and use last known position as fallback
      try {
        _currentPosition = await geo.Geolocator.getCurrentPosition(
          desiredAccuracy: geo.LocationAccuracy.high
        ).timeout(const Duration(seconds: 20), onTimeout: () async {
          // Fallback to last known position if current position times out
          final lastPosition = await geo.Geolocator.getLastKnownPosition();
          if (lastPosition != null) {
            return lastPosition;
          }
          throw 'Location request timed out and no last known position available';
        });
      } catch (e) {
        print('Error getting current position: $e');
        // Try with lower accuracy if high accuracy fails
        _currentPosition = await geo.Geolocator.getCurrentPosition(
          desiredAccuracy: geo.LocationAccuracy.low
        ).timeout(const Duration(seconds: 10));
      }
      
      // Set up location stream ONLY if we successfully got the initial position
      if (_currentPosition != null) {
        // Make sure we don't have an active subscription before creating a new one
        if (_positionStreamSubscription != null) {
          await _positionStreamSubscription!.cancel();
          _positionStreamSubscription = null;
        }
      
        const locationSettings = geo.LocationSettings(
          accuracy: geo.LocationAccuracy.high,
          distanceFilter: 10,
        );
        
        _positionStreamSubscription = geo.Geolocator.getPositionStream(
          locationSettings: locationSettings
        ).listen(
          (geo.Position position) {
            if (mounted) {
              setState(() {
                _currentPosition = position;
                _updateMarkerPosition();
                
                // Avoid camera movement if map isn't initialized yet
                if (_controller != null && _mapInitialized) {
                  _controller!.animateCamera(
                    CameraUpdate.newCameraPosition(
                      CameraPosition(
                        target: LatLng(position.latitude, position.longitude),
                        zoom: 14,
                      ),
                    ),
                  );
                }
              });
              
              _determineMunicipalityName(position.latitude, position.longitude);
            }
          },
          onError: (e) {
            print('Position stream error: $e');
          },
          cancelOnError: false, // Don't cancel on error, just log it
        );
      }
      
      // Process current location
      await _processCurrLocation();
      
    } catch (e) {
      print('Error initializing location: $e');
      _handleLocationError();
    }
  }
  
  Future<void> _processCurrLocation() async {
    if (_currentPosition == null) {
      _handleLocationError();
      return;
    }
    
    try {
      // Get municipality name
      await _determineMunicipalityName(_currentPosition!.latitude, _currentPosition!.longitude);
      
      // Add marker for rider's position
      _updateMarkerPosition();
      
      // Add municipality boundary
      _fetchMunicipalityBoundary();
      
      if (mounted) {
        setState(() {
          _isLoading = false;
          _mapInitialized = true;
        });
      }
    } catch (e) {
      print('Error processing location: $e');
      _handleLocationError();
    }
  }
  
  void _updateMarkerPosition() {
    if (_currentPosition == null || !mounted) return;
    
    setState(() {
      _markers.clear();
      _markers.add(
        Marker(
          markerId: const MarkerId('rider'),
          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          infoWindow: const InfoWindow(title: 'Your Current Location'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        )
      );
    });
  }
  
  // Use geocoding package to determine municipality name
  Future<void> _determineMunicipalityName(double latitude, double longitude) async {
    try {
      if (kIsWeb) {
        // For web, try to use a free geocoding API service
        final response = await http.get(
          Uri.parse('https://nominatim.openstreetmap.org/reverse?format=json&lat=$latitude&lon=$longitude&zoom=10')
        ).timeout(const Duration(seconds: 5));
        
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          String? municipality;
          
          // Try to find the most appropriate administrative unit
          if (data['address'] != null) {
            municipality = data['address']['city'] ?? 
                          data['address']['town'] ?? 
                          data['address']['village'] ?? 
                          data['address']['municipality'] ??
                          data['address']['county'];
          }
          
          if (mounted) {
            setState(() {
              _currentMunicipality = municipality ?? 
                "Area ${latitude.toStringAsFixed(2)}, ${longitude.toStringAsFixed(2)}";
            });
          }
        } else {
          throw Exception('Failed to get municipality name from API');
        }
      } else {
        // For mobile, use geocoding package
        try {
          List<geocoding.Placemark> placemarks = 
              await geocoding.placemarkFromCoordinates(latitude, longitude);
          
          if (placemarks.isNotEmpty) {
            geocoding.Placemark place = placemarks.first;
            String municipalityName = place.locality ?? 
                                      place.subAdministrativeArea ?? 
                                      place.administrativeArea ?? 
                                      "Unknown";
            
            if (mounted) {
              setState(() {
                _currentMunicipality = municipalityName;
              });
            }
          }
        } catch (e) {
          print('Geocoding error: $e');
          // Fallback to coordinate-based name
          if (mounted) {
            setState(() {
              _currentMunicipality = "Area ${latitude.toStringAsFixed(2)}, ${longitude.toStringAsFixed(2)}";
            });
          }
        }
      }
    } catch (e) {
      print('Error determining municipality: $e');
      if (mounted) {
        setState(() {
          _currentMunicipality = "Unknown Municipality";
        });
      }
    }
  }
  
  void _fetchMunicipalityBoundary() {
    try {
      if (_currentPosition == null) {
        _handleLocationError();
        return;
      }
      
      // Clear existing polygons
      if (mounted) {
        setState(() {
          _polygons.clear();
        });
      }
      
      // Define a fixed radius for simplicity
      double municipalityRadiusKm = 3.0;
      
      List<LatLng> boundaryPoints = _generateCircularBoundary(
        _currentPosition!.latitude, 
        _currentPosition!.longitude,
        municipalityRadiusKm,
        32 // More points for smoother circle
      );
      
      if (mounted) {
        setState(() {
          _polygons.add(
            Polygon(
              polygonId: const PolygonId('municipality_boundary'),
              points: boundaryPoints,
              fillColor: Colors.blue.withOpacity(0.3),
              strokeColor: Colors.blue,
              strokeWidth: 2,
            )
          );
        });
      }
    } catch (e) {
      print('Error fetching municipality boundary: $e');
      _addDefaultBoundary();
    }
  }
  
  void _addDefaultBoundary() {
    if (_currentPosition == null) {
      // If we don't have location, use default Philippines coordinates
      LatLng defaultPosition = const LatLng(15.4875, 121.1053);
      _addBoundaryFromCenter(defaultPosition, 3.0);
    } else {
      // Use current location with a default radius
      _addBoundaryFromCenter(
        LatLng(_currentPosition!.latitude, _currentPosition!.longitude), 
        3.0
      );
    }
  }
  
  void _addBoundaryFromCenter(LatLng center, double radiusKm) {
    List<LatLng> boundaryPoints = _generateCircularBoundary(
      center.latitude,
      center.longitude,
      radiusKm,
      32
    );
    
    if (mounted) {
      setState(() {
        _polygons.clear();
        _polygons.add(
          Polygon(
            polygonId: const PolygonId('default_boundary'),
            points: boundaryPoints,
            fillColor: Colors.blue.withOpacity(0.3),
            strokeColor: Colors.blue,
            strokeWidth: 2,
          )
        );
      });
    }
  }
  
  void _handleLocationError() {
    if (!mounted) return;
    
    setState(() {
      _isLoading = false;
      _mapInitialized = true;
      
      // Fallback to default position
      const LatLng defaultPosition = LatLng(15.4875, 121.1053); // Philippines
      
      // Clear markers and add default marker
      _markers.clear();
      _markers.add(
        Marker(
          markerId: const MarkerId('default'),
          position: defaultPosition,
          infoWindow: const InfoWindow(title: 'Default Location')
        )
      );
      
      // Add default boundary
      _addBoundaryFromCenter(defaultPosition, 3.0);
      
      _currentMunicipality = "Unknown Municipality";
    });
  }
  
  // Utility function to generate circular boundary points
  List<LatLng> _generateCircularBoundary(
    double centerLat, 
    double centerLng, 
    double radiusKm, 
    int numPoints
  ) {
    List<LatLng> points = [];
    
    // Earth's radius in kilometers
    const double earthRadius = 6371.0;
    
    // Convert radius from kilometers to radians
    double radiusRadians = radiusKm / earthRadius;
    
    for (int i = 0; i < numPoints; i++) {
      double angle = 2 * pi * i / numPoints;
      
      // Calculate point coordinates on the circle
      double latRadians = asin(sin(centerLat * pi / 180) * cos(radiusRadians) +
          cos(centerLat * pi / 180) * sin(radiusRadians) * cos(angle));
          
      double lngRadians = centerLng * pi / 180 + atan2(
          sin(angle) * sin(radiusRadians) * cos(centerLat * pi / 180),
          cos(radiusRadians) - sin(centerLat * pi / 180) * sin(latRadians));
      
      // Convert back to degrees
      double lat = latRadians * 180 / pi;
      double lng = lngRadians * 180 / pi;
      
      points.add(LatLng(lat, lng));
    }
    
    return points;
  }
  
  void _refreshLocation() {
    // Cancel existing subscription before refreshing
    if (_positionStreamSubscription != null) {
      _positionStreamSubscription!.cancel();
      _positionStreamSubscription = null;
    }
    
    if (mounted) {
      setState(() {
        _polygons.clear();
        _markers.clear();
        _isLoading = true;
      });
    }
    
    _initializeLocation();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rider Map'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: _isLoading 
                  ? const Center(child: CircularProgressIndicator()) 
                  : GoogleMap(
                      initialCameraPosition: CameraPosition(
                        target: _currentPosition != null
                            ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                            : const LatLng(15.4875, 121.1053), // Default Philippines
                        zoom: 14,
                      ),
                      markers: _markers,
                      polygons: _polygons,
                      myLocationEnabled: !kIsWeb, // This doesn't work well on web
                      myLocationButtonEnabled: !kIsWeb, // This doesn't work well on web
                      onMapCreated: (GoogleMapController controller) {
                        setState(() {
                          _controller = controller;
                        });
                        
                        // Move camera to current location if available
                        if (_currentPosition != null) {
                          controller.animateCamera(
                            CameraUpdate.newCameraPosition(
                              CameraPosition(
                                target: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                                zoom: 14,
                              ),
                            ),
                          );
                        }
                      },
                    ),
              ),
              Container(
                padding: const EdgeInsets.all(12),
                color: Colors.blue.shade100,
                width: double.infinity,
                child: Text(
                  'Delivery Area: ${_currentMunicipality ?? "Loading..."}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
              ),
              /*if (kIsWeb)
                Container(
                  padding: EdgeInsets.all(8),
                  color: Colors.amber.shade100,
                  width: double.infinity,
                  child: Text(
                    'Running in web mode',
                    style: TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),*/
            ],
          ),
          if (!_isLoading && _currentPosition == null)
            Positioned(
              top: 20,
              left: 0,
              right: 0,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red),
                ),
                child: const Text(
                  'Location access is required. Please enable location services and try again.',
                  style: TextStyle(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _refreshLocation,
        child: const Icon(Icons.my_location),
        backgroundColor: Colors.yellowbg,
      ),
    );
  }
}

class HistoryScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('History Screen'));
  }
}

class WalletScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Wallet Screen'));
  }
}