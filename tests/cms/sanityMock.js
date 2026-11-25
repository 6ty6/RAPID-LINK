// Studio UI tests exercise the real components without project credentials or writes.
export const useClient=()=>globalThis.cmsTestClient
export const set=value=>({type:'set',path:[],value})
export const unset=()=>({type:'unset',path:[]})
export const useFormValue=()=>globalThis.cmsTestDocument||{}
export const defineField=value=>value
export const defineType=value=>value
export const defineArrayMember=value=>value
