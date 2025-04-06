import 'package:flutter/material.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/products.dart';


class SearchBar extends StatefulWidget {
  const SearchBar({super.key});

  @override
  State<SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<SearchBar> {
  final _searchController = TextEditingController();
  List<Product> _filteredProducts = [];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    setState(() {
      _filteredProducts = products
          .where((product) => product.name
              .toLowerCase()
              .contains(_searchController.text.toLowerCase()))
          .toList();
    });
    Navigator.pushNamed(
      context,
      '/search-results',
      arguments: _filteredProducts,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              labelText: 'Search for products...',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 10),
          ElevatedButton(
            onPressed: _handleSearch,
            child: const Text('Search'),
          ),
        ],
      ),
    );
  }
}
