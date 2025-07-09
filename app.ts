import express, {Express, Application, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import usersRoutes from './routes/users.routes';
import authRoutes from './routes/auth.route';
import dashboardRoutes from './routes/dashboard.route';
import gameRoutes from './routes/games.routes';
import { configDotenv } from 'dotenv';
import logRequests from './middleware/logger.middleware';
import adminRoutes from './routes/admin.routes';

configDotenv();

const app: Application = express();

// Middleware to parse JSON bodies
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the routes
app.use(logRequests);
app.use("/api/users", usersRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes)


app.get("/api", (req: Request, res: Response) => {
  res.send("Welcome to the CogniBuddy API!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});