// Database connection
import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DB_URI
});

pool.on('connect',() => {
    console.log('DB Connected');
});

pool.on('error', (err) =>{
    console.error('DB Error', err);
})


