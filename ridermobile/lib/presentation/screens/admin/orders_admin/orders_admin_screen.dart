import 'package:flutter/material.dart';
import 'package:restaurant/domain/models/pay_type.dart';
import 'package:restaurant/domain/models/response/orders_by_status_response.dart';
import 'package:restaurant/domain/services/orders_services.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/date_custom.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/admin/orders_admin/order_details_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';

class OrdersAdminScreen extends StatelessWidget {

  @override
  Widget build(BuildContext context){

    return DefaultTabController(
      length: payType.length, 
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          title: const TextCustom(text: 'List Orders', fontSize: 20),
          centerTitle: true,
          leadingWidth: 80,
          leading: InkWell(
            onTap: () => Navigator.pop(context),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.arrow_back_ios_new_outlined, color: ColorsFrave.primaryColor, size: 17),
                TextCustom(text: 'Back', color: ColorsFrave.primaryColor, fontSize: 17)
              ],
            ),
          ),
          bottom: TabBar(
            indicatorWeight: 2,
            labelColor: ColorsFrave.primaryColor,
            unselectedLabelColor: Colors.grey,
            indicator: FraveIndicatorTabBar(),
            isScrollable: true,
            tabs: List<Widget>.generate(payType.length, (i) 
              => Tab(
                  child: Text(payType[i], style: GoogleFonts.getFont('Roboto', fontSize: 17))
                )
            )
          ),
        ),
        body: TabBarView(
          children: payType.map((e) 
            => // Inside your TabBarView's FutureBuilder
FutureBuilder<List<OrdersResponse>>(
  future: ordersServices.getOrdersByStatus(e),
  builder: (context, snapshot) {
    print('FutureBuilder state: ${snapshot.connectionState}');
    print('Has data: ${snapshot.hasData}');
    print('Has error: ${snapshot.hasError}');
    if (snapshot.hasError) print('Error: ${snapshot.error}');
    
    if (snapshot.hasData) {
      print('Data length: ${snapshot.data!.length}');
      if (snapshot.data!.isEmpty) {
        print('Data is empty list, but hasData is true');
      } else {
        print('First item ID: ${snapshot.data![0].id}');
      }
    }
    
    return (!snapshot.hasData)
      ? Column(
          children: const [
            ShimmerFrave(),
            SizedBox(height: 10),
            ShimmerFrave(),
            SizedBox(height: 10),
            ShimmerFrave(),
          ],
        )
      : _ListOrders(listOrders: snapshot.data!);
  }
)
          ).toList(),
        ),
      )
    );
  }   
}


class _ListOrders extends StatelessWidget {
  final List<OrdersResponse> listOrders;

  const _ListOrders({required this.listOrders});

  @override
  Widget build(BuildContext context) {
    print('Number of orders to display: ${listOrders.length}');
    for (var order in listOrders) {
      print('Order ID: ${order.id}, Client: ${order.name}');
    }
    
    return ListView.builder(
      itemCount: listOrders.length,
      itemBuilder: (context, i) {
        print('Building item at index $i');
        return _CardOrders(orderResponse: listOrders[i]);
      },
    );
  }
}

class _CardOrders extends StatelessWidget {
  final OrdersResponse orderResponse;

  const _CardOrders({required this.orderResponse});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(15.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10.0),
        boxShadow: [
          BoxShadow(color: Colors.blueGrey, blurRadius: 8, spreadRadius: -5)
        ],
      ),
      width: MediaQuery.of(context).size.width,
      child: InkWell(
        onTap: () => Navigator.push(
            context, routeFrave(page: OrderDetailsScreen(order: orderResponse))),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextCustom(text: 'ORDER ID: ${orderResponse.id}'),
              const Divider(),
              const SizedBox(height: 10.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const TextCustom(
                      text: 'Date',
                      fontSize: 16,
                      color: ColorsFrave.secundaryColor),
                  TextCustom(
                      text: DateCustom.getDateOrder(
                          orderResponse.date.toString()),
                      fontSize: 16),
                ],
              ),
              const SizedBox(height: 10.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const TextCustom(
                      text: 'Client',
                      fontSize: 16,
                      color: ColorsFrave.secundaryColor),
                  TextCustom(
                      text: orderResponse.name,
                      fontSize: 16),
                ],
              ),
              const SizedBox(height: 10.0),
              const TextCustom(
                  text: 'Address shipping',
                  fontSize: 16,
                  color: ColorsFrave.secundaryColor),
              const SizedBox(height: 5.0),
              Align(
                alignment: Alignment.centerRight,
                child: TextCustom(
                    text: orderResponse.address,
                    fontSize: 16,
                    maxLine: 2),
              ),
              const SizedBox(height: 5.0),
            ],
          ),
        ),
      ),
    );
  }
}