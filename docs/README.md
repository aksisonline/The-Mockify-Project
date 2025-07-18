# Mockify Application Documentation

## Overview

 Mockify is a comprehensive platform for media professionals, enthusiasts, and learners. It provides networking, knowledge-sharing, job exploration, equipment trading, training, and community features.

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Package Manager**: Bun
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Documentation Structure

### 📁 Features

- [Authentication &amp; User Management](./features/authentication.md)
- [User Profile System](./features/profile.md)
- [Directory &amp; Networking](./features/directory.md)
- [Careers &amp; Job Board](./features/careers.md)
- [Discussions &amp; Community](./features/discussions.md)
- [Reviews System](./features/reviews.md)
- [Events Management](./features/events.md)
- [Training Programs](./features/training.md)
- [Tools &amp; Calculators](./features/tools.md)
- [Points &amp; Rewards System](./features/points-rewards.md)
- [Ekart Marketplace](./features/ekart.md)
- [Notifications](./features/notifications.md)

### 📁 API Documentation

- [Authentication APIs](./api/auth/README.md)
- [Profile APIs](./api/profile/README.md)
- [Discussions APIs](./api/discussions/README.md)
- [Points APIs](./api/points/README.md)
- [Rewards APIs](./api/rewards/README.md)
- [Ekart APIs](./api/ekart/README.md)
- [Training APIs](./api/training/README.md)
- [Events APIs](./api/events/README.md)
- [Careers APIs](./api/careers/README.md)
- [Reviews APIs](./api/reviews/README.md)
- [Tools APIs](./api/tools/README.md)
- [Admin APIs](./api/admin/README.md)


## Database Overview

The application uses a PostgreSQL database with the following main tables:

- **profiles**: User profile information
- **discussions**: Community discussions and posts
- **jobs**: Job listings and applications
- **events**: Event management
- **training_programs**: Training courses
- **products**: Marketplace products
- **reviews**: Product and brand reviews
- **points**: Points system and transactions
- **rewards**: Reward items and purchases
- **notifications**: User notifications

The full Schema can be found in the database.sql file.

## Key Features

- **User Authentication**: Email/password and OTP-based auth
- **Profile Management**: Comprehensive user profiles with completion tracking
- **Community**: Discussions, polls, voting, and moderation
- **Job Board**: Job listings, applications, and career tools
- **Marketplace**: Buy/sell   equipment (Ekart)
- **Training**: Course enrollment and management
- **Reviews**: Product and brand reviews with ratings
- **Events**: Event listings and registration
- **Points System**: Gamification with rewards
- **Tools**:   calculators and utilities
- **Admin Panel**: Comprehensive admin interface
