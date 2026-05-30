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

---

## Run

### Prerequisites

- Node.js 20+
- npm

---

### 1. Backend

```bash
cd backend
```

Copy the example env and fill in the values:

```bash
cp .env.example .env
```

`.env` should contain:

```env
DATABASE_URL="file:./dev.db"
ALLOW_ORIGIN=http://localhost:5173
PORT=3000
JWT_SECRET=any-random-secret
```

Install dependencies, run migrations, and seed the database:

```bash
npm install
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```

Backend runs at `http://localhost:3000`.

---

### 2. Frontend

Open a second terminal:

```bash
cd frontend
```

Create an env file:

```bash
echo "VITE_API_URL=http://localhost:3000" > .env
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

### 3. Using the Rescue Feature

Open `http://localhost:5173/login` and log in with the seeded rescue team account:

| Field    | Value        |
|----------|--------------|
| Username | `rescue`     |
| Password | `rescue123`  |
| Role     | `RescueTeam` |

After login you are redirected to the live map at `/map`. The left panel shows incoming SOS requests. Red circles on the map are survivors awaiting rescue. Click **Accept & Navigate** on any SOS to begin a mission — the map draws a route from your position to the survivor. Click **Mission Complete** when you arrive.

---

## API Reference

---

## Database Schema
