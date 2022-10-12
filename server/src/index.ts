import type { GenerateResultPacket } from "./Packet";
import { PacketKind } from "./Packet";
import { Server } from "./Server";
import { WebUIController } from "./WebUIController";

let server: Server;
let controller: WebUIController;
let shutdown = false;

process.on("SIGINT", async () => {
    console.log("shutting down");
    await server?.dispose();
    controller?.dispose();
    process.exit(1);
    shutdown = true;
});

async function main(): Promise<void> {
    server = new Server(20310);
    controller = await WebUIController.create();

    let prompt = "";
    let lastResult: GenerateResultPacket;

    server.onPacket = async (socket, packet): Promise<void> => {
        console.log("received packet", packet);
        switch (packet.kind) {
        case PacketKind.GetPrompt: {
            socket.send(JSON.stringify({
                kind: PacketKind.GetPromptResult,
                result: prompt
            }));
            break;
        }
        case PacketKind.TrySetPrompt: {
            prompt = packet.promptText;
            server.broadcast({
                kind: PacketKind.GetPromptResult,
                result: prompt
            });
            break;
        }
        case PacketKind.TryGenerate: {
            const success = await controller.tryGenerate(prompt);
            if (success) {
                server.broadcast({
                    kind: PacketKind.GetIsGeneratingResult,
                    result: true
                });
            }
            break;
        }
        case PacketKind.GetIsGenerating: {
            const isGenerating = await controller.isGenerating();
            socket.send(JSON.stringify({
                kind: PacketKind.GetIsGeneratingResult,
                result: isGenerating
            }));
            break;
        }
        case PacketKind.RequestGenerateResult: {
            if (lastResult) {
                socket.send(JSON.stringify(lastResult));
            }
            break;
        }
        }
    };

    while (!shutdown) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const images = await controller.flushImages();
        if (images) {
            lastResult = {
                kind: PacketKind.GenerateResult,
                result: images
            };
            server.broadcast(lastResult);
            server.broadcast({
                kind: PacketKind.GetIsGeneratingResult,
                result: false
            });
        }
    }
}

main();
