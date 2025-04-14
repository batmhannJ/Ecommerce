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


  Future<List<OrdersResponse>> getOrdersByStatus( String status ) async {

    final token = await secureStorage.readToken();

    final resp = await http.get(Uri.parse('${Environment.endpointApi}/get-orders-by-status/$status'),
      headers: {'Accept' : 'application/json', 'xx-token' : token!},
    );
    return OrdersByStatusResponse.fromJson(jsonDecode(resp.body)).ordersResponse;
  }


  Future<List<DetailsOrder>> gerOrderDetailsById(String idOrder) async {

    final token = await secureStorage.readToken();

    final resp = await http.get(Uri.parse('${Environment.endpointApi}/get-details-order-by-id/$idOrder'),
      headers: {'Accept' : 'application/json', 'xx-token' : token!},
    );
    return OrderDetailsResponse.fromJson( jsonDecode(resp.body)).detailsOrder;
  }


  Future<ResponseDefault> updateStatusOrderToDispatched(String idOrder, String idDelivery) async {

    final token = await secureStorage.readToken();

    final resp = await http.put(Uri.parse('${Environment.endpointApi}/update-status-order-dispatched'),
      headers: { 'Accept' : 'application/json', 'xx-token' : token! },
      body: {
        'idDelivery' : idDelivery,
        'idOrder' : idOrder
      }
    );

    return ResponseDefault.fromJson(jsonDecode(resp.body));
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