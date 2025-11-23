import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Mock user email - change this to your test user email
const MOCK_USER_EMAIL = 'nasgunawann@gmail.com'

const categories = {
  income: [
    { name: 'Gaji', icon: '💰', color: '#22c55e' },
    { name: 'Freelance', icon: '💼', color: '#10b981' },
    { name: 'Investasi', icon: '📈', color: '#14b8a6' },
  ],
  expense: [
    { name: 'Makanan', icon: '🍔', color: '#ef4444' },
    { name: 'Transport', icon: '🚗', color: '#f97316' },
    { name: 'Belanja', icon: '🛒', color: '#ec4899' },
    { name: 'Tagihan', icon: '📄', color: '#8b5cf6' },
    { name: 'Hiburan', icon: '🎬', color: '#06b6d4' },
    { name: 'Kesehatan', icon: '🏥', color: '#84cc16' },
  ]
}

async function seed() {
  try {
    console.log('🌱 Starting seed...')

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const user = users.find((u: any) => u.email === MOCK_USER_EMAIL)
    if (!user) {
      console.error(`❌ User with email ${MOCK_USER_EMAIL} not found`)
      console.log('Available users:', users.map((u: any) => u.email))
      return
    }

    console.log(`✅ Found user: ${user.email}`)

    // Create accounts
    console.log('Creating accounts...')
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .insert([
        { user_id: user.id, name: 'Kas', type: 'cash', balance: 5000000, icon: '💵', color: '#22c55e' },
        { user_id: user.id, name: 'Bank BCA', type: 'bank', balance: 15000000, icon: '🏦', color: '#3b82f6' },
        { user_id: user.id, name: 'E-Wallet', type: 'ewallet', balance: 2000000, icon: '📱', color: '#8b5cf6' },
      ])
      .select()

    if (accountError) throw accountError
    console.log(`✅ Created ${accounts.length} accounts`)

    // Create categories
    console.log('Creating categories...')
    const allCategories = [...categories.income, ...categories.expense]
    const { data: createdCategories, error: categoryError } = await supabase
      .from('categories')
      .insert(
        allCategories.map(cat => ({
          user_id: user.id,
          name: cat.name,
          type: categories.income.includes(cat) ? 'income' : 'expense',
          icon: cat.icon,
          color: cat.color
        }))
      )
      .select()

    if (categoryError) throw categoryError
    console.log(`✅ Created ${createdCategories.length} categories`)

    // Generate transactions for the past 12 months
    console.log('Generating transactions...')
    const transactions = []
    const now = new Date()

    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
      const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

      // Income transactions (2-3 per month)
      const incomeCount = Math.floor(Math.random() * 2) + 2
      for (let i = 0; i < incomeCount; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const date = new Date(month.getFullYear(), month.getMonth(), day)
        const category = createdCategories.filter((c: any) => c.type === 'income')[Math.floor(Math.random() * 3)]
        const account = accounts[Math.floor(Math.random() * accounts.length)]
        
        transactions.push({
          user_id: user.id,
          type: 'income',
          amount: Math.floor(Math.random() * 5000000) + 3000000, // 3M - 8M
          category_id: category.id,
          account_id: account.id,
          date: date.toISOString(),
          description: `${category.name} - ${month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
        })
      }

      // Expense transactions (15-25 per month)
      const expenseCount = Math.floor(Math.random() * 11) + 15
      for (let i = 0; i < expenseCount; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const date = new Date(month.getFullYear(), month.getMonth(), day)
        const category = createdCategories.filter((c: any) => c.type === 'expense')[Math.floor(Math.random() * 6)]
        const account = accounts[Math.floor(Math.random() * accounts.length)]
        
        let amount
        if (category.name === 'Makanan') {
          amount = Math.floor(Math.random() * 150000) + 20000 // 20K - 170K
        } else if (category.name === 'Transport') {
          amount = Math.floor(Math.random() * 100000) + 15000 // 15K - 115K
        } else if (category.name === 'Belanja') {
          amount = Math.floor(Math.random() * 500000) + 50000 // 50K - 550K
        } else if (category.name === 'Tagihan') {
          amount = Math.floor(Math.random() * 300000) + 100000 // 100K - 400K
        } else if (category.name === 'Hiburan') {
          amount = Math.floor(Math.random() * 200000) + 50000 // 50K - 250K
        } else {
          amount = Math.floor(Math.random() * 300000) + 50000 // 50K - 350K
        }

        transactions.push({
          user_id: user.id,
          type: 'expense',
          amount,
          category_id: category.id,
          account_id: account.id,
          date: date.toISOString(),
          description: `${category.name} - ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
        })
      }
    }

    // Insert transactions in batches
    const batchSize = 100
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      const { error: txError } = await supabase
        .from('transactions')
        .insert(batch)

      if (txError) throw txError
      console.log(`✅ Inserted ${Math.min(i + batchSize, transactions.length)}/${transactions.length} transactions`)
    }

    console.log('🎉 Seed completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Accounts: ${accounts.length}`)
    console.log(`   - Categories: ${createdCategories.length}`)
    console.log(`   - Transactions: ${transactions.length}`)

  } catch (error) {
    console.error('❌ Seed failed:', error)
  }
}

seed()
