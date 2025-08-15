# VibeCheck: AI-Powered Pop-Up Store Generator

Turn any trend into a beautiful, AI-powered pop-up store in seconds. Generate products, images, and layouts automatically with working Stripe checkout.

## Features

- 🤖 **AI-Powered Generation**: Advanced AI creates product names, descriptions, and pricing automatically
- 🎨 **Beautiful Layouts**: Professionally designed store layouts with hero sections and product grids
- 💳 **Instant Checkout**: Integrated Stripe checkout for seamless payment processing
- 🛡️ **Content Moderation**: Built-in IP protection and content filtering
- ⚡ **Performance**: Optimized for speed with Redis caching and rate limiting

## Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4 + DALL-E 3
- **Payments**: Stripe Checkout
- **Styling**: Tailwind CSS + shadcn/ui
- **Caching**: Upstash Redis
- **Validation**: Zod schemas

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd vibecheck
npm install
```

### 2. Environment Setup

Copy the environment file and fill in your API keys:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 3. Database Setup

1. Create a Supabase project
2. Run the SQL schema in `database-schema.sql` in the Supabase SQL Editor
3. Copy your Supabase URL and keys to `.env.local`

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to start creating stores!

## Usage

### Creating a Store

1. Enter a trend or product idea (e.g., "mushroom summer aesthetic tees")
2. Click "Generate Store"
3. Wait for AI to create products, images, and layout
4. View your generated store at `/s/[slug]`

### Content Moderation

The app includes built-in content moderation:
- Blocks trademarked brand names
- Uses OpenAI's moderation API
- Provides helpful suggestions for alternatives

### Stripe Integration

- All products have working "Buy Now" buttons
- Test mode enabled by default
- Webhook handling for payment confirmation

## Project Structure

```
vibecheck/
├── app/
│   ├── (public)/
│   │   └── page.tsx              # Landing page
│   ├── s/
│   │   └── [slug]/
│   │       └── page.tsx          # Dynamic store page
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts          # Store generation endpoint
│   │   ├── publish/
│   │   │   └── route.ts          # Store publishing
│   │   ├── checkout/
│   │   │   └── route.ts          # Stripe checkout
│   │   └── stripe/
│   │       └── webhook/
│   │           └── route.ts      # Stripe webhooks
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── blocks/
│   │   ├── Hero.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── FAQ.tsx
│   │   └── Footer.tsx
│   ├── ui/                       # shadcn components
│   └── StoreRenderer.tsx
├── lib/
│   ├── openai.ts                 # OpenAI client
│   ├── supabase.ts               # Supabase client
│   ├── redis.ts                  # Redis client
│   ├── orchestrator.ts           # Main generation logic
│   ├── moderation.ts             # Content moderation
│   ├── stripe.ts                 # Stripe integration
│   └── env.ts                    # Environment validation
├── schemas/
│   ├── store.ts                  # Store schemas
│   └── layout.ts                 # Layout schemas
└── package.json
```

## API Endpoints

### POST /api/generate
Generate a new store from a prompt.

**Request:**
```json
{
  "prompt": "mushroom summer aesthetic tees",
  "allowIp": false
}
```

**Response:**
```json
{
  "storeId": "uuid",
  "slug": "abc123def"
}
```

### POST /api/checkout
Create a Stripe checkout session.

**Request:**
```json
{
  "productId": "uuid",
  "qty": 1
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/publish
Publish a store to make it publicly accessible.

**Request:**
```json
{
  "storeId": "uuid"
}
```

## Database Schema

The app uses PostgreSQL with the following main tables:

- **stores**: Store metadata and layout configuration
- **products**: Product information and pricing
- **orders**: Order tracking and Stripe integration
- **generations**: AI generation tracking and rate limiting

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.
