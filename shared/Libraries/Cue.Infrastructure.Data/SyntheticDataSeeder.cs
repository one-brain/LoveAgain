using System.Security.Cryptography;
using Cue.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cue.Infrastructure.Data;

public static class SyntheticDataSeeder
{
    private static readonly Guid ElenaUserId = Guid.Parse("158b9ff7-19de-49ce-a57c-b37738591285");
    private static readonly Guid MarcusUserId = Guid.Parse("6d187ed5-aff0-4fa3-856c-9beb89264b15");
    private static readonly Guid SophiaUserId = Guid.Parse("010e1920-fdf6-4419-85c1-95d284c6730d");
    private static readonly Guid DemoClientUserId = Guid.Parse("120f367a-2ba7-42b7-a2d3-cd8b60258313");
    private static readonly Guid NaveenGmailUserId = Guid.Parse("4f9ba8b9-395f-4c06-9644-9421618cb5ef");
    private static readonly Guid NaveenKumarUserId = Guid.Parse("6a5cafe3-2be9-4197-abce-8f550a6eac2c");
    private static readonly Guid AlexSeekerUserId = Guid.Parse("6d59d945-c2ea-42e6-b195-34737b8cde33");
    private static readonly Guid AdminUserId = Guid.Parse("252510bb-6edb-41d0-898c-c62dd48060e1");

    private static readonly string[][] FemalePortraits =
    [
        [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
        ]
    ];

    private static readonly string[][] MalePortraits =
    [
        [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
        ],
        [
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
        ]
    ];

    private sealed record HubSpec(string City, string Area, double Lat, double Lon);

    private static readonly HubSpec[] MetroHubs =
    [
        new("Bengaluru", "Indiranagar", 12.9784, 77.6408),
        new("Bengaluru", "Koramangala", 12.9352, 77.6245),
        new("Bengaluru", "Central (MG Road)", 12.9716, 77.5946),
        new("Bengaluru", "HSR Layout", 12.9121, 77.6446),
        new("Bengaluru", "Whitefield", 12.9698, 77.7500),
        new("Mumbai", "Bandra West", 19.0596, 72.8295),
        new("Mumbai", "BKC", 19.0662, 72.8682),
        new("Mumbai", "South Mumbai (Colaba)", 18.9220, 72.8347),
        new("Mumbai", "Andheri West", 19.1136, 72.8697),
        new("Mumbai", "Juhu", 19.1075, 72.8263),
        new("Mumbai", "Dadar West", 19.0178, 72.8478),
        new("Delhi-NCR", "Connaught Place", 28.6315, 77.2167),
        new("Delhi-NCR", "Cyber City, Gurgaon", 28.4950, 77.0895),
        new("Delhi-NCR", "South Delhi (Hauz Khas)", 28.5494, 77.2001),
        new("Delhi-NCR", "Sector 18, Noida", 28.5708, 77.3261),
        new("Hyderabad", "Hitec City", 17.4435, 78.3772),
        new("Hyderabad", "Jubilee Hills", 17.4325, 78.4071),
        new("Hyderabad", "Gachibowli", 17.4401, 78.3489),
        new("Hyderabad", "Banjara Hills", 17.4156, 78.4347),
        new("Pune", "Koregaon Park", 18.5362, 73.8940),
        new("Pune", "Kalyani Nagar", 18.5484, 73.9038),
        new("Pune", "Baner", 18.5590, 73.7868),
        new("Chennai", "Nungambakkam", 13.0569, 80.2425),
        new("Chennai", "Adyar", 13.0012, 80.2565),
        new("Kolkata", "Park Street", 22.5510, 88.3524),
        new("Kolkata", "Salt Lake", 22.5867, 88.4178)
    ];

    private sealed record SyntheticPersona(
        int Index,
        string FirstName,
        string LastName,
        string Gender,
        int HubIndex,
        decimal HourlyRate,
        decimal Rating,
        int TrustScore,
        string Bio,
        string[] Specialties,
        VerificationStatus Status,
        bool IsActive,
        string? RejectionReason = null,
        string? IntroVideoUrl = null,
        bool IsPureSeeker = false);

    public static async Task SeedAsync(CueDbContext dbContext, CancellationToken cancellationToken = default)
    {
        try
        {
            await dbContext.Database.ExecuteSqlRawAsync("SELECT pg_advisory_lock(20261028);", cancellationToken);
            try
            {
                await ExecuteSeedInternalAsync(dbContext, cancellationToken);
            }
            finally
            {
                await dbContext.Database.ExecuteSqlRawAsync("SELECT pg_advisory_unlock(20261028);", cancellationToken);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SyntheticDataSeeder] Notice during seeding: {ex.Message} | Inner: {ex.InnerException?.Message}\n{ex.StackTrace}");
        }
    }

    private static async Task ExecuteSeedInternalAsync(CueDbContext dbContext, CancellationToken cancellationToken)
    {
        // 1. Always repair legacy corrupted rows first
        await RepairLegacyDataAsync(dbContext, cancellationToken);

        // 2. Check if our 100 synthetic profiles are already seeded
        var markerUserId = BuildDeterministicGuid(100);
        var alreadySeeded = await dbContext.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Id == markerUserId, cancellationToken);

        if (alreadySeeded)
        {
            return;
        }

        Console.WriteLine("[SyntheticDataSeeder] Seeding 100 realistic profiles and multi-scenario operational data...");

        var passwordHash = ComputeDefaultPasswordHash("CueDemo123!");
        var personas = Build100Personas();

        var existingEmails = (await dbContext.Users
            .IgnoreQueryFilters()
            .Select(u => u.Email.ToLower())
            .ToListAsync(cancellationToken))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var existingUserIds = (await dbContext.Users
            .IgnoreQueryFilters()
            .Select(u => u.Id)
            .ToListAsync(cancellationToken))
            .ToHashSet();

        var existingProfileUserIds = (await dbContext.ProviderProfiles
            .IgnoreQueryFilters()
            .Select(p => p.UserId)
            .ToListAsync(cancellationToken))
            .ToHashSet();

        var now = DateTime.UtcNow;
        var activeProviderIds = new List<(Guid UserId, decimal Rate, string DisplayName, string City, string Area, string[] Specialties)>();
        var seekerIds = new List<Guid>();
        var pendingProfiles = new List<ProviderProfile>();

        // 2a. Always seed primary platform accounts (Admin, Demo Seeker, Flagship Companions) first
        SeedBasePlatformAccounts(
            dbContext,
            existingUserIds,
            existingEmails,
            existingProfileUserIds,
            pendingProfiles,
            activeProviderIds,
            seekerIds,
            passwordHash,
            now);

        foreach (var p in personas)
        {
            var userId = BuildDeterministicGuid(p.Index);
            var profileId = BuildDeterministicProfileGuid(p.Index);
            var email = $"{p.FirstName.ToLowerInvariant().Replace(".", "").Replace(" ", "")}.{p.LastName.ToLowerInvariant().Replace(".", "").Replace(" ", "").Replace("(", "").Replace(")", "")}.{p.Index}@cue.in";
            var phone = $"+91 98{p.Index:D2}{(100000 + p.Index * 7919) % 900000:D6}";
            var hub = MetroHubs[p.HubIndex % MetroHubs.Length];
            var latOffset = ((p.Index % 7) - 3) * 0.0042;
            var lonOffset = ((p.Index % 5) - 2) * 0.0042;
            var lat = Math.Round(hub.Lat + latOffset, 6);
            var lon = Math.Round(hub.Lon + lonOffset, 6);

            var portraits = string.Equals(p.Gender, "Male", StringComparison.OrdinalIgnoreCase)
                ? MalePortraits[p.Index % MalePortraits.Length]
                : FemalePortraits[p.Index % FemalePortraits.Length];

            var createdAt = now.AddDays(-(105 - p.Index)).AddHours(-(p.Index % 12));
            var roles = p.IsPureSeeker
                ? new[] { UserRole.Seeker }
                : (p.Status == VerificationStatus.Approved
                    ? new[] { UserRole.Seeker, UserRole.Provider }
                    : new[] { UserRole.Seeker });

            if (!existingUserIds.Contains(userId) && !existingEmails.Contains(email))
            {
                var dob = new DateOnly(1982 + (p.Index % 20), (p.Index % 12) + 1, (p.Index % 27) + 1);
                var user = User.Seed(
                    userId,
                    email,
                    p.FirstName,
                    p.LastName,
                    phone,
                    portraits[0],
                    passwordHash,
                    roles,
                    isVerified: p.Status == VerificationStatus.Approved || p.IsPureSeeker,
                    trustScore: p.TrustScore,
                    dateOfBirth: dob,
                    createdAt: createdAt);

                await dbContext.Users.AddAsync(user, cancellationToken);
                existingUserIds.Add(userId);
                existingEmails.Add(email);
            }

            // Skip if the user row could not be created (e.g., email collision with a different id)
            if (!existingUserIds.Contains(userId))
            {
                continue;
            }

            if (p.IsPureSeeker)
            {
                seekerIds.Add(userId);
                continue;
            }

            if (!existingProfileUserIds.Contains(userId))
            {
                var displayName = $"{p.FirstName} {p.LastName}".Trim();
                var idProofUrl = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80";
                var selfieUrl = portraits[0];
                var reviewedAt = p.Status is VerificationStatus.Approved or VerificationStatus.Rejected or VerificationStatus.Suspended
                    ? createdAt.AddHours(6)
                    : (DateTime?)null;

                var profile = ProviderProfile.Seed(
                    profileId,
                    userId,
                    displayName,
                    p.Gender,
                    hub.City,
                    hub.Area,
                    p.HourlyRate,
                    p.Bio,
                    p.Specialties,
                    portraits,
                    lat,
                    lon,
                    maxRadiusKm: 25 + (p.Index % 4) * 5,
                    averageRating: p.Rating,
                    status: p.Status,
                    isActive: p.IsActive,
                    idProofUrl: idProofUrl,
                    selfieUrl: selfieUrl,
                    rejectionReason: p.RejectionReason,
                    reviewedAt: reviewedAt,
                    introVideoUrl: p.IntroVideoUrl,
                    createdAt: createdAt);

                pendingProfiles.Add(profile);
                existingProfileUserIds.Add(userId);

                if (p.Status == VerificationStatus.Approved && p.IsActive)
                {
                    activeProviderIds.Add((userId, p.HourlyRate, displayName, hub.City, hub.Area, p.Specialties));
                }
            }
        }

