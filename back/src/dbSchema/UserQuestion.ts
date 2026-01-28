import {pool} from "./connect.js"

export const refUsertoQues=async()=>{
    const query=`
        create table if not exists UserProgress(
        
            id serial primary key,
            uid integer references USERS(uid),
            qid integer references QUESTIONS(qid),
            status TEXT DEFAULT 'not_started',
            visited INTEGER DEFAULT 0,
            last_opened TIMESTAMP,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try{
        await pool.query(query);
        console.log("UserPR done");
    }
    catch(error){
        console.log(error);
        throw error;
    }
}