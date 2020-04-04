import { ProgramList } from './types';
import { WordDictionary } from "./WordDictionary";
export declare const parser: {
    Grammar: {
        _read_pounce: () => any;
        _read_pounce_pl: () => any;
        _read_pounce_empty: () => any;
        _read_word: () => any;
        _read_value: () => any;
        _read_map: () => any;
        _read_pair: () => any;
        _read_string: () => any;
        _read_string_s: () => any;
        _read_string_d: () => any;
        _read_string_t: () => any;
        _read_list: () => any;
        _read_list_empty: () => any;
        _read_list_full: () => any;
        _read_number: () => any;
        _read_float1: () => any;
        _read_float2: () => any;
        _read_float3: () => any;
        _read_integer: () => any;
        _read_end_of_word: () => any;
        _read_ws: () => any;
        _read_space: () => any;
        _read_tab: () => any;
        _read_newline: () => any;
        _read_newline1: () => any;
        _read_newline2: () => any;
        _read_comment: () => any;
        _read_end_of_string: () => any;
    };
    Parser: any;
    parse: (input: string, options: any) => any;
};
export declare function purr(programList: ProgramList, wd?: WordDictionary, opt?: {
    debug?: boolean;
}): Generator<ProgramList[] | (string | ProgramList[])[], void, unknown>;
