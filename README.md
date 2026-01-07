# MediConnect Frontend

Modern, responsive user interface for MediConnect healthcare platform built with React and TailwindCSS.

## 🔗 Related Repositories
- **Main Documentation:** [mediconnect](https://github.com/Yashraj-Coll/mediconnect) - Complete setup guide
- **Backend API:** [mediconnect-backend](https://github.com/Yashraj-Coll/mediconnect-backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. **Clone repository**
```bash
git clone https://github.com/Yashraj-Coll/mediconnect-frontend
cd mediconnect-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with backend API URL
```

4. **Start development server**
```bash
npm run dev
```

Application runs at: `http://localhost:5173`

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **HTTP Client:** Axios
- **Routing:** React Router DOM

## 📦 Key Features

### User Interface
- 🎨 Modern, clean design
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌙 Dark mode support (if implemented)
- ♿ Accessibility compliant

### Core Pages
- **Dashboard** - Overview of appointments and health metrics
- **Appointment Booking** - Schedule doctor consultations
- **Video Consultation** - Real-time video calls
- **Medical Records** - View and manage health records
- **Lab Tests** - Order and view test results
- **Prescriptions** - Digital prescription management
- **Payment** - Secure payment processing

## 🔐 Environment Variables

Create `.env` file in root:
```env
# Backend API
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws

# Optional: Third-party services
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📁 Project Structure
```
src/
├── assets/              # Images, icons, static files
├── components/          # Reusable UI components
│   ├── common/          # Buttons, Inputs, Cards, etc.
│   ├── layout/          # Header, Footer, Sidebar
│   └── features/        # Feature-specific components
├── pages/               # Page components
│   ├── Home/
│   ├── Dashboard/
│   ├── Appointments/
│   ├── VideoCall/
│   └── Auth/
├── services/            # API calls and business logic
│   ├── api.js           # Axios instance
│   ├── authService.js
│   └── appointmentService.js
├── context/             # React Context (State Management)
│   ├── AuthContext.jsx
│   └── AppContext.jsx
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
├── styles/              # Global styles
├── App.jsx              # Main App component
└── main.jsx             # Entry point
```

## 🎨 Component Library

### Common Components
- `<Button />` - Customizable button
- `<Input />` - Form input fields
- `<Card />` - Container component
- `<Modal />` - Popup dialogs
- `<Loader />` - Loading spinner
- `<Alert />` - Notification messages

### Feature Components
- `<AppointmentCard />` - Appointment display
- `<DoctorProfile />` - Doctor information
- `<VideoPlayer />` - Video consultation
- `<PrescriptionViewer />` - View prescriptions

## 🔌 API Integration

### API Service Setup
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 🧪 Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Build output: `dist/` folder

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

## 🎨 Styling Guide

### TailwindCSS Classes
```jsx
// Primary button
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Book Appointment
</button>

// Card component
<div className="bg-white shadow-md rounded-lg p-6">
  Content here
</div>
```

### Custom CSS
Global styles in `src/styles/index.css`

## 🔧 Development Tips

### Hot Module Replacement
Vite provides instant HMR - changes reflect immediately

### Code Formatting
```bash
# Format code
npm run format

# Lint code
npm run lint
```

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux snippets

## 🐛 Known Issues

- Video call optimization in progress
- Mobile UI refinements needed for tablet view
- Dark mode toggle in development

## 🚀 Upcoming Features

- [ ] Progressive Web App (PWA)
- [ ] Offline mode
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced search filters

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## 📧 Contact

**Developer:** Yashraj  
**Email:** yashrajsingh.mail@gmail.com 
**LinkedIn:** https://linkedin.com/in/yashraj-singh-dev

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

⭐ **Star this repository if you find it helpful!**

[Main Documentation](https://github.com/Yashraj-Coll/mediconnect) • [Backend Repo](https://github.com/Yashraj-Coll/mediconnect-backend)