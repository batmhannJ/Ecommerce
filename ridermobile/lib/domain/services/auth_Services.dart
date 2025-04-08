import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:restaurant/data/env/environment.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/models/response/response_login.dart';

class AuthServices {

Future<ResponseLogin> loginController(String email, String password) async {
  try {
    print("Sending login request with email: $email");
    final response = await http.post(
      Uri.parse('${Environment.endpointApi}/login-role'),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    print("Received response with status code: ${response.statusCode}");
    print("Response body: ${response.body}");

    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(response.body);
      print("Decoded JSON response: $jsonResponse");
      final responseData = Map.from(jsonResponse);

      final bool isSuccess = responseData['success'] as bool? ?? false;
      print("Success value: $isSuccess");

      if (isSuccess) {
        final int roleId = responseData['roleId'] as int? ?? 0;
        print("Role ID: $roleId");

        final userId = responseData['userId'] as String?;
        print("Raw userId from response: $userId");

        // Use the userId directly as a String (no parsing to int)
        final String uid = userId ?? ''; // Default to empty string if null
        print("UID: $uid");
final userDetailsResponse = await http.get(
          Uri.parse('${Environment.endpointBase}api/user-details/$userId'),
          headers: {'Accept': 'application/json'},
        );
        // Extract the user information from the response
        final String firstName = responseData['firstName'] as String? ?? '';
        final String lastName = responseData['lastName'] as String? ?? '';
        final String phone = responseData['phone'] as String? ?? '';
        final String name = '$firstName $lastName'.trim();
final userDetails = jsonDecode(userDetailsResponse.body);
        final userData = {
          'uid': uid,
          'email': email,
          'rolId': roleId,
          'name': name,
          'firstName': firstName,
          'lastName': lastName,
          'phone': phone,
          'image': '',
          'notificationToken': '',
          'address': userDetails['user']['address'],
        };
        print("User data prepared: $userData");

        return ResponseLogin(
          resp: true,
          msg: 'Login successful',
          user: User.fromJson(userData),
          token: responseData['token'] as String? ?? '',
        );
      } else {
        final errorMsg = responseData['errors'] as String? ?? 'Unknown error';
        print("Login failed with error: $errorMsg");
        return ResponseLogin(
          resp: false,
          msg: errorMsg,
          user: User(
            uid: '',
            name: '',
            firstName: '',
            lastName: '',
            phone: '',
            image: '',
            email: '',
            rolId: 0,
            notificationToken: '',
          ),
          token: '',
        );
      }
    } else {
      print("Non-200 response received: ${response.statusCode}");
      final errorResponse = jsonDecode(response.body);
      print("Error response: $errorResponse");
      final errorMsg = errorResponse['errors'] as String? ?? 'Error: ${response.statusCode}';
      return ResponseLogin(
        resp: false,
        msg: errorMsg,
        user: User(
          uid: '',
          name: '',
          firstName: '',
          lastName: '',
          phone: '',
          image: '',
          email: '',
          rolId: 0,
          notificationToken: '',
        ),
        token: '',
      );
    }
  } catch (e) {
    print("Exception caught during login: $e");
    return ResponseLogin(
      resp: false,
      msg: 'Error: $e',
      user: User(
        uid: '',
        name: '',
        firstName: '',
        lastName: '',
        phone: '',
        image: '',
        email: '',
        rolId: 0,
        notificationToken: '',
      ),
      token: '',
    );
  }
}

  Future<ResponseLogin> renewLoginController() async {
  final token = await secureStorage.readToken();
  if (token == null) {
    return ResponseLogin(
      resp: false,
      msg: 'No token available',
      user: User(
        uid: '',
        name:'',
        firstName: '',
        lastName: '',
        phone: '',
        image: '',
        email: '',
        rolId: 0,
        notificationToken: '',
      ),
      token: '',
    );
  }

  final response = await http.get(
    Uri.parse('${Environment.endpointApi}/renew-token-login'),
    headers: {'Accept': 'application/json', 'xx-token': token},
  );

  return ResponseLogin.fromJson(jsonDecode(response.body));
}

}

final authServices = AuthServices();