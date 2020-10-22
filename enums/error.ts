export enum errorCodeUser {
    InvEmail = 'InvEmail',
    InvUser = 'InvUser',
    InvName = 'InvName',
    NoUser = 'NoUser',
    NoEmail = 'NoEmail',
    ExistEmail = 'ExistEmail',
    ErrLogin = 'ErrLogin',
    InvPass = 'InvPass',
    InvPassLength = 'InvPassLength',
    InvPassNumbers = 'InvPassNumbers',
    InvPassLetters = 'InvPassLetters',
    InvPassUpper = 'InvPassUpper',
    InvPassLower = 'InvPassLower',
    NoPass = 'NoPass',
    MongoError = 'MongoError',
}

export enum errorCodeRoom {
    InvUser = 'InvUser',
    NoUser = 'NoUser',
    ExistRoom = 'ExistRoom',
    NoRoom = 'NoRoom',
    InvRoom = 'InvRoom',
    MongoError = 'MongoError',
}

export enum errorCodeMessage {
    InvUser = 'InvUser',
    InvRoom = 'InvRoom',
    InvMessage = 'InvMessage',
    NoRoom = 'NoRoom',
    NoRefMessage = 'NoRefMessage',
    MongoError = 'MongoError',
}