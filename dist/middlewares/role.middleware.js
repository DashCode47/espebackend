"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.UserRole = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("./errorHandler");
const prisma = new client_1.PrismaClient();
// Enum UserRole - se importará de Prisma una vez que los tipos se actualicen
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "STUDENT";
    UserRole["DRIVER"] = "DRIVER";
})(UserRole || (exports.UserRole = UserRole = {}));
const requireRole = (...allowedRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError(401, 'Authentication required');
            }
            const user = yield prisma.user.findUnique({
                where: { id: req.user.userId }
            });
            if (!user) {
                throw new errorHandler_1.AppError(404, 'User not found');
            }
            // @ts-ignore - role exists in database after migration
            const userRole = user.role;
            const allowedRoleStrings = allowedRoles.map(role => role);
            if (!allowedRoleStrings.includes(userRole)) {
                throw new errorHandler_1.AppError(403, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.requireRole = requireRole;
