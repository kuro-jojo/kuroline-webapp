export interface User {
    id?: string
    name?: string
    phoneNumber?: string
    email?: string
    password?: string
    status?: string // online, offline or busy
    profilePicture?: File | string,
    contacts?: string[]
}

export const userStatuses = {
    online: 'ONLINE',
    offline: 'OFFLINE',
    busy: 'BUSY'
}