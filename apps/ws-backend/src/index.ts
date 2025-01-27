import jwt, { decode, JwtPayload } from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({port:8081});

wss.on('connection',function connection(ws,request){
    // verifiying the server only authenicated user can come
    const url = request.url;
    if(!url){
        return ;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";

    if(!token){
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) ;
    if (!decoded || !(decoded as JwtPayload).userId ) {
        ws.close();
    }

    ws.on('message',function message(data){
        console.log('Received Message =>',data);
        ws.send('pong');
    })
})