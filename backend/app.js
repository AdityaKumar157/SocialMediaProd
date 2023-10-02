import express from 'express';
import mongoose from 'mongoose';
import router from './routes/user-routes';
import blogRouter from './routes/blog-routes';
import dotenv from "dotenv";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use("/api/user", router);
app.use("/api/blog", blogRouter);

dotenv.config();

// Connection to database
mongoose.connect(process.env.DATABASE_URL)
    .then(() => { app.listen(PORT); })
    .then(() => { console.log(`Connection to database successfull and listening to the port ${PORT}!!`); })
    .catch((error) => {
        console.log(error);
    });


// app.listen(PORT, () => {
//     console.log(`Listening to the port ${PORT}!!`)
// });