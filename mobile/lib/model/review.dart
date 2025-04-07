class Review {
  final double rate; // Assuming rate is a double
  final String comment; // Assuming there is a comment field
  final String name; // Assuming there's a reviewer name

  const Review({
    required this.rate,
    required this.comment,
    required this.name,
  });

  // Convert a Review object into a JSON map.
  Map<String, dynamic> toJson() {
    return {
      'rate': rate,
      'comment': comment,
      'name': name,
    };
  }

  // Create a Review object from a JSON map.
  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      rate: json['rate'],
      comment: json['comment'],
      name: json['name'],
    );
  }
}
