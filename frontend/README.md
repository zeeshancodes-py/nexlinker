# NexLinker - Professional Networking Platform

## Overview

NexLinker is a full-stack professional networking platform built with Django REST Framework and React. It enables professionals to connect, share insights, find jobs, and communicate in real time — similar to LinkedIn but with a modern dark-themed UI and real-time features powered by WebSockets.

---

## Tech Stack

### Backend
- Python 3.11+
- Django 4.2.7
- Django REST Framework
- Django Channels (WebSocket)
- Simple JWT (Authentication)
- SQLite (Development) / PostgreSQL (Production)
- Daphne (ASGI Server)

### Frontend
- React 18
- Redux Toolkit
- React Router v6
- Axios
- Vite
- React Icons
- React Hot Toast
- date-fns

---

## Features

- JWT Authentication (Register, Login, Logout, Token Refresh)
- User Profiles (Avatar, Cover Image, Headline, About, Location, Website)
- Experience, Education, Skills and Certifications Management
- Post Feed with Image Support
- 5 Reaction Types (Like, Celebrate, Support, Insightful, Curious)
- Nested Comments
- Connection System (Send, Accept, Reject, Withdraw)
- Follow / Unfollow System
- Real-time Messaging via WebSocket
- Real-time Notifications via WebSocket
- Jobs Board (Post, Search, Apply)
- Global Search (People and Jobs)
- Fully Responsive Design

---

## Project Structure

```
nexlinker/
├── venv/                        # Python virtual environment
│
├── backend/                     # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── nexlinker/               # Django config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── accounts/                # Auth & User model
│   ├── profiles/                # Profile, Experience, Education, Skills
│   ├── feed/                    # Posts, Reactions, Comments
│   ├── connections/             # Connections & Follow system
│   ├── messaging/               # Real-time chat
│   ├── notifications/           # Real-time notifications
│   ├── jobs/                    # Job listings & applications
│   └── search/                  # Global search
│
└── frontend/                    # React frontend
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/                 # Axios instance
        ├── store/               # Redux slices
        ├── hooks/               # Custom hooks
        ├── pages/               # Page components
        └── components/          # Reusable components
            ├── layout/
            ├── feed/
            ├── profile/
            ├── network/
            ├── jobs/
            └── common/
```

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- pip
- npm

---

### Backend Setup

**Step 1 — Clone the repository**
```bash
git clone https://github.com/yourusername/nexlinker.git
cd nexlinker
```

**Step 2 — Create and activate virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

**Step 3 — Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**Step 4 — Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Step 5 — Create superuser**
```bash
python manage.py createsuperuser
```

**Step 6 — Start the server**
```bash
python manage.py runserver
```

Backend runs at: http://127.0.0.1:8000

---

### Frontend Setup

**Step 1 — Navigate to frontend**
```bash
cd nexlinker/frontend
```

**Step 2 — Install dependencies**
```bash
npm install
```

**Step 3 — Start the dev server**
```bash
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login and get tokens |
| POST | /api/auth/logout/ | Logout and blacklist token |
| GET | /api/auth/me/ | Get current user |
| POST | /api/auth/token/refresh/ | Refresh access token |
| POST | /api/auth/change-password/ | Change password |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | /api/profiles/me/ | Get or update own profile |
| GET | /api/profiles/{id}/ | Get profile by user ID |
| GET/POST | /api/profiles/experiences/ | List or add experience |
| PATCH/DELETE | /api/profiles/experiences/{id}/ | Update or delete experience |
| GET/POST | /api/profiles/educations/ | List or add education |
| PATCH/DELETE | /api/profiles/educations/{id}/ | Update or delete education |
| GET/POST | /api/profiles/skills/ | List or add skill |
| DELETE | /api/profiles/skills/{id}/ | Delete skill |
| GET/POST | /api/profiles/certifications/ | List or add certification |
| DELETE | /api/profiles/certifications/{id}/ | Delete certification |

### Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /api/feed/ | Get feed or create post |
| GET/DELETE | /api/feed/{id}/ | Get or delete post |
| POST | /api/feed/{id}/react/ | React to a post |
| GET/POST | /api/feed/{id}/comments/ | Get or add comments |
| GET | /api/feed/user/{id}/ | Get posts by user |

### Connections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/connections/ | List accepted connections |
| GET | /api/connections/pending/ | List pending requests |
| GET | /api/connections/suggestions/ | Get connection suggestions |
| POST | /api/connections/request/{id}/ | Send connection request |
| POST | /api/connections/respond/{id}/ | Accept or reject request |
| DELETE | /api/connections/withdraw/{id}/ | Withdraw request |
| POST/DELETE | /api/connections/follow/{id}/ | Follow or unfollow user |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/messages/conversations/ | List all conversations |
| POST | /api/messages/conversations/with/{id}/ | Start or get conversation |
| GET | /api/messages/conversations/{id}/messages/ | Get messages |
| POST | /api/messages/conversations/{id}/send/ | Send a message |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications/ | List all notifications |
| GET | /api/notifications/unread-count/ | Get unread count |
| POST | /api/notifications/{id}/read/ | Mark as read |
| POST | /api/notifications/mark-all-read/ | Mark all as read |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /api/jobs/ | List or post jobs |
| GET | /api/jobs/{id}/ | Get job detail |
| POST | /api/jobs/{id}/apply/ | Apply for a job |
| GET | /api/jobs/my-applications/ | Get my applications |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/search/?q={query}&type={people|jobs} | Search people or jobs |

---

## WebSocket Endpoints

| Endpoint | Description |
|----------|-------------|
| ws://localhost:8000/ws/chat/{conversation_id}/ | Real-time messaging |
| ws://localhost:8000/ws/notifications/ | Real-time notifications |

---

## Environment Variables

Create a `.env` file in the `backend/` folder:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=sqlite:///db.sqlite3
```

---

## Running Both Servers Together

Open two terminals:

**Terminal 1 — Backend**
```bash
cd nexlinker
venv\Scripts\activate
cd backend
python manage.py runserver
```

**Terminal 2 — Frontend**
```bash
cd nexlinker/frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Admin Panel

Access the Django admin panel at:
```
http://127.0.0.1:8000/admin/
```

Use the superuser credentials you created during setup.

---

## Screenshots

| Page | Description |
|------|-------------|
| Landing Page | Hero section with animated stats and feature highlights |
| Login / Signup | Clean auth forms with validation |
| Home Feed | Posts, reactions, comments, create post |
| Profile Page | Full profile with experience, education, skills |
| Network Page | Connection suggestions, pending requests |
| Messages Page | Real-time chat interface |
| Jobs Page | Job listings with search and filters |
| Notifications | Real-time notification center |

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Author

Built with by Zeeshan Haider
- GitHub: zeeshancodes-py
- LinkedIn: www.linkedin.com/in/zeeshan-haider-4b307334b

---

## Acknowledgements

- Django REST Framework
- React and the React ecosystem
- Vite for blazing fast development
- Django Channels for WebSocket support