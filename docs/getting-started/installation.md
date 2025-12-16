# Installation Guide

This guide will walk you through setting up 4Diary on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or higher
- **pnpm** package manager (recommended)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for cloning the repository

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Harsha-Bhattacharyya/4diary.git
cd 4diary
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/4diary
REDIS_URL=redis://localhost:6379
```

### 4. Start MongoDB

If using local MongoDB:

```bash
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

Or use MongoDB Atlas by updating the `MONGODB_URI` with your connection string.

### 5. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Docker Setup

For a containerized setup using Docker:

```bash
# Build and start containers
docker-compose up -d
```

This will start:
- Next.js app on port 3000
- MongoDB on port 27017
- Redis on port 6379

## Production Build

To create a production build:

```bash
pnpm run build
pnpm start
```

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection errors:

1. Check that MongoDB is running
2. Verify the connection string in `.env.local`
3. Ensure MongoDB accepts connections from localhost

### Port Conflicts

If port 3000 is already in use:

```bash
PORT=3001 pnpm run dev
```

## Next Steps

Once installed, proceed to the [Quick Start Guide](./quickstart.md) to create your first note!
