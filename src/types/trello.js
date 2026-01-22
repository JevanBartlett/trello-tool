"use strict";
// Trello API type definitions
// These interfaces mirror the shape of data returned by Trello's REST API
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardSchema = exports.ListSchema = exports.BoardSchema = exports.MemberSchema = exports.LabelSchema = void 0;
var zod_1 = require("zod");
exports.LabelSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    color: zod_1.z.string(),
});
exports.MemberSchema = zod_1.z.object({
    fullName: zod_1.z.string(),
});
exports.BoardSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
});
exports.ListSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    idBoard: zod_1.z.string(),
});
exports.CardSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    desc: zod_1.z.string(),
    idList: zod_1.z.string(),
    due: zod_1.z.string().nullable(),
    labels: zod_1.z.array(exports.LabelSchema),
});
