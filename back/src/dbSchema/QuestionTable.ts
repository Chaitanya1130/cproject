import {pool} from "./connect.js"

export const GlobalQues=async()=>{
    const query=`
        create table if not exists QUESTIONS(
            qid serial primary key,
            qname text,
            qpattern text,
            link TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
try{
    await pool.query(query);
    console.log("Users table ready");
}
catch(error){
    console.error("Error, db not initialized ");
    throw error;
}
};