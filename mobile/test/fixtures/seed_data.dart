import 'package:dio/dio.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/models/booking.dart';
import 'package:cue_mobile/models/chat_message.dart';
import 'package:cue_mobile/models/provider.dart';
import 'package:cue_mobile/models/user.dart';

class SeedData {
  static const User currentUser = User(
    id: 'user-guest-001',
    email: 'alex.rivera@example.com',
    firstName: 'Alex',
    lastName: 'Rivera',
    roles: ['Guest'],
    trustScore: 96,
    isVerified: true,
    bio: 'Art enthusiast and quiet explorer living in Indiranagar, Bengaluru.',
    phone: '+91 98765 43210',
    city: 'Bengaluru',
  );

  static final List<ProviderProfile> seedProviders = [
    ProviderProfile(
      id: 'prov-001',
      name: 'Ananya Sen',
      role: 'Art & Gallery Companion',
      city: 'Bengaluru (Indiranagar)',
      rate: 1500,
      rating: 4.95,
      initials: 'AS',
      specialties: const ['Art & Culture', 'Gallery walks', 'Independent coffee', 'Architecture'],
      bio:
          'Curator and visual arts graduate. Passionate about local indie galleries, heritage architectural walks in Bangalore, and reflective conversations.',
      trustScore: 98,
      isVerified: true,
      distanceKm: 2.1,
      reviewCount: 38,
      upcomingSlots: [
        AvailabilitySlot(
          id: 'slot-101',
          providerId: 'prov-001',
          startTime: DateTime.now().add(const Duration(days: 1, hours: 2)),
          endTime: DateTime.now().add(const Duration(days: 1, hours: 4)),
        ),
      ],
      reviews: [
        ProviderReview(
          id: 'rev-01',
          reviewerName: 'Rohan K.',
          rating: 5.0,
          comment:
              'Ananya was an absolute delight. Made our visit to the NGMA gallery quiet, enriching, and very relaxing.',
          createdAt: DateTime.now().subtract(const Duration(days: 3)),
        ),
      ],
    ),
    const ProviderProfile(
      id: 'prov-002',
      name: 'Kabir Varma',
      role: 'Classical Music & Concert Companion',
      city: 'Bengaluru (Koramangala)',
      rate: 1800,
      rating: 4.88,
      initials: 'KV',
      specialties: ['Classical Concerts', 'Hindustani Vocals', 'Jazz Listening', 'Philosophy'],
      bio:
          'Violinist and sound archivist. Enjoys chamber music recitals, jazz bars, and discussing literature over single-origin filter roasts.',
      trustScore: 94,
      isVerified: true,
      distanceKm: 4.8,
      reviewCount: 22,
    ),
    const ProviderProfile(
      id: 'prov-003',
      name: 'Meera Nambiar',
      role: 'Literary & Book Fair Companion',
      city: 'Bengaluru (Lavelle Road)',
      rate: 1400,
      rating: 4.92,
      initials: 'MN',
      specialties: ['Book fairs', 'Poetry readings', 'Botanical walks', 'Tea ceremonies'],
      bio:
          'Independent researcher in comparative literature. Calm presence for afternoon book hunts on Church Street and peaceful walks in Cubbon Park.',
      trustScore: 96,
      isVerified: true,
      distanceKm: 3.4,
      reviewCount: 29,
    ),
    const ProviderProfile(
      id: 'prov-004',
      name: 'Devansh Roy',
      role: 'Museum & Heritage Walk Guide',
      city: 'Mumbai (Kala Ghoda)',
      rate: 2000,
      rating: 4.90,
      initials: 'DR',
      specialties: ['Colonial history', 'Art Deco walks', 'Photography', 'Film screenings'],
      bio:
          'Architectural historian exploring the heritage of Fort and Ballard Estate. Passionate about urban restoration and archival photography.',
      trustScore: 95,
      isVerified: true,
      distanceKm: 12.5,
      reviewCount: 41,
    ),
    const ProviderProfile(
      id: 'prov-005',
      name: 'Zoya Akhtar',
      role: 'Culinary Food Walks & Tea Tasting',
      city: 'Delhi-NCR (Connaught Place)',
      rate: 2200,
      rating: 4.96,
      initials: 'ZA',
      specialties: ['Culinary walks', 'Artisanal tea tasting', 'Sufi music', 'Heritage bazaars'],
      bio:
          'Food historian and tea sommelier. Discovering Old Delhi quiet spice courtyards, artisan tea ateliers, and reflective afternoon discussions.',
      trustScore: 97,
      isVerified: true,
      distanceKm: 22.0,
      reviewCount: 54,
    ),
  ];

