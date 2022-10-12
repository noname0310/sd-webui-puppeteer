import "./index.css";

import { Client } from "./Client";
import { PacketKind } from "./Packet";

const resultImageElement = document.getElementById("result-img") as HTMLImageElement;
const textInputElement = document.getElementById("text-input") as HTMLInputElement;
const generateButtonElement = document.getElementById("generate-button") as HTMLButtonElement;

const client = new Client("ws://nonamehome.iptime.org:20310");

client.onPacket = (packet): void => {
    switch (packet.kind) {
    case PacketKind.GenerateResult:
        resultImageElement.src = packet.result[0];
        break;
    }
};

generateButtonElement.onclick = (): void => {
    if (!client.isConnected) return;

    client.send({
        kind: PacketKind.TryGenerate,
        promptText: textInputElement.value
    });
};
