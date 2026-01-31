import app from './app.js';
import { env, connectDB } from './config/index.js';

const PORT = env.PORT;

const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log(`║  🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`.padEnd(61) + '║');
            console.log('║  📡 API: http://localhost:' + `${PORT}/api`.padEnd(34) + '║');
            console.log('║  ❤️  Health: http://localhost:' + `${PORT}/api/health`.padEnd(29) + '║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
    console.error('❌ Unhandled Rejection:', reason.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

startServer();
