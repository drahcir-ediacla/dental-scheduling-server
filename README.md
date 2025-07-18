# 🦷 Dental Scheduling App – Backend (Node.js + Express + Prisma)

This is the **backend** repository for the Dental Scheduling App. It powers user authentication, dentist and time slot management, and appointment scheduling via a RESTful API.

> The frontend is maintained in a separate repository. Ensure both client and server are running for full functionality.

---

## 📦 Tech Stack

* **Node.js + Express** – Backend server framework
* **Prisma ORM** – Database access layer
* **MySQL** – Relational database
* **JWT** – Authentication with access and refresh tokens

---

## 🗃️ Project Structure

```
server/
│   ├── config/         # CORS options and app configuration
│   ├── controllers/    # API or Business logic
│   ├── k8s/            # Kubernetes manifests for deployment (e.g., Deployment, Service, Ingress)
│   ├── middleware/     # Verify auth middleware
│   ├── prisma/         # Prisma client instance, schema and migrations
│   ├── routes/         # Express route definitions
│   ├── utils/          # Time slot generator
│   └── index.js        # App entry point
├── .env                # Environment variables
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/drahcir-ediacla/dental-scheduling-server.git
cd dental-scheduling-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file:

```env
DATABASE_URL="mysql://username:password@localhost:3306/dental_db"
ACCESS_TOKEN_SECRET="access_jwt_secret"
REFRESH_TOKEN_SECRET="refresh_jwt_secret"
NODE_ENV="production_or_development"
```

### 4. Run Migrations and Generate Client

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Server

```bash
npm run dev
```

> Server will run at `http://localhost:3000`

---

## 📖 API Endpoints

### Auth

* `POST /api/users/register`
* `POST /api/users/login`
* `GET /api/user/logout`

### Refresh Token

* `GET /api/refresh`

### Appointments

* `POST /api/generate-time-slots` – Manually trigger time slot generation
* `POST /api/schedule-appointment`
* `GET /dentists/:dentistId/slots`
* `GET /api/dentists`
* `GET /api/users/:userId/appointments`
* `DELETE /api/users/appointments/:id`
* `PUT /api/users/appointments/:id`

### User

* `GET /api/get/user/auth`
* `GET /api/get/users`

---

### ⏰ Time Slot Generator

Time slots can be manually generated by sending a POST request to:

POST /api/generate-time-slots

This will generate 15 days of time slots for all dentists with predefined daily slots such as:
09:00 AM, 10:00 AM, 11:00 AM, 01:00 PM, 02:00 PM, 03:00 PM, 04:00 PM

This mechanism exists because there is currently no Admin Panel where doctors can set their availability.
The generator ensures that appointments can still be scheduled in the meantime.

---

## 🧠 Database Schema Overview (Prisma)

Includes the following models:

* `User`
* `Dentist`
* `TimeSlot`
* `Appointment`
* `RefreshToken`

> View the full schema in `prisma/schema.prisma`

---

## ❗ Assumptions

* There is no admin dashboard yet, so dentist availability is handled via the time slot generator.
* All users are patients; role-based access is not yet implemented.
* Time slots are fixed and the same for all dentists.
* Passwords are assumed to be securely hashed (e.g., using bcrypt).
* Refresh tokens are used for session management and are stored per user.
* No email confirmation or 2FA is currently implemented.

---

## 🛠 Future Improvements

* Admin panel for managing slots/dentists
* Email or SMS notifications for reminders
* Role-based access
* Appointment status (e.g., confirmed, completed, canceled)
* Implement rate limiting on the API endpoints to prevent abuse.

---

## ✅ Requirements

* Node.js 18+
* MySQL 8+
* Frontend client running ([Dental Scheduler Client](https://github.com/drahcir-ediacla/dental-scheduling-client))

---

## 📬 Contact

Feel free to open issues or contribute if you have suggestions or run into problems.

---

© 2025 Dental Scheduling App – Backend
