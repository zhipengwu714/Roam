# Roam
> Your city, for free, without the BS.

---

## Overview
Roam is a group activity decision app for urban explorers. Friends join a session, swipe on free things to do nearby, vote live on a shared screen, and get routed to the winning spot — bathrooms included.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| Maps | Google Maps API |
| AI | Anthropic Claude API |
| Deploy | Vercel (frontend) · Railway (backend) |

---

## Features

### 1. Group Session (Join Code)
- Host creates a session → receives a short code (e.g. `ROAM-4829`)
- Friends join via code on their phones
- Session state managed server-side via Socket.io rooms

### 2. Swipe / Voting
- Each user gets an independent feed of free nearby places
- Swipe right = vote, swipe left = pass
- Votes are counted as pure right-swipe totals (most votes wins)

### 3. Live Leaderboard
- Big screen view updates in real time as votes come in
- Places ranked by vote count with animated bars
- Tiebreaker resolved by on-screen roulette wheel spin

### 4. Map + Bathrooms
- Winning place shown on Google Map with route from current location
- Bathroom pins surfaced along the route
- Each bathroom rated by: cleanliness, safety, availability

### 5. AI Decision API
- Endpoint: `POST /api/decide`
- Input: group size, budget, activity preferences, location
- Returns: ranked activity suggestions with reasoning
- Powered by Claude API

---

## Project Structure

```
roam/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwipeCard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── RouletteWheel.jsx
│   │   │   ├── MapView.jsx
│   │   │   └── JoinSession.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Session.jsx
│   │   │   └── BigScreen.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
│
├── server/                  # Node + Express + Socket.io
│   ├── index.js             # Entry point
│   ├── routes/
│   │   ├── session.js       # Create/join session
│   │   └── decide.js        # AI decision endpoint
│   ├── sockets/
│   │   └── sessionSocket.js # Real-time vote handling
│   └── data/
│       └── places.js        # Seeded free places dataset
│
├── .env.example
├── package.json
└── README.md
```

---

## API Endpoints

### Sessions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/session/create` | Create a new session, returns code |
| `POST` | `/api/session/join` | Join session by code |
| `GET` | `/api/session/:code` | Get session state |

### Places
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/places` | Get free places near a location |
| `GET` | `/api/bathrooms` | Get rated bathrooms near a route |

### AI
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/decide` | AI activity recommender |

#### `POST /api/decide` — Request Body
```json
{
  "groupSize": 6,
  "budget": 20,
  "preferences": ["outdoors", "food", "art"],
  "location": { "lat": 40.7128, "lng": -74.0060 }
}
```

#### Response
```json
{
  "recommendations": [
    {
      "name": "The High Line",
      "reason": "Free, outdoors, fits 6 easily, near food vendors",
      "score": 0.94
    }
  ]
}
```

---

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `session:join` | Client → Server | `{ code, userId }` |
| `session:vote` | Client → Server | `{ placeId, direction }` |
| `session:update` | Server → Client | `{ scores[] }` |
| `session:decide` | Server → Client | `{ winner, roulette? }` |

---

## Getting Started

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Run dev
cd client && npm run dev
cd ../server && npm run dev
```

---

## Team

| Name | Owns |
|---|---|
| TBD | Swipe UI + Session join |
| TBD | Live leaderboard + Roulette |
| TBD | Map + Bathroom layer |
| TBD | Backend + Sockets |
| TBD | AI decide endpoint |
