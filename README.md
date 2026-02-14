# CRM Atlas 🗺️

A production-ready web app for documenting CRM capabilities (fields, flows, deeplinks) and tracking gaps/opportunities.

## ✨ Features

- **Dashboard**: Overview of all CRM capabilities with live flow monitoring
- **Products**: Manage product areas and their fields/events/flows
- **Flows**: Comprehensive flow management with advanced filtering
  - Filter by Product, Purpose, Channel, Live status, STO status, Trigger type
  - Real-time search
  - Beautiful table view with all key metadata
- **Opportunities**: Track and prioritize improvements with Impact/Effort/Confidence scoring
- **Import**: Bulk CSV import for fields and flows
- **Search**: Global search across all entities

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (beautiful, accessible components)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Forms**: React Hook Form + Zod validation
- **State**: Server Actions for data mutations

## 📋 Prerequisites

- Node.js 18+
- A Supabase account (free tier works great)

## 🚀 Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (~2 minutes)
3. Note your project URL and anon key (Settings → API)

### 2. Run Database Migrations

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query
5. Repeat for `supabase/migrations/002_seed_data.sql` (optional - adds sample data)

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Data Model

### Core Entities

- **Products**: Product areas (e.g., Payment Links, TIC, Tools/Boosts)
- **Fields**: User/account fields available for personalization
- **Events**: Behavioral events tracked in your system
- **Flows**: Marketing/CRM flows (purpose: activation, retention, winback, transactional)
- **Deeplinks**: URLs with associated channels
- **Opportunities**: Improvement ideas with impact/effort scoring
- **Missing Signals**: Fields or events you wish you had

### Relationships

- Flows belong to Products
- Flows can depend on many Fields and Events
- Flows can link to many Deeplinks
- Opportunities can link to Products and Flows
- Missing Signals link to Products and Opportunities

## 📥 Importing Data

The Import page supports bulk CSV import for Fields and Flows.

### Fields CSV Format

```csv
product,field_name,description,format,live
Payment Links,TapToPayEnabled,Has member enabled T2P,BOOLEAN,true
Payment Links,LastTransactionDate,Date of most recent transaction,MM/DD/YY,true
```

### Flows CSV Format

```csv
product,flow_name,purpose,description,trigger_type,frequency,channels,live,sto,iterable_id
Payment Links,Welcome Email,activation,Welcome new users,event_based,Daily,email,true,true,12345
TIC,Monthly Report,retention,Monthly usage report,scheduled,Monthly,email,true,false,67890
```

**Channel types**: `email`, `push`, `in_app` (can combine with +, comma, or &)
**Purpose types**: `activation`, `retention`, `winback`, `transactional`
**Trigger types**: `event_based`, `scheduled`, `api_triggered`

## 🎨 UI Highlights

- **Gradient accents**: Beautiful blue-to-purple gradients throughout
- **Live indicators**: Green badges for live flows, red for non-STO
- **Smart filtering**: Multi-dimensional filtering on the Flows page
- **Responsive design**: Works great on desktop and mobile
- **Dark mode ready**: Full dark mode support

## 🔍 Key Pages

### Dashboard (`/`)
- Quick stats cards
- All Live Flows table (searchable, sortable)
- Top Opportunities by Impact/Effort ratio

### Flows (`/flows`)
- **Comprehensive filtering**: Product, Purpose, Channel, Live status, STO, Trigger type
- **Search**: Real-time search across flow names, purposes, and products
- **Table view**: Shows all key metadata (Product, Purpose, Trigger, Frequency, Channels, Live, STO, Iterable ID)

### Import (`/import`)
- Paste CSV data
- Preview parsed rows
- Bulk insert with error handling

## 🗂️ Project Structure

```
crm-atlas/
├── app/
│   ├── actions/          # Server actions for data mutations
│   ├── opportunities/    # Opportunities pages
│   ├── products/         # Products pages
│   ├── flows/           # Flows pages
│   ├── import/          # Import page
│   └── layout.tsx       # Root layout with navigation
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── navigation.tsx   # Top nav bar
│   ├── dashboard-stats.tsx
│   ├── all-live-flows.tsx
│   ├── products-list.tsx
│   ├── flows-list.tsx
│   ├── opportunities-list.tsx
│   └── bulk-import.tsx
├── lib/
│   └── supabase/
│       ├── client.ts    # Supabase client
│       └── types.ts     # TypeScript types
└── supabase/
    └── migrations/      # SQL schema migrations
```

## 🤝 Contributing

This is a single-user app, but feel free to fork and customize for your needs!

## 📝 License

MIT

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui
