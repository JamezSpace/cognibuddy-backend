import express, {Express, Application, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import usersRoutes from './routes/users.routes';
import authRoutes from './routes/auth.route';
import dashboardRoutes from './routes/dashboard.route';
import { configDotenv } from 'dotenv';

configDotenv();

const app: Application = express();

// Middleware to parse JSON bodies
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the users routes
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/api", (req: Request, res: Response) => {
  res.send("Welcome to the CogniBuddy API!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});