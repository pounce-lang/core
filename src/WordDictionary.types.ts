import { ProgramList, ValueStack, WordSignature, Word } from "./types";

export type WordValue = {
    sig?: WordSignature;
    def: ProgramList | ((s: ValueStack, pl: ProgramList) =>
        [ValueStack, ProgramList?]);
};
export type WordDictionary = {
    [index: string]: WordValue
};
