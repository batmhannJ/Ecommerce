import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:restaurant/data/env/environment.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/domain/models/response/category_all_response.dart';
import 'package:restaurant/domain/models/response/products_top_home_response.dart';
import 'package:restaurant/domain/services/services.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/date_custom.dart';
import 'package:restaurant/presentation/screens/client/cart_client_screen.dart';
import 'package:restaurant/presentation/screens/client/details_product_screen.dart';
import 'package:restaurant/presentation/screens/client/search_for_category_screen.dart';
import 'package:restaurant/presentation/screens/profile/list_addresses_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';

class ClientHomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authBloc = BlocProvider.of<AuthBloc>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          physics: const BouncingScrollPhysics(),
          children: [
            const SizedBox(height: 20.0),
            BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                if (state is SuccessAuthState && state.user != null) {
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            height: 45,
                            width: 45,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              image: DecorationImage(
                                fit: BoxFit.cover,
                                image: NetworkImage('${Environment.endpointBase}${state.user!.image}'),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8.0),
                          TextCustom(
                            text: DateCustom.getDateFrave() + ', ${state.user!.firstName}',
                            fontSize: 17,
                            color: ColorsFrave.secundaryColor,
                          ),
                        ],
                      ),
                      InkWell(
                        onTap: () => Navigator.pushReplacement(context, routeFrave(page: CartClientScreen())),
                        child: Stack(
                          children: [
                            const Icon(Icons.shopping_bag_outlined, size: 30),
                            Positioned(
                              right: 0,
                              bottom: 5,
                              child: Container(
                                height: 20,
                                width: 15,
                                decoration: const BoxDecoration(
                                  color: Color(0xff0C6CF2),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: BlocBuilder<CartBloc, CartState>(
                                    builder: (context, state) => TextCustom(
                                      text: state.quantityCart.toString(),
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }
                // Fallback UI when not in SuccessAuthState or user is null
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          height: 45,
                          width: 45,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.grey, // Placeholder
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        const TextCustom(
                          text: 'Loading...',
                          fontSize: 17,
                          color: Colors.grey,
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: () => Navigator.pushReplacement(context, routeFrave(page: CartClientScreen())),
                      child: Stack(
                        children: [
                          const Icon(Icons.shopping_bag_outlined, size: 30),
                          Positioned(
                            right: 0,
                            bottom: 5,
                            child: Container(
                              height: 20,
                              width: 15,
                              decoration: const BoxDecoration(
                                color: Color(0xff0C6CF2),
                                shape: BoxShape.circle,
                              ),
                              child: const Center(
                                child: TextCustom(
                                  text: '0',
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 20.0),
            const Padding(
              padding: EdgeInsets.only(right: 50.0),
              child: TextCustom(text: 'What do you want eat today?', fontSize: 28, maxLine: 2, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 20.0),
           Row(
  children: [
    Container(
      height: 60,
      width: 60,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(15.0),
      ),
      child: const Icon(Icons.place_outlined, size: 38, color: Colors.grey),
    ),
    const SizedBox(width: 10.0),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const TextCustom(text: 'Address'),
        InkWell(
          onTap: () => Navigator.push(context, routeFrave(page: ListAddressesScreen())),
          child: BlocBuilder<UserBloc, UserState>(
            builder: (context, state) {
              String addressDisplay = 'without direction';
              if (state.user?.address != null) {
                addressDisplay = state.user!.address!.getFormattedAddress();
              } else if (state.addressName.isNotEmpty) {
                addressDisplay = state.addressName;
              }
              return TextCustom(
                text: addressDisplay,
                color: ColorsFrave.primaryColor,
                fontSize: 17,
                maxLine: 1,
              );
            },
          ),
        ),
      ],
    ),
  ],
),
            const SizedBox(height: 20.0),
            FutureBuilder<List<Category>>(
              future: categoryServices.getAllCategories(),
              builder: (context, snapshot) {
                final List<Category>? category = snapshot.data;

                return !snapshot.hasData
                    ? const ShimmerFrave()
                    : Container(
                        height: 45,
                        child: ListView.builder(
                          physics: const BouncingScrollPhysics(),
                          scrollDirection: Axis.horizontal,
                          itemCount: category!.length,
                          itemBuilder: (context, i) => InkWell(
                            splashColor: Colors.transparent,
                            highlightColor: Colors.transparent,
onTap: () {
  // Try to parse the ID to int
  int categoryId;
  try {
    categoryId = int.parse(category[i].id);
  } catch (e) {
    // Handle parsing error
    print('Error parsing category ID: ${category[i].id}');
    categoryId = 0; // Default value
  }
  
  Navigator.push(
    context, 
    routeFrave(page: SearchForCategoryScreen(
      idCategory: categoryId, 
      category: category[i].name
    ))
  );
},
                            child: Container(
                              alignment: Alignment.center,
                              margin: const EdgeInsets.only(right: 10.0),
                              padding: const EdgeInsets.symmetric(horizontal: 20.0),
                              decoration: BoxDecoration(
                                color: Color(0xff5469D4).withOpacity(.1),
                                borderRadius: BorderRadius.circular(25.0),
                              ),
                              child: TextCustom(text: category[i].name),
                            ),
                          ),
                        ),
                      );
              },
            ),
            const SizedBox(height: 20.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                TextCustom(text: 'Popular Items', fontSize: 21, fontWeight: FontWeight.w500),
                TextCustom(text: 'See All', color: ColorsFrave.primaryColor, fontSize: 17),
              ],
            ),
            const SizedBox(height: 20.0),
            _ListProducts(),
            const SizedBox(height: 20.0),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationFrave(0),
    );
  }
}

class _ListProducts extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Productsdb>>(
      future: productServices.getProductsTopHome(),
      builder: (_, snapshot) {
        final List<Productsdb>? listProduct = snapshot.data;

        if (!snapshot.hasData || listProduct == null || listProduct.isEmpty) {
          return Column(
            children: const [
              ShimmerFrave(),
              SizedBox(height: 10.0),
              ShimmerFrave(),
              SizedBox(height: 10.0),
              ShimmerFrave(),
            ],
          );
        }

        return GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 25,
            mainAxisSpacing: 20,
            mainAxisExtent: 220,
          ),
          itemCount: listProduct.length, // No need for null check here since we checked above
          itemBuilder: (_, i) {
            // Using null-safe approach
            final product = listProduct[i];
// In your GridView.builder where you're loading images
final String baseImagePath = '${Environment.endpointBase}upload/images/';
final String imageUrl = product.picture.isNotEmpty 
    ? baseImagePath + product.picture 
    : 'https://via.placeholder.com/150';

print('Trying to load image from: $imageUrl'); // Debug print
            
            return Container(
              padding: const EdgeInsets.all(10.0),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(20.0),
              ),
              child: GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => DetailsProductScreen(product: product)),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      child: Hero(
                        tag: product.id,
                        child: Image.network(
                          imageUrl,
                          height: 150,
                          errorBuilder: (context, error, stackTrace) {
                            print('Error loading image: $error');
                            return Image.asset('assets/no_image.png', height: 150);
                            // Or use a placeholder:
                            // return Image.network('https://via.placeholder.com/150');
                          },
                        ),
                      ),
                    ),
                    TextCustom(
                      text: product.nameProduct,
                      textOverflow: TextOverflow.ellipsis,
                      fontWeight: FontWeight.w500,
                      color: ColorsFrave.primaryColor,
                      fontSize: 19,
                    ),
                    const SizedBox(height: 5.0),
                    TextCustom(
                      text: '\₱ ${product.price.toString()}',
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}