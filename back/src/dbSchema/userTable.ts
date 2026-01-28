import { error } from "node:console";
import {pool} from "./connect.js";


export const tableCreation=async()=>{
    const query=
    `
    CREATE TABLE if not exists USERS(
        uid serial primary key,
        name varchar(50) not null,
        email varchar(100) unique not null,
        password varchar not null,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

`;
try{
    await pool.query(query);
    console.log("Users table ready");
}
catch{
    console.error("Error, db not initialized ");
    throw error;
}
}