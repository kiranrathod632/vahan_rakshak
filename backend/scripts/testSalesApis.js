async function run() {
  try {
    // 1. Login as Sachin Gaikwad
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9821889900', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    console.log('Login Status:', loginRes.status, 'Success:', loginData.success, 'Role:', loginData.data?.role, 'Token exists:', !!token);

    // 2. Test /api/sales/my-stats
    const statsRes = await fetch('http://localhost:5000/api/sales/my-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('Stats API Success:', statsData.success);
    console.log('Metrics:', {
      totalCustomers: statsData.data?.metrics?.totalCustomers,
      todaySales: statsData.data?.metrics?.todaySales, // "Aaj kitne user active kiya"
      weekSales: statsData.data?.metrics?.weekSales,
      monthSales: statsData.data?.metrics?.monthSales,
      yearSales: statsData.data?.metrics?.yearSales,
      totalCommission: statsData.data?.metrics?.totalCommissionEarned
    });
    console.log('Attendance Summary:', statsData.data?.attendanceSummary);

    // 3. Test /api/sales/my-users
    const usersRes = await fetch('http://localhost:5000/api/sales/my-users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersRes.json();
    console.log('Users Count:', usersData.count, 'Sample User:', usersData.data?.[0]?.name, usersData.data?.[0]?.vehicleNumber);

    // 4. Test /api/sales/customer/:id (Eye button)
    if (usersData.data?.[0]?._id) {
      const custRes = await fetch(`http://localhost:5000/api/sales/customer/${usersData.data[0]._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const custData = await custRes.json();
      console.log('Customer Dossier API Success:', custData.success, 'Tag:', custData.data?.tag?.tagCode, 'Emergencies:', custData.data?.emergencyContacts?.length);
    }

    // 5. Test /api/sales/attendance
    const attRes = await fetch('http://localhost:5000/api/sales/attendance', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const attData = await attRes.json();
    console.log('Attendance Records Count:', attData.data?.records?.length, 'Summary:', attData.data?.summary);

    // 6. Test /api/sales/reports
    const repRes = await fetch('http://localhost:5000/api/sales/reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const repData = await repRes.json();
    console.log('Reports API Success:', repData.success, 'Weekly days count:', repData.data?.weekly?.length, 'Yearly months:', repData.data?.yearly?.length);

  } catch (err) {
    console.error('Test Error:', err);
  }
}

run();
