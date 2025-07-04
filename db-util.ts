import { MongoClient, ServerApiVersion } from 'mongodb';
import {configDotenv} from 'dotenv';

configDotenv();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@freecluster.jdr5d.mongodb.net/cognibuddy?retryWrites=true&w=majority&appName=FreeCluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

export default client;