part of 'products_bloc.dart';

@immutable
class ProductsState {

  final String idCategory; // Changed from int to String
  final String? category;
  final List<XFile>? images;
  final String searchProduct;

  ProductsState({
    this.idCategory = "", // Default empty string 
    this.category,
    this.images,
    this.searchProduct = ''
  });

  ProductsState copyWith({ String? idCategory, String? category, List<XFile>? images, String? searchProduct })
    => ProductsState(
      idCategory: idCategory ?? this.idCategory,
      category: category ?? this.category,
      images: images ?? this.images,
      searchProduct: searchProduct ?? this.searchProduct
    );

}


class LoadingProductsState extends ProductsState {}

class SuccessProductsState extends ProductsState {}

class FailureProductsState extends ProductsState {
  final String error;

  FailureProductsState(this.error);
}