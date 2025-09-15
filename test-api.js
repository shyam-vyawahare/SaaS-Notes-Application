// Simple API test script
// Run with: node test-api.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const testAccounts = [
  { email: 'admin@acme.test', password: 'password', tenant: 'acme', role: 'ADMIN' },
  { email: 'user@acme.test', password: 'password', tenant: 'acme', role: 'MEMBER' },
  { email: 'admin@globex.test', password: 'password', tenant: 'globex', role: 'ADMIN' },
  { email: 'user@globex.test', password: 'password', tenant: 'globex', role: 'MEMBER' }
]

async function testEndpoint(method, url, headers = {}, body = null) {
  try {
    const options = { method, headers }
    if (body) {
      options.body = JSON.stringify(body)
      headers['Content-Type'] = 'application/json'
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options)
    const data = await response.json()
    
    return {
      status: response.status,
      data,
      success: response.ok
    }
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false
    }
  }
}

async function login(email, password) {
  const result = await testEndpoint('POST', '/api/auth/login', {}, { email, password })
  return result.success ? result.data.token : null
}

async function runTests() {
  console.log('🧪 Starting API Tests...\n')
  
  // Test 1: Health endpoint
  console.log('1. Testing health endpoint...')
  const health = await testEndpoint('GET', '/api/health')
  console.log(`   Status: ${health.status} ${health.success ? '✅' : '❌'}`)
  console.log(`   Response: ${JSON.stringify(health.data)}\n`)
  
  // Test 2: Login for all test accounts
  console.log('2. Testing login for all accounts...')
  const tokens = {}
  
  for (const account of testAccounts) {
    const token = await login(account.email, account.password)
    tokens[account.email] = token
    console.log(`   ${account.email}: ${token ? '✅' : '❌'}`)
  }
  console.log()
  
  // Test 3: Test tenant isolation
  console.log('3. Testing tenant isolation...')
  const acmeToken = tokens['admin@acme.test']
  const globexToken = tokens['admin@globex.test']
  
  if (acmeToken && globexToken) {
    // Get notes for Acme
    const acmeNotes = await testEndpoint('GET', '/api/notes', {
      'Authorization': `Bearer ${acmeToken}`
    })
    
    // Get notes for Globex
    const globexNotes = await testEndpoint('GET', '/api/notes', {
      'Authorization': `Bearer ${globexToken}`
    })
    
    console.log(`   Acme notes: ${acmeNotes.data.length} notes`)
    console.log(`   Globex notes: ${globexNotes.data.length} notes`)
    console.log(`   Tenant isolation: ${acmeNotes.data.length !== globexNotes.data.length ? '✅' : '❌'}\n`)
  }
  
  // Test 4: Test note creation and limits
  console.log('4. Testing note creation and limits...')
  if (acmeToken) {
    // Try to create a note
    const createNote = await testEndpoint('POST', '/api/notes', {
      'Authorization': `Bearer ${acmeToken}`
    }, {
      title: 'Test Note',
      content: 'This is a test note'
    })
    
    console.log(`   Create note: ${createNote.success ? '✅' : '❌'}`)
    console.log(`   Response: ${JSON.stringify(createNote.data)}\n`)
  }
  
  // Test 5: Test upgrade endpoint (Admin only)
  console.log('5. Testing upgrade endpoint...')
  if (acmeToken) {
    const upgrade = await testEndpoint('POST', '/api/tenants/acme/upgrade', {
      'Authorization': `Bearer ${acmeToken}`
    })
    
    console.log(`   Upgrade tenant: ${upgrade.success ? '✅' : '❌'}`)
    console.log(`   Response: ${JSON.stringify(upgrade.data)}\n`)
  }
  
  // Test 6: Test member cannot upgrade
  console.log('6. Testing member cannot upgrade...')
  const memberToken = tokens['user@acme.test']
  if (memberToken) {
    const memberUpgrade = await testEndpoint('POST', '/api/tenants/acme/upgrade', {
      'Authorization': `Bearer ${memberToken}`
    })
    
    console.log(`   Member upgrade attempt: ${!memberUpgrade.success ? '✅ (Correctly blocked)' : '❌ (Should be blocked)'}`)
    console.log(`   Response: ${JSON.stringify(memberUpgrade.data)}\n`)
  }
  
  console.log('🎉 API Tests completed!')
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testEndpoint, login, runTests }
