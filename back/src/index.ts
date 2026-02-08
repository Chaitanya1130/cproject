import express from 'express'
import cors from 'cors';
const app=express()
import {initDB} from './dbSchema/intializeDB.js';
import UserRouter from './routes/user/UserRoutes.js'
import progressRoutes from "./routes/progress/UserProgress.js";
import TotalRoutes from "./routes/progress/UserTotal.js";
import QuesRouter from './routes/questions/QuesRoutes.js'
import { startCronJobs } from "./Services/misc/Cron.js";

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

initDB();
startCronJobs();

app.get('/firstCheck',(req,res)=>{
    res.send("Hey wow what a craxy thing");
})
app.use('/users',UserRouter);

app.use("/progress", progressRoutes);
app.use("/total",TotalRoutes);
app.use("/questions",QuesRouter);

app.listen(8000,()=>{
    console.log("Backend server has started, nice ")
});