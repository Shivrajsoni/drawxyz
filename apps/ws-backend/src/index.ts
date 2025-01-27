import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8081});

wss.on('connection',function connection(ws){
    ws.on('message',function message(data){
        console.log('Received Message =>',data);
        ws.send('pong');
    })
})