class SearchProductsWidget extends StatefulWidget {
  final List<String> products;

  const SearchProductsWidget({Key? key, required this.products})
      : super(key: key);

  @override
  _SearchProductsWidgetState createState() => _SearchProductsWidgetState();
}

class _SearchProductsWidgetState extends State<SearchProductsWidget> {
  String _searchQuery = '';
  List<String> _filteredProducts = [];

  void _filterProducts(String query) {
    setState(() {
      _searchQuery = query;
      _filteredProducts = widget.products
          .where(
              (product) => product.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          onChanged: _filterProducts,
          decoration: InputDecoration(
            labelText: 'Search Products',
            prefixIcon: Icon(Icons.search),
            border: OutlineInputBorder(),
          ),
        ),
        SizedBox(height: 16),
        Container(
          height: 200, // Adjust this height as needed
          child: ListView.builder(
            itemCount: _searchQuery.isEmpty ? 0 : _filteredProducts.length,
            itemBuilder: (context, index) {
              final product = _filteredProducts[index];
              return ListTile(
                title: Text(product),
                onTap: () {
                  // Handle product selection here
                  print('Selected product: $product');
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
