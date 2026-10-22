import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/models/provider.dart';

void main() {
  group('ProviderProfile Tests', () {
    test('parses from JSON correctly and derives initials', () {
      final json = {
        'providerId': 'prov-99',
        'displayName': 'Elena Rostova',
        'role': 'Culinary Guide',
        'city': 'SoHo, NY',
        'hourlyRate': 60,
        'averageRating': 4.95,
        'specialties': ['Dining & Coffee', 'Wine tasting'],
        'bio': 'Passionate food expert.',
        'trustScore': 97,
        'isVerified': true,
        'distanceKm': 1.5,
      };

      final profile = ProviderProfile.fromJson(json);

      expect(profile.id, 'prov-99');
      expect(profile.name, 'Elena Rostova');
      expect(profile.initials, 'ER');
      expect(profile.rate, 60);
      expect(profile.hourlyRate, 60);
      expect(profile.rating, 4.95);
      expect(profile.trustScore, 97);
      expect(profile.isVerified, true);
      expect(profile.specialties, contains('Wine tasting'));
    });

    test('serializes to JSON correctly', () {
      const profile = ProviderProfile(
        id: 'prov-01',
        name: 'Jonah Kim',
        role: 'Language Exchange',
        city: 'Manhattan, NY',
        rate: 36,
        rating: 4.8,
        initials: 'JK',
        specialties: ['Korean', 'Writing'],
        bio: 'Bilingual writer.',
      );

      final json = profile.toJson();
      expect(json['id'], 'prov-01');
      expect(json['name'], 'Jonah Kim');
      expect(json['rate'], 36);
      expect(json['initials'], 'JK');
    });
  });
}

