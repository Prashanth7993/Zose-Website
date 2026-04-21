# ZOSE — UAE Premium T-Shirt Store
## Frontend (React + Vite + Tailwind CSS)

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd zose
npm install
```

### 2. Start development server
```bash
npm run dev
```
App runs at → http://localhost:3000

### 3. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

```
zose/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite config (port 3000, proxy /api → :5000)
├── tailwind.config.js          # Tailwind config + brand colors
├── postcss.config.js           # PostCSS + autoprefixer
├── package.json
└── src/
    ├── main.jsx                # React entry
    ├── App.jsx                 # Root component, auth state management
    ├── index.css               # Tailwind directives + global styles
    └── components/
        ├── Navbar.jsx          # Sticky nav — Sign In / Register buttons
        ├── AuthModal.jsx       # Login & Register modal (tabbed)
        ├── HeroSection.jsx     # Full hero with CTA
        ├── MarqueeBanner.jsx   # Gold scrolling banner
        ├── CollectionsSection.jsx  # 3 product collection cards
        ├── TrustSection.jsx    # UAE trust badges
        ├── NewsletterSection.jsx   # Email signup
        └── Footer.jsx          # Footer links
```

---

## 🔌 Connecting to Node.js Backend

In `AuthModal.jsx`, replace the simulated API call with real fetch calls:

```jsx
// Login
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: form.email, password: form.password }),
});
const data = await res.json();
if (!res.ok) throw new Error(data.message);
// Store token: localStorage.setItem("token", data.token);
onSuccess(data.user);

// Register
const res = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
});
```

---

## 🎨 Brand Colors (in tailwind.config.js)
| Token         | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| gold.DEFAULT  | #C9A14A   | Primary brand gold       |
| gold.light    | #E8C97A   | Hover states             |
| zose.dark     | #0A0A0A   | Page background          |
| zose.off-white| #F5F0E8   | Body text                |
| zose.muted    | #888880   | Secondary text           |

---

## ✅ Next Steps (Step by Step)
- [ ] Step 2 — Node.js backend: Express + JWT auth routes
- [ ] Step 3 — Shop page: Product listing grid with filters
- [ ] Step 4 — Product detail page
- [ ] Step 5 — Cart & Checkout (Stripe / Telr UAE)
- [ ] Step 6 — User dashboard & order history
