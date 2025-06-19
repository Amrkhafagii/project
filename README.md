# Zenith - Meal Delivery & Fitness

A comprehensive meal delivery and fitness tracking application built with Expo and React Native.

## Architecture Overview

This application follows a modular architecture organized by features and services:

### Feature-Based Structure

```
features/
├── shared/           # Shared components across features
├── customer/         # Customer-specific components
├── delivery/         # Delivery-related components
├── restaurant/       # Restaurant management components
├── payment/          # Payment processing components
└── fitness/          # Fitness tracking components
```

### Service Layer

```
services/
├── auth/             # Authentication services
├── payments/         # Payment processing services
├── delivery/         # Delivery optimization services
├── location/         # Location-based services
├── fitness/          # Fitness calculation services
├── ai/               # AI recommendation engine
├── restaurant/       # Restaurant intelligence services
├── realtime/         # Real-time communication
└── supplychain/      # Supply chain management
```

### Key Features

- **Multi-Role Support**: Customer, Restaurant, and Driver interfaces
- **Real-Time Tracking**: Live order and driver tracking
- **AI Recommendations**: Personalized meal recommendations
- **Fitness Integration**: Calorie and macro tracking
- **Restaurant Intelligence**: Menu optimization and analytics
- **Supply Chain Management**: Inventory forecasting and optimization
- **Advanced Payments**: Subscription management and refund processing

### Technology Stack

- **Framework**: Expo / React Native
- **Navigation**: Expo Router
- **Database**: Supabase
- **Styling**: StyleSheet (React Native)
- **Icons**: Lucide React Native
- **State Management**: React Hooks
- **Real-time**: WebSockets

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Project Structure

```
app/                  # App routes (Expo Router)
├── (auth)/          # Authentication routes
├── (tabs)/          # Main app tabs
├── (driver)/        # Driver-specific routes
└── (restaurant)/    # Restaurant-specific routes

features/            # Feature-based components
services/            # Business logic and utilities
lib/                 # External service configurations
types/               # TypeScript type definitions
```

This modular structure ensures:
- **Maintainability**: Easy to locate and modify code
- **Scalability**: Simple to add new features
- **Reusability**: Components and services can be shared
- **Testing**: Clear separation of concerns
