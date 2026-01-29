// server.ts - Main entry point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import configurations (initializes Firebase)
import './config/firebase';

// Import routes
import { authRoutes, loreRoutes, audioRoutes, healthRoutes, favoritesRoutes, userRoutes, settingsRoutes } from './routes';

const PORT = process.env.PORT || 3100;
const app = express();

// --- CORS Configuration ---
app.use(cors({
    origin: [
        'https://promptlab.tsxr1ck.com',     // Production
        'https://api.promptlab.tsxr1ck.com', // Backend
        'http://localhost:5173',             // Vite local
        'http://localhost:3100',             // Server local
        'http://192.168.100.25:5173',        // Local IP (mobile testing)
        'http://192.168.100.25:5001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// --- Middleware ---
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/lore', loreRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/health', healthRoutes);

// Stats endpoint (from lore routes)
app.use('/api', loreRoutes);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔑 Qwen API Key: ${process.env.QWEN_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
});
