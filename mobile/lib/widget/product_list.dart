import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:gap/gap.dart';
import 'package:indigitech_shop/core/style/colors.dart';
import 'package:indigitech_shop/core/style/text_styles.dart';
import 'package:indigitech_shop/view/product_view.dart';

import '../model/product.dart';

class ProductList extends StatelessWidget {
  final List<Product> products;

  const ProductList({Key? key, required this.products}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlignedGridView.count(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 24),
      crossAxisCount: 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 20,
      itemCount: products.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemBuilder: (context, index) {
        Product product = products[index];
        print(product.image);

        return Container(
          width: MediaQuery.of(context).size.width / 2 - 22,
          height: 300,
          decoration: BoxDecoration(
            color: AppColors.coolGrey,
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                offset: const Offset(0, 4),
                blurRadius: 6,
                spreadRadius: 1,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => ProductView(product: product, products: products),
                    ),
                  );
                },
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    height: 200,
                    width: double.infinity,
                     child: product.image.isNotEmpty
                        ? Image.network(
                      'http://localhost:4000/upload/images/${product.image[0]}', // Check if image list is not empty
                      fit: BoxFit.contain,
                      alignment: Alignment.center,
                      errorBuilder: (context, error, stackTrace) {
                        return Center(
                          child: Image.asset('assets/images/placeholder_food.png'), // Placeholder image path
                        ); // Show a placeholder if image fails to load
                      },
                    )
                        : Center(child: Text("No image available")),
                  ),
                ),
              ),
              const Gap(15),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      overflow: TextOverflow.clip,
                      style: AppTextStyles.subtitle1.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Gap(5),
                    Wrap(
                      children: [
                        if (product.discount != 0)
                          Padding(
                            padding: const EdgeInsets.only(right: 15),
                            child: Text(
                              '₱${(product.old_price - (product.new_price * product.discount)).toStringAsFixed(2)}',
                              style: AppTextStyles.caption.copyWith(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        Text(
                          '₱${product.new_price.toStringAsFixed(2)}',
                          style: product.discount != 0
                              ? AppTextStyles.caption.copyWith(
                                  color: AppColors.greyAD,
                                  decoration: TextDecoration.lineThrough,
                                  decorationColor: AppColors.greyAD,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                )
                              : AppTextStyles.caption.copyWith(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
