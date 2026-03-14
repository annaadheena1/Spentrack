import 'package:flutter/material.dart';

class SpenTrackController extends ChangeNotifier {
  double currentBalance = 1250.45;
  double spentToday = 89.99;

  // This is the "Engine" that runs when an SMS arrives
  void processIncomingSMS(String message) {
    // Regex to find numbers: matches things like "50.00" or "1200"
    RegExp amountRegex = RegExp(r'(\d+(?:\.\d{1,2})?)');
    Iterable<RegExpMatch> matches = amountRegex.allMatches(message);

    if (matches.length >= 2) {
      // We assume the 1st number is Spent and 2nd is New Balance
      double spent = double.parse(matches.elementAt(0).group(0)!);
      double balance = double.parse(matches.elementAt(1).group(0)!);

      spentToday += spent;
      currentBalance = balance;

      // This "runs" the UI update!
      notifyListeners();
    }
  }
}