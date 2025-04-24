import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/domain/models/response/address_one_response.dart';
import 'package:restaurant/presentation/screens/delivery/main_screen.dart';
import 'package:restaurant/presentation/screens/intro/checking_login_screen.dart';
import 'package:provider/provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AddressHelper.initialize(); // Initialize address data here
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );

    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => AuthBloc()..add(CheckLoginEvent())),
        BlocProvider(create: (context) => GeneralBloc()),
        BlocProvider(create: (context) => ProductsBloc()),
        BlocProvider(create: (context) => CartBloc()),
        BlocProvider(create: (context) => UserBloc()),
        BlocProvider(create: (context) => MylocationmapBloc()),
        BlocProvider(create: (context) => PaymentsBloc()),
        BlocProvider(create: (context) => OrdersBloc()),
        BlocProvider(create: (context) => DeliveryBloc()),
        BlocProvider(create: (context) => MapdeliveryBloc()),
        BlocProvider(create: (context) => MapclientBloc()),
        ChangeNotifierProvider(create: (_) => ShiftProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'BizGo',
        home: CheckingLoginScreen(),
      ),
    );
  }
}