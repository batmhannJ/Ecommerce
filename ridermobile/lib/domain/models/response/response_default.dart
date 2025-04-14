class ResponseDefault {
  final bool resp;
  final String msg;

  ResponseDefault({required this.resp, required this.msg});

  factory ResponseDefault.fromJson(Map<String, dynamic> json) => ResponseDefault(
        resp: json['status'] == 'success', // Convert "status" to boolean
        msg: json['message'] ?? 'No message provided',
      );
}