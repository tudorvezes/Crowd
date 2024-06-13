export type Report = {
    id: number,

    title: string,
    body: string,
    timestamp: string,
    username: string,
}

export type CreateReport = {
    title: string,
    body: string,
}