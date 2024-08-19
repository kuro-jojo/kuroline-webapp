export interface User {
    id?: string
    name: string
    phoneNumber?: string
    email?: string
    password?: string
    status?: string // online, offline or busy
    profilePhoto?: File | string,
}
