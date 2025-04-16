class ResponseDefault {
  final bool resp;
  final String msg;

  ResponseDefault({required this.resp, required this.msg});
factory ResponseDefault.fromJson(Map<String, dynamic> json) {
  // Check if this is an error response
  if (json.containsKey('error')) {
    return ResponseDefault(
      resp: false,
      msg: json['error'],
    );
  }
  
  // Otherwise, process as success response
  return ResponseDefault(
    resp: json['status'] == 'success',
    msg: json['message'] ?? 'No message provided',
  );
}
}