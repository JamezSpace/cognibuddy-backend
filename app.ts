import express, {Express, Application, Request, Response, NextFunction} from 'express';
import usersRoutes from './routes/users.routes';

const app: Application = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the users routes
app.use("/users", usersRoutes);


app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});