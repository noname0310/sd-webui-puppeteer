import "./index.css";

import { Client } from "./Client";
import { DebounceExecuter } from "./DebounceExecuter";
import { PacketKind } from "./Packet";

async function main(): Promise<void> {
    const client = await Client.createAndConnect("wss://nonamehome.iptime.org:20310");

    const resultImageElement = document.getElementById("result-img") as HTMLImageElement;
    const textInputElement = document.getElementById("text-input") as HTMLInputElement;
    const generateButtonElement = document.getElementById("generate-button") as HTMLButtonElement;

    client.onPacket = (packet): void => {
        switch (packet.kind) {
        case PacketKind.GetPromptResult:
            textInputElement.value = packet.result;
            break;
        case PacketKind.GetIsGeneratingResult:
            if (packet.result) {
                generateButtonElement.disabled = true;
                generateButtonElement.innerText = "...";
            } else {
                generateButtonElement.disabled = false;
                generateButtonElement.innerText = "Generate";
            }
            break;
        case PacketKind.GenerateResult:
            resultImageElement.src = packet.result[0];
            break;
        }
    };

    client.send({ kind: PacketKind.GetPrompt });
    client.send({ kind: PacketKind.GetIsGenerating });
    client.send({ kind: PacketKind.RequestGenerateResult });

    const textInputDebounceExecuter = new DebounceExecuter(500);

    textInputElement.oninput = (): void => {
        textInputDebounceExecuter.execute(() => {
            client.send({ kind: PacketKind.TrySetPrompt, promptText: textInputElement.value });
        });
    };

    generateButtonElement.onclick = (): void => {
        if (!client.isConnected) return;
        if (textInputDebounceExecuter.isExecuting) return;

        client.send({ kind: PacketKind.TryGenerate });
    };
}

main();
