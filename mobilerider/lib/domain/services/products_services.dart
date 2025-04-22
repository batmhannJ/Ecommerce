import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:restaurant/data/env/environment.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/models/response/images_products_response.dart';
import 'package:restaurant/domain/models/response/products_top_home_response.dart';
import 'package:restaurant/domain/models/response/response_default.dart';
import 'package:restaurant/presentation/helpers/de_bouncer.dart';


class ProductsServices {

  final debouncer = DeBouncer(duration: Duration(milliseconds: 800));
  final StreamController<List<Productsdb>> _streamController = StreamController<List<Productsdb>>.broadcast(); 
  Stream<List<Productsdb>> get searchProducts => _streamController.stream;

  void dispose() {
    _streamController.close();
  }

  Future<ResponseDefault> addNewProduct(String name, String description, String price, List<XFile> images, String category ) async {

    final token = await secureStorage.readToken();

    var request = http.MultipartRequest('POST', Uri.parse('${Environment.endpointApi}/add-new-products'))
      ..headers['Accept'] = 'application/json'
      ..headers['xx-token'] = token!
      ..fields['name'] = name
      ..fields['description'] = description
      ..fields['price'] = price
      ..fields['category'] = category;
      for (var i = 0; i < images.length; i++) {
      final bytes = await images[i].readAsBytes();
      final fileName = images[i].name;
      
      request.files.add(
        http.MultipartFile.fromBytes(
          'images', // field name on server
          bytes,
          filename: fileName,
          contentType: MediaType('image', 'jpeg'), // adjust based on your image type
        ),
      );
    }

    final response = await request.send();
    var data = await http.Response.fromStream(response);

    return ResponseDefault.fromJson(jsonDecode(data.body));
  }

Future<List<Productsdb>> getProductsTopHome() async {
  try {
    final token = await secureStorage.readToken();
    
    // Check if token exists
    if (token == null || token.isEmpty) {
      print('No auth token found');
      // Handle the case where there's no token - maybe redirect to login
      throw Exception('Authentication required. Please login.');
    }
    
    final response = await http.get(
      Uri.parse('${Environment.endpointBase}allproducts-mobile'),
      headers: {'Accept': 'application/json', 'xx-token': token},
    );
    
    print('API Response Status: ${response.statusCode}');
    print('API Response Body: ${response.body}');
    
    final decodedResponse = jsonDecode(response.body);
    
    // Check for auth errors in the response body
    if (decodedResponse.containsKey('success') && !decodedResponse['success']) {
      print('Auth error: ${decodedResponse['message']}');
      // Clear the invalid token
      await secureStorage.deleteSecureStorage();
      // Throw exception to be caught and handled
      throw Exception(decodedResponse['message']);
    }
    
    // If we passed the auth check, continue with normal parsing
    if (response.statusCode == 200) {
      final data = ProductsTopHomeResponse.fromJson(decodedResponse);
      print('Parsed Products Count: ${data.productsdb.length}');
      return data.productsdb;
    } else {
      throw Exception('Failed to load products: ${response.statusCode}');
    }
  } catch (e) {
    print('Error getting products: $e');
    // Return empty list instead of throwing to avoid breaking the UI
    return [];
  }
}

  Future<List<ImageProductdb>> getImagesProducts(String id) async {

    final token = await secureStorage.readToken();

    final response = await http.get(Uri.parse('${Environment.endpointApi}/get-images-products/$id'),
      headers: {'Accept' : 'application/json', 'xx-token' : token!}
    );

    return ImagesProductsResponse.fromJson(jsonDecode(response.body)).imageProductdb;
  }  


  void searchProductsForName(String productName) async {

    debouncer.value = '';
    debouncer.onValue = ( value ) async {

      final token = await secureStorage.readToken();

      final response = await http.get(Uri.parse('${Environment.endpointApi}/search-product-for-name/$productName'),
        headers: { 'Accept' :  'application/json', 'xx-token' : token! }
      );

      final listProduct =  ProductsTopHomeResponse.fromJson( jsonDecode( response.body) ).productsdb;

      this._streamController.add(listProduct);

    };
    final timer = Timer(Duration(milliseconds: 200), () => debouncer.value = productName);
    Future.delayed(Duration(milliseconds: 400)).then((_) => timer.cancel());

  }


  Future<List<Productsdb>> searchPorductsForCategory(String idCategory) async {

    final token = await secureStorage.readToken();

    final resp = await http.get(Uri.parse('${Environment.endpointApi}/search-product-for-category/$idCategory'),
      headers: {'Accept' : 'application/json', 'xx-token' : token!}
    );

    return ProductsTopHomeResponse.fromJson(jsonDecode(resp.body)).productsdb;
  }

Future<List<Productsdb>> listProductsBySeller(String sellerId) async {
  try {
    final token = await secureStorage.readToken();
    
    if (token == null) {
      throw Exception('Authentication token not found');
    }
    
    print('Fetching products for seller ID: $sellerId');
    final url = '${Environment.endpointApi}/list-products-seller?sellerId=$sellerId';
    print('Request URL: $url');
    
    final response = await http.get(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json', 'xx-token': token}
    );
    
    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print('Decoded data: $data');
      
      // Check response structure
      if (data['products'] != null) {
        print('Found products array with ${(data['products'] as List).length} items');
        final productsList = data['products'] as List;
        
        // Log the first product to debug
        if (productsList.isNotEmpty) {
          print('First product: ${productsList[0]}');
        }
        
        return productsList.map((item) => Productsdb.fromJson(item)).toList();
      } else if (data['productsdb'] != null) {
        print('Found productsdb array with ${(data['productsdb'] as List).length} items');
        final productsList = data['productsdb'] as List;
        return productsList.map((item) => Productsdb.fromJson(item)).toList();
      } else {
        print('No products or productsdb found in response');
        return [];
      }
    } else {
      print('Error response: ${response.body}');
      throw Exception('Server error: ${response.statusCode}');
    }
  } catch (e) {
    print('Error in listProductsBySeller: $e');
    throw Exception('Failed to load seller products: $e');
  }
}

  Future<ResponseDefault> updateStatusProduct(String idProduct, String status) async {

    final token = await secureStorage.readToken();

    final resp = await http.put(Uri.parse('${Environment.endpointApi}/update-status-product'),
      headers: {'Accept' : 'application/json', 'xx-token' : token!},
      body: {
        'idProduct' : idProduct,
        'status' : status
      }
    );

    return ResponseDefault.fromJson(jsonDecode(resp.body));
  }


  Future<ResponseDefault> deleteProduct(String idProduct) async {

    final token = await secureStorage.readToken();

    final resp = await http.delete(Uri.parse('${Environment.endpointApi}/delete-product/$idProduct'),
      headers: {'Accept' : 'application/json', 'xx-token' : token!}
    );

    return ResponseDefault.fromJson(jsonDecode(resp.body));
  }




}

final productServices = ProductsServices();