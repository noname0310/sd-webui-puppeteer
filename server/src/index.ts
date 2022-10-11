import { IsGeneratingResultPacket, PacketKind } from "./Packet";
import { Server } from "./Server";
import { WebUIController } from "./WebUIController";

async function main() {
    const controller = await WebUIController.create();
    const server = new Server(20310);

    server.onPacket = async (socket, packet) => {
        switch (packet.kind) {
            case PacketKind.TryGenerate: {
                const result = await controller.tryGenerate(packet.promptText);
                server.broadcast({
                    kind: PacketKind.TryGenerateResult,
                    result
                });
                break;
            }
            case PacketKind.IsGenerating: {
                const result = await controller.isGenerating();
                socket.send(JSON.stringify({
                    kind: PacketKind.IsGeneratingResult,
                    result
                } as IsGeneratingResultPacket));
                break;
            }
        }
    };

    for (; ;) {
        const images = await controller.flushImages();
        if (images) {
            server.broadcast({
                kind: PacketKind.GenerateResult,
                result: images
            });
        }
    }
}

main();
