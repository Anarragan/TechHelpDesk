# API Documentation - Tech Help Desk

## Overview

The API has been fully documented using **Swagger/OpenAPI**. All responses follow a standardized format using the `TransformInterceptor`.

## Features Implemented

### 1. Transform Interceptor
All API responses are automatically transformed to follow this standard format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Request successful"
}
```

**Location:** `src/common/interceptors/transform.interceptor.ts`

### 2. Swagger Documentation
Complete API documentation with:
- Request/Response examples for all endpoints
- Authentication requirements
- Role-based access control indicators
- Parameter descriptions
- Status code explanations

## Accessing the Documentation

Once the server is running:

```bash
npm run start:dev
```

Visit: **http://localhost:3000/api**

You will see the interactive Swagger UI with all documented endpoints.

## Using Swagger UI

### 1. Authentication
1. Click the **"Authorize"** button (lock icon) at the top right
2. Login using the `/auth/login` endpoint to get your JWT token
3. Copy the `access_token` from the response
4. Click **"Authorize"** again and paste the token in the format: `Bearer {your_token}`
5. Click **"Authorize"** and then **"Close"**

Now all authenticated requests will include your JWT token.

### 2. Testing Endpoints

Each endpoint shows:
- **Method and Path**: GET, POST, PATCH, DELETE
- **Summary**: Brief description
- **Parameters**: Required and optional parameters
- **Request Body**: Example JSON for POST/PATCH requests
- **Responses**: Examples for different status codes

### 3. Try It Out
1. Click on any endpoint to expand it
2. Click **"Try it out"**
3. Fill in the parameters or request body
4. Click **"Execute"**
5. See the response below

## API Groups (Tags)

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Tickets
- `POST /tickets` - Create ticket (ADMIN, CLIENT)
- `GET /tickets` - Get all tickets (filtered by role)
- `GET /tickets/:id` - Get ticket by ID
- `PATCH /tickets/:id` - Update ticket (ADMIN, TECHNICIAN)
- `DELETE /tickets/:id` - Delete ticket (ADMIN)

### Categories
- `POST /categories` - Create category (ADMIN)
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category (ADMIN)
- `DELETE /categories/:id` - Delete category (ADMIN)

### Users
- `POST /users` - Create user (ADMIN)
- `GET /users` - Get all users (ADMIN)
- `GET /users/:id` - Get user by ID (ADMIN)
- `PATCH /users/:id` - Update user (ADMIN)
- `DELETE /users/:id` - Delete user (ADMIN)

### Technicians
- `POST /technicians` - Create technician (ADMIN)
- `GET /technicians` - Get all technicians (ADMIN)
- `GET /technicians/:id` - Get technician by ID (ADMIN)
- `PATCH /technicians/:id` - Update technician (ADMIN)
- `DELETE /technicians/:id` - Delete technician (ADMIN)

### Clients
- `POST /clients` - Create client (ADMIN)
- `GET /clients` - Get all clients (ADMIN)
- `GET /clients/:id` - Get client by ID (ADMIN)
- `PATCH /clients/:id` - Update client (ADMIN)
- `DELETE /clients/:id` - Delete client (ADMIN)

## Response Format Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Computer not working",
    "status": "OPEN"
  },
  "message": "Request successful"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Invalid status transition: OPEN → RESOLVED. Allowed transitions from OPEN: IN_PROGRESS",
  "error": "Bad Request"
}
```

## Business Rules Documented

All business validations are documented in Swagger:

1. **Ticket Creation**
   - Client and Category are required
   - Technician workload validation (max 5 in-progress)

2. **Status Transitions**
   - Valid sequence: OPEN → IN_PROGRESS → RESOLVED → CLOSED
   - Invalid transitions return descriptive error messages

3. **Role-Based Access**
   - ADMIN: Full access to all resources
   - TECHNICIAN: View and update assigned tickets only
   - CLIENT: Create tickets and view own history

## Swagger Configuration

Configuration in `main.ts`:
```typescript
const config = new DocumentBuilder()
  .setTitle('Tech Help Desk API')
  .setDescription('API for managing technical support tickets')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }, 'JWT-auth')
  .build();
```

## DTOs with Examples

All DTOs include:
- `@ApiProperty` decorators with examples
- Type validation
- Required/Optional indicators
- Enum values where applicable

Example from `CreateTicketDto`:
```typescript
@ApiProperty({
  example: 'Computer not turning on',
  description: 'Ticket title',
  minLength: 5,
})
@IsString()
@MinLength(5)
title: string;
```

## Testing Workflow

1. **Start Server**: `npm run start:dev`
2. **Open Swagger**: http://localhost:3000/api
3. **Register/Login**: Use auth endpoints to get JWT
4. **Authorize**: Add JWT to Swagger authorization
5. **Test Endpoints**: Try different operations based on role
6. **View Responses**: See standardized response format

## Notes

- All endpoints (except auth) require JWT authentication
- Role restrictions are clearly marked in operation summaries
- Request/Response examples match the actual API behavior
- Error responses include descriptive messages for debugging
