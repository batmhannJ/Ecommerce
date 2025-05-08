import 'dart:async';
import 'dart:convert';
import 'package:bloc/bloc.dart';
import 'package:http/http.dart' as http;
import 'package:meta/meta.dart';
import 'package:image_picker/image_picker.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/services/category_services.dart';
import 'package:restaurant/domain/services/products_services.dart';

part 'products_event.dart';
part 'products_state.dart';

class ProductsBloc extends Bloc<ProductsEvent, ProductsState> {

  ProductsBloc() : super(ProductsState()){

    on<OnAddNewCategoryEvent>( _onAddNewCategory );
    on<OnSelectCategoryEvent>( _onSelectCategory );
    on<OnUnSelectCategoryEvent>( _onUnSelectCategory );
    on<OnSelectMultipleImagesEvent>( _onSelectMultipleImages );
    on<OnUnSelectMultipleImagesEvent>( _onUnSelectMultipleImages );
    on<OnAddNewProductEvent>( _onAddNewProduct );
    on<OnUpdateStatusProductEvent>( _onUpdateStatusProduct );
    on<OnDeleteProductEvent>( _onDeleteProduct );
    on<OnSearchProductEvent>( _onSearchProductEvent );
  }


  Future<void> _onAddNewCategory( OnAddNewCategoryEvent event, Emitter<ProductsState> emit ) async {

    try {

      emit( LoadingProductsState() );

      await Future.delayed(Duration(seconds: 1));

      final data = await categoryServices.addNewCategory(event.nameCategory, event.descriptionCategory);

      if( data.resp ) emit( SuccessProductsState() );
      else emit( FailureProductsState(data.msg) );
      
    } catch (e) {
      emit( FailureProductsState(e.toString()) );
    }

  }

  Future<void> _onSelectCategory( OnSelectCategoryEvent event, Emitter<ProductsState> emit ) async {

    emit( state.copyWith(
      idCategory: event.idCategory,
      category: event.category
    ));
  }

  Future<void> _onUnSelectCategory( OnUnSelectCategoryEvent event, Emitter<ProductsState> emit ) async {
    
    emit( state.copyWith(
      idCategory: "",
      category: ''
    ));
  }

  Future<void> _onSelectMultipleImages( OnSelectMultipleImagesEvent event, Emitter<ProductsState> emit ) async {

    emit( state.copyWith( images: event.images ));

  }

  Future<void> _onUnSelectMultipleImages( OnUnSelectMultipleImagesEvent event, Emitter<ProductsState> emit) async {

    emit( state.copyWith(images: []) );

  }

/*Future<void> _onAddNewProduct(OnAddNewProductEvent event, Emitter<ProductsState> emit) async {
  try {
    emit(LoadingProductsState());
    
    // Pass XFile objects directly
    final data = await productServices.addNewProduct(
      event.name, 
      event.description, 
      event.price, 
      event.images, // Pass XFile objects directly
      event.category
    );
    
    await Future.delayed(Duration(seconds: 2));

    if(data.resp) emit(SuccessProductsState());
    else emit(FailureProductsState(data.msg));
  } catch (e) {
    emit(FailureProductsState(e.toString()));
  }
}*/

  Future<void> _onAddNewProduct(OnAddNewProductEvent event, Emitter<ProductsState> emit) async {
    emit(LoadingProductsState());
    
    try {
      // First, we need to upload all images
      final mainImageUrl = await _uploadImage(event.images[0]);
      
      if (mainImageUrl == null) {
        emit(FailureProductsState('Failed to upload main image'));
        return;
      }

      // Process thumbnail images if available
      String? thumbnail1 = event.images.length > 1 ? await _uploadImage(event.images[1]) : null;
      String? thumbnail2 = event.images.length > 2 ? await _uploadImage(event.images[2]) : null;
      String? thumbnail3 = event.images.length > 3 ? await _uploadImage(event.images[3]) : null;

      // Generate a random ID for the product (similar to how your web app might do it)
      final productId = DateTime.now().millisecondsSinceEpoch;
      
      // Prepare the product data to match your MongoDB schema
      Map<String, dynamic> productData = {
        'id': productId,
        'sellerId': await _getUserId(), // Get this from local storage or user state
        'name': event.name,
        'image': mainImageUrl,
        'thumbnail1': thumbnail1 ?? '',
        'thumbnail2': thumbnail2 ?? '',
        'thumbnail3': thumbnail3 ?? '',
        'description': event.description,
        'category': event.category.toLowerCase(),
        'new_price': double.parse(event.price),
        'old_price': double.parse(event.price) * 1.2, // Example: old price is 20% higher
        'stock': 10, // Default stock value
      };

      // Handle category-specific stock
      if (event.category.toLowerCase() == 'clothes') {
        productData['s_stock'] = 2;
        productData['m_stock'] = 3;
        productData['l_stock'] = 3;
        productData['xl_stock'] = 2;
      }

      // Add tags based on category (example implementation)
      productData['tags'] = [event.category.toLowerCase(), event.name.split(' ')[0].toLowerCase()];

      // Send the data to your server
      final resp = await http.post(
        Uri.parse('http://172.16.20.150:4000/api/add-new-product'), // Use the same endpoint as your web app
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(productData)
      );

      if (resp.statusCode == 200 || resp.statusCode == 201) {
        emit(SuccessProductsState());
      } else {
        emit(FailureProductsState('Failed to add product: ${resp.body}'));
      }
      
    } catch (e) {
      emit(FailureProductsState(e.toString()));
    }
  }

Future<String?> _uploadImage(XFile image) async {
  try {
    // Read the image as bytes
    final bytes = await image.readAsBytes();
    final fileName = image.name;
    
    // Create base64 string from bytes
    final base64Image = base64Encode(bytes);
    
    // Send the image as base64 string to your API
    final response = await http.post(
      Uri.parse('http://172.16.20.150:4000/upload-base64'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'image': base64Image,
        'filename': fileName
      })
    );
    
    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(response.body);
      return jsonResponse['image_url'];
    }
    return null;
  } catch (e) {
    print('Error uploading image: $e');
    return null;
  }
}


  Future<void> _onUpdateStatusProduct( OnUpdateStatusProductEvent event, Emitter<ProductsState> emit ) async {

    try {

      emit( LoadingProductsState() );

      final resp = await productServices.updateStatusProduct( event.idProduct, event.status );

      await Future.delayed(Duration(milliseconds: 1000));

      if( resp.resp ) emit( SuccessProductsState() );
      else emit( FailureProductsState( resp.msg ) );
      
    } catch (e) {
      emit( FailureProductsState(e.toString()) );
    }

  }

  Future<void> _onDeleteProduct( OnDeleteProductEvent event, Emitter<ProductsState> emit) async {

    try {

      emit( LoadingProductsState() );

      final resp = await productServices.deleteProduct( event.idProduct );

      await Future.delayed(Duration(seconds: 1));

      if( resp.resp ) emit( SuccessProductsState() );
      else emit( FailureProductsState(resp.msg) );
      
    } catch (e) {
      emit( FailureProductsState(e.toString()) );
    }

  }

  Future<void> _onSearchProductEvent( OnSearchProductEvent event, Emitter<ProductsState> emit) async {

    emit( state.copyWith( searchProduct: event.searchProduct ) );

  }
Future<String> _getUserId() async {
  // Use your existing secure storage instance
  final userId = await secureStorage.readUserId();
  
  if (userId == null || userId.isEmpty) {
    throw Exception('User ID not found. Please log in again.');
  }
  
  return userId;
}
}
