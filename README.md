# Improve My City — Next.js Full Stack Application

A civic engagement platform that allows citizens to report infrastructure issues with photos and location data, while enabling government authorities to manage, track, and resolve these complaints efficiently.

## Features

- **Public Interface**: Citizens can report issues with location and photos
- **Authority Interface**: Government officials can login and manage complaints (start progress, put on hold, resolve, merge)
- **Image Processing**: EXIF validation, compression, storage
- **Duplicate Detection**: Finds similar complaints nearby
- **Status Management**: Complex workflow with pending, in_progress, stalled, revived, resolved statuses
- **Timeline Tracking**: Complete audit trail of all actions
- **Geospatial Queries**: MongoDB with 2dsphere indexing for location-based searches
- **Modern UI**: Glass morphism design with blurred architectural background
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + MongoDB + Mongoose
- **Authentication**: JWT with bcrypt password hashing
- **Image Processing**: Sharp for compression, EXIF parsing
- **File Storage**: Local storage (configurable for cloud storage)

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB running locally

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/improve-my-city
   JWT_SECRET=your-jwt-secret-key-here
   DEV_ADMIN_KEY=dev-admin-key
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Add background image (optional):**
   - Save your architectural background image as `building-background.jpg` in the `public/` folder
   - See `BACKGROUND-IMAGE-SETUP.md` for detailed instructions
   - The app will work with a gradient background if no image is provided

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Project Structure

```
improve-my-city/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── authority/         # Authority pages
│   ├── complaints/        # Complaint pages
│   ├── report/            # Report issue page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities and services
├── models/                # MongoDB models
├── public/                # Static assets
├── types/                 # TypeScript types
└── package.json
```

## API Endpoints

### Public API
- `GET /api/metrics` - Get dashboard metrics
- `GET /api/complaints` - List complaints with filters
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/[id]` - Get complaint details
- `POST /api/complaints/[id]/no-progress` - Append no-progress update

### Authority API (requires authentication)
- `POST /api/authority/login` - Login
- `GET /api/authority/complaints` - List complaints for authority
- `GET /api/authority/complaints/[id]` - Get complaint details
- `POST /api/authority/complaints/[id]/start-progress` - Start progress
- `POST /api/authority/complaints/[id]/progress` - Update progress
- `POST /api/authority/complaints/[id]/hold` - Put complaint on hold
- `POST /api/authority/complaints/[id]/resolve` - Mark as resolved
- `POST /api/authority/complaints/[id]/merge` - Merge complaints

## Pages

- `/` - Landing page with metrics
- `/complaints` - Browse complaints with filters
- `/complaints/[id]` - Complaint details
- `/report` - Report new issue form
- `/authority/login` - Authority login
- `/authority` - Authority dashboard (overdue complaints)

## Development

### Adding New Features

1. **API Routes**: Add new routes in `app/api/`
2. **Pages**: Add new pages in `app/` directory
3. **Components**: Add reusable components in `components/`
4. **Types**: Add new types in `types/`

### Environment Variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `DEV_ADMIN_KEY` - Developer admin key
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Base URL for the application

## Production Deployment

1. Set up environment variables for production
2. Configure image storage (currently uses local storage)
3. Set up proper CORS and security headers
4. Configure MongoDB for production
5. Build and deploy: `npm run build && npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
