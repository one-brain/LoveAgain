# Cue Platform - Frontend

A modern, responsive frontend for the Cue social companionship platform built with React, TypeScript, Vite, and TailwindCSS.

## Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, TailwindCSS
- **State Management**: Redux Toolkit for predictable state handling
- **Routing**: React Router v6 for seamless navigation
- **API Communication**: Axios for HTTP requests
- **UI Components**: Beautiful, responsive design with TailwindCSS
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Heroicons for clean, consistent icons
- **Authentication**: JWT-based auth with Redux persistence

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/           # Static assets (images, icons)
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layouts (MainLayout, etc.)
│   ├── pages/            # Page components
│   ├── services/         # API service configurations
│   ├── store/            # Redux store configuration
│   │   ├── index.ts      # Store setup
│   │   └── slices/       # Redux slices (auth, user, etc.)
│   ├── styles/           # Global styles and CSS utilities
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind base styles
├── index.html            # HTML template
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)
- `npm test` - Run tests (if configured)

## Design System

### Colors

The application uses a custom color palette based on the primary blue theme:

- **Primary**: Various shades of blue (`#0ea5e9` as base)
- **Secondary**: Warm amber tones (`#f59e0b` as base)
- **Background**: Clean whites and grays
- **Text**: Dark gray for primary text, lighter grays for secondary

### Typography

- Uses system fonts for optimal performance
- Responsive typography scales with screen size
- Clear hierarchy with appropriate font weights

### Components

All components follow these principles:
- Reusable and composable
- Accessible (ARIA labels, keyboard navigation)
- Responsive (mobile-first approach)
- Consistent spacing and alignment
- Proper loading and error states

## State Management

The application uses Redux Toolkit for state management:

- **authSlice**: Handles authentication state (token, user info)
- **userSlice**: Manages user profile and preferences

State is persisted in localStorage where appropriate (auth tokens).

## API Integration

API services are configured in the `src/services/` directory:
- Base URL configuration
- Request/response interceptors
- Error handling
- Token management

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5007
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Contact

For questions or support, please contact the development team.