# Asset Tracker

A comprehensive real estate asset management application built with React, Vite, and Tailwind CSS. This application helps diaspora real estate owners manage their properties remotely with features for asset tracking, task management, calendar scheduling, and notifications.

## ✨ Features

- 🔐 **Authentication**: Complete user authentication with login, register, and password reset
- 🌙 **Dark/Light Theme**: Toggle between themes with persistence
- 📊 **Dashboard**: Real-time statistics and overview of your portfolio
- 🏠 **Asset Management**: Add, edit, and track real estate properties
- ✅ **Task Management**: Create and manage maintenance tasks with priorities
- 📅 **Calendar Integration**: Schedule inspections and maintenance with multiple views
- 🔔 **Notifications**: Real-time notifications for due tasks and alerts
- 📊 **Data Tables**: Advanced tables with sorting, filtering, and pagination
- 🔍 **Search & Filter**: Advanced search and filtering capabilities
- 📱 **Mobile Responsive**: Fully responsive design optimized for all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, JavaScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state, React Context for theme and auth
- **Routing**: React Router v6
- **Forms**: React Hook Form with Yup validation
- **Icons**: Lucide React
- **Charts**: Chart.js with React Chart.js 2
- **Notifications**: React Hot Toast
- **Testing**: Vitest, React Testing Library, jsdom

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd asset-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

## 🎯 Project Status

**Current Phase**: Phase 1 Complete ✅  
**Next Phase**: Phase 2 Implementation 🚧  
**Version**: 1.0.0  
**Last Updated**: July 17, 2025

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── ui/             # Reusable UI components
│   ├── dashboard/      # Dashboard components
│   ├── assets/         # Asset management components
│   ├── tasks/          # Task management components
│   └── calendar/       # Calendar components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── stores/             # State management
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## 🧪 Testing

The application includes comprehensive tests covering:

- Component rendering and interactions
- State management (Zustand stores)
- Context providers (Theme, Auth)
- Page components and routing
- Utility functions

Run tests with:
```bash
npm run test              # Run all tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage report
```

**Test Coverage**: Aiming for 80%+ coverage
**Testing Framework**: Vitest + React Testing Library

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Quick Deploy

- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)
- **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the variables for your environment:

```env
VITE_APP_TITLE=Asset Tracker
VITE_API_URL=https://your-api-domain.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Authentication

The application includes a complete authentication system with:
- User registration with email verification
- Login with remember me functionality
- Forgot password with email reset
- Protected routes

## Theme System

Toggle between light and dark themes with full persistence across sessions.

## Asset Management

- Add, edit, and delete assets
- Track asset conditions and maintenance
- Upload images and documents
- Categorize assets by type
- Monitor asset status and alerts

## Task Management

- Create tasks with priorities and due dates
- Assign tasks to specific assets
- Track task completion
- Set up notifications and reminders

## Calendar Integration

- View all tasks and events in calendar format
- Schedule maintenance and inspections
- Drag-and-drop rescheduling
- Multiple calendar views (month, week, day)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please create an issue with:

- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern real estate management platforms
- Built with modern React patterns and best practices
- Optimized for performance and accessibility

## 📚 Documentation

For comprehensive documentation:

- 📖 **[Project Documentation](./PROJECT_DOCUMENTATION.md)** - Complete project overview
- 🚀 **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Setup and development guidelines
- 📋 **[API Documentation](./API_DOCUMENTATION.md)** - API endpoints and usage
- 🎯 **[Phase 2 Implementation Plan](./PHASE_2_IMPLEMENTATION_PLAN.md)** - Detailed next phase roadmap
- 🚀 **[Deployment Guide](./DEPLOYMENT.md)** - Deployment instructions

## 🗺️ Roadmap

### Phase 1 (Complete) ✅
- Authentication system
- Dashboard with statistics
- Theme system (dark/light)
- Basic asset management
- Responsive layout

### Phase 2 (Next - 4-6 weeks) 🚧
- Complete Asset Management with CRUD operations
- Advanced Task Management with notifications
- Calendar Integration with multiple views
- Enhanced Data Tables with sorting/export
- Comprehensive Search & Filtering

### Phase 3 (Future) 📋
- Real-time features with WebSocket
- Advanced analytics and reporting
- Mobile PWA capabilities
- External integrations

## 📞 Support

For support and questions:

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/asset-tracker/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/asset-tracker/discussions)
- 📖 Documentation: See documentation links above

---

Made with ❤️ for diaspora real estate owners