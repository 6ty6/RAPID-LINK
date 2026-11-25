// Studio UI tests exercise the real components without project credentials or writes.
export const useClient=()=>globalThis.cmsTestClient
export const set=value=>({type:'set',path:[],value})
