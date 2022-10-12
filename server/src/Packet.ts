export enum PacketKind {
    GetPrompt,
    GetPromptResult,

    TrySetPrompt,

    TryGenerate,

    GetIsGenerating,
    GetIsGeneratingResult,

    RequestGenerateResult,
    GenerateResult
}

export type GetPromptPacket = {
    kind: PacketKind.GetPrompt;
};

export type GetPromptResultPacket = {
    kind: PacketKind.GetPromptResult;
    result: string;
};

export type TrySetPromptPacket = {
    kind: PacketKind.TrySetPrompt;
    promptText: string;
};

export type TryGeneratePacket = {
    kind: PacketKind.TryGenerate;
};

export type GetIsGeneratingPacket = {
    kind: PacketKind.GetIsGenerating;
};

export type GetIsGeneratingResultPacket = {
    kind: PacketKind.GetIsGeneratingResult;
    result: boolean;
};

export type RequestGenerateResultPacket = {
    kind: PacketKind.RequestGenerateResult;
};

export type GenerateResultPacket = {
    kind: PacketKind.GenerateResult;
    result: string[];
};

export type Packet =
    GetPromptPacket |
    GetPromptResultPacket |
    TrySetPromptPacket |
    TryGeneratePacket |
    GetIsGeneratingPacket |
    GetIsGeneratingResultPacket |
    RequestGenerateResultPacket |
    GenerateResultPacket;
