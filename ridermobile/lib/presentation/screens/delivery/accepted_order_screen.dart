import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:restaurant/domain/models/response/orders_by_status_response.dart';
import 'package:restaurant/presentation/screens/delivery/main_screen.dart';

class AcceptedOrderPage extends StatefulWidget {
  final OrdersResponse order;

  const AcceptedOrderPage({
    Key? key,
    required this.order,
  }) : super(key: key);

  @override
  _AcceptedOrderPageState createState() => _AcceptedOrderPageState();
}

class _AcceptedOrderPageState extends State<AcceptedOrderPage> {
  LatLng? pickupLocation;
  LatLng? dropoffLocation;
  LatLng? currentRiderLocation;
  bool isLoading = true;
  GoogleMapController? mapController;
  Set<Marker> markers = {};
  Set<Polyline> polylines = {};
  Timer? _locationUpdateTimer;
  bool _arrivedAtVendor = false;
  bool _pickedUpOrder = false;
  bool _deliveredOrder = false;
  int _currentIndex = 1; // Default to Deliveries tab (index 1)
  bool _isFullScreenMap = false; // Track if map is in full screen mode
  bool _showingDirections = false; // Track if directions are being shown

  @override
  void initState() {
    super.initState();
    _initializeMapData();
    _locationUpdateTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _updateRiderLocation();
    });
    
    // Simulate current rider location near pickup
    _simulateRiderLocation();
  }

  void _simulateRiderLocation() {
    // This would ideally come from actual GPS data
    // For now, simulate a location slightly away from pickup
    Future.delayed(const Duration(seconds: 1), () {
      if (pickupLocation != null) {
        setState(() {
          currentRiderLocation = LatLng(
            pickupLocation!.latitude - 0.003,
            pickupLocation!.longitude - 0.002,
          );
          
          // Add rider marker
          if (currentRiderLocation != null) {
            markers.add(
              Marker(
                markerId: const MarkerId('rider'),
                position: currentRiderLocation!,
                infoWindow: const InfoWindow(title: 'You'),
                icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
              ),
            );
          }
        });
      }
    });
  }

  @override
  void dispose() {
    mapController?.dispose();
    _locationUpdateTimer?.cancel();
    super.dispose();
  }

  void _updateRiderLocation() {
    print('Updating rider location...');
    // In a real app, this would update with actual GPS coordinates
  }

  Future<LatLng?> getCoordinatesFromAddress(String address) async {
    try {
      final apiKey = 'AIzaSyCfeMqzu93-w0aWnBTs1TTU62_Od49c9iI';
      final encodedAddress = Uri.encodeComponent(address);
      final url = 'https://maps.googleapis.com/maps/api/geocode/json?address=$encodedAddress&key=$apiKey';
      
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['results'] != null && data['results'].isNotEmpty) {
          final location = data['results'][0]['geometry']['location'];
          return LatLng(location['lat'], location['lng']);
        }
      }
      print('Geocoding failed for address: $address. Status code: ${response.statusCode}');
      return null;
    } catch (e) {
      print('Error in geocoding: $e');
      return null;
    }
  }

  Future<List<LatLng>> getDirections(LatLng origin, LatLng destination) async {
    try {
      final apiKey = 'AIzaSyCfeMqzu93-w0aWnBTs1TTU62_Od49c9iI';
      final url = 'https://maps.googleapis.com/maps/api/directions/json?'
          'origin=${origin.latitude},${origin.longitude}'
          '&destination=${destination.latitude},${destination.longitude}'
          '&key=$apiKey';
      
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final points = _decodePolyline(data['routes'][0]['overview_polyline']['points']);
          return points;
        }
      }
      print('Directions API failed. Status code: ${response.statusCode}');
      // Return direct line as fallback
      return [origin, destination];
    } catch (e) {
      print('Error fetching directions: $e');
      // Return direct line as fallback
      return [origin, destination];
    }
  }

  List<LatLng> _decodePolyline(String encoded) {
    List<LatLng> points = [];
    int index = 0, len = encoded.length;
    int lat = 0, lng = 0;

    while (index < len) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng((lat / 1E5), (lng / 1E5)));
    }
    return points;
  }

  Future<void> _showBestRoute(bool isPickupMap) async {
  if (currentRiderLocation == null) return;
  
  // Determine destination based on map type
  final destination = isPickupMap ? pickupLocation! : dropoffLocation!;
  
  setState(() {
    _showingDirections = true;
  });
  
  try {
    // Get directions from rider's current location to destination
    final routePoints = await getDirections(currentRiderLocation!, destination);
    
    // Create a set of markers based on map type
    Set<Marker> routeMarkers = {};
    routeMarkers.add(
      Marker(
        markerId: const MarkerId('rider'),
        position: currentRiderLocation!,
        infoWindow: const InfoWindow(title: 'You'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ),
    );
    
    if (isPickupMap) {
      routeMarkers.add(
        Marker(
          markerId: const MarkerId('pickup'),
          position: pickupLocation!,
          infoWindow: InfoWindow(
            title: 'Pickup',
            snippet: widget.order.shopName.isNotEmpty ? widget.order.shopName : 'Shop',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        ),
      );
    } else {
      routeMarkers.add(markers.firstWhere((marker) => marker.markerId.value == 'pickup'));
      routeMarkers.add(markers.firstWhere((marker) => marker.markerId.value == 'dropoff'));
    }
    
    final polylineId = isPickupMap ? 'route_to_pickup' : 'route_to_dropoff';
    final polyline = Polyline(
      polylineId: PolylineId(polylineId),
      points: routePoints,
      color: Colors.blue,
      width: 5,
    );
    
    // Get the current page context
    final context = Navigator.of(this.context).context;
    
    // Close the current fullscreen dialog
    Navigator.pop(context);
    
    // Open a new fullscreen dialog with the route
    showDialog(
      context: this.context,
      builder: (context) => Dialog.fullscreen(
        child: Scaffold(
          appBar: AppBar(
            title: Text(isPickupMap ? 'Navigation to Seller' : 'Complete Route'),
            backgroundColor: Colors.yellowbg,
            foregroundColor: Colors.white,
            actions: [
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          body: GoogleMap(
            initialCameraPosition: CameraPosition(
              target: currentRiderLocation!,
              zoom: 14.0,
            ),
            markers: routeMarkers,
            polylines: {polyline},
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            zoomControlsEnabled: true,
            mapToolbarEnabled: true,
            onMapCreated: (GoogleMapController controller) {
              Future.delayed(Duration(milliseconds: 300), () {
                final bounds = _calculateBounds(routePoints);
                controller.animateCamera(
                  CameraUpdate.newLatLngBounds(bounds, 50),
                );
              });
            },
          ),
        ),
      ),
    );
    
  } catch (e) {
    print('Error showing best route: $e');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Failed to load directions. Please try again.')),
    );
  } finally {
    setState(() {
      _showingDirections = false;
    });
  }
}


  LatLngBounds _calculateBounds(List<LatLng> points) {
    double minLat = points[0].latitude;
    double maxLat = points[0].latitude;
    double minLng = points[0].longitude;
    double maxLng = points[0].longitude;

    for (LatLng point in points) {
      if (point.latitude < minLat) minLat = point.latitude;
      if (point.latitude > maxLat) maxLat = point.latitude;
      if (point.longitude < minLng) minLng = point.longitude;
      if (point.longitude > maxLng) maxLng = point.longitude;
    }

    return LatLngBounds(
      southwest: LatLng(minLat, minLng),
      northeast: LatLng(maxLat, maxLng),
    );
  }

  void _toggleFullScreenMap(bool isPickupMap) {
  // Set which locations to display based on which map was tapped
  Set<Marker> displayMarkers = {};
  LatLng centerPosition;
  String mapTitle;

  if (isPickupMap) {
    // For seller/pickup map, only show seller location and rider location
    displayMarkers.add(
      Marker(
        markerId: const MarkerId('pickup'),
        position: pickupLocation!,
        infoWindow: InfoWindow(
          title: 'Pickup',
          snippet: widget.order.shopName.isNotEmpty ? widget.order.shopName : 'Shop',
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    );
    
    // Add rider marker if available
    if (currentRiderLocation != null) {
      displayMarkers.add(
        Marker(
          markerId: const MarkerId('rider'),
          position: currentRiderLocation!,
          infoWindow: const InfoWindow(title: 'You'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        ),
      );
    }
    
    centerPosition = pickupLocation!;
    mapTitle = "Route to Seller";
    _showBestRoute(isPickupMap);
  } else {
    // For customer/dropoff map, show all locations
    displayMarkers = markers;
    centerPosition = dropoffLocation!;
    mapTitle = "Complete Route";
  }

  showDialog(
    context: context,
    builder: (context) => Dialog.fullscreen(
      child: Scaffold(
        appBar: AppBar(
          title: Text(mapTitle),
          backgroundColor: Colors.yellowbg,
          foregroundColor: Colors.white,
          actions: [
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
        body: Stack(
          children: [
            GoogleMap(
              initialCameraPosition: CameraPosition(
                target: centerPosition,
                zoom: 14.0,
              ),
              markers: displayMarkers,
              polylines: isPickupMap ? {} : polylines, // Only show polylines for complete route
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
              zoomControlsEnabled: true,
              mapToolbarEnabled: true,
              onMapCreated: (GoogleMapController controller) {
                // This controller is separate from the main one
                Future.delayed(Duration(milliseconds: 300), () {
                  // Adjust map bounds to show all markers
                  if (isPickupMap && currentRiderLocation != null) {
                    final bounds = _calculateBounds([pickupLocation!, currentRiderLocation!]);
                    controller.animateCamera(
                      CameraUpdate.newLatLngBounds(bounds, 50),
                    );
                  }
                });
              },
            ),
            Positioned(
              bottom: 10,
              right: 10,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 5,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: IconButton(
                  icon: const Icon(Icons.navigation, color: Colors.yellowbg),
                  onPressed: () => _toggleFullScreenMap(true), // true indicates pickup map
                  tooltip: 'Show seller location and route',
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

  Future<void> _initializeMapData() async {
    setState(() {
      isLoading = true;
    });

    try {
      if (widget.order.businessLocation.isNotEmpty) {
        final LatLng? coordinates = await getCoordinatesFromAddress(widget.order.businessLocation);
        pickupLocation = coordinates ?? const LatLng(14.5995, 120.9842);
      } else {
        pickupLocation = const LatLng(14.5995, 120.9842);
      }
      
      if (widget.order.address.isNotEmpty) {
        final LatLng? coordinates = await getCoordinatesFromAddress(widget.order.address);
        dropoffLocation = coordinates ?? LatLng(
          pickupLocation!.latitude + 0.01,
          pickupLocation!.longitude + 0.01,
        );
      } else {
        dropoffLocation = LatLng(
          pickupLocation!.latitude + 0.01,
          pickupLocation!.longitude + 0.01,
        );
      }

      markers = {
        Marker(
          markerId: const MarkerId('pickup'),
          position: pickupLocation!,
          infoWindow: InfoWindow(
            title: 'Pickup',
            snippet: widget.order.shopName.isNotEmpty ? widget.order.shopName : 'Shop',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        ),
        Marker(
          markerId: const MarkerId('dropoff'),
          position: dropoffLocation!,
          infoWindow: InfoWindow(
            title: 'Drop-off',
            snippet: widget.order.name.isNotEmpty ? widget.order.name : 'Customer',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      };

      polylines = {
        Polyline(
          polylineId: const PolylineId('route'),
          points: [pickupLocation!, dropoffLocation!],
          color: Colors.blue,
          width: 5,
        ),
      };
    } catch (e) {
      print('Error in _initializeMapData: $e');
      pickupLocation = const LatLng(14.5995, 120.9842);
      dropoffLocation = const LatLng(14.6095, 120.9942);
      
      markers = {
        Marker(
          markerId: const MarkerId('pickup'),
          position: pickupLocation!,
          infoWindow: const InfoWindow(title: 'Pickup'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        ),
        Marker(
          markerId: const MarkerId('dropoff'),
          position: dropoffLocation!,
          infoWindow: const InfoWindow(title: 'Drop-off'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      };
      
      polylines = {
        Polyline(
          polylineId: const PolylineId('route'),
          points: [pickupLocation!, dropoffLocation!],
          color: Colors.blue,
          width: 5,
        ),
      };
    } finally {
      setState(() {
        isLoading = false;
      });
      _simulateRiderLocation();
    }
  }

  void _handleArrivedAtVendor() {
    setState(() {
      _arrivedAtVendor = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Marked as arrived at vendor')),
    );
  }

  void _handlePickedUpOrder() {
    setState(() {
      _pickedUpOrder = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Marked as picked up')),
    );
  }

  void _handleDeliveredOrder() {
    setState(() {
      _deliveredOrder = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Marked as delivered!')),
    );
    Future.delayed(const Duration(seconds: 2), () {
      Navigator.of(context).pop();
    });
  }

  void _toggleChat() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Chat functionality would open here')),
    );
  }

  void _callCustomer() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Calling customer...')),
    );
  }

  void _cancelOrder() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Order'),
        content: const Text('Are you sure you want to cancel this order? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Order canceled')),
              );
            },
            child: const Text('Yes', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _onNavBarTap(int index) {
    setState(() {
      _currentIndex = index;
    });
    // Navigate to MainDeliveryLayout with the selected index
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => MainDeliveryLayout(initialIndex: index),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final arrivalTime = DateFormat('hh:mm a').format(now.add(const Duration(minutes: 10)));
    
    final String shopDisplay = widget.order.shopName.isNotEmpty 
        ? widget.order.shopName 
        : "Shop information not available";
    
    final String locationDisplay = widget.order.businessLocation.isNotEmpty
        ? widget.order.businessLocation
        : "Location not available";

    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Details'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.cancel_outlined, color: Colors.red),
            onPressed: _cancelOrder,
          ),
        ],
      ),
      body: isLoading 
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  Card(
                    margin: const EdgeInsets.all(8),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Go to vendor',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey[600],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.call, color: Colors.yellowbg),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Calling vendor...')),
                                  );
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            shopDisplay,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 20, color: Colors.grey),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  locationDisplay,
                                  style: TextStyle(color: Colors.grey[600]),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Arrive at $arrivalTime',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                          const SizedBox(height: 12),
                          Stack(
                            children: [
                              Container(
                                height: 150,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.grey.shade300),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: GoogleMap(
                                    initialCameraPosition: CameraPosition(
                                      target: pickupLocation!,
                                      zoom: 15.0,
                                    ),
                                    zoomControlsEnabled: false,
                                    mapToolbarEnabled: false,
                                    myLocationEnabled: true,
                                    myLocationButtonEnabled: false,
                                    markers: markers,
                                    polylines: polylines,
                                    onMapCreated: (GoogleMapController controller) {
                                      mapController = controller;
                                    },
                                  ),
                                ),
                              ),
                              // Navigation icon button
                              Positioned(
                                bottom: 10,
                                right: 10,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.2),
                                        blurRadius: 5,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  child: IconButton(
                                    icon: const Icon(Icons.navigation, color: Colors.yellowbg),
                                      onPressed: () => _toggleFullScreenMap(true), // false indicates dropoff map
                                    tooltip: 'Show full map with directions',
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Container(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _arrivedAtVendor ? null : _handleArrivedAtVendor,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.yellowbg,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                disabledBackgroundColor: Colors.grey,
                              ),
                              child: Text(
                                _arrivedAtVendor ? 'Arrived at the vendor' : 'Arrived at the vendor',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_arrivedAtVendor && !_pickedUpOrder)
                    Card(
                      margin: const EdgeInsets.all(8),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Pick up order',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Order: ${widget.order.item} (${widget.order.quantity})',
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _handlePickedUpOrder,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.yellowbg,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text(
                                  'Order Picked Up',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (_pickedUpOrder && !_deliveredOrder)
                    Card(
                      margin: const EdgeInsets.all(8),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Deliver to customer',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.chat, color: Colors.yellowbg),
                                      onPressed: _toggleChat,
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.call, color: Colors.yellowbg),
                                      onPressed: _callCustomer,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              widget.order.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 20, color: Colors.grey),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    widget.order.address,
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Stack(
                              children: [
                                Container(
                                  height: 150,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.grey.shade300),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: GoogleMap(
                                      initialCameraPosition: CameraPosition(
                                        target: dropoffLocation!,
                                        zoom: 15.0,
                                      ),
                                      zoomControlsEnabled: false,
                                      mapToolbarEnabled: false,
                                      myLocationEnabled: true,
                                      myLocationButtonEnabled: false,
                                      markers: {
                                        markers.firstWhere((marker) => marker.markerId.value == 'dropoff')
                                      },
                                      onMapCreated: (GoogleMapController controller) {
                                        mapController = controller;
                                      },
                                    ),
                                  ),
                                ),
                                // Add navigation button here too for customer delivery
                                Positioned(
                                  bottom: 10,
                                  right: 10,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.2),
                                          blurRadius: 5,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    child: IconButton(
                                      icon: const Icon(Icons.navigation, color: Colors.yellowbg),
                                      onPressed: () => _toggleFullScreenMap(false), // false indicates dropoff map
                                      tooltip: 'Show complete delivery route',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Container(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _handleDeliveredOrder,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.yellow,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text(
                                  'Order Delivered',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (_deliveredOrder)
                    Card(
                      margin: const EdgeInsets.all(8),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.check_circle,
                              color: Colors.green,
                              size: 64,
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Delivery Completed!',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'You earned ₱${widget.order.deliveryComm}',
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.green,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Container(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.yellowbg,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text(
                                  'Back to Orders',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onNavBarTap,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.yellow,
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
}