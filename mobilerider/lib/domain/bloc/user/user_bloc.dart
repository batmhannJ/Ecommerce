import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:meta/meta.dart';
import 'package:bloc/bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:restaurant/domain/models/response/response_login.dart';
import 'package:restaurant/domain/services/push_notification.dart';
import 'package:restaurant/domain/services/user_services.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {

  UserBloc() : super(UserState()){

    on<OnGetUserEvent>(_onGetUser );
    on<OnSelectPictureEvent>(_onSelectPicture);
    on<OnClearPicturePathEvent>(_onClearPicturePath);
    on<OnChangeImageProfileEvent>( _onChangePictureProfile );
    on<OnEditUserEvent>( _onEditProfileUser );
    on<OnChangePasswordEvent>( _onChangePassword );
    on<OnRegisterClientEvent>( _onRegisterClient );
    on<OnRegisterDeliveryEvent>( _onRegisterDelivery );
    on<OnUpdateDeliveryToClientEvent>( _onUpdateDeliveryToClient );
    on<OnDeleteStreetAddressEvent>( _onDeleteStreetAddress );
    on<OnSelectAddressButtonEvent>( _onSelectAddressButton );
    on<OnAddNewAddressEvent>( _onAddNewStreetAddress );
  }


  Future<void> _onGetUser(OnGetUserEvent event, Emitter<UserState> emit) async {

    emit( state.copyWith( user: event.user ));

  }

  Future<void> _onSelectPicture( OnSelectPictureEvent event, Emitter<UserState> emit) async {

    emit( state.copyWith( pictureProfilePath: event.pictureProfilePath ) );

  }

  Future<void> _onClearPicturePath(OnClearPicturePathEvent event, Emitter<UserState> emit) async {

    emit( state.copyWith( pictureProfilePath: '' ));

  }

  Future<void> _onChangePictureProfile( OnChangeImageProfileEvent event, Emitter<UserState> emit ) async {

    try {

      emit( LoadingUserState() );

      final data = await userServices.changeImageProfile(event.image);

      if( data.resp ){

        final user = await userServices.getUserById();

        emit( SuccessUserState() );

        emit( state.copyWith(user: user));

      }else{
        emit( FailureUserState(data.msg) );
      }
      
    } catch (e) {
      emit( FailureUserState(e.toString()) );
    }

  }

  Future<void> _onEditProfileUser( OnEditUserEvent event, Emitter<UserState> emit ) async {

    try {

      emit( LoadingUserState() );

      final data = await userServices.editProfile(event.name, event.lastname, event.phone);

      if( data.resp ){

        final user = await userServices.getUserById();

        emit( SuccessUserState() );

        emit( state.copyWith( user: user ));

      } else {
        emit( FailureUserState(data.msg) );
      }
      
    } catch (e) {
      emit( FailureUserState(e.toString()) );
    }

  }

  Future<void> _onChangePassword( OnChangePasswordEvent event, Emitter<UserState> emit ) async {

    try {

      emit( LoadingUserState() );

      final data = await userServices.changePassword(event.currentPassword, event.newPassword);

      if( data.resp ){

        final user = await userServices.getUserById();

        emit( SuccessUserState() );

        emit( state.copyWith( user: user ));

      }else{
        emit( FailureUserState(data.msg) );
      }
      
    } catch (e) {
      emit( FailureUserState(e.toString()) );
    }

  }
  
 Future<void> _onRegisterClient(OnRegisterClientEvent event, Emitter<UserState> emit) async {
  try {
    emit(LoadingUserState());
    final nToken = await pushNotification.getNotificationToken();
    final data = await userServices.registerClient(event.name, event.lastname, event.phone, event.image, event.email, event.password, nToken!);
    if (data.resp) {
      final user = await userServices.getUserById(); // Fetch the user after registration
      emit(SuccessUserState());
      emit(state.copyWith(user: user)); // Set the user in state
    } else {
      emit(FailureUserState(data.msg));
    }
  } catch (e) {
    emit(FailureUserState(e.toString()));
  }
}

  Future<void> _onRegisterDelivery( OnRegisterDeliveryEvent event, Emitter<UserState> emit) async {

    try {

      emit( LoadingUserState() );

      final nToken = await pushNotification.getNotificationToken();

      final data = await userServices.registerDelivery(event.name, event.lastname, event.phone, event.email, event.password, event.image, nToken!);

      if( data.resp ) {
        
        final user = await userServices.getUserById();

        emit( SuccessUserState() );

        emit( state.copyWith( user: user ));

      } else emit( FailureUserState(data.msg));
      
    } catch (e) {
      emit( FailureUserState(e.toString()) );
    }

  }

  Future<void> _onUpdateDeliveryToClient( OnUpdateDeliveryToClientEvent event, Emitter<UserState> emit) async {

    try {

      emit( LoadingUserState() );

      final data = await userServices.updateDeliveryToClient(event.idPerson);

      if( data.resp ){

        final user = await userServices.getUserById();

        emit( SuccessUserState() );

        emit( state.copyWith(user: user) );

      }else{
        emit( FailureUserState(data.msg) );
      }
      
    } catch (e) {
      emit( FailureUserState(e.toString()));
    }

  }

  Future<void> _onDeleteStreetAddress( OnDeleteStreetAddressEvent event, Emitter<UserState> emit) async {

    try {

      emit( LoadingUserState() );

      final data = await userServices.deleteStreetAddress( event.uid.toString() );

      if( data.resp ){

        final user = await userServices.getUserById();

        emit( SuccessUserState() );

        emit( state.copyWith( user: user ));

      }else {
        emit( FailureUserState(data.msg) );
      }


    } catch (e) {
      emit( FailureUserState(e.toString()) );
    }

  }

  Future<void> _onSelectAddressButton( OnSelectAddressButtonEvent event, Emitter<UserState> emit) async {

    emit( state.copyWith( uidAddress: event.uidAddress, addressName: event.addressName ) );

  }// In your UserBloc class

Future<void> _onAddNewStreetAddress(OnAddNewAddressEvent event, Emitter<UserState> emit) async {
  try {
    // Store the current user before changing state
    final currentUser = state.user;
    
    emit(LoadingUserState());
    
    print('User ID in _onAddNewStreetAddress: ${currentUser?.uid}');
    if (currentUser == null) {
      emit(FailureUserState('No user found in state. Please log in first.'));
      return;
    }

    final userId = currentUser.uid;
    print('Proceeding with User ID: $userId');

    try {
      final response = await http.post(
        Uri.parse('http://172.16.20.150:4000/api/add-new-address'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'street': event.street,
          'reference': event.reference,
          'latitude': event.location.latitude,
          'longitude': event.location.longitude,
        }),
      );

      if (response.statusCode == 200) {
        // Emit ONLY the success state - don't try to update the user
        // or trigger any other state changes afterwards
        emit(SuccessUserState());
        
        // Don't do this:
        // final user = await userServices.getUserById();
        // final userdb = await userServices.getAddressOne();
        // if (userdb != null && userdb.address != null) {
        //   add(OnSelectAddressButtonEvent(userdb.address.id, userdb.address.reference));
        // }
        // if (user != null) {
        //   emit(state.copyWith(user: user));
        // } else {
        //   emit(state.copyWith(user: currentUser));
        // }
      } else {
        emit(FailureUserState('Failed to add address: ${response.body}'));
      }
    } catch (e) {
      print('HTTP error: $e');
      emit(FailureUserState(e.toString()));
    }
  } catch (e) {
    print('Exception in _onAddNewStreetAddress: $e');
    emit(FailureUserState(e.toString()));
  }
}

}
