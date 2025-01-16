# Project Overview

# Feature requirements

- We will use, Next.js, Shadcn, Lucid, Cookie-Based Session Auth, Role-Based Authentication, Prisma, PostgreSQL

# Relevant Docs

- https://ui.shadcn.com/
- https://nextjs.org/
- https://lucide.dev/
- https://www.prisma.io/
- https://www.postgresql.org/

# File Structure

client/
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── public/
│ ├── favicon.ico
│ └── assets/
│ ├── images/
│ └── icons/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.tsx
│ │ ├── register/
│ │ │ └── page.tsx
│ │ └── layout.tsx
│ ├── (root)/
│ │ ├── page.tsx
│ │ └── layout.tsx
│ ├── components/
│ │ ├── common/
│ │ │ ├── Button/
│ │ │ ├── Input/
│ │ │ └── Card/
│ │ └── layouts/
│ │ ├── Header/
│ │ ├── Footer/
│ │ └── Sidebar/
│ ├── services/
│ │ ├── api/
│ │ └── auth/
│ ├── utils/
│ │ └── helpers/
│ ├── hooks/
│ │ └── common/
│ ├── context/
│ │ └── auth/
│ ├── styles/
│ │ └── globals.css
│ ├── constants/
│ │ └── index.ts
│ ├── types/
│ │ └── index.ts
│ └── layout.tsx
└── README.md
