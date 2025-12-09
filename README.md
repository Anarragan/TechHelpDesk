# Tech Help Desk API

A comprehensive help desk ticketing system built with NestJS, TypeScript, and PostgreSQL. This system provides role-based access control for managing technical support tickets with clients, technicians, and administrators.

## Description

RESTful API for managing technical support tickets with authentication, authorization, and comprehensive business logic for ticket lifecycle management.

## Technologies Used

### Backend Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment

### Database
- **PostgreSQL** - Relational database
- **TypeORM** - Object-Relational Mapping

### Authentication & Security
- **JWT** - JSON Web Tokens
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing

### Validation & Documentation
- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **Swagger/OpenAPI** - API documentation

### Testing
- **Jest** - Testing framework
- **@nestjs/testing** - NestJS testing utilities

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Project Structure

```
tech-help-solution/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth & role guards
│   │   └── interceptors/    # Response interceptors
│   ├── config/              # Configuration files
│   ├── database/            # Database configuration
│   │   └── seed/            # Database seeders
│   └── modules/
│       ├── auth/            # Authentication module
│       ├── users/           # User management
│       ├── roles/           # Role management
│       ├── clients/         # Client profiles
│       ├── technicians/     # Technician profiles
│       ├── categories/      # Ticket categories
│       └── tickets/         # Ticket management
├── test/                    # E2E tests
├── coverage/                # Test coverage reports
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
└── package.json             # Dependencies
```

## Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

### Development Mode
```bash
# Start in watch mode
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker
```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop containers
docker-compose down
```

## Testing

```bash
# Unit tests
npm run test

# Test coverage (minimum 40% required)
npm run test:cov

# E2E tests
npm run test:e2e
```

## API Documentation

The API documentation is available via Swagger UI once the application is running.

**Access Swagger:** `http://localhost:3000/api`

### Swagger Examples

#### Authentication Endpoints

**POST /auth/register** - Register a new user
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "roleId": 1
}
```

**POST /auth/login** - Login
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "CLIENT"
  }
}
```

#### Ticket Endpoints

**POST /tickets** - Create a new ticket
```json
{
  "title": "Computer not turning on",
  "description": "My workstation won't boot after power outage",
  "priority": "HIGH",
  "clientId": 1,
  "categoryId": 2,
  "createdById": 1
}
```

**PATCH /tickets/:id** - Update ticket status
```json
{
  "status": "IN_PROGRESS"
}
```

**GET /tickets** - Get all tickets
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Computer not turning on",
    "status": "OPEN",
    "priority": "HIGH",
    "client": {
      "id": 1,
      "name": "John Doe"
    },
    "category": {
      "id": 2,
      "name": "Hardware"
    }
  }
]
```

#### Categories Endpoints

**GET /categories** - List all categories
**POST /categories** - Create a category (Admin only)
```json
{
  "name": "Software",
  "description": "Software-related issues"
}
```

## Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=techhelpdesk

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## Features

- ✅ **Role-Based Access Control** (RBAC)
  - Admin, Technician, Client roles
  - Custom decorators for authorization

- ✅ **Ticket Management**
  - Create, update, delete tickets
  - Status workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
  - Priority levels: LOW, MEDIUM, HIGH

- ✅ **Business Rules**
  - Technicians can only be assigned to max 5 in-progress tickets
  - Status transitions validation
  - Role-based data visibility

- ✅ **Authentication**
  - JWT-based authentication
  - Password encryption with bcrypt
  - Protected routes

- ✅ **Testing**
  - Unit tests for critical business logic
  - 45%+ code coverage
  - Ticket creation and status change tests

- ✅ **Docker Support**
  - Multi-stage Dockerfile
  - Docker Compose with PostgreSQL
  - Persistent volumes

## License

This project is [MIT licensed](LICENSE).
