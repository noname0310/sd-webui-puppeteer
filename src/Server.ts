import WebSocket, { WebSocketServer } from "ws";
import { Packet } from "./Packet";

export class Server {
    public onPacket: (socket: WebSocket, packet: Packet) => void = () => {/* */};
    private _websocketServer: WebSocketServer;
    private _clients: WebSocket[] = [];

    public constructor(port: number) {
        this._websocketServer = new WebSocketServer({ port });
        this._websocketServer.on("connection", this.onConnection);
    }

    private readonly onConnection = (client: WebSocket): void =>{
        this._clients.push(client);

        const onMessage = (message: WebSocket.RawData) => {
            this.onPacket(client, JSON.parse(message.toString()));
        };

        const onClose = () => {
            client.off("message", onMessage);
            client.off("close", onClose);
            this._clients.splice(this._clients.indexOf(client), 1);
        };
        
        client.on("message", onMessage);
        client.on("close", onClose);
    }

    public dispose() {
        this._websocketServer.off("connection", this.onConnection);
        for (const client of this._clients) client.close();
        this._websocketServer.close();
    }

    public broadcast(packet: Packet) {
        const stringifiedPacket = JSON.stringify(packet);
        this._websocketServer.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(stringifiedPacket);
            }
        });
    }
}
