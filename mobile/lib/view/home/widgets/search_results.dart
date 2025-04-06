import 'package:flutter/material.dart';
import 'package:indigitech_shop/products.dart';

class SearchResults extends StatelessWidget {
  final List<Products> filteredProducts;

  const SearchResults(this.filteredProducts, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Results'),
      ),
      body: ListView.builder(
        itemCount: filteredProducts.length,
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(filteredProducts[index].name),
            subtitle: Text('New Price: ${filteredProducts[index].newPrice}'),
          );
        },
      ),
    );
  }
}
