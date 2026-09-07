class ProviderProfile {
  const ProviderProfile({
    required this.name,
    required this.role,
    required this.city,
    required this.rate,
    required this.rating,
    required this.initials,
    required this.specialties,
  });

  final String name;
  final String role;
  final String city;
  final int rate;
  final double rating;
  final String initials;
  final List<String> specialties;
}

const providers = [
  ProviderProfile(
      name: 'Maya Rodriguez',
      role: 'Museum companion',
      city: 'Brooklyn, NY',
      rate: 48,
      rating: 4.9,
      initials: 'MR',
      specialties: ['Art walks', 'Conversation']),
  ProviderProfile(
      name: 'Jonah Kim',
      role: 'Language exchange',
      city: 'Manhattan, NY',
      rate: 36,
      rating: 4.8,
      initials: 'JK',
      specialties: ['Korean', 'Coffee walks']),
  ProviderProfile(
      name: 'Celine Brooks',
      role: 'Event plus-one',
      city: 'Queens, NY',
      rate: 62,
      rating: 5.0,
      initials: 'CB',
      specialties: ['Networking', 'Events']),
];
