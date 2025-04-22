import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:restaurant/data/env/environment.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/models/product_cart.dart';
import 'package:restaurant/domain/models/response/order_details_response.dart';
import 'package:restaurant/domain/models/response/orders_by_status_response.dart';
import 'package:restaurant/domain/models/response/orders_client_response.dart';
import 'package:restaurant/domain/models/response/response_default.dart';


class OrdersServices {


  Future<ResponseDefault> addNewOrders(String uidAddress, double total, String typePayment, List<ProductCart> products) async {

    final token = await secureStorage.readToken();
    final userId = await secureStorage.readUserId();
if (userId == null) {
      throw Exception('User ID not found in secure storage');
    }
   // Prepare request payload with userId included
    Map<String, dynamic> data = {
      "userId": userId,         // Add userId from secure storage
      "uidAddress": uidAddress,
      "typePayment": typePayment,
      "total": total,
      "products": products.map((p) => {
        "uidProduct": p.uidProduct,
        "nameProduct": p.nameProduct,
        "price": p.price,
        "quantity": p.quantity,
        "imageProduct": p.imageProduct,
      }).toList(),
    };

    final resp = await http.post(Uri.parse('${Environment.endpointApi}/add-new-orders'),
      headers: {'Content-type' : 'application/json', 'xx-token' : token!},
      body: json.encode(data)
    );
    
    print('Raw API Response: ${resp.body}');

    return ResponseDefault.fromJson(jsonDecode(resp.body));
  }

Future<List<OrdersResponse>> getOrdersByStatus(String status) async {
  try {
    final token = await secureStorage.readToken();
    final resp = await http.get(
      Uri.parse('${Environment.endpointApi}/get-orders-by-status/$status'),
      headers: {'Accept': 'application/json', 'xx-token': token ?? ''},
    );

    print('API Response status: ${resp.statusCode}');
    print('API Response body: ${resp.body}');

    if (resp.statusCode == 200) {
      final jsonResponse = jsonDecode(resp.body);
      print('Decoded JSON: $jsonResponse');

      try {
        final orderResponse = OrdersByStatusResponse.fromJson(jsonResponse);
        print('Successfully parsed response');
        print('Parsed ${orderResponse.ordersResponse.length} orders from response');
        return orderResponse.ordersResponse;
      } catch (e) {
        print('Error parsing response: $e');
        rethrow; // Propagate the error
      }
    } else {
      print('Error: Server returned status ${resp.statusCode}');
      return [];
    }
  } catch (e) {
    print('Exception in getOrdersByStatus: $e');
    rethrow; // Propagate the error
  }
}
  // In your ordersServices.dart file
Future<List<DetailsOrder>> getOrderDetailsById(String orderId) async {
  final response = await http.get(
    Uri.parse('${Environment.endpointApi}/get-details-order-by-id/$orderId'),
    headers: {'Content-Type': 'application/json'},
  );

  if (response.statusCode == 200) {
    List<dynamic> data = json.decode(response.body);
    return data.map((item) => DetailsOrder.fromJson(item)).toList();
  } else {
    throw Exception('Failed to load order details');
  }
}

Future<ResponseDefault> updateStatusOrderToDispatched(String idOrder, String idDelivery) async {
  try {
    final token = await secureStorage.readToken();
    final url = '${Environment.endpointApi}/update-status-order-dispatched';
    print('Request URL: $url');
    print('Request body: ${jsonEncode({
      'idOrder': idOrder,
      'idDelivery': idDelivery,
    })}');

    final resp = await http.put(
      Uri.parse(url),
      headers: {
        'Accept': 'application/json',
        'xx-token': token!,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'idOrder': idOrder,
        'idDelivery': idDelivery,
      }),
    );

    if (resp.statusCode != 200) {
      print('Error: ${resp.statusCode} - ${resp.body}');
      return ResponseDefault(resp: false, msg: 'Failed to update status');
    }

    return ResponseDefault.fromJson(jsonDecode(resp.body));
  } catch (e) {
    print('Exception: $e');
    return ResponseDefault(resp: false, msg: 'Network error');
  }
}

  Future<ResponseDefault> updateOrderStatusOnWay( String idOrder, String latitude, String longitude ) async {

    final token = await secureStorage.readToken();

    final resp = await http.put(Uri.parse('${Environment.endpointApi}/update-status-order-on-way/$idOrder'),
      headers: { 'Accept' : 'application/json', 'xx-token' : token! },
      body: {
        'latitude' : latitude,
        'longitude' : longitude
      }
    );

    return ResponseDefault.fromJson(jsonDecode(resp.body));
  }
  

  Future<ResponseDefault> updateOrderStatusDelivered(String idOrder) async {

    final token = await secureStorage.readToken();

    final resp = await http.put(Uri.parse('${Environment.endpointApi}/update-status-order-delivered/$idOrder'),
      headers: { 'Accept' : 'application/json', 'xx-token' : token! },
    );
    return ResponseDefault.fromJson( jsonDecode( resp.body ));
  }
Future<List<OrdersClient>> getListOrdersForClient() async {
  final userId = await secureStorage.readUserId();

  if (userId == null) {
    throw Exception('User ID not found');
  }

  final url = '${Environment.endpointApi}/client-order?userId=$userId';
  print('Calling URL: $url');

  final response = await http.get(
    Uri.parse(url),
    headers: {
      'Content-Type': 'application/json',
    },
  );

  print('Orders API Response: ${response.body}');

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    final ordersResponse = OrdersClientResponse.fromJson(jsonResponse);
    if (ordersResponse.status) {
      print('Parsed orders count: ${ordersResponse.ordersClient.length}');
      print('Parsed orders: ${ordersResponse.ordersClient.map((o) => o.id).toList()}');
      return ordersResponse.ordersClient;
    } else {
      throw Exception(ordersResponse.message.isEmpty ? 'Failed to fetch orders' : ordersResponse.message);
    }
  } else {
    throw Exception('HTTP Error: ${response.statusCode}');
  }
}
}

final ordersServices = OrdersServices();