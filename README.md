# LinkedIn Replica

Day 1 deployable LinkedIn-style professional network app.

## Stack

- **Frontend:** React (Vite) + TailwindCSS
- **Backend:** Node.js + Express + MongoDB
- **Auth:** JWT in HTTP-only cookies

## Setup

```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and secrets

# Run dev (both client + server)
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000

## API

All endpoints are versioned under `/api/v1/`.

Response shape: `{ success, message, data, statusCode }`
