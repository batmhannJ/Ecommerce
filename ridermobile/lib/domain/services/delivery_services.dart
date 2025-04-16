import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:restaurant/data/env/environment.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/models/response/get_all_delivery_response.dart';
import 'package:restaurant/domain/models/response/orders_by_status_response.dart';


class DeliveryServices {


  Future<List<Delivery>> getAlldelivery() async {

    final token = await secureStorage.readToken();

    final resp = await http.get(Uri.parse('${Environment.endpointApi}/get-all-delivery'),
      headers: { 'Accept' : 'application/json', 'xx-token' : token! }
    );

    return GetAllDeliveryResponse.fromJson(jsonDecode(resp.body)).delivery;
  }

Future<List<OrdersResponse>> getOrdersForDelivery(String statusOrder) async {
  try {
    final response = await http.get(
      Uri.parse('${Environment.endpointApi}/get-transactions-by-status/$statusOrder'),
      headers: {'Accept': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Access the transactions array from the response
      if (data["transactions"] != null) {
        return List<OrdersResponse>.from(
          data["transactions"].map((x) => OrdersResponse.fromJson(x))
        );
      }
      return [];
    } else {
      throw Exception('Failed to fetch transactions: ${response.statusCode}');
    }
  } catch (e) {
    print('Error fetching transactions: $e');
    return [];
  }
}
}

final deliveryServices = DeliveryServices();