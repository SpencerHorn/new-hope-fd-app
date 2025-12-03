# 🚒 New Hope Fire Department Personnel Manager

A lightweight, high-performance web application built with **SvelteKit**, **TypeScript**, **SQLite**, and **Drizzle ORM** to manage volunteers, employees, onboarding, and operational readiness for the New Hope Fire Department.

---

## ✨ Features

### 👥 Personnel Management

- Add new users (probationary, volunteer, employee)
- Automatically format names and phone numbers
- Prevent duplicate phone numbers
- Edit user profiles
- Manage:
  - First name / Last name
  - Personal email
  - Work email
  - Phone number
  - Mask size
  - T-shirt size
  - Fit test date
  - Role (with dropdown)
- Color-coded table rows by role

### 🔍 Searching & Filtering

- Header search across **all fields**
- Partial matching:
  - `jo` → John, Jordan, Johnson
  - `555` → any phone number containing 555
  - `@gmail` → email domain search
- Multi-field combined search (`"john 555"` works)
- Filter by role
- Sort by last name or role

### 📝 Onboarding Checklist

- Each user has a dedicated profile page (`/users/[id]`)
- Editable fields
- Link to onboarding tasks (placeholder)

### 🧹 UI

- Global header with centered logo + Add User form
- Modal confirmation for deletion
- Responsive layout
- Department color theme (blue, yellow, white)

---

## 🗄 Tech Stack

- **SvelteKit**
- **TypeScript**
- **SQLite** (local DB)
- **Drizzle ORM** with migrations
- **Vite**
- **Playwright** (optional testing)
- **ESLint & Prettier**

---

## 🧩 Project Structure

```txt
src/
  lib/
    db/
      client.ts        # Drizzle client (SQLite)
      schema.ts        # Database tables
    stores/
      userSearch.ts    # Search results + active state
    styles/
      landing.css      # Global header styling
  routes/
    +layout.svelte     # Global layout (header + add user form)
    +page.svelte       # Home page (user list)
    users/
      [id]/
        +page.svelte   # User profile / edit page
    api/
      users/
        +server.ts     # GET/POST users
        [id]/
          +server.ts   # GET/PATCH/DELETE user
        search/
          +server.ts   # Partial multi-field user search
```

## 🚀 Getting Started

Follow these steps to run the app locally.

### 1. Clone the repository

git clone https://github.com/YOUR_USERNAME/new-hope-fd-app.git
cd new-hope-fd-app

### 2. Install Dependencies

npm install

### 3. Run DB migration

npx drizzle-kit migrate

### 4. Start the development server

npm run dev

app will be available at

http://localhost:5173
