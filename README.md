# 🇸🇾 2Syria — AI-Powered Tourism App

> Discover Syria through the lens of AI. Upload a photo, get instant matches from a curated database of historical and cultural landmarks — complete with maps, reviews, and community ratings.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Flask](https://img.shields.io/badge/Flask-AI%20Service-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com)

🔗 **[Live Demo](#)** &nbsp;·&nbsp; 📹 **[Demo Video](#)**

---

## 📖 Overview

**2Syria** is a full-stack, three-tier web application that helps travelers explore Syria using **image-based search powered by computer vision**.

Users can upload a photo of a place (a mosque, a citadel, a street), and the system returns visually similar landmarks from a curated database — along with their location on an interactive map, user reviews, and average ratings.

The project is split into **three independent services**:

| Service | Purpose | Repo |
|---------|---------|------|
| 🌐 **Frontend** | React + Vite single-page app with Leaflet map | *(this repo)* |
| 🔧 **Backend** | Node.js / Express REST API + MongoDB | *(this repo)* |
| 🧠 **AI Service** | Flask image-similarity engine | [2syria-flask-server](https://github.com/sami000khaleel/2syria-flask-server) |

---

## ✨ Features

### 🔍 Image-Based Place Search
Upload any photo and get matched to landmarks in the database using a CLIP-style image similarity model. Results are ranked by probability and displayed on the map.

### 🗺 Interactive Map (Leaflet + OpenStreetMap)
- Auto-centers on user's location (via IP geolocation with permission)
- Displays matched places as markers
- Custom slide-out panel with photos, description, and reviews
- Adjustable search radius (km / mi)

### 🏛 Rich Place Data
- Multiple photos per place
- Average rating + individual reviews
- Type-based filtering (historical, restaurant, great view, religious, old ruins, hotel)
- City-based filtering (Damascus, Aleppo, Homs, Palmyra, …)

### ⭐ Reviews & Ratings
- Star-based rating (1–5) + written review
- One review per user **per week** per place (enforced server-side)
- Average rating recomputed automatically

### 🔐 Authentication
- Signup / login with **JWT**
- Password hashing with **bcrypt**
- **Password recovery via email** (Nodemailer + 6-digit verification code with 30-second throttle and 2-minute expiry)
- **Google OAuth** integration (OpenID Connect)

---

## 🏗 Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     React + Vite Frontend                 │
│  • Leaflet map    • Auth pages    • Slide-out place panel │
└──────────────┬──────────────────────────┬─────────────────┘
               │                          │
               │ REST (JSON / multipart)  │ Image upload
               ▼                          ▼
┌──────────────────────────┐  ┌────────────────────────────┐
│   Express API (Node.js)  │  │   Flask AI Service         │
│   • JWT auth             │  │   • Image embedding model  │
│   • Mongo (Users/Places) │  │   • Cosine similarity      │
│   • Reviews, filters     │  │   • Returns ranked matches │
└──────────────┬───────────┘  └────────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │   MongoDB    │
        │  Users,      │
        │  Places,     │
        │  Reviews     │
        └──────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite**
- **React Router v6** for navigation
- **Leaflet** + **react-leaflet** for interactive maps
- **Tailwind CSS** for styling
- **Axios** for HTTP
- **lucide-react** for icons

### Backend
- **Node.js** + **Express 4**
- **MongoDB** + **Mongoose 6**
- **JWT** (`jsonwebtoken`) for auth
- **bcryptjs** for password hashing
- **Nodemailer** for recovery emails
- **Multer** for image uploads
- **Axios** to talk to the AI service
- **google-auth-library** for OAuth

### AI Service
- **Flask** (Python)
- **PyTorch / CLIP** for image embeddings
- Cosine similarity search over indexed place photos

---

## 📁 Project Structure

### Backend (`/server`)

```
server/
├── controllers/
│   ├── placeController.js    # Search, reviews, images, radius filter
│   └── userController.js     # Auth, password reset, OAuth, reviews
├── middleware/
│   ├── authentication.js     # JWT, bcrypt, email codes, OAuth
│   ├── placeMiddleware.js    # Similarity search, distance, weekly limit
│   └── userMiddleware.js     # Account creation, rating history
├── models/
│   ├── placeModel.js
│   └── userModel.js
├── routes/
│   ├── placeRoutes.js
│   └── userRoutes.js
└── index.js
```

### Frontend (`/browser`)

```
browser/
└── src/
    ├── api/
    │   └── api.js            # Axios wrapper for all endpoints
    ├── assets/
    └── (pages: map, signup, login, recover, reset)
```

---

## 🔌 API Overview

### `/api/user`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register a new user |
| `GET` | `/login` | Login (password via header) |
| `GET` | `/send-account` | Fetch current user |
| `GET` | `/validate-token` | Verify JWT |
| `GET` | `/recover-account` | Request a 6-digit recovery code by email |
| `POST` | `/recover-account` | Submit recovery code → returns token |
| `PATCH` | `/reset-password` | Change password (auth required) |
| `POST` | `/review-place` | Add a review to a place |
| `GET` | `/get-reviews?placeId=…` | List reviews for a place |

### `/api/place`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/search-by-image` | Upload image → similar places |
| `GET` | `/search-places` | Filter by search / city / type / radius |
| `GET` | `/fetch-places-nearby` | Places within radius of coordinates |
| `GET` | `/image?photoReference=…&placeId=…` | Serve a place image |
| `GET` | `/get-place-photo?photoReference=…` | Redirect to Google photo |

---

## 🧠 How the Image Search Works

1. The user uploads a photo via the frontend.
2. The Express backend saves it temporarily and forwards it to the Flask AI service (`SIMILARITY_URL`).
3. Flask computes an image embedding using a pretrained vision model and compares it against embeddings of all indexed place photos.
4. It returns a list of `[photoReference, probability]` pairs.
5. The backend maps each `photoReference` back to a `Place` document in MongoDB.
6. Results are deduplicated, sorted by probability, and returned to the frontend.
7. The frontend plots the matched places on the Leaflet map and opens the slide-out panel.

---

## 📸 Screenshots

> Screenshots and a live demo video will be added soon.

```
docs/
├── screenshot-map.png
├── screenshot-search.png
└── screenshot-place.png
```

---

## 🗺 Roadmap

- [ ] Offline mode with cached place data
- [ ] Multi-language support (AR / EN / DE)
- [ ] Itinerary planner (multi-day trips)
- [ ] User-submitted places (moderated)
- [ ] Reviews with photos
- [ ] React Native mobile app
- [ ] Dockerize all three services with `docker-compose`
- [ ] TypeScript migration on the backend

---

## 💡 What I Learned

- **Three-service architecture** — decoupling AI from the API from the UI makes each part independently deployable and testable
- **Multipart file uploads** across two services (React → Express → Flask)
- **Image similarity search** at the application level, abstracting the ML model behind a REST endpoint
- **Haversine distance** for location filtering without relying on external geospatial APIs
- **Email verification flows** with throttle windows and expiry
- **JWT + bcrypt + Google OAuth** in one auth system
- **Handling cross-origin file paths** between backend and frontend

---

## 👨‍💻 About Me

I'm **Sami Khaleel**, a full-stack developer based in Jülich, Germany, with a B.Eng in Computer Engineering.


I'm currently looking for a **Junior Full-Stack Developer** role and I'm available immediately — already in Germany, no visa sponsorship needed.

- 📧 Email: [sami000khaleel@gmail.com](mailto:sami000khaleel@gmail.com)
- 🐙 GitHub: [@sami000khaleel](https://github.com/sami000khaleel)
- 🧠 Codewars: [sami000khaleel](https://www.codewars.com/users/sami000khaleel)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to learn from it, fork it, and build on it. Attribution is appreciated.

---

⭐ **If you found this project interesting, a star is always appreciated — and if you're hiring junior developers, I'd love to hear from you!**
