class User {
  final String id;
  final String name;
  final String phone;
  final String password;
  final String email;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
    required this.phone,
  });

  // Factory method to create User object from JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      password: json['password'] ?? '',
      phone: json['phone'] ?? '',
    );
  }

  // Method to create a copy of the User object with updated properties
  User copyWith({
    String? id,
    String? name,
    String? phone,
    String? email,
    String? password,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      password: password ?? this.password,
    );
  }
}
