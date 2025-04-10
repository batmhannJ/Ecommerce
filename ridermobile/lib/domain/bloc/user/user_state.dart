// Sa user_state.dart
part of 'user_bloc.dart';

@immutable
class UserState {
  final String pictureProfilePath;
  final String uidAddress;
  final String addressName;
  final User? user;

  UserState({
    this.uidAddress = '',
    this.addressName = '',
    this.pictureProfilePath = '',
    this.user,
  });

  UserState copyWith({String? uidAddress, String? addressName, String? pictureProfilePath, User? user}) => UserState(
        uidAddress: uidAddress ?? this.uidAddress,
        addressName: addressName ?? this.addressName,
        pictureProfilePath: pictureProfilePath ?? this.pictureProfilePath,
        user: user ?? this.user,
      );
}

class LoadingUserState extends UserState {
  LoadingUserState({String pictureProfilePath = '', String uidAddress = '', String addressName = '', User? user})
      : super(pictureProfilePath: pictureProfilePath, uidAddress: uidAddress, addressName: addressName, user: user);
}

class SuccessUserState extends UserState {
  SuccessUserState({String pictureProfilePath = '', String uidAddress = '', String addressName = '', User? user})
      : super(pictureProfilePath: pictureProfilePath, uidAddress: uidAddress, addressName: addressName, user: user);
}

class FailureUserState extends UserState {
  final String error;

  FailureUserState(this.error, {String pictureProfilePath = '', String uidAddress = '', String addressName = '', User? user})
      : super(pictureProfilePath: pictureProfilePath, uidAddress: uidAddress, addressName: addressName, user: user);
}