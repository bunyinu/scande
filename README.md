# 💀 DeathCast - AI-Powered Mortality Prediction Platform

**Production-Ready Mortality Prediction & Death Markets Platform**

DeathCast is a sophisticated web application that combines artificial intelligence, blockchain technology, voice synthesis, and modern web development to create the world's first AI-powered death prediction marketplace.

## 🚀 Features

### 🔮 AI Mortality Prediction
- Advanced facial analysis using TensorFlow.js
- Real-time health data integration
- Location-based mortality risk assessment
- Confidence scoring and cause-of-death prediction
- Genetic risk analysis from facial features

### ⛓️ Blockchain Death Markets
- Algorand smart contracts for transparent betting
- Real-time odds calculation
- Decentralized market operations
- Automatic payout on death verification
- Immutable prediction records

### 🗣️ Voice AI Integration
- ElevenLabs voice announcements with 12 personalities
- Dramatic death predictions
- Daily mortality reminders
- Last words recording service
- Market update announcements

### 💳 Monetization System
- RevenueCat subscription management
- Life extension packages ($9.99 - $199.99/month)
- Death insurance options
- Premium features and upgrades
- Digital legacy services

### 🗄️ Digital Legacy Management
- Secure last words storage
- Beneficiary management
- Digital asset inheritance
- Funeral preference recording
- Automatic delivery upon death verification

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **AI/ML**: TensorFlow.js for facial analysis
- **Blockchain**: Algorand for smart contracts
- **Voice AI**: ElevenLabs for speech synthesis
- **Database**: Supabase (PostgreSQL)
- **Payments**: RevenueCat for subscriptions
- **Deployment**: Netlify with CDN optimization

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- ElevenLabs API key
- (Optional) Algorand API key
- (Optional) RevenueCat account

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd deathcast
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_ELEVENLABS_KEY=your-elevenlabs-api-key
   ```

3. **Database Setup**
   - Go to your Supabase dashboard
   - Run the SQL from `supabase-schema.sql`
   - Enable Row Level Security policies

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm run preview
   ```

## 🔧 Configuration

### Required Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_ELEVENLABS_KEY` - ElevenLabs API key for voice synthesis

### Optional Environment Variables

- `VITE_ALGORAND_API_KEY` - For blockchain features
- `VITE_REVENUECAT_API_KEY` - For subscription management

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **death_predictions** - AI mortality predictions
- **death_markets** - Blockchain betting markets
- **death_bets** - User bets on predictions
- **digital_legacies** - Last words and inheritance
- **user_subscriptions** - RevenueCat integration
- **death_verifications** - Oracle-based death confirmation

See `supabase-schema.sql` for complete schema.

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Encrypted digital legacy storage
- Secure API key management
- HTTPS enforcement
- Content Security Policy headers

## 🌐 Deployment

### Netlify (Recommended)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Custom Domain**
   - Configure DNS in Netlify dashboard
   - HTTPS is automatically enabled

### Manual Deployment

1. Build: `npm run build`
2. Upload `dist` folder to your hosting provider
3. Configure environment variables
4. Set up HTTPS and security headers

## 🧪 Testing

The application includes comprehensive error handling and validation:

- Camera permission handling
- API failure graceful degradation
- Network connectivity checks
- Input validation and sanitization

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interface
- Camera access on mobile devices
- Progressive Web App features

## 🔊 Voice Features

12 unique AI personalities for death announcements:
- Grim Reaper (classic death)
- Friendly Death (upbeat)
- Game Show Host (entertaining)
- News Anchor (professional)
- British Butler (sophisticated)
- Sports Commentator (exciting)
- Movie Trailer (dramatic)
- Robot AI (calculated)
- Valley Girl (casual)
- Pirate Captain (adventurous)
- Southern Preacher (passionate)
- Philosopher (contemplative)

## 💰 Revenue Streams

1. **Life Extension Subscriptions** ($9.99 - $199.99/month)
2. **Death Insurance** ($19.99/month)
3. **Premium Scanning** ($4.99 one-time)
4. **Digital Legacy Services** (included in subscriptions)
5. **Market Transaction Fees** (percentage of bets)

## 🚨 Legal Disclaimers

- For entertainment purposes only
- Not medical advice
- Predictions are not scientifically validated
- No guarantee of accuracy
- Users must be 18+ to participate in betting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- Check the documentation
- Review error logs in browser console
- Verify environment variables are set correctly
- Ensure database schema is properly installed

## 🏆 Hackathon Achievements

DeathCast successfully addresses multiple hackathon challenges:
- **Blockchain Challenge**: Algorand smart contracts
- **Voice AI Challenge**: ElevenLabs integration
- **Startup Challenge**: Supabase + monetization
- **Deploy Challenge**: Netlify optimization

---

**Built with cutting-edge technology for a production-ready mortality prediction platform.**