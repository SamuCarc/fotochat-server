"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorCodeMessage = exports.errorCodeRoom = exports.errorCodeUser = void 0;
var errorCodeUser;
(function (errorCodeUser) {
    errorCodeUser["InvEmail"] = "InvEmail";
    errorCodeUser["InvUser"] = "InvUser";
    errorCodeUser["InvName"] = "InvName";
    errorCodeUser["NoUser"] = "NoUser";
    errorCodeUser["NoEmail"] = "NoEmail";
    errorCodeUser["ExistEmail"] = "ExistEmail";
    errorCodeUser["ErrLogin"] = "ErrLogin";
    errorCodeUser["InvPass"] = "InvPass";
    errorCodeUser["InvPassLength"] = "InvPassLength";
    errorCodeUser["InvPassNumbers"] = "InvPassNumbers";
    errorCodeUser["InvPassLetters"] = "InvPassLetters";
    errorCodeUser["InvPassUpper"] = "InvPassUpper";
    errorCodeUser["InvPassLower"] = "InvPassLower";
    errorCodeUser["NoPass"] = "NoPass";
    errorCodeUser["MongoError"] = "MongoError";
})(errorCodeUser = exports.errorCodeUser || (exports.errorCodeUser = {}));
var errorCodeRoom;
(function (errorCodeRoom) {
    errorCodeRoom["InvUser"] = "InvUser";
    errorCodeRoom["NoUser"] = "NoUser";
    errorCodeRoom["ExistRoom"] = "ExistRoom";
    errorCodeRoom["NoRoom"] = "NoRoom";
    errorCodeRoom["InvRoom"] = "InvRoom";
    errorCodeRoom["MongoError"] = "MongoError";
})(errorCodeRoom = exports.errorCodeRoom || (exports.errorCodeRoom = {}));
var errorCodeMessage;
(function (errorCodeMessage) {
    errorCodeMessage["InvUser"] = "InvUser";
    errorCodeMessage["InvRoom"] = "InvRoom";
    errorCodeMessage["InvMessage"] = "InvMessage";
    errorCodeMessage["NoRoom"] = "NoRoom";
    errorCodeMessage["NoRefMessage"] = "NoRefMessage";
    errorCodeMessage["MongoError"] = "MongoError";
})(errorCodeMessage = exports.errorCodeMessage || (exports.errorCodeMessage = {}));
