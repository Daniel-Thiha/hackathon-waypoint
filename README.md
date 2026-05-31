# CSC105-Hackathon-G11-Waypoint-FloodAid

## Group Information

| Student  ID |        Student  Name        | GitHub Username |Feature|
|:-:|-|:-:|:-:|
| 68130500840 |      Thiha Phone Thaw       |  Daniel-Thiha   | Survivor self-segistration & SOS |
| 68130500844 |     Ye Htet Maung Maung     |     YeHtetMM    | Rescue dispatch with path-finder |
| 68130500857 |   Chatdanai Denis Smolman   |    DenniTrea    | Flood Forecast |
| 68130500870 |     SIRISAK KOTKHANGPHU     |      ballDp     | Safe Place Management |

---

## Table of Contents

- [Short Description](#short-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Run](#run)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Short Description

FloodAid bridges the coordination gap that costs lives during flood disasters.

When flooding hits, victims struggle to find safe places, rescuers search blindly without knowing who needs help or where, and authorities have no unified tool to manage response in real time. FloodAid puts all three roles — **admins**, **survivors**, and **rescue teams** — on a single shared live map, closing the loop from early flood warning to safe rescue.

---

## Features

### Flood Forecast
- **Admin-published flood zones** — admins draw and post forecast zones directly on the shared map so survivors know what areas are at risk and when.
- All connected users see forecast updates in real time.

---

### Safe Place Management
- **Admins create safe places** — each safe place has a name, location pinned on the map, and a maximum capacity.
- **Food and water distribution schedules** — admins attach supply distribution times to each safe place so survivors know what to expect on arrival.
- Safe places are automatically marked as full when capacity is reached.

---

### Survivor Self-Registration & SOS
- **Safe place registration** — survivors browse available safe places on the map filtered by distance, view capacity and distribution schedules, and register to claim a spot. Registration generates a unique reference ID.
- **SOS rescue request** — survivors who cannot reach a safe place on their own send an SOS directly to a nearby available rescue team member. The request includes the survivor's live GPS location and their registered safe place destination.
- **Auto-reassignment** — if a rescue team member does not accept within 60 seconds, the SOS is automatically reassigned to the next nearest available rescuer.
- **Live location sharing** — once an SOS is accepted, the survivor's GPS streams live to the rescuer until the mission is marked complete. Last known coordinates are always persisted in case of connection loss.

---

### Rescue Dispatch  with Path-Finder
- **Rescue team dashboard** — team members see incoming SOS alerts with survivor location, name, reference ID, registered safe place, and any notes left by the survivor.
- **Availability status** — team members toggle between `available` and `on_mission`. Only available members appear to survivors requesting rescue.
- **Mission tracking** — team members navigate to the survivor's live location and mark the mission complete on arrival at the safe place, automatically returning to available status.

---

### Shared Live Map (Basic)
- A single real-time map visible to all roles showing:
  - Flood forecast zones
  - Active safe places with capacity status
  - Live SOS pins
  - Rescue team positions
- Each role sees only the controls and interactions relevant to them — on the same map.

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui + Radix UI | latest | Accessible component primitives |
| React Router | 7 | Client-side routing |
| React Hook Form + Zod | latest | Forms & validation |
| React Leaflet | latest | Interactive map |
| geolib | latest | Haversine distance calculation |
| Socket.IO Client | latest | Real-time events |
| date-fns | 4 | Date formatting |
| Lucide React | latest | Icon set |

### Backend

| Library | Version | Purpose |
|---|---|---|
| Express | 5 | HTTP server |
| TypeScript | 6 | Type safety |
| Prisma | 7 | ORM & migrations |
| SQLite | — | Database |
| bcrypt | 6 | Password hashing |
| Socket.IO | latest | Real-time communication |
| Morgan | — | HTTP request logging |
| CORS | — | Cross-origin requests |

---

## Project Structure

```
hackathon-waypoint/
├── backend/                        # Express 5 + TypeScript + Prisma + SQLite
│   ├── prisma/
│   │   ├── schema.prisma           # Database models
│   │   ├── seed.ts                 # Demo data (zones, shelters, rescue teams, SOS)
│   │   └── migrations/             # Auto-generated Prisma migrations
│   ├── src/
│   │   ├── index.ts                # App entry point (Express + CORS + cookie-parser)
│   │   ├── routers.ts              # Root router — mounts all module routers
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts  # requireAuth / requireRole guards
│   │   │   └── error_handler.ts    # Centralised error response
│   │   └── modules/
│   │       ├── auth/               # Login, logout, register, session
│   │       ├── forecast/           # Flood zone CRUD
│   │       ├── safe-place/         # Safe place CRUD
│   │       ├── survivor/           # Safe place registration + SOS requests
│   │       ├── rescue/             # Mission management + team status
│   │       └── active-location/    # Live GPS broadcast (unauthenticated)
│   ├── .env.example
│   └── package.json
│
└── frontend/                       # React 19 + TypeScript + Vite + Leaflet
    ├── src/
    │   ├── App.tsx                 # Root layout
    │   ├── routers.tsx             # React Router browser router
    │   ├── api.ts                  # Axios instance
    │   ├── hooks/
    │   │   ├── useMyLocation.ts    # Browser Geolocation wrapper
    │   │   └── usePolling.ts       # Generic polling hook
    │   ├── middlewares/
    │   │   └── ProtectedRoute.tsx  # Role-based route guard
    │   └── modules/
    │       ├── auth/               # Landing, login pages, admin/rescuer dashboards
    │       ├── map/                # Shared live map (BaseMap, layers, legend, controls)
    │       ├── forecast/           # Flood zone form + map layer
    │       ├── safe-place/         # Safe place form + map layer
    │       ├── survivor/           # SOS form + SOS map pins
    │       ├── rescue/             # Rescue panel + team position layer
    │       └── active-location/    # Live location layer (survivor/volunteer dots)
    ├── .env.example
    └── package.json
```

---

## Run

### Prerequisites

- Node.js 20+
- npm 10+

### 1 — Backend

```bash
cd backend
cp .env.example .env        # set DATABASE_URL, PORT, JWT_SECRET, ALLOW_ORIGIN
npm install
npx prisma migrate dev      # create dev.db and run migrations
npx prisma db seed          # load demo zones, shelters, teams, and SOS requests
npm run dev                 # tsx watch — restarts on file changes
```

Server starts at `http://localhost:3000`.

### 2 — Frontend

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL=http://localhost:3000
npm install
npm run dev                 # Vite dev server with HMR
```

App opens at `http://localhost:5173`.

### Seed accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Rescue Team | `rescue1` | `rescue123` |
| Rescue Team | `rescue2` | `rescue123` |
| Rescue Team | `rescue3` | `rescue123` |

> Survivors are not accounts — they interact via the public `/survivor` page without logging in.

---

## API Reference

Base URL: `http://localhost:3000`

Authentication is cookie-based JWT. Protected routes require a valid session cookie set by `POST /auth/login`.

---

### Auth — `/auth`

| Method | Path | Auth required | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Login as Admin or RescueTeam |
| `POST` | `/auth/logout` | Any | Clear the session cookie |
| `GET` | `/auth/me` | Any | Return the current authenticated user |
| `POST` | `/auth/register` | — | Register a new RescueTeam account |

---

### Forecast — `/forecast`

| Method | Path | Auth required | Description |
|---|---|---|---|
| `GET` | `/forecast` | — | List all flood zones |
| `GET` | `/forecast/:id` | — | Get a single flood zone |
| `POST` | `/forecast` | Admin | Publish a new flood zone |
| `PUT` | `/forecast/:id` | Admin | Update a flood zone |
| `DELETE` | `/forecast/:id` | Admin | Remove a flood zone |

---

### Safe Place — `/safe-place`

| Method | Path | Auth required | Description |
|---|---|---|---|
| `GET` | `/safe-place` | — | List all safe places |
| `GET` | `/safe-place/:id` | — | Get a single safe place |
| `POST` | `/safe-place` | Admin | Create a safe place |
| `PUT` | `/safe-place/:id` | Admin | Update a safe place (capacity, supplies, etc.) |
| `DELETE` | `/safe-place/:id` | Admin | Remove a safe place |

---

### Survivor — `/survivor`

| Method | Path | Auth required | Description |
|---|---|---|---|
| `POST` | `/survivor/register` | — | Register a survivor to a safe place; returns a `referenceId` |
| `GET` | `/survivor/register/:referenceId` | — | Look up a registration by reference ID |
| `POST` | `/survivor/sos` | — | Submit an SOS rescue request |
| `GET` | `/survivor/sos` | — | List all SOS pins (map view, no PII) |
| `GET` | `/survivor/sos/by-device` | — | Restore an SOS session by browser device ID |
| `GET` | `/survivor/sos/:id/status` | — | Get SOS status only (no PII) |
| `GET` | `/survivor/sos/:id` | Admin, RescueTeam | Get full SOS detail including PII |
| `PATCH` | `/survivor/sos/:id/location` | — | Push the survivor's live GPS update |
| `PATCH` | `/survivor/sos/:id/shelter` | — | Change the survivor's target safe place |

---

### Rescue — `/rescue`

| Method | Path | Auth required | Description |
|---|---|---|---|
| `GET` | `/rescue/team-status` | — | List all rescue team positions and availability |
| `GET` | `/rescue/missions` | RescueTeam | List the caller's own missions |
| `POST` | `/rescue/missions/accept` | RescueTeam | Accept a pending SOS request |
| `PATCH` | `/rescue/missions/:id/complete` | RescueTeam | Mark an active mission as complete |
| `PATCH` | `/rescue/status/availability` | RescueTeam | Toggle `available` / `on_mission` |
| `PATCH` | `/rescue/status/position` | RescueTeam | Update the caller's GPS position |

---

### Active Location — `/active-locations`

Unauthenticated live-location broadcast used by survivors and volunteers on the shared map.

| Method | Path | Auth required | Description |
|---|---|---|---|
| `PUT` | `/active-locations/me` | — | Upsert (create or update) own live location by session ID |
| `GET` | `/active-locations` | — | List all currently active locations |
| `DELETE` | `/active-locations/me` | — | Remove own live location on disconnect |

---

## Database Schema

SQLite managed by Prisma. All models are in `backend/prisma/schema.prisma`.

---

### `User`

Covers all staff accounts (Admin and RescueTeam).

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | Auto-increment |
| `username` | String | Unique |
| `password` | String | bcrypt hash |
| `role` | String | `"Admin"` \| `"RescueTeam"` |
| `name` | String? | Display name or organisation name |
| `rescuerType` | String? | `"PrivateTeam"` \| `"GovernmentTeam"` — RescueTeam only |
| `status` | String | `"active"` \| `"pending"` \| `"rejected"` |
| `createdAt` | DateTime | — |

---

### `FloodZone`

A circle on the shared map published by an Admin.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | — |
| `title` | String | — |
| `severity` | String | `"low"` \| `"medium"` \| `"high"` |
| `floodType` | String? | `"flash"` \| `"river"` \| `"coastal"` \| `"urban"` |
| `lat` | Float | Centre latitude |
| `lng` | Float | Centre longitude |
| `radius` | Int | Metres (default 1000) |
| `description` | String? | — |
| `adminId` | Int | FK → `User.id` |
| `createdAt` / `updatedAt` | DateTime | — |

---

### `SafePlace`

An evacuation shelter created by an Admin.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | — |
| `name` | String | — |
| `description` | String? | — |
| `lat` / `lng` | Float | Pin location |
| `capacity` | Int | Maximum occupants |
| `currentCount` | Int | Current registrations (default 0) |
| `hasFood` | Boolean | — |
| `hasWater` | Boolean | — |
| `supplies` | String? | JSON: `{ item: string; scheduledAt: string }[]` |
| `adminId` | Int | FK → `User.id` |
| `createdAt` / `updatedAt` | DateTime | — |

---

### `SurvivorRegistration`

A survivor claiming a spot at a safe place (no login required).

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | — |
| `referenceId` | String | Unique, e.g. `WP-2026-00001` |
| `name` | String | — |
| `phone` | String? | — |
| `lat` / `lng` | Float | Survivor's location at registration |
| `safePlaceId` | Int | FK → `SafePlace.id` |
| `createdAt` | DateTime | — |

---

### `SosRequest`

A live rescue request from a survivor in danger.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | — |
| `deviceId` | String? | Unique browser fingerprint — prevents duplicate SOS |
| `survivorName` | String | — |
| `phone` | String? | — |
| `lat` / `lng` | Float | Location at SOS submission |
| `lastKnownLat` / `lastKnownLng` | Float? | Updated while survivor shares live location |
| `notes` | String? | — |
| `safePlaceId` | Int? | FK → `SafePlace.id` (target destination) |
| `status` | String | `"pending"` \| `"assigned"` \| `"completed"` |
| `assignedRescuerId` | Int? | FK → `User.id` of assigned rescuer |
| `createdAt` / `updatedAt` | DateTime | — |

---

### `RescueMission`

Tracks the active assignment between a rescuer and an SOS request.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | — |
| `sosRequestId` | Int | Unique FK → `SosRequest.id` |
| `rescuerId` | Int | FK → `User.id` |
| `status` | String | `"active"` \| `"completed"` |
| `startedAt` | DateTime | — |
| `completedAt` | DateTime? | Set when rescuer marks mission done |

---

### `ActiveLocation`

Short-lived GPS broadcast for survivors and volunteers visible on the shared map.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | — |
| `sessionId` | String | Unique browser session key |
| `role` | String | `"Survivor"` \| `"Volunteer"` |
| `lat` / `lng` | Float | Current position |
| `updatedAt` | DateTime | — |

---

### `RescueTeamStatus`

Persistent position and availability status for each RescueTeam member.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | — |
| `userId` | Int | Unique FK → `User.id` |
| `isAvailable` | Boolean | `true` = available, `false` = on mission |
| `lat` / `lng` | Float? | Current GPS position |
| `updatedAt` | DateTime | — |
