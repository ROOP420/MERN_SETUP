# FastAPI Backend - Production-Ready Template

A secure, production-grade FastAPI backend with authentication, database support, and security best practices.

## 🚀 Features

- ✅ **JWT Authentication** - Access & refresh tokens with secure expiration
- ✅ **Password Security** - Bcrypt hashing with strong password requirements
- ✅ **Email Verification** - Account confirmation flow
- ✅ **Password Reset** - Forgot password functionality
- ✅ **Rate Limiting** - API protection from abuse
- ✅ **CORS** - Configured for frontend integration
- ✅ **Database Support** - PostgreSQL, MySQL, SQLite via SQLAlchemy (async)
- ✅ **MongoDB Support** - Motor async driver
- ✅ **Async Operations** - Fully async database operations
- ✅ **Pydantic Validation** - Strong input validation
- ✅ **Role-based Access** - Superuser and user roles
- ✅ **Error Handling** - Production-safe error responses
- ✅ **Logging** - Structured logging
- ✅ **Health Checks** - Endpoints for monitoring

## 📁 Project Structure

```
backend/
├── app/
│   ├── models/           # SQLAlchemy models
│   │   └── user.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py
│   │   └── auth.py
│   ├── routes/           # API routes
│   │   ├── auth.py       # Authentication endpoints
│   │   └── users.py      # User management
│   ├── middleware/       # Auth dependencies
│   │   └── auth.py
│   ├── utils/            # Utilities
│   │   ├── security.py   # JWT & password hashing
│   │   └── email.py      # Email sending
│   ├── config.py         # Settings
│   └── database.py       # Database configuration
├── main.py               # Application entry point
├── requirements.txt      # Dependencies
└── .env                  # Environment variables
```

## 🛠️ Setup

### 1. Create virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Create `.env` file:

```env
# Application
SECRET_KEY=your-secret-key-change-in-production-minimum-32-characters
DEBUG=True

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_TYPE=postgresql  # postgresql, mysql, sqlite, mongodb

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=FastAPI Backend

# CORS
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### 4. Run the application

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## 📝 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Get current user profile | Yes |
| PUT | `/api/users/me` | Update current user | Yes |
| PUT | `/api/users/me/change-password` | Change password | Yes |
| DELETE | `/api/users/me` | Deactivate account | Yes |
| GET | `/api/users/` | List all users (admin) | Yes (Superuser) |
| GET | `/api/users/{id}` | Get user by ID (admin) | Yes (Superuser) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| GET | `/api/health` | API health check |

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

### JWT Tokens
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- Tokens include user ID and email
- Proper token type validation

### Rate Limiting
- Default: 60 requests per minute per IP
- Configurable via environment

### Error Handling
- Production mode hides internal errors
- Development mode shows detailed errors
- All errors logged

## 🗄️ Database Support

### PostgreSQL (Recommended)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_TYPE=postgresql
```

### MySQL
```env
DATABASE_URL=mysql://user:password@localhost:3306/dbname
DATABASE_TYPE=mysql
```

### SQLite (Development)
```env
DATABASE_URL=sqlite:///./database.db
DATABASE_TYPE=sqlite
```

### MongoDB
```env
DATABASE_URL=mongodb://localhost:27017/dbname
DATABASE_TYPE=mongodb
```

## 📧 Email Configuration

For Gmail with App Password:

1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in SMTP_PASSWORD

## 🧪 Testing

```bash
pytest
```

## 📦 Dependencies

- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - SQL ORM (async)
- **Motor** - MongoDB async driver
- **Pydantic** - Data validation
- **python-jose** - JWT handling
- **Passlib** - Password hashing
- **slowapi** - Rate limiting
- **aiosmtplib** - Async email

## 🚀 Production Deployment

1. Set `DEBUG=False`
2. Use strong `SECRET_KEY` (minimum 32 characters)
3. Configure production database
4. Set up SMTP for emails
5. Configure CORS allowed origins
6. Use HTTPS
7. Set up monitoring

### Example with Gunicorn

```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📄 License

MIT