  static final List<Booking> seedBookings = [
    Booking(
      orderId: 'ord-bengaluru-101',
      providerId: 'prov-001',
      providerName: 'Ananya Sen',
      providerInitials: 'AS',
      seekerId: 'user-guest-001',
      seekerName: 'Alex Rivera',
      startTime: DateTime.now().add(const Duration(days: 1, hours: 2)),
      endTime: DateTime.now().add(const Duration(days: 1, hours: 4)),
      hourlyRate: 1500,
      durationHours: 2,
      providerEarnings: 3000,
      platformFee: 300,
      totalAmount: 3300,
      status: BookingStatus.confirmed,
      meetingAddress: 'National Gallery of Modern Art (NGMA), Palace Rd, Bengaluru',
      specialRequests: 'Looking forward to exploring the modern sculpture and photography pavilion.',
      arrivalPin: '482910',
      completionPin: '739184',
    ),
  ];

  static final Map<String, List<ChatMessage>> seedMessages = {
    'ord-bengaluru-101': [
      ChatMessage(
        id: 'msg-1',
        orderId: 'ord-bengaluru-101',
        senderId: 'user-guest-001',
        senderName: 'Alex Rivera',
        content: 'Hi Ananya, looking forward to our NGMA gallery walk tomorrow!',
        sentAt: DateTime.now().subtract(const Duration(hours: 4)),
        isRead: true,
      ),
      ChatMessage(
        id: 'msg-2',
        orderId: 'ord-bengaluru-101',
        senderId: 'prov-001',
        senderName: 'Ananya Sen',
        content: 'Hello Alex! Yes, absolutely. The contemporary sculpture retrospective is marvelous right now.',
        sentAt: DateTime.now().subtract(const Duration(hours: 3)),
        isRead: true,
      ),
    ],
  };
}

class FakeSeedApiClient extends ApiClient {
  FakeSeedApiClient() : super(dio: Dio());

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) async {
    if (path.contains('/discovery/providers')) {
      final jsonItems = SeedData.seedProviders.map((p) => {
        'providerId': p.id,
        'displayName': p.name,
        'photoUrl': p.photoUrl,
        'hourlyRate': p.rate,
        'bio': p.bio,
        'specialties': p.specialties,
        'averageRating': p.rating,
        'isVerified': p.isVerified,
        'trustScore': p.trustScore,
        'city': p.city,
      }).toList();

      return Response<T>(
        data: {'items': jsonItems, 'totalCount': jsonItems.length} as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }

    if (path.contains('/bookings')) {
      final jsonBookings = SeedData.seedBookings.map((b) => {
        'id': b.orderId,
        'providerId': b.providerId,
        'providerName': b.providerName,
        'seekerId': b.seekerId,
        'seekerName': b.seekerName,
        'startTime': b.startTime.toIso8601String(),
        'endTime': b.endTime.toIso8601String(),
        'totalAmount': b.totalAmount,
        'platformFee': b.platformFee,
        'status': b.status.name,
        'meetingAddress': b.meetingAddress,
        'specialRequests': b.specialRequests,
        'arrivalPin': b.arrivalPin,
        'completionPin': b.completionPin,
      }).toList();

      return Response<T>(
        data: jsonBookings as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }

    if (path.contains('/payments/wallet/balance')) {
      return Response<T>(
        data: {
          'userId': 'user-guest-001',
          'availableBalance': 25000.0,
          'pendingBalance': 3300.0,
          'currency': 'INR',
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }

    if (path.contains('/payments/wallet/transactions')) {
      return Response<T>(
        data: [
          {
            'id': 'tx_1',
            'amount': 5000.0,
            'direction': 'Credit',
            'type': 'TopUp',
            'balanceAfter': 25000.0,
            'description': 'UPI Wallet Top-Up (Google Pay)',
            'createdAt': DateTime.now().toIso8601String(),
          }
        ] as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }

    if (path.contains('/payments/provider/earnings')) {
      return Response<T>(
        data: {
          'grossRevenue': 36000.0,
          'platformCommission': 3600.0,
          'clearedBalance': 32400.0,
          'pendingBalance': 3000.0,
          'currency': 'INR',
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }

    return Response<T>(
      data: {} as T,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );
  }

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    return Response<T>(
      data: {'status': 'ok'} as T,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );
  }
}
