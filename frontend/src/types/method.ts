export interface user {
    id: string,
    approved: boolean,
    role: number,
    created: string,
    email: string
}

export interface medotSet {
    created: string,
    head: true,
    id: string,
    methods: method[],
    name: string,
    user: user,
    version: number,
    vid: string,
}

export interface method {
    calculations: string | any,
    components: string | any,
    created: string,
    head: boolean,
    id: string,
    type: string,
    name: string,
    user: user,
    version: number,
    vid: string,
    update?: boolean
}

export interface ComponentI {
    name: string,
    id: number,
    rt: number,
    window: number,
    type: string
  }
