<!-- filename: README.md -->

# Spoonful

Spoonful is a recipe-management web application where users can create accounts, log in, and manage personal recipes.
**Live site:** [Open Spoonful](http://aaronhsu-spoonful-capstone.s3-website-us-east-1.amazonaws.com)

## Features

- User signup and login
- Recipe dashboard
- Create, edit, and delete recipes
- Empty-state dashboard for new users
- Recipe cards with images, dates, and category tags
- Light and dark themes
- Responsive mobile-friendly design
- AI-related backend route

## Technology Stack

- React and Vite
- Node.js and Express
- MongoDB Atlas with Mongoose
- Amazon S3
- AWS CLI
- Cloudflare Quick Tunnel
- GitHub Actions
- Playwright

## Architecture

```text
Browser
  |
  v
Amazon S3 frontend
  |
  v
Cloudflare Quick Tunnel
  |
  v
Local Express backend
  |
  v
MongoDB Atlas
```

The frontend is hosted on Amazon S3. API requests are sent through Cloudflare to the local Express backend, which connects to MongoDB Atlas.

## Deployment

The frontend is deployed as an S3 static website using:

```bash
npm run deploy
```

This command:

1. Builds the React application.
2. Creates the production `dist` folder.
3. Syncs the files to the S3 bucket.
4. Deletes outdated files from the bucket.

The S3 bucket is configured with:

- `index.html` as the index document
- `index.html` as the error document for React route handling

The backend runs locally with:

```bash
node server.js
```

The Cloudflare tunnel exposes the backend publicly:

```bash
cloudflared tunnel --url http://localhost:3000
```

CORS is configured to allow both the local frontend and the deployed S3 website.

## API Routes

| Route | Purpose |
|---|---|
| `/api/users` | User signup and login |
| `/api/recipes` | Recipe creation and management |
| `/api/ai` | AI-related functionality |

## Testing

Playwright end-to-end testing was added for the authentication pages.

Run the tests with:

```bash
npm run test:e2e
```

The tests verify that:

- The login page loads correctly.
- Login controls are visible.
- The signup page loads correctly.
- Signup controls are visible.

## Stretch Goals

### Automated S3 Deployment

A deployment script was added to `package.json` so the frontend can be built and uploaded without manually entering the bucket name:

```text
npm run deploy
```

### GitHub Actions CI/CD

The project can be automated with GitHub Actions so every push to `main`:

1. Installs dependencies.
2. Builds the frontend.
3. Runs Playwright tests.
4. Deploys the frontend to S3.

The workflow uses GitHub repository secrets for:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `BACKEND_URL`

AWS credentials are kept out of the repository and stored securely in GitHub Actions.

### Automated End-to-End Testing
