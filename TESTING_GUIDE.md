# EventLite Testing Guide

## 🚀 Quick Start Testing

### 1. Test Account Registration
1. Navigate to: `http://localhost:3000/register`
2. Create test accounts:

#### Test User Accounts:
- **Attendee**: 
  - Username: `attendee1`
  - Email: `attendee1@test.com`
  - Password: `password123`
  - Role: Attendee

- **Staff**: 
  - Username: `staff1`
  - Email: `staff1@test.com`
  - Password: `password123`
  - Role: Staff

- **Event Creator**: 
  - Username: `creator1`
  - Email: `creator1@test.com`
  - Password: `password123`
  - Role: Event Creator

### 2. Test Login Flow
- Login with each account
- Verify automatic dashboard redirection:
  - Attendee → `/attendee`
  - Staff → `/staff`
  - Event Creator → `/creator`

### 3. Test Super Admin Access
- **Email**: `admin@eventlite.com`
- **Password**: `admin123456`
- **Role**: Super Admin
- **URL**: `/super-admin`

### 4. Test Event Management (Event Creator)
1. Login as Event Creator
2. Navigate to event management
3. Create a test event:
   - Title: "Test Event 2024"
   - Description: "This is a test event"
   - Location: "Test Location"
   - Max Attendees: 50
   - Start Date: Future date
   - End Date: Future date
4. Publish the event
5. Verify event appears in list

### 5. Test Event Registration (Attendee)
1. Login as Attendee
2. Browse events
3. Register for the created event
4. Check registration history
5. View QR code (if available)

### 6. Test Access Control
1. Try accessing wrong role URLs:
   - Attendee tries `/creator` → Should redirect to `/unauthorized`
   - Staff tries `/creator` → Should redirect to `/unauthorized`
   - Event Creator tries `/super-admin` → Should redirect to `/unauthorized`

### 7. Test Token Refresh
1. Login as any user
2. Wait for token to expire (15 minutes)
3. Perform an action
4. System should automatically refresh token

## 🔍 API Testing

### Test Registration API
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5001/api/auth/register -Method POST -ContentType "application/json" -Body '{"username":"testuser","email":"test@example.com","password":"password123","role":"attendee"}'
```

### Test Login API
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5001/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```

### Test Health Check
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5001/health -Method GET
```

## 🎯 Expected Results

### ✅ Registration
- Status 201 Created
- Returns user object with JWT token
- Automatic redirect to role-based dashboard

### ✅ Login
- Status 200 OK
- Returns JWT tokens
- Automatic redirect to role-based dashboard

### ✅ Role-Based Access
- Each role sees different dashboard
- Unauthorized access blocked
- Proper error handling

### ✅ Event Management
- Event CRUD operations work
- Status transitions work (draft → published → closed)
- QR code generation works

## 🔧 Troubleshooting

### If Registration Fails:
1. Check backend console for errors
2. Verify MongoDB connection
3. Check network requests in browser dev tools
4. Verify port 5001 is accessible

### If Login Fails:
1. Verify password is correct
2. Check JWT token generation
3. Verify user exists in database
4. Check token validation logic

### If Dashboard Issues:
1. Check role-based routing
2. Verify JWT token parsing
3. Check user permissions
4. Verify API calls are working

## 📊 Performance Testing

### Load Testing
- Create multiple accounts simultaneously
- Test concurrent event registrations
- Verify database performance
- Check API response times

### Stress Testing
- Test with maximum event capacity
- Test with large number of users
- Verify system stability
- Check error handling

## 🚀 Production Readiness

### ✅ Security Tests
- SQL injection protection
- XSS protection
- CSRF protection
- Rate limiting
- Input validation

### ✅ Functionality Tests
- All CRUD operations
- Authentication flow
- Authorization checks
- Error handling
- Data validation

### ✅ Performance Tests
- API response times
- Database query optimization
- Frontend rendering performance
- Memory usage

---

**🎉 Your EventLite system is ready for comprehensive testing!**
