# AfrikLearn

Student platform for African universities with course materials, past papers, community chat, announcements, and premium access.

## Quick Start

### 1. Install

```bash
git clone https://github.com/your-org/afriklearn.git
cd afriklearn
npm install
```

### 2. Configure

```bash
cp .env.example .env.local
```

Minimum variables to start the app locally:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Optional for a nicer seeded admin:
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_UNIVERSITY`

Optional for a seeded demo student:
- `SEED_STUDENT_EMAIL`
- `SEED_STUDENT_PASSWORD`
- `SEED_STUDENT_NAME`
- `SEED_STUDENT_UNIVERSITY`
- `SEED_STUDENT_FACULTY`
- `SEED_STUDENT_LEVEL`

Optional until you use payments, uploads, or email:
- `FAPSHI_*`
- `CLOUDINARY_*`
- `SMTP_*`
- `EMAIL_FROM`

### 3. Prepare the database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

If `login` or `register` returns `500`, the most common reasons are:
- `DATABASE_URL` is missing or incorrect
- the Prisma schema has not been pushed yet
- the seeded accounts were not created yet

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seeded Accounts

The seeded accounts are now driven by environment variables.

Admin account:
- email: `SEED_ADMIN_EMAIL`
- password: `SEED_ADMIN_PASSWORD`

Student account:
- email: `SEED_STUDENT_EMAIL`
- password: `SEED_STUDENT_PASSWORD`

If you change these values in Vercel or in `.env.local`, then run `npm run db:seed` again and the seed will update those two users.

## Deployment

### Railway + Vercel

1. Create PostgreSQL on Railway.
2. Copy the Railway `DATABASE_URL`.
3. In Vercel, open `Project Settings > Environment Variables`.
4. Add at least:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
5. Redeploy.

This repo also runs `prisma db push` during `npm run build` when `DATABASE_URL` is present, so deployments do not start with missing Prisma tables.

## Environment Variables

### Required for auth and basic app startup

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: random secret used to sign auth tokens.
- `NEXT_PUBLIC_APP_URL`: public URL of your app.
- `SEED_ADMIN_EMAIL`: admin login email that will be created by `npm run db:seed`.
- `SEED_ADMIN_PASSWORD`: admin password that will be created by `npm run db:seed`.

### Optional seeded profile values

- `SEED_ADMIN_NAME`: admin display name.
- `SEED_ADMIN_UNIVERSITY`: admin university label.
- `SEED_STUDENT_EMAIL`
- `SEED_STUDENT_PASSWORD`
- `SEED_STUDENT_NAME`
- `SEED_STUDENT_UNIVERSITY`
- `SEED_STUDENT_FACULTY`
- `SEED_STUDENT_LEVEL`

### Payments

- `FAPSHI_API_USER`
- `FAPSHI_API_KEY`
- `FAPSHI_WEBHOOK_SECRET`
- `NEXT_PUBLIC_FAPSHI_BASE_URL`

Where to find them:
- create a Fapshi account
- open `https://fapshi.com/developer`
- copy the API user, API key, and webhook secret from your dashboard

### File uploads

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Where to find them:
- create a Cloudinary account
- open the Cloudinary dashboard
- copy the cloud name, API key, and API secret from the environment credentials section

### Email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

Where to find them:
- use your email provider's SMTP settings
- examples: Gmail, Brevo, Mailgun, Zoho, Resend SMTP
- for Gmail, you usually need an app password instead of your normal password

## Database Scripts

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
npm run db:seed
```

## Stack

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- Zustand
- JWT auth with HTTP-only cookies
- Fapshi
- Cloudinary
