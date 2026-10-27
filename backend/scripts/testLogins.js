async function testAuth(phone, password, label) {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    console.log(`[${label}] Status: ${res.status}, Success: ${data.success}, Role: ${data.user?.role}, Name: ${data.user?.name}`);
    return data.token;
  } catch (err) {
    console.error(`[${label}] Error:`, err.message);
  }
}

async function run() {
  console.log('Testing 3 portal authentication flows:');
  const userToken = await testAuth('9876543210', 'password123', 'Customer Portal');
  const salesToken = await testAuth('9821889900', 'password123', 'Sales Team Portal');
  const adminToken = await testAuth('9823000000', 'password123', 'Master Admin Console');

  if (salesToken) {
    const res = await fetch('http://localhost:5000/api/sales/my-stats', {
      headers: { 'Authorization': `Bearer ${salesToken}` }
    });
    const stats = await res.json();
    console.log('[Sales Stats API] Status:', res.status, 'Total customers:', stats.stats?.totalCustomers, 'Bank:', stats.agent?.bankDetails?.bankName);
  }

  if (adminToken) {
    const res1 = await fetch('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const users = await res1.json();
    console.log('[Admin Users API] Status:', res1.status, 'Total users:', users.users?.length);

    const res2 = await fetch('http://localhost:5000/api/admin/team', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const team = await res2.json();
    console.log('[Admin Team API] Status:', res2.status, 'Total team members:', team.team?.length);
  }
}

run();
