import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/profile/edit_Prodile_screen.dart';
import 'package:restaurant/presentation/screens/profile/change_password_screen.dart';
import 'package:restaurant/presentation/screens/home/select_role_screen.dart';
import 'package:restaurant/presentation/screens/delivery/list_orders_delivery_screen.dart';
import 'package:restaurant/presentation/screens/delivery/order_on_way_screen.dart';
import 'package:restaurant/presentation/screens/delivery/order_delivered_screen.dart';
import 'package:restaurant/presentation/screens/intro/checking_login_screen.dart';

class MainDeliveryLayout extends StatefulWidget {
  @override
  State<MainDeliveryLayout> createState() => _MainDeliveryLayoutState();
}

class _MainDeliveryLayoutState extends State<MainDeliveryLayout> {
  int _currentIndex = 0;
  String _statusKey = UniqueKey().toString();

  List<Widget> get _screens => [
        StatusScreen(),
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
              icon: Icon(Icons.notifications_outlined, color: Colors.yellowbg),
              onPressed: () {},
            ),
          ],
        ),
        drawer: Drawer(
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
          items: [
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

// Create a modified version of your DeliveryHomeScreen that works as a drawer
class DeliveryHomeScreenAsDrawer extends StatelessWidget {
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
              // Fallback UI when not in SuccessAuthState or user is null
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
          ItemAccount(
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
          ItemAccount(
            text: 'Privacy & Policy',
            icon: Icons.policy_rounded,
            colorIcon: 0xff6dbd63,
          ),
          ItemAccount(
            text: 'Security',
            icon: Icons.lock_outline_rounded,
            colorIcon: 0xff1F252C,
          ),
          ItemAccount(
            text: 'Term & Conditions',
            icon: Icons.description_outlined,
            colorIcon: 0xff458bff,
          ),
          ItemAccount(
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
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
              SizedBox(height: 20),
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
        Text(
          'Current Shift',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 12),
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
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          Text(_getMonth(activeShift['date']),
                              style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                          Text(activeShift['date'].day.toString(),
                              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                          Text(isToday ? 'Today' : _getWeekday(activeShift['date']),
                              style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ],
                      ),
                    ),
                    SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${activeShift['startTime']} - ${activeShift['endTime']} (${activeShift['hours']}h)',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 4),
                        Row(
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
                SizedBox(height: 12),
                Divider(),
                SizedBox(height: 8),
                Text('Settings', style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
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
                SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    shiftProvider.endShift();
                    final mainDeliveryLayoutState =
                        context.findAncestorStateOfType<_MainDeliveryLayoutState>();
                    mainDeliveryLayoutState?.updateStatusKey();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.yellowbg,
                    minimumSize: Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
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
        Row(
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
        SizedBox(height: 16),
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
                      padding: EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          Text(_getMonth(nextShift['date']),
                              style: TextStyle(color: Colors.grey[600])),
                          Text(nextShift['date'].day.toString(),
                              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          Text(_getWeekday(nextShift['date']),
                              style: TextStyle(color: Colors.grey[600])),
                        ],
                      ),
                    ),
                    SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${nextShift['startTime']} - ${nextShift['endTime']} (${nextShift['hours']}h)',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Starting in ${formatTimeRemaining(nextShift['minutesUntilStart'])}',
                          style: TextStyle(color: Colors.green, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Text('Are you ready?'),
                SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    // Pass the callback to StartShiftScreen
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StartShiftScreen(
                          nextShift: nextShift,
                          onShiftStarted: () {
                            // Find MainDeliveryLayoutState and call updateStatusKey
                            final mainDeliveryLayoutState = context.findAncestorStateOfType<_MainDeliveryLayoutState>();
                            mainDeliveryLayoutState?.updateStatusKey();
                          },
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.yellowbg,
                    minimumSize: Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
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

  
  // Logic to determine the next shift based on current time
  Map<String, dynamic> getNextShift(DateTime now) {
  // Define shift times
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
    // Non-working hours (2AM - 6AM) are implicitly covered as not being in any shift
  ];
  
  // Get the current hour and minute
  final int currentHour = now.hour;
  final int currentMinute = now.minute;
  
  // Determine if we're currently in a shift
  bool isWorkingNow = false;
  String currentShiftName = '';
  
  // Check if we're in a shift now
  for (var shift in shifts) {
    final startHour = shift['startHour'];
    final endHour = shift['endHour'];
    
    // Special case for the 4th shift which spans across midnight
    if (shift['name'] == '4th shift') {
      if ((currentHour >= startHour) || (currentHour < endHour)) {
        isWorkingNow = true;
        currentShiftName = shift['name'];
        break;
      }
    } 
    // Regular case for other shifts
    else if (currentHour >= startHour && currentHour < endHour) {
      isWorkingNow = true;
      currentShiftName = shift['name'];
      break;
    }
  }
  
  // Set default next shift
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
  
  // Find the next shift
  
  // If it's after 9PM and before 2AM (4th shift), the next shift is 1st shift the next day
  if (currentHour >= 21 || currentHour < 2) {
    // If we're in 4th shift
    if (currentHour >= 21) {
      // Next shift is 1st shift the next day
      shiftDate = DateTime(now.year, now.month, now.day + 1);
    } else {
      // We're after midnight but before 2AM, still in 4th shift
      // Next shift is 1st shift the same day
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
  // If it's after 2AM and before 7AM (non-working hours), next shift is 1st shift
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
  // If it's after 7AM and before 11AM (1st shift), next shift is 2nd shift
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
  // If it's after 11AM and before 4PM (2nd shift), next shift is 3rd shift
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
  // If it's after 4PM and before 9PM (3rd shift), next shift is 4th shift
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
  
  // Calculate minutes until next shift starts
  DateTime nextShiftStartTime = DateTime(
    shiftDate.year,
    shiftDate.month,
    shiftDate.day,
    nextShift['startHour'],
    nextShift['startMinute']
  );
  
  int minutesUntilStart = nextShiftStartTime.difference(now).inMinutes;
  
  // Handle negative minutes (if nextShiftStartTime is before now)
  if (minutesUntilStart < 0) {
    // We might need to add a day in some edge cases
    nextShiftStartTime = DateTime(
      shiftDate.year,
      shiftDate.month,
      shiftDate.day + 1,
      nextShift['startHour'],
      nextShift['startMinute']
    );
    minutesUntilStart = nextShiftStartTime.difference(now).inMinutes;
  }
  
  // Format times for display
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
          SnackBar(content: Text('Could not load vehicle information'), backgroundColor: Colors.red),
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
        title: Text('Start Shift'),
        actions: [
          IconButton(
            icon: Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
          ),
        ],
        automaticallyImplyLeading: false,
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: Colors.yellowbg))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Vehicle Type', style: TextStyle(color: Colors.grey[700])),
                  SizedBox(height: 8),
                  Container(
                    padding: EdgeInsets.all(16),
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
                        SizedBox(width: 12),
                        Text(
                          vehicleType ?? 'Unknown',
                          style: TextStyle(
                            color: Colors.yellowbg,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 16),
                  Divider(),
                  SizedBox(height: 16),
                  Text('Bag Type', style: TextStyle(color: Colors.grey[700])),
                  SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildBagOption('Standard box', Icons.work),
                        SizedBox(width: 10),
                        _buildBagOption('Large box', Icons.cases),
                        SizedBox(width: 10),
                        _buildBagOption('Backpack', Icons.backpack),
                      ],
                    ),
                  ),
                  SizedBox(height: 16),
                  Divider(),
                  SizedBox(height: 16),
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
                      Expanded(child: Text('I agree to the Privacy Policy')),
                      Icon(Icons.launch, size: 16, color: Colors.yellowbg),
                    ],
                  ),
                  SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('I am available to extend my shift'),
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
                  Spacer(),
                  ElevatedButton(
                    onPressed: agreeToPrivacyPolicy ? _handleStartShift : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.yellowbg,
                      minimumSize: Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Start',
                      style: TextStyle(fontSize: 16, color: Colors.white),
                    ),
                  ),
                  SizedBox(height: 16),
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
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.yellowbg.withOpacity(0.1) : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
          border: isSelected ? Border.all(color: Colors.yellowbg, width: 2) : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? Colors.yellowbg : Colors.grey[700], size: 32),
            SizedBox(height: 8),
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

    Future.delayed(Duration(milliseconds: 100), () {
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
    
    // You can also update this preference in your backend if needed
    _updateExtensionAvailability(isAvailable);
  }
  
  // Function to update online status in backend
  Future<void> _updateOnlineStatus(bool isOnline) async {
    try {
      // Get rider ID from secure storage
      final riderId = await secureStorage.readUserId();
      
      if (riderId == null) {
        throw Exception('User ID not found in secure storage');
      }
      
      // Base URL of your API
      const String baseUrl = 'http://localhost:4000';
      
      // Make the API request to update online status
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
  
  // New function to update extension availability
  Future<void> _updateExtensionAvailability(bool isAvailable) async {
    try {
      // Get rider ID from secure storage
      final riderId = await secureStorage.readUserId();
      
      if (riderId == null) {
        throw Exception('User ID not found in secure storage');
      }
      
      // Base URL of your API
      const String baseUrl = 'http://localhost:4000';
      
      // Make the API request to update extension availability
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

// Create placeholder screens for other tabs
class DeliveriesScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Deliveries Screen'));
  }
}

class MapScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Map Screen'));
  }
}

class HistoryScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('History Screen'));
  }
}

class WalletScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Wallet Screen'));
  }
}