        // Persist users first: EF has no navigation between User and ProviderProfile,
        // so it cannot order the inserts to satisfy provider_profiles_user_id_fkey.
        await dbContext.SaveChangesAsync(cancellationToken);

        if (pendingProfiles.Count > 0)
        {
            await dbContext.ProviderProfiles.AddRangeAsync(pendingProfiles, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        activeProviderIds = activeProviderIds.Where(a => existingUserIds.Contains(a.UserId)).ToList();

        // 3. Seed upcoming Availability Slots across next 7 days for active companions
        await SeedAvailabilitySlotsAsync(dbContext, activeProviderIds, now, cancellationToken);

        // 4. Seed Multi-Scenario Bookings, Wallets, Escrow Holds, Payouts, Reviews, Chat & Disputes
        await SeedOperationalScenariosAsync(dbContext, activeProviderIds, seekerIds, now, cancellationToken);

        Console.WriteLine("[SyntheticDataSeeder] Successfully seeded 100 profiles and all operational scenarios.");
    }

    private static void SeedBasePlatformAccounts(
        CueDbContext dbContext,
        HashSet<Guid> existingUserIds,
        HashSet<string> existingEmails,
        HashSet<Guid> existingProfileUserIds,
        List<ProviderProfile> pendingProfiles,
        List<(Guid UserId, decimal Rate, string DisplayName, string City, string Area, string[] Specialties)> activeProviderIds,
        List<Guid> seekerIds,
        string defaultPasswordHash,
        DateTime now)
    {
        // 1. Admin account (admin@cue.local / CueAdmin123!)
        if (!existingUserIds.Contains(AdminUserId) && !existingEmails.Contains("admin@cue.local"))
        {
            var adminPasswordHash = ComputeDefaultPasswordHash("CueAdmin123!");
            var adminUser = User.Seed(
                AdminUserId,
                "admin@cue.local",
                "Cue",
                "Admin",
                "+91 99000 00001",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                adminPasswordHash,
                new[] { UserRole.Admin },
                isVerified: true,
                trustScore: 100,
                createdAt: now.AddDays(-120));
            dbContext.Users.Add(adminUser);
            existingUserIds.Add(AdminUserId);
            existingEmails.Add("admin@cue.local");
        }

        // 2. Primary Seeker demo account (demo@cue.local / CueDemo123!)
        if (!existingUserIds.Contains(DemoClientUserId) && !existingEmails.Contains("demo@cue.local"))
        {
            var demoUser = User.Seed(
                DemoClientUserId,
                "demo@cue.local",
                "Demo",
                "Client",
                "+91 99000 00002",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
                defaultPasswordHash,
                new[] { UserRole.Seeker },
                isVerified: true,
                trustScore: 100,
                createdAt: now.AddDays(-120));
            dbContext.Users.Add(demoUser);
            existingUserIds.Add(DemoClientUserId);
            existingEmails.Add("demo@cue.local");
        }
        if (!seekerIds.Contains(DemoClientUserId)) seekerIds.Add(DemoClientUserId);

        // 3. Secondary Seeker account (alex.seeker@cue.local / CueDemo123!)
        if (!existingUserIds.Contains(AlexSeekerUserId) && !existingEmails.Contains("alex.seeker@cue.local"))
        {
            var alexUser = User.Seed(
                AlexSeekerUserId,
                "alex.seeker@cue.local",
                "Alex",
                "Seeker",
                "+91 99000 00003",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
                defaultPasswordHash,
                new[] { UserRole.Seeker },
                isVerified: true,
                trustScore: 98,
                createdAt: now.AddDays(-110));
            dbContext.Users.Add(alexUser);
            existingUserIds.Add(AlexSeekerUserId);
            existingEmails.Add("alex.seeker@cue.local");
        }
        if (!seekerIds.Contains(AlexSeekerUserId)) seekerIds.Add(AlexSeekerUserId);

        // 4. Flagship Companions
        var flagshipCompanions = new (Guid UserId, Guid ProfileId, string Email, string FirstName, string LastName, string Phone, string Gender, string City, string Area, decimal Rate, decimal Rating, string Bio, string[] Specialties, double Lat, double Lon)[]
        {
            (ElenaUserId, Guid.Parse("158b9ff7-19de-49ce-a57c-b37738591286"), "elena.provider@cue.com", "Elena", "Rostova", "+91 98450 11223", "Female", "Bengaluru", "Indiranagar", 1500m, 4.98m,
             "Semi-pro tennis coach, contemporary art curator, and bilingual city companion in Indiranagar.", ["Tennis", "Yoga Partner", "Museum Walk", "Gym Spotter"], 12.9784, 77.6408),
            (MarcusUserId, Guid.Parse("6d187ed5-aff0-4fa3-856c-9beb89264b16"), "marcus.provider@cue.com", "Marcus", "Vance", "+91 98201 44556", "Male", "Mumbai", "Bandra West", 1800m, 4.95m,
             "Commercial portrait photographer and Mumbai street foodie guide. Available for photo walks and culinary outings.", ["Photography", "Cooking & Baking", "City Tour", "Cafe & Chat"], 19.0596, 72.8295),
            (SophiaUserId, Guid.Parse("010e1920-fdf6-4419-85c1-95d284c6730e"), "sophia.provider@cue.com", "Dr. Sophia", "Chen", "+91 98111 88990", "Female", "Delhi-NCR", "South Delhi (Hauz Khas)", 1200m, 4.94m,
             "Cognitive neuroscientist, classical violinist, and serene nature walk companion in Hauz Khas.", ["Hiking", "Yoga Partner", "Violin", "City Tour"], 28.5494, 77.2001),
            (NaveenGmailUserId, Guid.Parse("4f9ba8b9-395f-4c06-9644-9421618cb5f0"), "naveen.bathina@gmail.com", "Naveen", "Bathina", "+91 99450 33445", "Male", "Bengaluru", "Koramangala", 1500m, 4.95m,
             "Full-stack product builder, weekend cyclist, and heritage walk host in Koramangala.", ["Coding Mentorship", "City Tour", "Cafe & Chat"], 12.9352, 77.6245),
            (NaveenKumarUserId, Guid.Parse("6a5cafe3-2be9-4197-abce-8f550a6eac2d"), "naveenkumar.b2003@gmail.com", "Naveen", "Kumar", "+91 99160 55667", "Male", "Bengaluru", "HSR Layout", 1600m, 4.92m,
             "Competitive badminton player, fitness enthusiast, and specialty coffee lover in HSR Layout.", ["Badminton Rally", "Gym Spotter", "Cafe & Chat"], 12.9121, 77.6446)
        };

        foreach (var c in flagshipCompanions)
        {
            var portraits = string.Equals(c.Gender, "Male", StringComparison.OrdinalIgnoreCase)
                ? MalePortraits[0]
                : FemalePortraits[0];

            if (!existingUserIds.Contains(c.UserId) && !existingEmails.Contains(c.Email))
            {
                var user = User.Seed(
                    c.UserId,
                    c.Email,
                    c.FirstName,
                    c.LastName,
                    c.Phone,
                    portraits[0],
                    defaultPasswordHash,
                    new[] { UserRole.Seeker, UserRole.Provider },
                    isVerified: true,
                    trustScore: 99,
                    createdAt: now.AddDays(-100));
                dbContext.Users.Add(user);
                existingUserIds.Add(c.UserId);
                existingEmails.Add(c.Email);
            }

            if (!existingProfileUserIds.Contains(c.UserId))
            {
                var displayName = $"{c.FirstName} {c.LastName}".Trim();
                var profile = ProviderProfile.Seed(
                    c.ProfileId,
                    c.UserId,
                    displayName,
                    c.Gender,
                    c.City,
                    c.Area,
                    c.Rate,
                    c.Bio,
                    c.Specialties,
                    portraits,
                    c.Lat,
                    c.Lon,
                    maxRadiusKm: 30m,
                    averageRating: c.Rating,
                    status: VerificationStatus.Approved,
                    isActive: true,
                    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
                    selfieUrl: portraits[0],
                    reviewedAt: now.AddDays(-95),
                    createdAt: now.AddDays(-100));
                pendingProfiles.Add(profile);
                existingProfileUserIds.Add(c.UserId);
            }

            activeProviderIds.Add((c.UserId, c.Rate, $"{c.FirstName} {c.LastName}", c.City, c.Area, c.Specialties));
        }
    }

    private static async Task RepairLegacyDataAsync(CueDbContext dbContext, CancellationToken cancellationToken)
    {
        // 1. Remove accidental ProviderProfile on Seeker-only Demo Client (120f367a-2ba7-42b7-a2d3-cd8b60258313)
        await dbContext.Database.ExecuteSqlRawAsync(
            "DELETE FROM profiles.provider_profiles WHERE user_id = '120f367a-2ba7-42b7-a2d3-cd8b60258313';",
            cancellationToken);

        // 2. Repair Elena Rostova (158b9ff7-19de-49ce-a57c-b37738591285)
        var elenaProfile = await dbContext.ProviderProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == ElenaUserId, cancellationToken);
        if (elenaProfile != null)
        {
            elenaProfile.Update(
                1500m,
                "Semi-pro tennis coach, contemporary art curator, and bilingual city companion in Indiranagar.",
                ["Tennis", "Yoga Partner", "Museum Walk", "Gym Spotter"],
                25m,
                "https://youtube.com",
                "Elena Rostova",
                FemalePortraits[0]);
            elenaProfile.SetLocation(12.9784, 77.6408);
            elenaProfile.SetDemographicsAndHub("Female", "Bengaluru", "Indiranagar");
            elenaProfile.SetRatingAndResponseTime(4.98m, 3m);
            elenaProfile.Approve(AdminUserId);
        }
        var elenaUser = await dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == ElenaUserId, cancellationToken);
        if (elenaUser != null)
        {
            elenaUser.SetPhotoUrl(FemalePortraits[0][0]);
            elenaUser.UpdateContact("+91 98450 11223", "Elena", "Rostova");
        }

