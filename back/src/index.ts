import express from 'express'
import cors from 'cors';
const app=express()
import {initDB} from './dbSchema/intializeDB.js';
import UserRouter from './routes/user/UserRoutes.js'
import progressRoutes from "./routes/progress/UserProgress.js";
import TotalRoutes from "./routes/progress/UserTotal.js";
import QuesRouter from './routes/questions/QuesRoutes.js'
import RAnalysis from "./routes/Analytics/RAnalysis.js";


app.use(express.json());
const allowedOrigins = [
    'http://localhost:5173', // Local dev
    'https://dsaanalysis-frontend.vercel.app' // Your NEW Vercel URL
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

initDB();


app.get('/firstCheck',(req,res)=>{
    res.send("Hey wow what a craxy thing");
})
app.use('/users',UserRouter);
app.use("/progress", progressRoutes);
app.use("/total",TotalRoutes);
app.use("/questions",QuesRouter);
app.use("/analysis",RAnalysis);

app.listen(8000,()=>{
    console.log("Backend server has started, nice ")
});