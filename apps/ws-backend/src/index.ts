import jwt from "jsonwebtoken";
import { WebSocketServer,WebSocket } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaclient } from "@repo/db/client";

const wss = new WebSocketServer({port:9999});

interface User {
    ws:WebSocket,
    rooms:string[],
    userId:string
}
let users : User[] = [];


function CheckUser(token:string):string|null{

    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        console.log(decoded);
    if(typeof decoded ==="string"){
        console.log("JWT decoding failed : unexpected string format")
        return null ;
    }
    if (!decoded ||!decoded.userId ) {
        console.log("JWT missing userId")
        return null;
    }
    return decoded.userId;
        
    } catch (error) {
        console.log("JWT verification failed : unexpected error")
        return null;
    }
    
}

wss.on('connection',async function connection(ws,request){
    // verifiying the server only authenicated user can come
    const url = request.url;
    if(!url){
        return ;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
   
    const userId = CheckUser((queryParams.get('token') || ""));
    if(userId==null){
        ws.close(1008,"invalid authentication token");
        return null;
    }
    users.push({
        userId,
        rooms:[],
        ws
    })

    ws.on('message',async function message(data){
        const  parsedData = JSON.parse(data as unknown as string) ;

        if(parsedData.type ==="join_room"){
            const user = users.find(x=>x.ws===ws);
            user?.rooms.push(parsedData.roomId);
        }
        if(parsedData.type ==="leave_room"){
            const user = users.find(x=>x.ws===ws);
            if(!user){
                return ;
            }    
            user.rooms = user?.rooms.filter(x=>x!==parsedData.roomId);
        }
        if(parsedData.type ==="send_message"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            // push into queue , ideally 
            await prismaclient.chat.create({
                data:{
                    roomId:roomId,
                    message:message,
                    userId:userId

                }
            })

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomId:roomId
                    }))
                }
                                    
                    
            })

        }
    })
    ws.on("close", () => {
        users = users.filter(user => user.ws !== ws);
        console.log(`User ${userId} disconnected.`);
    });

})
wss.on('error',(err)=>{
    console.log(err);
})