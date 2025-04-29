import 'dart:math';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:restaurant/domain/models/response/orders_by_status_response.dart';
import 'package:restaurant/presentation/screens/delivery/main_screen.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

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
  bool locationLoading = true; // Track location fetching state
  GoogleMapController? mapController;
  Set<Marker> markers = {};
  Set<Polyline> polylines = {};
  Timer? _locationUpdateTimer;
  bool _arrivedAtVendor = false;
  bool _pickedUpOrder = false;
  bool _deliveredOrder = false;
  int _currentIndex = 1; // Default to Deliveries tab (index 1)
  bool _showingDirections = false; // Track if directions are being shown
  List<LatLng> _currentRoutePoints = [];
  String _estimatedTime = "1 min"; // Default estimated time
  String _distanceRemaining = "290 m"; // Default distance

  @override
  void initState() {
    super.initState();
    _initializeMapData();
    _locationUpdateTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _updateRiderLocation();
    });
  }

  Future<void> _simulateRiderLocation() async {
    setState(() {
      locationLoading = true; // Start loading
    });

    if (kIsWeb) {
      // Use browser's Geolocation API for web
      try {
        final permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          final newPermission = await Geolocator.requestPermission();
          if (newPermission == LocationPermission.denied || newPermission == LocationPermission.deniedForever) {
            throw Exception('Location permissions denied');
          }
        }

        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        setState(() {
          currentRiderLocation = LatLng(
            position.latitude,
            position.longitude,
          );
          _updateMarkersAndRoute();
        });
      } catch (e) {
        print('Error fetching location on web: $e');
        // Fallback to a default location if location fetching fails
        setState(() {
          if (pickupLocation != null) {
            currentRiderLocation = LatLng(
              pickupLocation!.latitude - 0.003,
              pickupLocation!.longitude - 0.002,
            );
            _updateMarkersAndRoute();
          }
        });
      }
    } else {
      // For mobile (Android/iOS), use the original simulation logic
      await Future.delayed(const Duration(seconds: 1));
      if (pickupLocation != null) {
        setState(() {
          currentRiderLocation = LatLng(
            pickupLocation!.latitude - 0.003,
            pickupLocation!.longitude - 0.002,
          );
          _updateMarkersAndRoute();
        });
      }
    }

    setState(() {
      locationLoading = false; // Done loading
    });
  }

  void _updateMarkersAndRoute() {
    if (currentRiderLocation != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('rider'),
          position: currentRiderLocation!,
          infoWindow: const InfoWindow(title: 'You (Current Location)'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        ),
      );

      if (pickupLocation != null && !_pickedUpOrder) {
        _getRoutePoints(currentRiderLocation!, pickupLocation!);
      } else if (dropoffLocation != null && _pickedUpOrder) {
        _getRoutePoints(currentRiderLocation!, dropoffLocation!);
      }
    }
  }

  @override
  void dispose() {
    mapController?.dispose();
    _locationUpdateTimer?.cancel();
    super.dispose();
  }

  void _updateRiderLocation() {
    print('Updating rider location...');
    // Simulate rider moving along the route
    if (_currentRoutePoints.isNotEmpty && _currentRoutePoints.length > 2) {
      int currentPointIndex = _currentRoutePoints.indexOf(currentRiderLocation!);
      if (currentPointIndex != -1 && currentPointIndex < _currentRoutePoints.length - 1) {
        setState(() {
          currentRiderLocation = _currentRoutePoints[currentPointIndex + 1];
          // Update rider marker
          markers.removeWhere((marker) => marker.markerId.value == 'rider');
          markers.add(
            Marker(
              markerId: const MarkerId('rider'),
              position: currentRiderLocation!,
              infoWindow: const InfoWindow(title: 'You (Current Location)'),
              icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
            ),
          );
        });
      }
    }
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

  Future<void> _getRoutePoints(LatLng origin, LatLng destination) async {
    try {
      final points = await getDirections(origin, destination);
      setState(() {
        _currentRoutePoints = points;
        polylines.clear();
        polylines.add(
          Polyline(
            polylineId: const PolylineId('route'),
            points: points,
            color: Colors.blue,
            width: 5,
          ),
        );
      });
    } catch (e) {
      print('Error getting route points: $e');
    }
  }

  Future<List<LatLng>> getDirections(LatLng origin, LatLng destination) async {
    try {
      final backendUrl = 'http://localhost:4000/api/directions?'
          'origin=${origin.latitude},${origin.longitude}'
          '&destination=${destination.latitude},${destination.longitude}'
          '&mode=driving'
          '&alternatives=true'
          '&key=AIzaSyCfeMqzu93-w0aWnBTs1TTU62_Od49c9iI';

      print('Requesting directions from: $backendUrl');

      final response = await http.get(
        Uri.parse(backendUrl),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      print('Response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        print('API Response: ${response.body.substring(0, min(200, response.body.length))}...');

        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final route = data['routes'][0];

          if (route['legs'] != null && route['legs'].isNotEmpty) {
            final leg = route['legs'][0];
            if (leg['duration'] != null && leg['distance'] != null) {
              setState(() {
                _estimatedTime = leg['duration']['text'];
                _distanceRemaining = leg['distance']['text'];
              });
            }
          }

          final points = _decodePolyline(route['overview_polyline']['points']);
          return points;
        } else {
          print('No routes found in API response');
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No route found between locations')),
          );
          return [origin, destination];
        }
      } else {
        print('API Request failed with status code: ${response.statusCode}');
        print('Error response: ${response.body}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to get directions: HTTP ${response.statusCode}')),
        );
        return [origin, destination];
      }
    } catch (e) {
      print('Error fetching directions: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Network error: ${e.toString()}')),
      );
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
    if (locationLoading) {
      // Show a loading dialog while waiting for the location
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(color: Colors.amber),
              SizedBox(width: 20),
              Text("Fetching your location..."),
            ],
          ),
        ),
      );
      // After the dialog, location should be fetched; if not, it will fallback below
    }

    if (currentRiderLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to detect your current location')),
      );
      return;
    }

    final destination = isPickupMap ? pickupLocation! : dropoffLocation!;
    final destinationName = isPickupMap ? (widget.order.shopName.isNotEmpty ? widget.order.shopName : 'Shop') : (widget.order.name.isNotEmpty ? widget.order.name : 'Customer');

    setState(() {
      _showingDirections = true;
    });

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(color: Colors.amber),
              SizedBox(width: 20),
              Text("Loading directions..."),
            ],
          ),
        ),
      );

      final routePoints = await getDirections(currentRiderLocation!, destination);

      Navigator.pop(context);

      Set<Marker> routeMarkers = {};

      routeMarkers.add(
        Marker(
          markerId: const MarkerId('rider'),
          position: currentRiderLocation!,
          infoWindow: const InfoWindow(title: 'You (Current Location)'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        ),
      );

      if (isPickupMap) {
        routeMarkers.add(
          Marker(
            markerId: const MarkerId('pickup'),
            position: pickupLocation!,
            infoWindow: InfoWindow(
              title: 'Seller Location',
              snippet: widget.order.shopName.isNotEmpty ? widget.order.shopName : 'Shop',
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
          ),
        );
      } else {
        routeMarkers.add(
          Marker(
            markerId: const MarkerId('dropoff'),
            position: dropoffLocation!,
            infoWindow: InfoWindow(
              title: 'Customer Location',
              snippet: widget.order.name.isNotEmpty ? widget.order.name : 'Customer',
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          ),
        );
      }

      final polylineId = isPickupMap ? 'route_to_pickup' : 'route_to_dropoff';
      final polyline = Polyline(
        polylineId: PolylineId(polylineId),
        points: routePoints,
        color: Colors.blue,
        width: 5,
      );

      showDialog(
        context: context,
        builder: (context) => Dialog.fullscreen(
          child: Scaffold(
            body: Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: currentRiderLocation!,
                    zoom: 17.0,
                    tilt: 45.0,
                    bearing: 30.0,
                  ),
                  markers: routeMarkers,
                  polylines: {polyline},
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  zoomControlsEnabled: false,
                  mapToolbarEnabled: false,
                  compassEnabled: true,
                  onMapCreated: (GoogleMapController controller) {
                    Future.delayed(Duration(milliseconds: 300), () {
                      controller.animateCamera(
                        CameraUpdate.newCameraPosition(
                          CameraPosition(
                            target: currentRiderLocation!,
                            zoom: 17.0,
                            tilt: 45.0,
                            bearing: _calculateBearing(
                              currentRiderLocation!,
                              routePoints.length > 1 ? routePoints[1] : destination,
                            ),
                          ),
                        ),
                      );
                    });
                  },
                ),
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    color: Colors.green,
                    padding: const EdgeInsets.fromLTRB(16, 40, 16, 16),
                    child: Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_upward, color: Colors.white),
                          onPressed: () {},
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text(
                                    "F. Torres St",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const Icon(Icons.arrow_right, color: Colors.white),
                                ],
                              ),
                              Text(
                                "toward Mabini st",
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.search, color: Colors.white),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 110,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.turn_right, color: Colors.white),
                        const SizedBox(width: 8),
                        const Text(
                          "Then",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 110,
                  right: 16,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.volume_up),
                      onPressed: () {},
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Column(
                    children: [
                      Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.access_time, size: 16),
                            SizedBox(width: 4),
                            Text(
                              "Similar ETA",
                              style: TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        color: Colors.white,
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.blue, width: 1),
                              ),
                              child: TextButton.icon(
                                icon: const Icon(Icons.gps_fixed, color: Colors.blue, size: 16),
                                label: const Text(
                                  "Re-center",
                                  style: TextStyle(color: Colors.blue, fontSize: 12),
                                ),
                                onPressed: () {},
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    _estimatedTime,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const Text(
                                    " • ",
                                    style: TextStyle(color: Colors.grey),
                                  ),
                                  Text(
                                    _distanceRemaining,
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                  const Text(
                                    " • ",
                                    style: TextStyle(color: Colors.grey),
                                  ),
                                  Text(
                                    "10:51 AM",
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.navigation, color: Colors.white),
                          onPressed: () => _openInMapsApp(destination, destinationName), // Open route in Google Maps
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.layers),
                          onPressed: () {},
                        ),
                      ),
                    ],
                  ),
                ),
              ],
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

  double _calculateBearing(LatLng start, LatLng end) {
    double startLat = start.latitude * (pi / 180);
    double startLng = start.longitude * (pi / 180);
    double endLat = end.latitude * (pi / 180);
    double endLng = end.longitude * (pi / 180);

    double dLng = endLng - startLng;

    double y = sin(dLng) * cos(endLat);
    double x = cos(startLat) * sin(endLat) - sin(startLat) * cos(endLat) * cos(dLng);

    double bearing = atan2(y, x);
    bearing = bearing * (180 / pi);
    bearing = (bearing + 360) % 360;

    return bearing;
  }

  void _openInMapsApp(LatLng destination, String destinationName) {
    try {
      final url = Uri.parse('https://www.google.com/maps/dir/?api=1'
          '&destination=${destination.latitude},${destination.longitude}'
          '&travelmode=driving'
          '&dir_action=navigate');

      launchUrl(url, mode: LaunchMode.externalApplication).then((launched) {
        if (!launched) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open Google Maps app')),
          );
        }
      });
    } catch (e) {
      print('Error opening maps app: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open maps app')),
      );
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

  void _toggleFullScreenMap(bool isPickupMap) async {
    // If location is still loading, wait for it
    if (locationLoading) {
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(color: Colors.amber),
              SizedBox(width: 20),
              Text("Fetching your location..."),
            ],
          ),
        ),
      );
    }

    // After the dialog, check if location was successfully fetched
    if (currentRiderLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to detect your current location')),
      );
      return;
    }

    Set<Marker> displayMarkers = {};
    LatLng centerPosition;
    String mapTitle;

    if (isPickupMap) {
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

      displayMarkers.add(
        Marker(
          markerId: const MarkerId('rider'),
          position: currentRiderLocation!,
          infoWindow: const InfoWindow(title: 'You'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        ),
      );

      centerPosition = pickupLocation!;
      mapTitle = "Route to Seller";
    } else {
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
                polylines: isPickupMap ? {} : polylines,
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
                zoomControlsEnabled: true,
                mapToolbarEnabled: true,
                onMapCreated: (GoogleMapController controller) {
                  Future.delayed(Duration(milliseconds: 300), () {
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
                    onPressed: () => _showBestRoute(isPickupMap), // Call _showBestRoute instead of _toggleFullScreenMap
                    tooltip: 'Show navigation route',
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
        dropoffLocation = coordinates ??
            LatLng(
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
      await _simulateRiderLocation(); // Wait for location to be fetched
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
                                    onPressed: locationLoading
                                        ? null // Disable button while location is loading
                                        : () => _toggleFullScreenMap(true),
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
                                        markers.firstWhere((marker) => marker.markerId.value == 'dropoff'),
                                      },
                                      onMapCreated: (GoogleMapController controller) {
                                        mapController = controller;
                                      },
                                    ),
                                  ),
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
                                      onPressed: locationLoading
                                          ? null // Disable button while location is loading
                                          : () => _toggleFullScreenMap(false),
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