
````markdown
🎓 CertiStore Pro – Certificate Management Platform

Author: Ashutosh Kumar Jha  
Year: 2025  
Repository: (https://github.com/amankumarjha71391/certistore-pro)

📌 Overview

CertiStore Pro is a modern, elegant certificate management tool built for IT professionals.  
With secure authentication, animated visuals, and smart skill tracking, it helps users:

- Upload professional certificates (PDF/Image)
- Organize them in a secure gallery
- Extract and visualize skill data  
— all in one place.

Built with React, Tailwind CSS, Supabase, and Recharts** for speed, security, and style.

✨ Features

- 🔐 **User Authentication** (via Supabase Email/Password)
- 📤 **Upload & Manage Certificates** (PDF/Image support)
- 🗃 **Certificate Gallery** (Edit/Delete capabilities)
- 📊 **Skill Visualizer** using Recharts
- 🧊 **Glassmorphism UI** with Vanta.NET animated background
- 📱 **Mobile-Responsive Design** with Hamburger Menu
- 🔁 **Password Reset & Update** Flow
- 🔒 **Protected Routes** for authenticated users
- ↪️ **Auto Redirects** on Login/Logout
- 🎯 **Session Listener** for real-time authentication state sync

🛠 Tech Stack

Frontend:
- React (Vite)
- Tailwind CSS
- Recharts
- Vanta.js (NET animation)

Backend:
- Supabase (Auth, Database, Storage)

🚀 Getting Started

Prerequisites
- Node.js v18+
- A Supabase project with **Anon/Public Key**

Installation

git clone https://github.com/amankumarjha71391/certistore-pro
cd certistore-pro
npm install

Environment Variables

Create a `.env` file in the project root:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

Start Development Server

npm run dev

Visit: [http://localhost:5173]

🗺 Routes

| Path              | Type      | Description                        |
| ----------------- | --------- | ---------------------------------- |
| `/`               | Protected | Certificate upload page            |
| `/gallery`        | Protected | View & edit uploaded certificates  |
| `/skills`         | Protected | Visualize recurring skills         |
| `/auth`           | Public    | Login / Signup / Forgot Password   |
| `/reset-password` | Public    | Set a new password from email link |
| `/login`          | Redirect  | Redirects to `/auth`               |

📦 Deployment

Platform: Netlify

Add your `.env` keys in the platform’s environment variable settings.
