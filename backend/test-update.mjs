const API = 'http://localhost:5000/api';

async function main() {
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eventlite.com', password: 'admin123456' }),
  });
  const login = await loginRes.json();
  if (!login.accessToken) {
    console.error('Login failed:', login);
    return;
  }
  const token = login.accessToken;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const usersRes = await fetch(`${API}/admin/users?limit=100`, { headers });
  const usersData = await usersRes.json();
  console.log('Users count:', usersData.users?.length);
  const target = usersData.users?.find((u) => u.role !== 'super_admin') || usersData.users?.[0];
  if (!target) {
    console.log('No users to test');
    return;
  }
  console.log('Target user before:', { id: target.id, username: target.username, email: target.email });

  const newUsername = target.username + '_x';
  const patchRes = await fetch(`${API}/admin/users/${target.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ username: newUsername, email: target.email, role: target.role }),
  });
  const patch = await patchRes.json();
  console.log('Patch status:', patchRes.status, patch);

  const usersRes2 = await fetch(`${API}/admin/users?limit=100`, { headers });
  const usersData2 = await usersRes2.json();
  const updated = usersData2.users?.find((u) => u.id === target.id);
  console.log('Target user after:', { id: updated?.id, username: updated?.username, email: updated?.email });

  // revert
  await fetch(`${API}/admin/users/${target.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ username: target.username, email: target.email, role: target.role }),
  });

  const tenantsRes = await fetch(`${API}/admin/tenants?limit=100`, { headers });
  const tenantsData = await tenantsRes.json();
  const tenant = tenantsData.tenants?.[0];
  if (tenant) {
    console.log('Tenant before:', { id: tenant.id, name: tenant.name });
    const patchTenant = await fetch(`${API}/admin/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: tenant.name, email: tenant.email, primaryColor: tenant.primaryColor, contactInfo: tenant.contactInfo }),
    });
    console.log('Tenant patch status:', patchTenant.status, await patchTenant.json());
  }
}

main().catch(console.error);
