import 'package:flutter/material.dart';
import 'package:restaurant/domain/models/response/orders_by_status_response.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/date_custom.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';

class CardOrdersDelivery extends StatelessWidget {
  final OrdersResponse orderResponse;
  final Function() onPressed;

  const CardOrdersDelivery({
    required this.orderResponse,
    required this.onPressed
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(10.0),
      elevation: 1.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
      child: InkWell(
        onTap: onPressed,
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextCustom(text: 'Order ID: ${orderResponse.transactionId}'),
                  TextCustom(text: 'PHP ${orderResponse.amount.toStringAsFixed(2)}', color: ColorsFrave.primaryColor),
                ],
              ),
              const Divider(),
              TextCustom(text: 'Customer: ${orderResponse.name}'),
              const SizedBox(height: 5.0),
              TextCustom(text: 'Contact: ${orderResponse.contact}'),
              const SizedBox(height: 5.0),
              TextCustom(text: 'Address: ${orderResponse.address}', maxLine: 2),
              const SizedBox(height: 5.0),
              TextCustom(text: 'Item: ${orderResponse.item} (${orderResponse.quantity}x)'),
              const SizedBox(height: 5.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 5.0),
                    decoration: BoxDecoration(
                      color: ColorsFrave.primaryColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(5.0)
                    ),
                    child: TextCustom(text: orderResponse.status),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}