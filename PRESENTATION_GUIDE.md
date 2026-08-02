# FitPass Website Presentation Guide

## 1. Opening (30 seconds)

> Good morning/afternoon. My project is **FitPass**, a fitness class booking platform. It helps users discover fitness studios, browse upcoming classes, buy class passes, reserve a spot, and manage their bookings from one place.

Explain the problem:

> Instead of checking many different gym websites or contacting a studio manually, a user can use one platform to see available classes and book them using credits.

## 2. Technology Stack (30 seconds)

> The frontend is built with React and Vite. The backend is a Flask REST API. I use SQLAlchemy for database models, Marshmallow for request validation and response serialization, and JWT tokens for authentication.

Mention the main integration:

> React sends requests to the Flask API. After login, the frontend stores a JWT token and sends it in the Authorization header for protected actions such as buying a pass, booking a class, and viewing a profile.

## 3. Live Demo Flow (3–5 minutes)

Follow this order during your demo.

### A. Home page

Say:

> This is the landing page. It introduces the FitPass brand, highlights featured classes, and shows a membership plan preview.

Point out:

- Responsive layout and navigation.
- Live class and pass data loaded from the backend.

### B. Browse classes and studios

Open **Classes** and **Studios**.

Say:

> Users can browse upcoming classes, search by class title, filter by category, and open a studio-specific schedule. The backend filters classes using query parameters such as category, studio, and search text.

Point out:

- Class capacity and remaining spots.
- Studio location filtering.
- Loading, empty, and error states.

### C. Register or log in

Use a client account, or create one.

Say:

> Users register with a name, email, and password. The backend validates the request, hashes the password, creates the account, and returns a JWT access token.

Then say:

> Protected routes check the logged-in user and their role before allowing access to account features.

### D. Buy a pass

Open **Pricing** and choose a plan.

Say:

> A pass gives the user credits. The available pass plans come from the API, and purchasing one creates a pass record with a credit balance and expiry date.

### E. Reserve a class

Return to **Classes** and reserve a spot.

Say:

> When a user reserves a class, the API verifies that the class exists, has not started, is not full, and has not already been booked by the user. It then checks for a valid pass and deducts one credit.

### F. Profile and cancellation

Open **Profile**.

Say:

> The profile shows the user’s active passes and bookings. A user can cancel their own future booking, and the system refunds a credit when appropriate.

### G. Admin area (optional)

Log in with an admin account and open the admin dashboard.

Say:

> This route is restricted to administrators. It demonstrates role-based access control and lets an admin create new fitness classes.

## 4. Key Engineering Decisions (1 minute)

Use these points if your teacher asks about implementation:

- **JWT authentication:** The API returns a token after login or registration; protected endpoints require that token.
- **Role-based authorization:** Client, trainer, and admin capabilities are separated. Public sign-up creates client accounts only, so users cannot create an admin account themselves.
- **Validation:** Marshmallow validates incoming JSON before controllers use it.
- **Business rules:** The booking flow prevents duplicate reservations, past-class bookings, and bookings over capacity.
- **API design:** Frontend API calls are kept in one module, which makes endpoints and authorization headers easier to maintain.
- **Error handling:** The UI shows loading, empty, and failure states instead of failing silently.

## 5. Closing (20 seconds)

> FitPass demonstrates a full-stack application with a React user interface, Flask REST API, database-backed data, authentication, authorization, and booking business rules. The main goal was to make fitness class discovery and reservation simple while keeping the important account actions secure.

> Thank you. I am happy to answer questions or show a specific part of the code.

## Likely Questions and Short Answers

**How do you secure passwords?**

> Passwords are hashed on the server using Werkzeug security helpers. The original password is not stored in the database.

**How does the frontend know a user is logged in?**

> It stores the JWT access token in local storage, sends it with protected API requests, and calls `/auth/me` when the app starts to restore the user session.

**How do you prevent overbooking?**

> Before creating a booking, the backend compares the number of existing bookings to the class capacity.

**What would you improve next?**

> I would add payment processing, email confirmations, trainer management, automated tests, and database constraints to protect against simultaneous duplicate bookings.

## Presentation Tips

- Start the backend before presenting, then start the frontend.
- Seed the database beforehand so classes, studios, and accounts are available.
- Keep one client account and one admin account ready.
- Use a browser window with no unrelated tabs or notifications.
- If a live API call fails, explain the intended request flow rather than panicking; showing the code structure is still valuable.
