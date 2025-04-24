import 'dart:async';
import 'package:bloc/bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:meta/meta.dart';
import 'package:restaurant/data/local_secure/secure_storage.dart';
import 'package:restaurant/domain/bloc/user/user_bloc.dart';
import 'package:restaurant/domain/services/auth_services.dart'; // Fixed typo: auth_Services -> auth_services
import 'package:restaurant/domain/models/response/response_login.dart';
import 'package:restaurant/domain/services/user_services.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(InitialAuthState()) {
    on<LoginEvent>(_onLogin);
    on<CheckLoginEvent>(_onCheckLogin);
    on<LogOutEvent>(_onLogOut);
  }
  
Future _onLogin(LoginEvent event, Emitter emit) async {
  try {
    emit(LoadingAuthState());
    
    final data = await authServices.loginController(event.email, event.password);
    
    if (data.resp) {
      await secureStorage.deleteSecureStorage();
      await secureStorage.persistenToken(data.token);
      
      // Check if user is a seller with isApproved status
      if (data.user.rolId.toString() == '2' && data.user.isSeller == true && !data.user.isApproved) {
        emit(FailureAuthState('Your seller account is pending approval'));
        return;
      }
      
      // Fetch complete user details
      final userDetails = await userServices.getUserDetails(data.user.uid);
      
      if (userDetails.resp) {
        final String roleIdString = userDetails.user.rolId.toString();
        emit(SuccessAuthState(
          user: userDetails.user, 
          rolId: roleIdString,
          isSeller: userDetails.user.isSeller ?? false,
          shopName: userDetails.user.shopName
        ));
        
        // Pass the user to UserBloc
        final userBloc = BlocProvider.of<UserBloc>(event.context);
        userBloc.add(OnGetUserEvent(userDetails.user));
      } else {
        final String roleIdString = data.user.rolId.toString();
        emit(SuccessAuthState(
          user: data.user, 
          rolId: roleIdString,
          isSeller: data.user.isSeller ?? false,
          shopName: data.user.shopName
        ));
        
        // Pass the basic user data to UserBloc if detailed fetch fails
        final userBloc = BlocProvider.of<UserBloc>(event.context);
        userBloc.add(OnGetUserEvent(data.user));
      }
    } else {
      emit(FailureAuthState(data.msg));
    }
  } catch (e) {
    emit(FailureAuthState(e.toString()));
  }
}

  Future<void> _onCheckLogin(CheckLoginEvent event, Emitter<AuthState> emit) async {
    try {
      emit(LoadingAuthState());

      if (await secureStorage.readToken() != null) {
        final data = await authServices.renewLoginController();

        if (data.resp) {
          await secureStorage.persistenToken(data.token);
          emit(SuccessAuthState(user: data.user, rolId: data.user.rolId.toString()));
        } else {
          emit(LogOutAuthState());
        }
      } else {
        emit(LogOutAuthState());
      }
    } catch (e) {
      emit(FailureAuthState(e.toString()));
    }
  }

  Future<void> _onLogOut(LogOutEvent event, Emitter<AuthState> emit) async {
    await secureStorage.deleteSecureStorage();
    emit(LogOutAuthState());
  }
}