        // 3. Repair Marcus Vance (6d187ed5-aff0-4fa3-856c-9beb89264b15)
        var marcusProfile = await dbContext.ProviderProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == MarcusUserId, cancellationToken);
        if (marcusProfile != null)
        {
            marcusProfile.Update(
                1800m,
                "Commercial portrait photographer and Mumbai street foodie guide. Available for photo walks and culinary outings.",
                ["Photography", "Cooking & Baking", "City Tour", "Cafe & Chat"],
                30m,
                null,
                "Marcus Vance",
                MalePortraits[0]);
            marcusProfile.SetLocation(19.0596, 72.8295);
            marcusProfile.SetDemographicsAndHub("Male", "Mumbai", "Bandra West");
            marcusProfile.SetRatingAndResponseTime(4.95m, 4m);
            marcusProfile.Approve(AdminUserId);
        }
        var marcusUser = await dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == MarcusUserId, cancellationToken);
        if (marcusUser != null)
        {
            marcusUser.SetPhotoUrl(MalePortraits[0][0]);
            marcusUser.UpdateContact("+91 98201 44556", "Marcus", "Vance");
        }

        // 4. Repair Dr. Sophia Chen (010e1920-fdf6-4419-85c1-95d284c6730d) - was $40 with empty display_name
        var sophiaProfile = await dbContext.ProviderProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == SophiaUserId, cancellationToken);
        if (sophiaProfile != null)
        {
            sophiaProfile.Update(
                1200m,
                "Cardiologist & classical violinist. Let us explore scenic trails, heritage gardens, or catch a live symphony.",
                ["Hiking", "Yoga Partner", "Violin", "City Tour"],
                25m,
                null,
                "Dr. Sophia Chen",
                FemalePortraits[1]);
            sophiaProfile.SetLocation(28.5494, 77.2001);
            sophiaProfile.SetDemographicsAndHub("Female", "Delhi-NCR", "South Delhi (Hauz Khas)");
            sophiaProfile.SetRatingAndResponseTime(4.92m, 5m);
            sophiaProfile.Approve(AdminUserId);
        }
        var sophiaUser = await dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == SophiaUserId, cancellationToken);
        if (sophiaUser != null)
        {
            sophiaUser.SetPhotoUrl(FemalePortraits[1][0]);
            sophiaUser.UpdateContact("+91 98112 77889", "Dr. Sophia", "Chen");
        }

        // 5. Repair Naveen Kumar (6a5cafe3-2be9-4197-abce-8f550a6eac2c) & Naveen Bathina (4f9ba8b9-395f-4c06-9644-9421618cb5ef)
        var naveenKumarProfile = await dbContext.ProviderProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == NaveenKumarUserId, cancellationToken);
        if (naveenKumarProfile != null)
        {
            naveenKumarProfile.Update(
                1400m,
                "Tech architect, badminton enthusiast, and specialty coffee explorer based in Hyderabad Hitec City.",
                ["Coding Mentorship", "Badminton", "Cafe & Chat", "City Tour"],
                30m,
                null,
                "Naveen Kumar",
                MalePortraits[2]);
            naveenKumarProfile.SetLocation(17.4435, 78.3772);
            naveenKumarProfile.SetDemographicsAndHub("Male", "Hyderabad", "Hitec City");
            naveenKumarProfile.SetRatingAndResponseTime(4.91m, 4m);
            naveenKumarProfile.Approve(AdminUserId);
        }

        var naveenBathinaProfile = await dbContext.ProviderProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == NaveenGmailUserId, cancellationToken);
        if (naveenBathinaProfile != null)
        {
            if (naveenBathinaProfile.ProfileImages.Count == 0)
            {
                naveenBathinaProfile.Update(
                    naveenBathinaProfile.HourlyRate > 0 ? naveenBathinaProfile.HourlyRate : 1500m,
                    string.IsNullOrWhiteSpace(naveenBathinaProfile.Bio)
                        ? "Full-stack product builder, weekend cyclist, and heritage walk host."
                        : naveenBathinaProfile.Bio,
                    naveenBathinaProfile.Specialties.Count > 0
                        ? naveenBathinaProfile.Specialties
                        : ["Coding Mentorship", "City Tour", "Cafe & Chat"],
                    30m,
                    naveenBathinaProfile.IntroVideoUrl,
                    "Naveen Bathina",
                    MalePortraits[3]);
            }
            naveenBathinaProfile.SetDemographicsAndHub("Male", "Bengaluru", "Koramangala");
            naveenBathinaProfile.SetLocation(12.9352, 77.6245);
            if (naveenBathinaProfile.AverageRating == 0)
            {
                naveenBathinaProfile.SetRatingAndResponseTime(4.95m, 3m);
            }
        }

        // 6. Upgrade legacy $90 service orders to realistic INR amounts & populate missing Requirements JSONB
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            UPDATE bookings.service_orders
            SET total_amount = 1800.00,
                platform_fee = 270.00,
                provider_earnings = 1530.00
            WHERE total_amount < 500;
            """,
            cancellationToken);

        await dbContext.Database.ExecuteSqlRawAsync(
            """
            UPDATE bookings.service_orders
            SET requirements = '{{"Activity":"City Tour & Specialty Cafe Hop","DressCode":"Smart Casual","TransportMode":"Public / Metro / Cab","DietPreference":"No Restrictions","EquipmentGear":"None","LanguagePreference":"English, Hindi","SpecialNotes":"Looking forward to an engaging conversation and local walkthrough."}}'::jsonb
            WHERE requirements IS NULL;
            """,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedAvailabilitySlotsAsync(
        CueDbContext dbContext,
        List<(Guid UserId, decimal Rate, string DisplayName, string City, string Area, string[] Specialties)> activeProviders,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var existingSlotProviders = (await dbContext.AvailabilitySlots
            .AsNoTracking()
            .Where(s => s.StartTime > now)
            .Select(s => s.ProviderId)
            .Distinct()
            .ToListAsync(cancellationToken))
            .ToHashSet();

        var newSlots = new List<AvailabilitySlot>();
        var baseDate = now.Date.AddDays(1);

        // Create 6 upcoming slots over the next 6 days for every active provider
        for (int idx = 0; idx < activeProviders.Count; idx++)
        {
            var providerId = activeProviders[idx].UserId;
            if (existingSlotProviders.Contains(providerId)) continue;

            for (int dayOffset = 0; dayOffset < 4; dayOffset++)
            {
                var day = baseDate.AddDays(dayOffset);
                var morningStart = DateTime.SpecifyKind(day.AddHours(5), DateTimeKind.Utc); // 10:30 IST
                var afternoonStart = DateTime.SpecifyKind(day.AddHours(9).AddMinutes(30), DateTimeKind.Utc); // 15:00 IST
                var eveningStart = DateTime.SpecifyKind(day.AddHours(13), DateTimeKind.Utc); // 18:30 IST

                newSlots.Add(new AvailabilitySlot(providerId, morningStart, morningStart.AddHours(2)));
                if ((idx + dayOffset) % 2 == 0)
                {
                    newSlots.Add(new AvailabilitySlot(providerId, afternoonStart, afternoonStart.AddHours(2)));
                }
                else
                {
                    newSlots.Add(new AvailabilitySlot(providerId, eveningStart, eveningStart.AddHours(2)));
                }
            }
        }

        if (newSlots.Count > 0)
        {
            await dbContext.AvailabilitySlots.AddRangeAsync(newSlots, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task SeedOperationalScenariosAsync(
        CueDbContext dbContext,
        List<(Guid UserId, decimal Rate, string DisplayName, string City, string Area, string[] Specialties)> activeProviders,
        List<Guid> seekerIds,
        DateTime now,
        CancellationToken cancellationToken)
    {
        if (activeProviders.Count < 20) return;

        // Ensure primary demo accounts have funded wallets so user can book immediately without friction
        var keyWalletUsers = new (Guid UserId, decimal Balance)[]
        {
            (DemoClientUserId, 28500m),
            (NaveenGmailUserId, 35000m),
            (AlexSeekerUserId, 22000m),
            (ElenaUserId, 18400m),
            (MarcusUserId, 42600m),
            (SophiaUserId, 15900m),
            (NaveenKumarUserId, 12800m)
        };

        foreach (var (uid, targetBalance) in keyWalletUsers)
        {
            var wallet = await dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == uid, cancellationToken);
            if (wallet == null)
            {
                wallet = new Wallet(uid, "INR");
                wallet.CreditAvailable(targetBalance);
                await dbContext.Wallets.AddAsync(wallet, cancellationToken);

                var topUpTxn = new WalletTransaction(
                    wallet.Id,
                    targetBalance,
                    TransactionDirection.Credit,
                    WalletTransactionType.TopUp,
                    wallet.AvailableBalance,
                    null,
                    "Wallet Top-Up via Razorpay UPI (Ref: pay_seed_upi_verified)");
                await dbContext.WalletTransactions.AddAsync(topUpTxn, cancellationToken);
            }
            else if (wallet.AvailableBalance < 5000m)
            {
                var diff = targetBalance - wallet.AvailableBalance;
                if (diff > 0)
                {
                    wallet.CreditAvailable(diff);
                    var topUpTxn = new WalletTransaction(
                        wallet.Id,
                        diff,
                        TransactionDirection.Credit,
                        WalletTransactionType.TopUp,
                        wallet.AvailableBalance,
                        null,
                        "Wallet Top-Up via Razorpay UPI (Ref: pay_seed_upi_topup)");
                    await dbContext.WalletTransactions.AddAsync(topUpTxn, cancellationToken);
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        // Build 45 multi-scenario ServiceOrders covering:
        // - Completed (24 orders across the past 7 days -> populates History & Completed + Admin 7-Day GMV Chart + Reviews)
        // - Confirmed (10 upcoming orders -> populates Active & Upcoming with 6-digit Check-In PINs & Held Escrow)
        // - InProgress (4 live orders -> checked in right now, ready for Complete Outing / SOS)
        // - PendingPayment (4 orders -> awaiting payment checkout)
        // - Cancelled (3 orders -> shows in History & Completed with cancellation reason)
        // - Disputed (3 orders -> shows Under Review in Admin Bookings & Support Disputes)

        var dressCodes = new[] { "Smart Casual", "Athletic / Activewear", "Traditional / Ethnic", "Business Formal", "Casual & Relaxed" };
        var transportModes = new[] { "Cab / Chauffeur", "Self-Drive / Own Vehicle", "Walking / Pedestrian Only", "Metro / Public Transit" };
        var dietPrefs = new[] { "Vegetarian", "No Restrictions", "Jain / Pure Veg", "Vegan & Gluten-Free", "High-Protein Fitness Menu" };
        var languages = new[] { "English, Hindi", "English, Kannada", "English, Marathi, Hindi", "English, Telugu", "English, Tamil", "English, Bengali" };

        var ordersToAdd = new List<ServiceOrder>();
        var knownUserIds = (await dbContext.Users
            .IgnoreQueryFilters()
            .Select(u => u.Id)
            .ToListAsync(cancellationToken))
            .ToHashSet();
        seekerIds = seekerIds.Where(knownUserIds.Contains).ToList();
        var escrowsToAdd = new List<EscrowHold>();
        var reviewsToAdd = new List<Review>();
        var trustEventsToAdd = new List<TrustEvent>();
        var messagesToAdd = new List<ChatMessage>();
        var disputesToAdd = new List<Dispute>();
        var notificationsToAdd = new List<Notification>();

        var reviewComments = new[]
        {
            "Exceptional companion! Arrived 10 minutes early, super warm conversation, and knew the best hidden spots in the neighborhood.",
            "Such a refreshing and dignified experience. Great listener, respectful boundaries, and made our 2-hour session fly by.",
            "Incredible coaching and patience during our session. Highly recommended for anyone looking for a genuine, skilled activity partner!",
            "Prepared the most authentic homestyle meal and organized the entire kitchen pantry effortlessly. Will definitely book again next week.",
            "Accompanied my parents for their morning temple visit and walk—so courteous, attentive, and fluent in their regional language.",
            "Fantastic photography walk through the heritage quarter! Came home with 40+ portrait shots and great memories.",
            "Superb tennis rally partner! Matched my pace, gave great backhand tips, and we grabbed filter coffee afterwards.",
            "Helped me drape my silk saree and styled our festive pooja setup beautifully. Punctual and 100% professional."
        };

        for (int i = 1; i <= 48; i++)
        {
            var orderId = BuildDeterministicOrderGuid(i);
            if (await dbContext.ServiceOrders.AnyAsync(o => o.Id == orderId, cancellationToken))
            {
                continue;
            }

            // Guarantee rich bookings for DemoClient, NaveenGmail, Elena, Marcus, Sophia, and NaveenKumar
            var providerInfo = activeProviders[i % Math.Min(35, activeProviders.Count)];
            Guid seekerId;
            if (i <= 8)
            {
                seekerId = DemoClientUserId; // Demo Client has 8 rich bookings across statuses
            }
            else if (i <= 16)
            {
                seekerId = NaveenGmailUserId; // Naveen Bathina has 8 rich bookings across statuses
            }
            else if (i <= 20)
            {
                // Incoming requests where Elena or Naveen is the provider
                providerInfo = i % 2 == 0
                    ? activeProviders[0] // Elena
                    : (NaveenGmailUserId, 1500m, "Naveen Bathina", "Bengaluru", "Koramangala", new[] { "Coding Mentorship", "City Tour" });
                seekerId = AlexSeekerUserId;
            }
            else
            {
                seekerId = seekerIds[i % seekerIds.Count];
            }

            if (providerInfo.UserId == seekerId)
            {
                providerInfo = activeProviders[(i + 3) % activeProviders.Count];
            }

            // Guard FK integrity: hardcoded demo accounts may not exist in every environment
            if (!knownUserIds.Contains(seekerId))
            {
                seekerId = seekerIds.Count > 0 ? seekerIds[i % seekerIds.Count] : Guid.Empty;
            }
            if (!knownUserIds.Contains(providerInfo.UserId) || !knownUserIds.Contains(seekerId) || providerInfo.UserId == seekerId)
            {
                continue;
            }

            var durationHours = (i % 3 == 0) ? 3 : 2;
            var totalAmount = providerInfo.Rate * durationHours;
            var specialty = providerInfo.Specialties[i % providerInfo.Specialties.Length];
            var address = $"{providerInfo.Area}, {providerInfo.City}";

            var requirements = new BookingRequirements(
                ActivityName: $"{specialty} ({durationHours} hrs)",
                DressCode: dressCodes[i % dressCodes.Length],
                TransportMode: transportModes[i % transportModes.Length],
                SpecialNotes: $"Meeting near {providerInfo.Area} main landmark for {specialty}.",
                Activity: $"{specialty} ({durationHours} hrs)",
                DietPreference: dietPrefs[i % dietPrefs.Length],
                EquipmentGear: i % 2 == 0 ? "Brought by companion" : "Available at venue",
                LanguagePreference: languages[i % languages.Length]);

            OrderStatus status;
            DateTime createdAt;
            DateTime startTime;
            DateTime endTime;
            string? checkInPin = $"{(100000 + i * 8191) % 900000:D6}";
            DateTime? checkedInAt = null;
            string? cancellationReason = null;

            // Distribute statuses so every user & admin view is rich:
            // Mod 8: 0,1,2,3 -> Completed; 4,5 -> Confirmed; 6 -> InProgress / PendingPayment; 7 -> Cancelled / Disputed
            var bucket = i % 8;
            if (bucket <= 3)
            {
                status = OrderStatus.Completed;
                var daysAgo = (i % 7); // Spread evenly across the last 7 days for Admin MIS chart!
                createdAt = now.Date.AddDays(-daysAgo).AddHours(6 + (i % 8));
                startTime = createdAt.AddHours(2);
                endTime = startTime.AddHours(durationHours);
                checkedInAt = startTime.AddMinutes(3);
            }
            else if (bucket <= 5)
            {
                status = OrderStatus.Confirmed;
                var daysAgo = i % 3;
                createdAt = now.AddDays(-daysAgo).AddHours(-4);
                startTime = now.Date.AddDays((i % 4) + 1).AddHours(9 + (i % 6));
                endTime = startTime.AddHours(durationHours);
            }
            else if (bucket == 6)
            {
                if (i % 16 == 6)
                {
                    status = OrderStatus.InProgress;
                    createdAt = now.AddHours(-3);
                    startTime = now.AddMinutes(-45);
                    endTime = startTime.AddHours(durationHours);
                    checkedInAt = startTime.AddMinutes(2);
                }
                else
                {
                    status = OrderStatus.PendingPayment;
                    createdAt = now.AddHours(-2);
                    startTime = now.Date.AddDays(2).AddHours(11);
                    endTime = startTime.AddHours(durationHours);
                    checkInPin = null;
                }
            }
            else
            {
                if (i <= 24)
                {
                    status = OrderStatus.Cancelled;
                    createdAt = now.AddDays(-(i % 5 + 1));
                    startTime = createdAt.AddDays(1);
                    endTime = startTime.AddHours(durationHours);
                    cancellationReason = "Schedule conflict due to flight rescheduling; mutually agreed to rebook for next weekend.";
                }
                else
                {
                    status = OrderStatus.Disputed;
                    createdAt = now.AddDays(-(i % 4 + 1));
                    startTime = createdAt.AddHours(4);
                    endTime = startTime.AddHours(durationHours);
                    checkedInAt = startTime.AddMinutes(5);
                }
            }

            var order = ServiceOrder.Seed(
                orderId,
                providerInfo.UserId,
                seekerId,
                startTime,
                endTime,
                status,
                totalAmount,
                address,
                requirements,
                checkInPin,
                checkedInAt,
                cancellationReason,
                createdAt);

            ordersToAdd.Add(order);

            // EscrowHold for paid orders
            if (status is OrderStatus.Confirmed or OrderStatus.InProgress or OrderStatus.Completed or OrderStatus.Disputed)
            {
                var fee = decimal.Round(totalAmount * 0.15m, 2);
                var escrow = new EscrowHold(orderId, seekerId, providerInfo.UserId, totalAmount, fee);
                if (status == OrderStatus.Completed)
                {
                    escrow.Release();
                }
                else if (status == OrderStatus.Disputed)
                {
                    escrow.Dispute("Timing discrepancy reported by participant; under Trust & Safety review.");
                }
                escrowsToAdd.Add(escrow);
            }

            // Reviews & TrustEvents for Completed orders
            if (status == OrderStatus.Completed)
            {
                var rating = (i % 5 == 0) ? 4 : 5;
                var comment = reviewComments[i % reviewComments.Length];
                reviewsToAdd.Add(new Review(orderId, seekerId, providerInfo.UserId, rating, comment, 5, rating));
                trustEventsToAdd.Add(new TrustEvent(providerInfo.UserId, "PositiveReview", 2, $"5-star verified outing #{orderId.ToString()[..8]}"));
            }

            // Chat messages for Confirmed, InProgress, and Completed orders
            if (status is OrderStatus.Confirmed or OrderStatus.InProgress or OrderStatus.Completed)
            {
                messagesToAdd.Add(new ChatMessage(
                    orderId,
                    seekerId,
                    $"Hi {providerInfo.DisplayName}! Looking forward to our {specialty} session at {address}."));
                messagesToAdd.Add(new ChatMessage(
                    orderId,
                    providerInfo.UserId,
                    $"Hello! Excited to meet up as well. I have noted your preferences ({requirements.DressCode}, {requirements.LanguagePreference}) and will be there 5 minutes early."));
                if (status is OrderStatus.InProgress or OrderStatus.Completed)
                {
                    messagesToAdd.Add(new ChatMessage(
                        orderId,
                        seekerId,
                        "I have arrived at the main entrance and shared the Check-In PIN."));
                }
            }

            // Disputes for Disputed orders
            if (status == OrderStatus.Disputed)
            {
                var dispute = new Dispute(
                    orderId,
                    seekerId,
                    "Venue was closed for private renovation; requesting partial escrow adjustment for travel time.");
                if (i % 2 == 0)
                {
                    dispute.BeginReview();
                }
                disputesToAdd.Add(dispute);
            }

            // Notifications for key users
            if (seekerId == DemoClientUserId || seekerId == NaveenGmailUserId || providerInfo.UserId == ElenaUserId)
            {
                notificationsToAdd.Add(new Notification(
                    seekerId,
                    NotificationType.BookingConfirmed,
                    $"Your {specialty} booking with {providerInfo.DisplayName} in {providerInfo.Area} is {status}."));
            }
        }

        // Persist orders before dependent rows (reviews, chat, disputes reference service_orders.id)
        if (ordersToAdd.Count > 0)
        {
            await dbContext.ServiceOrders.AddRangeAsync(ordersToAdd, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        if (escrowsToAdd.Count > 0) await dbContext.EscrowHolds.AddRangeAsync(escrowsToAdd, cancellationToken);
        if (reviewsToAdd.Count > 0) await dbContext.Reviews.AddRangeAsync(reviewsToAdd, cancellationToken);
        if (trustEventsToAdd.Count > 0) await dbContext.TrustEvents.AddRangeAsync(trustEventsToAdd, cancellationToken);
        if (messagesToAdd.Count > 0) await dbContext.ChatMessages.AddRangeAsync(messagesToAdd, cancellationToken);
        if (disputesToAdd.Count > 0) await dbContext.Disputes.AddRangeAsync(disputesToAdd, cancellationToken);
        if (notificationsToAdd.Count > 0) await dbContext.Notifications.AddRangeAsync(notificationsToAdd, cancellationToken);

        // Seed 10 realistic Companion UPI/IMPS Payout Requests (Pending & Completed) for Admin Payout Hub
        var existingPayoutCount = await dbContext.PayoutRequests.CountAsync(cancellationToken);
        if (existingPayoutCount < 5)
        {
            var payoutProviders = new (Guid UserId, decimal Amount, PayoutMethodType Method, string Dest, bool Completed, string Utr)[]
            {
                (ElenaUserId, 4500m, PayoutMethodType.Upi, "elena.rostova@okaxis", true, "UTR419082341102"),
                (MarcusUserId, 6800m, PayoutMethodType.Upi, "marcus.vance@okicici", true, "UTR419082341589"),
                (SophiaUserId, 3400m, PayoutMethodType.Upi, "sophia.chen@hdfcbank", false, ""),
                (NaveenKumarUserId, 5200m, PayoutMethodType.Upi, "naveen.kumar@ybl", false, ""),
                (BuildDeterministicGuid(4), 4800m, PayoutMethodType.Upi, "julian.alvarez@okhdfcbank", true, "UTR419082349912"),
                (BuildDeterministicGuid(5), 7500m, PayoutMethodType.BankTransfer, "HDFC0001204 / 501004829104", true, "UTR419082350120"),
                (BuildDeterministicGuid(6), 6200m, PayoutMethodType.Upi, "david.morales@icici", false, ""),
                (BuildDeterministicGuid(7), 3900m, PayoutMethodType.Upi, "ananya.sharma@okaxis", true, "UTR419082352310"),
                (BuildDeterministicGuid(8), 3200m, PayoutMethodType.BankTransfer, "SBIN0004812 / 30918273645", false, ""),
                (BuildDeterministicGuid(9), 5100m, PayoutMethodType.Upi, "pooja.iyer@kotak", true, "UTR419082358801")
            };

            foreach (var p in payoutProviders)
            {
                var req = new PayoutRequest(p.UserId, p.Amount, 5m, p.Method, p.Dest);
                if (p.Completed)
                {
                    req.MarkCompleted(p.Utr);
                }
                await dbContext.PayoutRequests.AddAsync(req, cancellationToken);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Guid BuildDeterministicGuid(int index) =>
        Guid.Parse($"00000000-0000-0000-0000-{index:x12}");

    private static Guid BuildDeterministicProfileGuid(int index) =>
        Guid.Parse($"00000000-0000-0000-0001-{index:x12}");

    private static Guid BuildDeterministicOrderGuid(int index) =>
        Guid.Parse($"00000000-0000-0000-0002-{index:x12}");

    private static string ComputeDefaultPasswordHash(string password)
    {
        var salt = new byte[16] { 11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176 };
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 120_000, HashAlgorithmName.SHA256, 32);
        return $"v1:{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    private static List<SyntheticPersona> Build100Personas()
    {
        var list = new List<SyntheticPersona>(100)
        {
            // 1..9: Flagship showcase profiles (1..3 are distinct regional companions since Elena/Marcus/Sophia live on their existing UUIDs, 4..9 match sample-4..sample-9)
            new(1, "Aarohi", "Deshmukh", "Female", 0, 1500m, 4.97m, 99,
                "Former state-level tennis player & contemporary art curator in Indiranagar. Available for rally sessions, gallery walks, and specialty coffee trails.",
                ["Tennis", "Yoga Partner", "Museum Walk", "Cafe & Chat"], VerificationStatus.Approved, true, IntroVideoUrl: "https://youtube.com"),
            new(2, "Vikramaditya", "Singhania", "Male", 5, 1800m, 4.95m, 98,
                "Editorial portrait photographer and Bandra culinary historian. Let us capture timeless street portraits or explore Mumbai's hidden Irani cafes.",
                ["Photography", "Cooking & Baking", "City Tour", "Fine Dining"], VerificationStatus.Approved, true),
            new(3, "Dr. Meera", "Krishnan", "Female", 13, 1300m, 4.94m, 98,
                "Clinical researcher & trained Carnatic violinist in South Delhi. Available for Lodhi Garden morning walks, classical music appreciation, and museum outings.",
                ["Hiking", "Violin", "Museum Walk", "Yoga Partner"], VerificationStatus.Approved, true),
            new(4, "Julian", "Alvarez", "Male", 15, 1600m, 4.88m, 96,
                "Certified salsa dance instructor & architectural history guide in Hitec City. Available for events, dance coaching, and wedding plus-one.",
                ["Dance", "Plus-One", "Event Host", "Architecture"], VerificationStatus.Approved, true),
            new(5, "Aria", "Thorne", "Female", 1, 1500m, 4.97m, 99,
                "Principal Software Architect & avid book enthusiast in Koramangala. Available for system design mentorship, coffee chats, and bookstore crawls.",
                ["Coding Mentorship", "Language Practice", "Museum Walk", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(6, "David", "Morales", "Male", 19, 2000m, 4.94m, 98,
                "Certified sommelier and strength conditioning coach in Koregaon Park. Host for curated dining excursions and 1-on-1 gym workouts.",
                ["Fine Dining", "Gym Spotter", "Tennis"], VerificationStatus.Approved, true),
            new(7, "Ananya", "Sharma", "Female", 0, 1200m, 4.96m, 99,
                "Passionate regional home chef and urban botanist. Specializing in healthy regional homestyle meal prep, festive flower rangolis, and balcony herb gardens.",
                ["Regional Homestyle Cook", "Festival & Pooja Decor", "Balcony Tulsi & Gardening"], VerificationStatus.Approved, true),
            new(8, "Col. Rajeshwar", "Rao (Retd.)", "Male", 16, 1000m, 4.99m, 100,
                "Retired defense officer & avid reader in Jubilee Hills. Providing dignified, warm companionship to senior citizens for temple visits, walks, and carrom.",
                ["Senior Companion & Temple Escort", "Carrom & Society Sports", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(9, "Pooja", "Iyer", "Female", 10, 1400m, 4.93m, 97,
                "NIFT graduate & Mumbai heritage enthusiast in Dadar West. Available for traditional saree draping, festive boutique shopping, and desi pantry organizing.",
                ["Ethnic Styling & Saree Draping", "Sabzi Mandi & Bazaar Guide", "Pantry & Dabba Organization"], VerificationStatus.Approved, true),

            // 10..75: 66 Approved & Active Companions across all 7 cities, 25 hubs, 4 lenses, and genders
            new(10, "Kavya", "Menon", "Female", 2, 1400m, 4.91m, 97,
                "Architect and Cubbon Park sketch walk host. Join me for heritage architecture walks, watercolour sessions, or artisanal coffee conversations.",
                ["Architecture", "Museum Walk", "Cafe & Chat", "Photography"], VerificationStatus.Approved, true),
            new(11, "Rohan", "Malhotra", "Male", 11, 1700m, 4.89m, 96,
                "Marathon pacer and certified CrossFit spotter at Connaught Place. Let us crush a morning 10K run or strength training session.",
                ["Running Buddy", "Gym Spotter", "Hiking", "Tennis"], VerificationStatus.Approved, true),
            new(12, "Nandini", "Chatterjee", "Female", 24, 1100m, 4.95m, 98,
                "Literature professor and Park Street heritage raconteur. Available for College Street book hunting, Rabindra Sangeet evenings, and tea tasting.",
                ["City Tour", "Museum Walk", "Language Practice", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(13, "Siddharth", "Verma", "Male", 6, 2200m, 4.93m, 98,
                "Ex-investment banker & corporate gala plus-one in BKC. Articulate, multilingual companion for business dinners, networking lounges, and golf.",
                ["Plus-One", "Fine Dining", "Event Host", "Tennis"], VerificationStatus.Approved, true),
            new(14, "Ishita", "Banerjee", "Female", 25, 1250m, 4.90m, 95,
                "Traditional Bengali homestyle cook and festive alpana artist in Salt Lake. Specializing in authentic weekend meal prep and cultural decor.",
                ["Regional Homestyle Cook", "Festival & Pooja Decor", "Cooking & Baking"], VerificationStatus.Approved, true),
            new(15, "Arjun", "Reddy", "Male", 17, 1500m, 4.87m, 94,
                "AI systems engineer & national-level badminton player in Gachibowli. Happy to spar on the badminton court or mentor on ML interviews.",
                ["Badminton", "Coding Mentorship", "Gym Spotter", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(16, "Meenakshi", "Sundaram", "Female", 22, 1300m, 4.96m, 99,
                "Bharatanatyam exponent and Mylapore/Nungambakkam temple heritage guide. Offering senior temple escort, Kanjeevaram saree styling, and Carnatic concerts.",
                ["Senior Companion & Temple Escort", "Ethnic Styling & Saree Draping", "Festival & Pooja Decor", "Dance"], VerificationStatus.Approved, true),
            new(17, "Kabir", "Bedi", "Male", 7, 1900m, 4.92m, 97,
                "Yachting enthusiast and South Mumbai art district guide in Colaba. Let us explore Kala Ghoda galleries, colonial architecture, and sea-facing cafes.",
                ["City Tour", "Architecture", "Museum Walk", "Fine Dining"], VerificationStatus.Approved, true),
            new(18, "Tanvi", "Kulkarni", "Female", 20, 1150m, 4.88m, 95,
                "Certified Ashtanga yoga teacher and Ayurvedic nutrition coach in Kalyani Nagar. Morning pranayama flows and organic farmer market tours.",
                ["Yoga Partner", "Sabzi Mandi & Bazaar Guide", "Regional Homestyle Cook"], VerificationStatus.Approved, true),
            new(19, "Devansh", "Joshi", "Male", 3, 1600m, 4.91m, 96,
                "Indie acoustic guitarist and board game strategist in HSR Layout. Available for jam sessions, Catan nights, and startup brainstorming.",
                ["Board Games", "Cafe & Chat", "Coding Mentorship", "Event Host"], VerificationStatus.Approved, true),
            new(20, "Zoya", "Akhtar", "Female", 8, 1750m, 4.94m, 98,
                "Film stylist and contemporary wardrobe consultant in Andheri West. Personal shopping companion, red-carpet plus-one, and portrait shoot director.",
                ["Ethnic Styling & Saree Draping", "Plus-One", "Photography", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(21, "Pranav", "Nair", "Male", 4, 1450m, 4.86m, 94,
                "Endurance cyclist and specialty coffee roaster in Whitefield. Join me for 30km sunrise rides or pour-over brewing workshops.",
                ["Cycling", "Gym Spotter", "Cooking & Baking", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(22, "Shruti", "Haasan", "Female", 23, 1350m, 4.93m, 97,
                "Marine biologist and Adyar coastal walk guide. Passionate about birdwatching at Theosophical Society, beach runs, and French language practice.",
                ["Hiking", "Running Buddy", "Language Practice", "City Tour"], VerificationStatus.Approved, true),
            new(23, "Rishabh", "Pant", "Male", 12, 2100m, 4.90m, 96,
                "Executive golf & padel partner in Cyber City, Gurgaon. Available for corporate golf rounds, high-energy padel matches, and fine dining.",
                ["Tennis", "Plus-One", "Fine Dining", "Gym Spotter"], VerificationStatus.Approved, true),
            new(24, "Sanya", "Mirza", "Non-Binary", 9, 1650m, 4.95m, 98,
                "Queer-affirming mindfulness coach, pottery artist, and Juhu beach sunset walker. Safe, grounding platonic companionship and creative workshops.",
                ["Yoga Partner", "Cafe & Chat", "Museum Walk", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(25, "Harshvardhan", "Rane", "Male", 18, 1550m, 4.89m, 95,
                "Wildlife photographer and boulder climbing partner in Banjara Hills. Available for Khajaguda rock walks and DSLR mentoring.",
                ["Photography", "Hiking", "Gym Spotter", "City Tour"], VerificationStatus.Approved, true),
            new(26, "Lakshmi", "Narayanan", "Female", 0, 1100m, 4.98m, 99,
                "Traditional South Indian homestyle cook & kolam artist in Indiranagar. Fresh sambar-rasam dabba prep, festive pooja arrangements, and senior care.",
                ["Regional Homestyle Cook", "Festival & Pooja Decor", "Senior Companion & Temple Escort"], VerificationStatus.Approved, true),
            new(27, "Aditya", "Roy", "Male", 21, 1400m, 4.85m, 93,
                "Sahyadri fort trek leader and acoustic percussionist in Baner. Weekend hikes to Sinhagad/Rajgad and evening rooftop unplugged sessions.",
                ["Hiking", "Running Buddy", "City Tour", "Event Host"], VerificationStatus.Approved, true),
            new(28, "Neha", "Dhupia", "Female", 14, 1600m, 4.91m, 96,
                "Corporate communications coach and art gallery companion in Sector 18, Noida. Public speaking practice, mock interviews, and exhibition visits.",
                ["Language Practice", "Plus-One", "Museum Walk", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(29, "Karan", "Johar", "Male", 5, 2500m, 4.96m, 99,
                "Luxury wedding & social gala host in Bandra West. Effortless conversationalist, etiquette specialist, and high-society event plus-one.",
                ["Plus-One", "Event Host", "Fine Dining", "Ethnic Styling & Saree Draping"], VerificationStatus.Approved, true),
            new(30, "Divya", "Spandana", "Female", 1, 1300m, 4.92m, 97,
                "Urban permaculture designer and terrace gardener in Koramangala. Set up your balcony tulsi/kitchen garden and organize eco-friendly pantries.",
                ["Balcony Tulsi & Gardening", "Pantry & Dabba Organization", "Sabzi Mandi & Bazaar Guide"], VerificationStatus.Approved, true),
            new(31, "Varun", "Dhawan", "Male", 8, 1750m, 4.88m, 95,
                "Functional hypertrophy trainer and dance fitness buddy in Andheri West. High-energy gym spotting, meal prep planning, and beach sprints.",
                ["Gym Spotter", "Dance", "Running Buddy", "Cooking & Baking"], VerificationStatus.Approved, true),
            new(32, "Radhika", "Apte", "Female", 19, 1850m, 4.97m, 99,
                "Theatre actor and contemporary literature companion in Koregaon Park. Script readings, independent cinema screenings, and artisanal dining.",
                ["Museum Walk", "Fine Dining", "Language Practice", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(33, "Subhash", "Ghai (Retd.)", "Male", 11, 950m, 4.98m, 100,
                "Retired civil servant in Connaught Place offering warm senior companionship, hospital/bank visit assistance, chess, and morning park walks.",
                ["Senior Companion & Temple Escort", "Carrom & Society Sports", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(34, "Kriti", "Sanon", "Female", 13, 1900m, 4.93m, 97,
                "Fashion choreographer and Hauz Khas Village boutique curator. Personal styling, designer lehenga/saree trials, and brunch outings.",
                ["Ethnic Styling & Saree Draping", "Plus-One", "Fine Dining", "Photography"], VerificationStatus.Approved, true),
            new(35, "Ayushmann", "Khurrana", "Male", 12, 1650m, 4.91m, 96,
                "Singer-songwriter and Gurgaon open-mic companion. Guitar jam sessions, lyric writing workshops, and relaxed evening cafe conversations.",
                ["Event Host", "Cafe & Chat", "Language Practice", "Plus-One"], VerificationStatus.Approved, true),
            new(36, "Pallavi", "Joshi", "Female", 10, 1200m, 4.95m, 98,
                "Authentic Maharashtrian & Gujarati homestyle cook in Dadar West. Puran poli, modak, festive thali preparation, and spice market tours.",
                ["Regional Homestyle Cook", "Sabzi Mandi & Bazaar Guide", "Festival & Pooja Decor"], VerificationStatus.Approved, true),
            new(37, "Nikhil", "Kamath", "Male", 2, 3000m, 4.97m, 99,
                "Angel investor, chess FIDE rated player, and MG Road founder mentor. 1-on-1 pitch deck reviews, rapid chess games, and fine dining.",
                ["Coding Mentorship", "Board Games", "Fine Dining", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(38, "Konkona", "Sen", "Female", 24, 1500m, 4.96m, 98,
                "Documentary filmmaker and Park Street cultural archivist. Heritage tram rides, analog photography walks, and Bengali-English translation.",
                ["Photography", "City Tour", "Museum Walk", "Language Practice"], VerificationStatus.Approved, true),
            new(39, "Dulquer", "Salmaan", "Male", 22, 1800m, 4.94m, 98,
                "Classic automobile enthusiast and Chennai East Coast Road drive companion. Scenic coastal drives, specialty filter coffee hops, and cinema chats.",
                ["City Tour", "Cafe & Chat", "Photography", "Fine Dining"], VerificationStatus.Approved, true),
            new(40, "Sai", "Pallavi", "Female", 16, 1450m, 4.98m, 99,
                "Medical doctor and contemporary folk dancer in Jubilee Hills. Mindful wellness walks, dance workshops, and compassionate senior companionship.",
                ["Dance", "Yoga Partner", "Senior Companion & Temple Escort", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(41, "Rana", "Daggubati", "Male", 15, 2200m, 4.92m, 97,
                "Tech media producer and Hitec City networking host. Available as a charismatic corporate event plus-one, padel partner, and barbecue host.",
                ["Plus-One", "Event Host", "Tennis", "Fine Dining"], VerificationStatus.Approved, true),
            new(42, "Sobhita", "Dhulipala", "Female", 7, 2100m, 4.95m, 98,
                "Haute couture muse and Colaba art auction companion. Curated gallery previews, luxury dinner plus-one, and vintage saree styling.",
                ["Plus-One", "Museum Walk", "Ethnic Styling & Saree Draping", "Fine Dining"], VerificationStatus.Approved, true),
            new(43, "Pratik", "Gandhi", "Male", 6, 1550m, 4.90m, 96,
                "Financial literacy mentor and theatre artist in BKC. Gujarati/Hindi theatre walks, personal finance coffee sessions, and carrom evenings.",
                ["Carrom & Society Sports", "Cafe & Chat", "Event Host", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(44, "Mrunal", "Thakur", "Female", 20, 1400m, 4.91m, 96,
                "Certified pilates instructor and artisanal baker in Kalyani Nagar. Sourdough baking sessions, core mobility flows, and pet-friendly park walks.",
                ["Cooking & Baking", "Yoga Partner", "Running Buddy", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(45, "Vijay", "Deverakonda", "Male", 18, 1950m, 4.89m, 95,
                "Volleyball & pickleball partner in Banjara Hills. High-octane court rallies, streetwear shopping tours, and rooftop sundowners.",
                ["Tennis", "Gym Spotter", "Plus-One", "City Tour"], VerificationStatus.Approved, true),
            new(46, "Triptii", "Dimri", "Female", 13, 1500m, 4.93m, 97,
                "Himalayan trail runner and minimalist lifestyle organizer in South Delhi. Sanjay Van trail hikes, wardrobe decluttering, and calm tea chats.",
                ["Hiking", "Pantry & Dabba Organization", "Running Buddy", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(47, "Babil", "Khan", "Non-Binary", 5, 1350m, 4.92m, 97,
                "Indie poet, vinyl collector, and Bandra sunset companion. Empathetic listening sessions, poetry slams, and street photography.",
                ["Photography", "Evening Chai & Gupshup", "Cafe & Chat", "Museum Walk"], VerificationStatus.Approved, true),
            new(48, "Nithya", "Menen", "Female", 3, 1450m, 4.96m, 99,
                "Acoustic vocalist and HSR Layout cafe hopper. Multilingual conversation partner (English, Kannada, Malayalam, Tamil, Hindi) and music buddy.",
                ["Language Practice", "Cafe & Chat", "Evening Chai & Gupshup", "Event Host"], VerificationStatus.Approved, true),
            new(49, "Rakul", "Preet", "Female", 12, 1750m, 4.90m, 96,
                "Aerial yoga practitioner and holistic golf buddy in Gurgaon. Morning flexibility sessions, driving range practice, and clean-eating meal prep.",
                ["Yoga Partner", "Tennis", "Regional Homestyle Cook", "Gym Spotter"], VerificationStatus.Approved, true),
            new(50, "Milind", "Soman", "Male", 9, 2400m, 4.99m, 100,
                "Barefoot marathoner and endurance swim coach in Juhu. Train for your first half-marathon, open-water swim, or functional longevity routine.",
                ["Running Buddy", "Gym Spotter", "Hiking", "Yoga Partner"], VerificationStatus.Approved, true),
            new(51, "Suhasini", "Maniratnam", "Female", 23, 1250m, 4.97m, 99,
                "Cultural historian and senior citizen companion in Adyar. Kapaleeshwarar temple darshan, Kalakshetra craft bazaar walks, and warm Tamil gupshup.",
                ["Senior Companion & Temple Escort", "Sabzi Mandi & Bazaar Guide", "Festival & Pooja Decor"], VerificationStatus.Approved, true),
            new(52, "Ritwik", "Bhowmik", "Male", 25, 1150m, 4.88m, 95,
                "Classical sitar player and Salt Lake board game host. Hindustani classical appreciation, chess/carrom matches, and adda over Darjeeling tea.",
                ["Carrom & Society Sports", "Board Games", "Evening Chai & Gupshup", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(53, "Shobha", "De", "Female", 7, 1600m, 4.94m, 98,
                "South Mumbai heritage walk curator and Crawford Market spice guide. Discover hidden Parsi cafes, colonial landmarks, and festive decor shopping.",
                ["Sabzi Mandi & Bazaar Guide", "City Tour", "Fine Dining", "Festival & Pooja Decor"], VerificationStatus.Approved, true),
            new(54, "Abhay", "Deol", "Male", 1, 1850m, 4.91m, 96,
                "Sustainable architecture enthusiast and vinyl jazz host in Koramangala. Relaxed gallery afternoons, craft mocktail tastings, and road trips.",
                ["Architecture", "Museum Walk", "Fine Dining", "City Tour"], VerificationStatus.Approved, true),
            new(55, "Kalki", "Koechlin", "Female", 0, 1700m, 4.95m, 98,
                "Bilingual French-English theatre mentor and Indiranagar cycling buddy. French conversation immersion, monologue coaching, and morning rides.",
                ["Language Practice", "Cycling", "Museum Walk", "Cafe & Chat"], VerificationStatus.Approved, true),
            new(56, "Surya", "Sivakumar", "Male", 22, 1650m, 4.93m, 97,
                "Strength & conditioning mentor and Nungambakkam tennis partner. Disciplined 1-on-1 gym spotting, court drills, and career motivation.",
                ["Gym Spotter", "Tennis", "Running Buddy", "Coding Mentorship"], VerificationStatus.Approved, true),
            new(57, "Dia", "Mirza", "Female", 16, 1550m, 4.98m, 99,
                "Urban conservationist and botanical garden guide in Jubilee Hills. KBR Park morning walks, zero-waste pantry makeovers, and terrace gardening.",
                ["Balcony Tulsi & Gardening", "Pantry & Dabba Organization", "Hiking", "Yoga Partner"], VerificationStatus.Approved, true),
            new(58, "Farhan", "Akhtar", "Male", 5, 2300m, 4.94m, 98,
                "Skydiving/outdoor adventure planner, acoustic rock guitarist, and Bandra running buddy. High-energy workouts and live concert companionship.",
                ["Running Buddy", "Event Host", "Gym Spotter", "Plus-One"], VerificationStatus.Approved, true),
            new(59, "Ratna", "Pathak", "Female", 8, 1200m, 4.99m, 100,
                "Warm, witty senior companion and Gujarati homestyle culinary mentor in Andheri West. Undhiyu/dhokla workshops, theatre outings, and chai gupshup.",
                ["Senior Companion & Temple Escort", "Regional Homestyle Cook", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(60, "Jim", "Sarbh", "Male", 7, 2100m, 4.92m, 97,
                "Avant-garde theatre director and Colaba contemporary art companion. Sharp wit, gallery openings, squash rallies, and espresso tastings.",
                ["Museum Walk", "Plus-One", "Tennis", "Fine Dining"], VerificationStatus.Approved, true),
            new(61, "Tillotama", "Shome", "Female", 24, 1350m, 4.96m, 98,
                "Art-house cinema companion and Kolkata heritage food guide. Kumartuli clay studio walks, botanical garden picnics, and mindful listening.",
                ["City Tour", "Photography", "Museum Walk", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(62, "Ali", "Fazal", "Male", 11, 1600m, 4.89m, 95,
                "Urdu poetry enthusiast and Old Delhi heritage food walk host. Chandni Chowk bazaar navigation, calligraphy appreciation, and dinner plus-one.",
                ["Sabzi Mandi & Bazaar Guide", "City Tour", "Fine Dining", "Language Practice"], VerificationStatus.Approved, true),
            new(63, "Richa", "Chadha", "Female", 13, 1500m, 4.91m, 96,
                "Punjabi homestyle culinary host and animal shelter volunteer in South Delhi. Amritsari kulcha workshops, dog-park walks, and candid chats.",
                ["Regional Homestyle Cook", "Cooking & Baking", "Cafe & Chat", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(64, "Vikrant", "Massey", "Male", 14, 1400m, 4.95m, 98,
                "Down-to-earth coffee companion, carrom champion, and Noida bookstore guide. Ideal for quiet study/work co-working sessions and board games.",
                ["Carrom & Society Sports", "Board Games", "Cafe & Chat", "Coding Mentorship"], VerificationStatus.Approved, true),
            new(65, "Shefali", "Shah", "Female", 6, 1800m, 4.97m, 99,
                "Gourmet home chef and festive hosting curator in BKC. Curated 5-course homestyle dinner prep, Diwali/Ganeshotsav decor, and warm conversation.",
                ["Regional Homestyle Cook", "Festival & Pooja Decor", "Fine Dining", "Cooking & Baking"], VerificationStatus.Approved, true),
            new(66, "Pankaj", "Tripathi", "Male", 11, 1300m, 4.99m, 100,
                "Storyteller, Litti-Chokha culinary artist, and serene morning walk companion in Connaught Place. Heartfelt Hindi literature and temple visits.",
                ["Regional Homestyle Cook", "Senior Companion & Temple Escort", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(67, "Rasika", "Dugal", "Female", 19, 1450m, 4.93m, 97,
                "Podcast host, classical violinist, and Koregaon Park cafe companion. Engaging literary conversations, violin duets, and heritage walks.",
                ["Violin", "Cafe & Chat", "Museum Walk", "Language Practice"], VerificationStatus.Approved, true),
            new(68, "Jaideep", "Ahlawat", "Male", 12, 1550m, 4.90m, 96,
                "Strength coach and Gurgaon highway drive companion. No-nonsense barbell spotting, Haryanvi/Hindi folk tales, and late-evening chai.",
                ["Gym Spotter", "Evening Chai & Gupshup", "City Tour"], VerificationStatus.Approved, true),
            new(69, "Neena", "Gupta", "Female", 9, 1500m, 4.98m, 99,
                "Iconic saree styling mentor and Juhu senior social companion. Learn graceful drape styles, enjoy afternoon rummy/carrom, and beach walks.",
                ["Ethnic Styling & Saree Draping", "Senior Companion & Temple Escort", "Carrom & Society Sports"], VerificationStatus.Approved, true),
            new(70, "Manoj", "Bajpayee", "Male", 10, 1450m, 4.97m, 99,
                "Method acting mentor and Dadar flower mandi early-morning guide. Authentic bazaar exploration, Champaran style veg/non-veg cooking, and walks.",
                ["Sabzi Mandi & Bazaar Guide", "Regional Homestyle Cook", "Evening Chai & Gupshup"], VerificationStatus.Approved, true),
            new(71, "Tabu", "Hashmi", "Female", 18, 2000m, 4.96m, 99,
                "Hyderabadi Tehzeeb & Deccani heritage curator in Banjara Hills. Charminar pearl bazaar guidance, Urdu shayari evenings, and fine dining.",
                ["Sabzi Mandi & Bazaar Guide", "Fine Dining", "Museum Walk", "Ethnic Styling & Saree Draping"], VerificationStatus.Approved, true),
            new(72, "Nawazuddin", "Siddiqui", "Male", 8, 1500m, 4.91m, 96,
                "Independent theatre workshop leader and Andheri film club companion. Deep cinema analysis, rehearsal partnering, and street chai.",
                ["Event Host", "Cafe & Chat", "Evening Chai & Gupshup", "Language Practice"], VerificationStatus.Approved, true),
            new(73, "Huma", "Qureshi", "Female", 13, 1650m, 4.92m, 97,
                "Mughlai culinary historian and South Delhi dinner plus-one. Curated food walks, festive table styling, and lively social companionship.",
                ["Fine Dining", "Plus-One", "Cooking & Baking", "Festival & Pooja Decor"], VerificationStatus.Approved, true),
            new(74, "Rajkummar", "Rao", "Male", 1, 1600m, 4.94m, 98,
                "Salsa & contemporary dance partner and Koramangala running buddy. Fun, zero-judgment dance sessions, 5K runs, and vegan cafe hops.",
                ["Dance", "Running Buddy", "Cafe & Chat", "Plus-One"], VerificationStatus.Approved, true),
            new(75, "Bhumi", "Pednekar", "Female", 5, 1550m, 4.93m, 97,
                "Climate warrior, urban composting guide, and Bandra pilates buddy. Transform your home pantry & balcony into a green sanctuary.",
                ["Balcony Tulsi & Gardening", "Pantry & Dabba Organization", "Yoga Partner"], VerificationStatus.Approved, true),

            // 76..81: 6 Approved Companions Currently Paused / Offline (Status = Approved, IsActive = false)
            new(76, "Deepika", "Padukone", "Female", 0, 2800m, 4.99m, 100,
                "National-level badminton player and mental wellness advocate in Indiranagar. (Currently on travel break — calendar paused).",
                ["Badminton", "Tennis", "Yoga Partner", "Plus-One"], VerificationStatus.Approved, false),
            new(77, "Ranveer", "Singh", "Male", 5, 2600m, 4.96m, 99,
                "High-voltage event host, vinyl hip-hop collector, and squash partner in Bandra West. (Currently away on outdoor shoot).",
                ["Event Host", "Plus-One", "Dance", "Tennis"], VerificationStatus.Approved, false),
            new(78, "Alia", "Bhatt", "Female", 9, 2500m, 4.97m, 99,
                "Pilates enthusiast, children's book storyteller, and Juhu cafe companion. (Discovery visibility paused for this week).",
                ["Yoga Partner", "Cafe & Chat", "Cooking & Baking"], VerificationStatus.Approved, false),
            new(79, "Hrithik", "Roshan", "Male", 8, 2900m, 4.98m, 100,
                "Functional movement specialist and dance mentor in Andheri West. (Temporarily offline).",
                ["Dance", "Gym Spotter", "Hiking"], VerificationStatus.Approved, false),
            new(80, "Kareena", "Kapoor", "Female", 6, 2700m, 4.95m, 98,
                "Yoga practitioner, radio host, and BKC fine dining companion. (Currently paused).",
                ["Yoga Partner", "Fine Dining", "Plus-One"], VerificationStatus.Approved, false),
            new(81, "Shahid", "Kapoor", "Male", 19, 2200m, 4.92m, 97,
                "Contemporary dance coach and espresso connoisseur in Koregaon Park. (Calendar paused until next month).",
                ["Dance", "Cafe & Chat", "Cycling"], VerificationStatus.Approved, false),

            // 82..89: 8 Pending KYC Verification Applications (Status = PendingReview, IsActive = false) for Admin Verification Studio
            new(82, "Kiara", "Advani", "Female", 7, 1800m, 5.00m, 85,
                "Certified sound healer, luxury shopper, and South Mumbai heritage walk host. Submitted Aadhaar & live selfie for companion verification.",
                ["Yoga Partner", "Ethnic Styling & Saree Draping", "Fine Dining", "City Tour"], VerificationStatus.PendingReview, false),
            new(83, "Kartik", "Aaryan", "Male", 12, 1650m, 5.00m, 82,
                "Engineering graduate, monologue mentor, and Gurgaon football/turf buddy. Excited to host weekend sports and street food crawls.",
                ["Running Buddy", "Gym Spotter", "Cafe & Chat", "City Tour"], VerificationStatus.PendingReview, false),
            new(84, "Janhvi", "Kapoor", "Female", 22, 1600m, 5.00m, 84,
                "Classical Kathak dancer, Pilates partner, and Nungambakkam temple & filter coffee guide. Awaiting KYC verification approval.",
                ["Dance", "Senior Companion & Temple Escort", "Yoga Partner"], VerificationStatus.PendingReview, false),
            new(85, "Ishaan", "Khatter", "Male", 5, 1500m, 5.00m, 80,
                "Freestyle dancer, rock climbing buddy, and Bandra street photographer. Ready for active outdoor sessions.",
                ["Dance", "Photography", "Hiking", "Cycling"], VerificationStatus.PendingReview, false),
            new(86, "Tara", "Sutaria", "Female", 1, 1750m, 5.00m, 86,
                "Opera/western classical vocalist and patisserie baker in Koramangala. Offering singing lessons, concert plus-one, and baking sessions.",
                ["Cooking & Baking", "Plus-One", "Fine Dining", "Event Host"], VerificationStatus.PendingReview, false),
            new(87, "Siddhant", "Chaturvedi", "Male", 14, 1450m, 5.00m, 81,
                "Spoken-word poet, calisthenics spotter, and Noida evening walk companion.",
                ["Gym Spotter", "Language Practice", "Evening Chai & Gupshup"], VerificationStatus.PendingReview, false),
            new(88, "Sharvari", "Wagh", "Female", 20, 1350m, 5.00m, 83,
                "Maharashtrian festive rangoli artist, scuba enthusiast, and Kalyani Nagar cycling partner.",
                ["Festival & Pooja Decor", "Cycling", "Cafe & Chat"], VerificationStatus.PendingReview, false),
            new(89, "Vedang", "Raina", "Male", 15, 1500m, 5.00m, 80,
                "R&B guitarist, pickleball player, and Hitec City coffee hopper.",
                ["Tennis", "Cafe & Chat", "Event Host"], VerificationStatus.PendingReview, false),

            // 90..93: 4 Rejected Companion Applications (Status = Rejected, IsActive = false) with detailed Admin Rejection Reasons
            new(90, "Rhea", "Chakraborty", "Female", 8, 1500m, 0.00m, 60,
                "Social companion and lounge host in Andheri West.",
                ["Plus-One", "Cafe & Chat"], VerificationStatus.Rejected, false,
                RejectionReason: "Uploaded government ID document is blurry and cropped at the corners. Please re-upload a clear, unedited Aadhaar or Passport scan."),
            new(91, "Sooraj", "Pancholi", "Male", 9, 1600m, 0.00m, 55,
                "Gym spotter and fitness trainer in Juhu.",
                ["Gym Spotter"], VerificationStatus.Rejected, false,
                RejectionReason: "Live selfie verification photo does not match the primary gallery portraits (sunglasses/hat obscuring face)."),
            new(92, "Urvashi", "Rautela", "Female", 6, 3200m, 0.00m, 62,
                "Pageant coach and gala plus-one in BKC.",
                ["Plus-One", "Event Host"], VerificationStatus.Rejected, false,
                RejectionReason: "Bio and service description must specify concrete platonic activities in accordance with Cue Community Guidelines."),
            new(93, "Prateik", "Babbar", "Male", 19, 1400m, 0.00m, 58,
                "MMA conditioning buddy in Koregaon Park.",
                ["Gym Spotter", "Running Buddy"], VerificationStatus.Rejected, false,
                RejectionReason: "Incomplete identity verification package; back side of address proof was omitted."),

            // 94..95: 2 Suspended Accounts (Status = Suspended, TrustScore = -1) for Admin Moderation Directory
            new(94, "Kamaal", "Khan", "Male", 8, 2000m, 3.20m, -1,
                "Film critic and social commentator.",
                ["Cafe & Chat"], VerificationStatus.Suspended, false,
                RejectionReason: "Account suspended by Trust & Safety due to repeated off-platform payment solicitation and rude chat conduct."),
            new(95, "Payal", "Rohatgi", "Female", 12, 1800m, 3.40m, -1,
                "Social media host and debate partner.",
                ["Evening Chai & Gupshup"], VerificationStatus.Suspended, false,
                RejectionReason: "Account suspended following two consecutive unexcused no-shows on confirmed bookings."),

            // 96..100: 5 Pure Seeker / Client Accounts across cities with high booking activity
            new(96, "Nikhil", "Arora", "Male", 0, 1000m, 5.00m, 96, "", ["Cafe & Chat"], VerificationStatus.Approved, false, IsPureSeeker: true),
            new(97, "Sneha", "Reddy", "Female", 15, 1000m, 5.00m, 98, "", ["Cafe & Chat"], VerificationStatus.Approved, false, IsPureSeeker: true),
            new(98, "Vikram", "Oberoi", "Male", 5, 1000m, 5.00m, 97, "", ["Cafe & Chat"], VerificationStatus.Approved, false, IsPureSeeker: true),
            new(99, "Anjali", "Mehta", "Female", 11, 1000m, 5.00m, 95, "", ["Cafe & Chat"], VerificationStatus.Approved, false, IsPureSeeker: true),
            new(100, "Raghav", "Forbes", "Male", 19, 1000m, 5.00m, 99, "", ["Cafe & Chat"], VerificationStatus.Approved, false, IsPureSeeker: true)
        };

        return list;
    }
}
