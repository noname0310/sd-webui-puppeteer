export enum PacketKind {
    TryGenerate,
    IsGenerating,

    TryGenerateResult,
    IsGeneratingResult,
    GenerateResult
}

export type TryGeneratePacket = {
    kind: PacketKind.TryGenerate,
    promptText: string
};

export type IsGeneratingPacket = {
    kind: PacketKind.IsGenerating
};

export type TryGenerateResultPacket = {
    kind: PacketKind.TryGenerateResult,
    result: boolean
};

export type IsGeneratingResultPacket = {
    kind: PacketKind.IsGeneratingResult,
    result: boolean
};

export type GenerateResultPacket = {
    kind: PacketKind.GenerateResult,
    result: string[]
};

export type Packet = TryGeneratePacket|IsGeneratingPacket|TryGenerateResultPacket|IsGeneratingResultPacket|GenerateResultPacket;
