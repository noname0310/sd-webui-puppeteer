import type { Packet } from "./Packet";

export class Client {
    private readonly _socket: WebSocket;
    public onPacket: (packet: Packet) => void = () => {/* */};

    public constructor(url: string) {
        this._socket = new WebSocket(url);
        this._socket.onmessage = this.onMessage;
    }

    private readonly onMessage = (event: MessageEvent): void => {
        const packet = JSON.parse(event.data) as Packet;
        this.onPacket(packet);
    };

    public send(packet: Packet): void {
        this._socket.send(JSON.stringify(packet));
    }

    public dispose(): void {
        this._socket.onmessage = null;
        this._socket.close();
    }

    public get isConnected(): boolean {
        return this._socket.readyState === WebSocket.OPEN;
    }
}
