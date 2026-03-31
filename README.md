# AfrikLearn 🎓

**The #1 student platform for African universities — starting with Cameroon.**

Access course materials, past exam papers with solutions, connect with fellow students, and stay updated on housing & internship opportunities.

---

## ✨ Features

### For Students
- 📚 **Library** — Browse course materials (PDF, DOC, PPTX)
- 📝 **Past Papers** — Filter by university, level, subject, year
- 💬 **Community** — Real-time chat rooms by school and study group
- 📢 **Announcements** — Housing, internships, scholarships, events
- ⭐ **Ratings & Comments** — Rate documents and leave comments

### For Admins
- ✅ Approve/Reject submitted documents
- 👥 User management — activate/deactivate, grant Premium
- 📢 Create and pin announcements

### Monetization
- 💎 **Premium via Fapshi** (MTN MoMo, Orange Money, Cards)
  - Monthly: 2,500 XAF | Semester: 12,000 XAF | Annual: 20,000 XAF
  - Unlocks premium documents, solutions & corrections

---

## 🚀 Quick Start

### 1. Install
```bash
git clone https://github.com/your-org/afriklearn.git
cd afriklearn
npm install
```

### 2. Configure
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

For local auth to work, set these first:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

`FAPSHI_*`, `CLOUDINARY_*`, and `SMTP_*` are optional for login/register.

### 3. Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

If `login` or `register` returns `500`, it usually means:
- `DATABASE_URL` is missing or incorrect
- the schema was not pushed yet
- the demo accounts were not seeded yet

The Prisma scripts in this repo load both `.env` and `.env.local`.

### 4. Run
```bash
npm run dev
# Open http://localhost:3000
```

During `npm run build`, the app will automatically run `prisma db push` first when `DATABASE_URL` is available. This helps prevent deploys where the app starts before the Prisma tables exist.

**Demo accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@afriklearn.com | Admin@123 |
| Student | student@uy1.cm | Student@123 |

---

## ☁️ Deployment

### Railway (Database) + Vercel (App)

**1. Database on Railway:**
- New Project → PostgreSQL → copy DATABASE_URL
- Run: `DATABASE_URL=<url> npm run db:push && npm run db:seed`

**2. App on Vercel:**
```bash
npm i -g vercel
vercel --prod
```
Add all env vars in Vercel dashboard.

**3. Fapshi Webhook:**
Set webhook URL in Fapshi dashboard to:
`https://your-domain.vercel.app/api/payments/webhook`

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `NEXT_PUBLIC_APP_URL` | ✅ | App URL |
| `FAPSHI_API_USER` | ✅ | Fapshi API user |
| `FAPSHI_API_KEY` | ✅ | Fapshi API key |
| `FAPSHI_WEBHOOK_SECRET` | ✅ | Webhook verification |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | File storage (prod) |
| `CLOUDINARY_API_KEY` | ⚠️ | Cloudinary key |
| `CLOUDINARY_API_SECRET` | ⚠️ | Cloudinary secret |

---

## 🗄 Database Scripts
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to DB
npm run db:migrate     # Create migration
npm run db:studio      # Open Prisma Studio GUI
npm run db:seed        # Seed demo data
```

---

## 🏗 Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma
- **Auth:** JWT (jose) + HTTP-only cookies
- **State:** Zustand
- **Payments:** Fapshi (MTN MoMo, Orange Money)
- **Storage:** Cloudinary (configurable)
- **Deploy:** Vercel + Railway

---

## 💳 Fapshi Payment Flow
1. Student clicks Subscribe → `POST /api/payments/initiate`
2. Redirect to Fapshi secure payment page
3. Fapshi sends webhook → `POST /api/payments/webhook`
4. Redirect to `/dashboard/premium/success?transId=xxx`
5. `GET /api/payments/verify` confirms and activates Premium

---

*Built with ❤️ for African students.*
