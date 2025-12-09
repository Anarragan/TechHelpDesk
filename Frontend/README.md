# Tech Help Desk Frontend

Frontend application for the Tech Help Desk ticketing system built with React and TypeScript.

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Axios** - HTTP client

## Features

- ✅ User authentication (Login)
- ✅ View all tickets
- ✅ Create new tickets
- ✅ Update ticket status (for technicians)
- ✅ Role-based UI (Admin, Technician, Client)
- ✅ Real-time API integration with Railway deployment

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Configuration

The frontend is configured to connect to the Railway-deployed API:

**API URL:** `https://techhelpdesk-production.up.railway.app`

The API URL is configured in `src/services/api.ts`.

## Usage

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Access:** `http://localhost:5173`

3. **Login with credentials from your API**

4. **Create and manage tickets**

## Project Structure

```
src/
├── components/         # Reusable components
├── context/           # React Context (Auth)
├── pages/             # Page components
│   ├── Login.tsx     # Login page
│   └── Tickets.tsx   # Tickets dashboard
├── services/          # API services
│   └── api.ts        # Axios configuration
├── styles/            # CSS files
│   ├── App.css
│   ├── Login.css
│   └── Tickets.css
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

No environment variables needed - API URL is hardcoded for Railway deployment.

## Features by Role

### Client
- View own tickets
- Create new tickets
- See ticket details

### Technician
- View assigned tickets
- Update ticket status
- Progress tickets through workflow

### Admin
- Full access to all tickets
- Manage users and categories
- Complete system control
