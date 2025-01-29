import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET} from "@repo/backend-common/config";
import { createRoomSchema,createUserSchema, SigninSchema } from "@repo/common/types";
import { prismaclient } from "@repo/db/client";


const app = express();
app.use(express.json());


//@ts-ignore
app.post("/signup",async function(req,res){
    const parsedData = createUserSchema.safeParse(req.body);
    // console.log(parsedData);
    if(!parsedData.success){
        res.json({
        message:"Incorrect Inputs"
       })
       return
    }
    try {
        const user = await prismaclient.user.create({
            data:{
                username:parsedData.data?.username,
                email:parsedData.data.email,
                password:parsedData.data.password
            }

        })
        console.log(user);
         res.json({
            message:"User have been created with user id : ",
            userId:user.id
        })
    } catch (error) {
        console.log(error);
        return res.status(411).json({
            message:"error occured",
            error: (error as Error).message
        })
    }
})


//@ts-ignore
app.post('/signin',async function(req:Request,res:Response){
    const parsedata = SigninSchema.safeParse(req.body);

    if(!parsedata.success){
        res.json({
            message:"Invalid data"
        })
        return;
    }
    // db call
    try {
        const user = await prismaclient.user.findUnique({
            where:{
                email:parsedata.data.email,
                password:parsedata.data.password
            }
        });

        if (!user) {
            return res.json({
                message: "Invalid User details, check password"
            });
        }
        const token = jwt.sign({
            userId:user?.id
        },JWT_SECRET);
        
        res.json({
            message:"User have been signed in",
            token:token
        })
        
    } catch (error) {
        return res.json({
            message:"Invalid User details , check password "
        })
    }
})


// first verify authorized route 
//@ts-ignore
app.get('/createroom',middleware,async function(req,res){
    const parsedata = createRoomSchema.safeParse(req.body);
    if(!parsedata.success){
        return res.json({
            message:"Invalid data"
        })
    }
    // db call
    try {
        const room = await prismaclient.room.create({
            data:{
                adminId:parsedata.data.adminId,
                slug: parsedata.data.slug // Make sure to include slug in the parsed data
            }
        })
        if(!room){
            return res.json({
                message: "Invalid User details, check password"
            });
        }
        
    res.json({
        message:"you have succesfully created a room",
        roomId:room.id
    });
        
    } catch (error) {
        res.json({
            message:"Invalid data for room creation"
        })
        return;
    }
})
app.get('/chats/:roomId',async (req,res)=>{
    const roomId = Number(req.params.roomId);
    try {
        const chats = await prismaclient.chat.findMany({
            where:{
                roomId:roomId
            },
            orderBy:{
                id:"desc"
            },
            take:50
        })
        res.json(chats);
        
    } catch (error) {
        res.json({
            message:"Invalid data for chat"
        })
        
    }
})

app.get('/room/:slug',async (req,res)=>{
    const slug = req.params.slug;
    try {
        const room = await prismaclient.room.findMany({
            where:{
                slug:slug
            }
        })
        res.json({
            room
        });
        
    } catch (error) {
        res.json({
            message:"Invalid data for slug"
        })
        
    }
})




app.listen(4037, () => {
    console.log('http-backend server running on port : 5050');
});
