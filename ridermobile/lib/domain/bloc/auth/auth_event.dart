part of 'auth_bloc.dart';

@immutable
abstract class AuthEvent {}


class LoginEvent extends AuthEvent {
  final String email;
  final String password;
final BuildContext context; // Idinagdag ang context
LoginEvent(this.email, this.password, this.context);}


class CheckLoginEvent extends AuthEvent {}


class LogOutEvent extends AuthEvent {}




