import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:restaurant/data/env/environment.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/models/response/category_all_response.dart';
import 'package:restaurant/domain/models/response/response_default.dart';

class CategoryServices {


Future<ResponseDefault> addNewCategory(String nameCategory, String descriptionCategory) async {
  final token = await secureStorage.readToken();
  
  // Debug logging to see what values are being sent
  print('Sending category data - Name: "$nameCategory", Description: "$descriptionCategory"');

  final response = await http.post(
    Uri.parse('${Environment.endpointApi}/add-categories'),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json', // Make sure content type is set correctly
      'xx-token': token!
    },
    body: jsonEncode({ // Use jsonEncode to properly format the request body
      'name': nameCategory,
      'description': descriptionCategory
    })
  );

  print('Response status: ${response.statusCode}');
  print('Response body: ${response.body}');

  return ResponseDefault.fromJson(jsonDecode(response.body));
}

  /*Future<List<Category>> getAllCategories() async {

    final token = await secureStorage.readToken();

    final response = await http.get(Uri.parse('${Environment.endpointApi}/get-all-categories'),
      headers: {  'Accept' : 'application/json', 'xx-token' : token! }
    );

    return CategoryAllResponse.fromJson( jsonDecode( response.body )).categories;
  }*/

  Future<List<Category>> getAllCategories() async {
    try {
      final response = await http.get(
        Uri.parse('${Environment.endpointApi}/get-all-categories'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Category.fromJson(json)).toList();
      } else {
        throw Exception('Failed to fetch categories: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching categories: $e');
    }
  }


  Future<ResponseDefault> deleteCategory(String uidCategory) async {

    final token = await secureStorage.readToken();

    final resp = await http.delete(Uri.parse('${Environment.endpointApi}/delete-category/'+ uidCategory ),
      headers: { 'Content-type' : 'application/json', 'xx-token' : token! }
    );

    return ResponseDefault.fromJson( jsonDecode( resp.body ) );
  }

  

}

final categoryServices = CategoryServices();