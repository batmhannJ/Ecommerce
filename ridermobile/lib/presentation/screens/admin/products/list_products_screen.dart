import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart';
import 'package:restaurant/data/env/environment.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/domain/models/response/products_top_home_response.dart';
import 'package:restaurant/domain/services/products_services.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/admin/products/add_new_product_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';

class ListProductsScreen extends StatefulWidget {

  @override
  State<ListProductsScreen> createState() => _ListProductsScreenState();
}

class _ListProductsScreenState extends State<ListProductsScreen> {
  String? _sellerId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSellerId();
  }

Future<void> _loadSellerId() async {
    try {
      // Use your existing method to get the userId (which is the seller ID)
      _sellerId = await secureStorage.readUserId();
      
      if (_sellerId == null) {
        print('Warning: Could not get seller ID from secure storage');
      }
    } catch (e) {
      print('Error loading seller ID: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  
  @override
  Widget build(BuildContext context) {
    return BlocListener<ProductsBloc, ProductsState>(
      listener: (context, state) {
        if( state is LoadingProductsState ){
          modalLoading(context);
        }
        if( state is SuccessProductsState ){
          Navigator.pop(context);
          modalSuccess(context, 'Success', (){
            Navigator.pop(context);
            setState(() {});
          });
        }
        if(state is FailureProductsState ){
          Navigator.pop(context);
          errorMessageSnack(context, state.error);
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          title: const TextCustom(text: 'List Products', fontSize: 19),
          centerTitle: true,
          leadingWidth: 80,
          elevation: 0,
          leading: InkWell(
            onTap: () => Navigator.pop(context),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.arrow_back_ios_new_rounded, color: ColorsFrave.primaryColor, size: 17),
                TextCustom(text: 'Back', fontSize: 17, color: ColorsFrave.primaryColor)
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.push(context, routeFrave(page: AddNewProductScreen())), 
              child: const TextCustom(text: 'Add', fontSize: 17, color: ColorsFrave.primaryColor)
            )
          ],
        ),
        body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _sellerId == null
          ? const Center(child: TextCustom(text: 'No seller ID found. Please login again.', color: Colors.red))
          : FutureBuilder<List<Productsdb>>(
              future: productServices.listProductsBySeller(_sellerId!),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(child: TextCustom(text: 'Error: ${snapshot.error}', color: Colors.red));
                }
                if (!snapshot.hasData) {
                  return const ShimmerFrave();
                }
                if (snapshot.data!.isEmpty) {
                  return const Center(child: TextCustom(text: 'No products found for this seller.'));
                }
                return _GridViewListProduct(listProducts: snapshot.data!);
              }
            ),
      ),
    );
  }
}

class _GridViewListProduct extends StatelessWidget {
  
  final List<Productsdb> listProducts;

  const _GridViewListProduct({required this.listProducts});

  @override
  Widget build(BuildContext context) {

    return GridView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
      itemCount: listProducts.length,
      gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 200,
        childAspectRatio: 4,
        crossAxisSpacing: 20,
        mainAxisSpacing: 20
      ), 
      itemBuilder: (context, i) 
        => InkWell(
          onTap: () => modalActiveOrInactiveProduct(context, listProducts[i].status, listProducts[i].nameProduct, listProducts[i].id, listProducts[i].picture),
          onLongPress: () => modalDeleteProduct(context, listProducts[i].nameProduct, listProducts[i].picture, listProducts[i].id.toString()),
          child: Row(
            children: [
              Container(
                height: 50,
                width: 50,
                decoration: BoxDecoration(
                  image: DecorationImage(
                    scale: 7,
                    image: NetworkImage('${Environment.endpointBase}upload/images/${listProducts[i].picture}')
                  )
                ),
              ),
              Expanded(
                child: Container(
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(5.0),
                    color: ( listProducts[i].status == 1 ) ? Colors.grey[50] : Colors.red[100]
                  ),
                  child: TextCustom(text: listProducts[i].nameProduct, fontSize: 16),
                ),
              ),
            ],
          ),
        ),
    );  

  }



}