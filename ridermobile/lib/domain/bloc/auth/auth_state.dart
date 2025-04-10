part of 'auth_bloc.dart';

@immutable
abstract class AuthState {
  const AuthState();
}

class InitialAuthState extends AuthState {
  const InitialAuthState();
}

class LoadingAuthState extends AuthState {
  const LoadingAuthState();
}

class SuccessAuthState extends AuthState {
  final User? user;
  final String rolId;
  const SuccessAuthState({this.user, required this.rolId});
}

class FailureAuthState extends AuthState {
  final String error;
  const FailureAuthState(this.error);
}

class LogOutAuthState extends AuthState {
  const LogOutAuthState();
}