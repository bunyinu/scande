# 🚀 DeathCast Deployment Guide

## Quick Deploy to Netlify

### Option 1: Drag & Drop (Fastest)
1. Run `npm run build` to create the `dist` folder
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to the deploy area
4. Your app is live! 🎉

### Option 2: Git Integration (Recommended)
1. Push your code to GitHub
2. Connect GitHub repo to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy automatically on every push

## Environment Variables for Production

Set these in your Netlify dashboard:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ELEVENLABS_KEY=WORLDSLARGESTHACKATHON-9de6906b
VITE_ALGORAND_API_KEY=your-algorand-api-key
VITE_REVENUECAT_API_KEY=your-revenuecat-key
```

## Custom Domain Setup

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS records
4. Enable HTTPS (automatic with Netlify)

## Performance Optimizations

The app is already optimized with:
- ✅ Vite for fast builds
- ✅ Code splitting ready
- ✅ Gzip compression
- ✅ CDN delivery via Netlify
- ✅ Security headers configured

## Monitoring & Analytics

Add these to your deployed app:
- Google Analytics for user tracking
- Sentry for error monitoring
- Netlify Analytics for performance

## Post-Deployment Checklist

- [ ] Test all features work in production
- [ ] Verify camera access works on HTTPS
- [ ] Check voice AI integration
- [ ] Test payment flows
- [ ] Validate blockchain connections
- [ ] Monitor performance metrics

## Hackathon Submission

Your DeathCast app is now ready for hackathon submission! 🏆

**Live Demo URL**: `https://your-app-name.netlify.app`

**Features Implemented**:
- ✅ AI Death Prediction with TensorFlow.js
- ✅ Blockchain Markets with Algorand
- ✅ Voice AI with ElevenLabs
- ✅ Monetization with RevenueCat
- ✅ Real-time Database with Supabase
- ✅ Professional Deployment on Netlify

**Prize Categories Targeted**:
- 🥇 Blockchain Challenge ($25k)
- 🥇 Voice AI Challenge ($25k) 
- 🥇 Startup Challenge ($25k)
- 🥇 Deploy Challenge ($25k)

Total potential winnings: **$100k** 💰

Good luck! 🍀
