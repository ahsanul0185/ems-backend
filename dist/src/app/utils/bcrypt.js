"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bcryptUtils = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hash = async (data) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(data, salt);
};
const compare = async (data, encrypted) => {
    return bcryptjs_1.default.compare(data, encrypted);
};
exports.bcryptUtils = {
    hash,
    compare,
};
