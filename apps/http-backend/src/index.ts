import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET} from "@repo/backend-common/config";


const app = express();
app.use(express.json());


app.post('/signup',(req,res)=>{
    // db call
    res.send("signup page");
})

app.post('/signin',(req,res)=>{
    const userId =1;
    jwt.sign({
        userId
    },JWT_SECRET)
    res.send("signin page and sending token for authentication");
})


// first verify authorized route 
app.get('/createroom',middleware,(req,res)=>{
    res.json({
        message:"you are authorized to create room"
    });
})

app.listen(3090, () => {
    console.log('http-backend server running on port : 4000');
});
