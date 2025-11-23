# Database Seeding

This script populates your database with mock data for testing purposes.

## Prerequisites

1. You need a Supabase service role key
2. Add it to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

You can find this key in your Supabase project settings under API > Project API keys > service_role key.

## Usage

1. **Install dependencies** (if not already installed):

   ```bash
   npm install
   ```

2. **Update the mock user email** in `scripts/seed.ts`:

   ```typescript
   const MOCK_USER_EMAIL = "your-test-email@example.com";
   ```

   Make sure this user exists in your Supabase Auth users.

3. **Run the seed script**:
   ```bash
   npm run seed
   ```

## What Gets Created

The seed script will create:

- **3 Accounts**:

  - Kas (Cash) - Rp5,000,000
  - Bank BCA - Rp15,000,000
  - E-Wallet - Rp2,000,000

- **9 Categories**:

  - Income: Gaji, Freelance, Investasi
  - Expense: Makanan, Transport, Belanja, Tagihan, Hiburan, Kesehatan

- **~200-300 Transactions** over 12 months:
  - 2-3 income transactions per month (Rp3M - Rp8M each)
  - 15-25 expense transactions per month with realistic amounts:
    - Makanan: Rp20K - Rp170K
    - Transport: Rp15K - Rp115K
    - Belanja: Rp50K - Rp550K
    - Tagihan: Rp100K - Rp400K
    - Hiburan: Rp50K - Rp250K
    - Kesehatan: Rp50K - Rp350K

## Notes

- The script uses the Supabase Admin API to bypass RLS policies
- Transactions are spread across the past 12 months
- All amounts are in Indonesian Rupiah (IDR)
- The script is idempotent - you can run it multiple times, but it will create duplicate data

## Cleaning Up

To remove the seeded data, you can:

1. Delete the test user from Supabase Auth (this will cascade delete all related data due to foreign key constraints)
2. Or manually delete from the Supabase dashboard
