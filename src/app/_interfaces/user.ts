export interface User {
    id: string
    name: string
    phoneNumber?: string
    status: string // online, offline or busy
    profilePhoto?: string,
    email?: string
}
