import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import cors from "cors";
import debug from 'debug';
import connectdb from './config/mongoose-connection.js';

import userRouter from "./routes/userRouter.js";
import transactionRouter from './routes/transactionRouter.js';
import reversalRouter from './routes/reversalRouter.js';
import adminRouter from './routes/adminRouter.js';

const app = express();
const dbgr = debug("development:app");
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOption = {
    origin : "http://localhost:5173",
    credentials: true
}
app.use(cors(corsOption));

app.use("/api/user",userRouter);
app.use("/api/transaction",transactionRouter);
app.use("/api/reversal",reversalRouter);
app.use("/api/admin",adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    dbgr(`Server started at port ${PORT}`);
    connectdb();
});