export type BedInfo = {
    bed_id: number,
    student_id: number,
    choose_bed_auth_counsellor_id: number
}

export type BedId = {
    name: string,
    bed_id: number,
    choose_bed_auth_counsellor_id: number
}


export type NessInfo = {
    persons: Array<{
        name: string,
        // TODO 注意act字段的意思，目前暂时当成登录时的用户名
        act: string,
        psw: string,
        cookie: {
            JSESSIONID: string
        }
    }>,
    // 预抢房的房间信息设置，优先级为从上到下
    houses: Array<{
        id: number,
        name: string
    }>
}