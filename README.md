# EventLite - Event Management Platform

A comprehensive event management platform with role-based access control (RBAC), JWT authentication, and QR code functionality.

## 🚀 Features

### Authentication & Authorization
- **JWT Authentication** with access and refresh tokens
- **Role-Based Access Control (RBAC)** with 4 roles:
  - **Super Admin**: Platform management, user management, analytics
  - **Event Creator**: Create/edit events, manage registrations, assign staff
  - **Staff**: QR code scanning, attendance tracking, event management
  - **Attendee**: Event registration, QR code display, registration history
- **Secure Password Hashing** with bcrypt
- **Token Refresh** with automatic renewal

### Event Management
- **Full CRUD Operations** for events
- **Event Status Management**: Draft → Published → Closed
- **QR Code Generation** for events
- **Search & Filtering** with advanced filters
- **Registration System** with capacity limits
- **Attendance Tracking** with QR scanning

### User Interface
- **Role-Specific Dashboards** for each user type
- **Responsive Design** with TailwindCSS
- **Real-time Updates** and notifications
- **Professional UI** with modern components

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite** and **TypeScript**
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Hook Form** + **Zod** for forms and validation
- **React Router** for navigation
- **Lucide React** for icons
- **JWT Decode** for token management

### Backend
- **Node.js** with **Express** and **TypeScript**
- **MongoDB Atlas** for database
- **JWT** (Access + Refresh tokens) for authentication
- **Zod** for validation
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

## 📁 Project Structure
```
EventLite/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── services/       # API services
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── scripts/        # Database scripts
│   └── package.json
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd EventLite
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment Setup**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
```

4. **Start the development servers**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health Check: `http://localhost:5000/health`

## 🔐 Test User Credentials

The following test users are available for testing all roles:

### Super Admin
- **Username**: superadmin
- **Password**: admin123
- **Email**: superadmin@eventlite.com

### Event Creator
- **Username**: eventcreator1
- **Password**: creator123
- **Email**: creator1@eventlite.com

- **Username**: eventcreator2
- **Password**: creator123
- **Email**: creator2@eventlite.com

### Staff
- **Username**: staff1
- **Password**: staff123
- **Email**: staff1@eventlite.com

- **Username**: staff2
- **Password**: staff123
- **Email**: staff2@eventlite.com

### Attendee
- **Username**: attendee1
- **Password**: attendee123
- **Email**: attendee1@eventlite.com

- **Username**: attendee2
- **Password**: attendee123
- **Email**: attendee2@eventlite.com

- **Username**: attendee3
- **Password**: attendee123
- **Email**: attendee3@eventlite.com

⚠️ **Important**: These are test credentials only. Change passwords in production!

### Seeding Test Users
To recreate test users, run:
```bash
cd backend
npm run seed
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Events
- `GET /api/events` - Get events (with filters)
- `POST /api/events` - Create event (Event Creator only)
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event (Event Creator only)
- `DELETE /api/events/:id` - Delete event (Event Creator only)
- `POST /api/events/:id/publish` - Publish event
- `POST /api/events/:id/close` - Close event
- `GET /api/events/:id/qrcode` - Generate QR code

### Registrations
- `POST /api/registrations` - Register for event (Attendee only)
- `GET /api/registrations/my-registrations` - Get user registrations
- `DELETE /api/registrations/:eventId` - Cancel registration

## 🎯 Role-Based Access

### Super Admin (`/super-admin`)
- Manage all users
- Platform analytics
- System settings
- Database management

### Event Creator (`/creator`)
- Create and manage events
- View registrations
- Assign staff to events
- Event analytics

### Staff (`/staff`)
- Scan QR codes
- Mark attendance
- View assigned events
- Attendance reports

### Attendee (`/attendee`)
- Browse and register for events
- View personal QR codes
- Registration history
- Event details

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventlite
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
# Deploy to your hosting service (Heroku, Vercel, etc.)
```

## 🧪 Testing

### Manual Testing
1. **User Registration**: Test all roles (except super_admin)
2. **Login Flow**: Verify role-based redirection
3. **Event Management**: Test CRUD operations
4. **Access Control**: Verify role restrictions
5. **QR Code**: Test generation and scanning

### API Testing
```bash
# Health check
curl http://localhost:5000/health

# Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","role":"attendee"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for event management excellence**
