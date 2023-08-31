"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const readline = __importStar(require("readline"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const fs_1 = require("fs");
const bcrypt = __importStar(require("bcrypt"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
});
/**
 * @description Ottengo i dati degli utenti dal db
 * @returns {Promise<any>}
 */
const getUsers = async () => {
    const dbData = await fs_1.promises.readFile('../db.json', 'utf8');
    return JSON.parse(dbData);
};
/**
 * @description Verifica password, la pasw è stata generata tramite bycrpt con 10 "round"
 * @param password
 * @param dbPasw
 */
const passwordMatch = async (password, dbPasw) => {
    return await bcrypt.compare(password, dbPasw);
};
const getDate = (user) => {
    let date = (0, moment_timezone_1.default)().tz(user.timeZone);
    if (user.offset) {
        (user.offset > 0)
            ? date.add(user.offset, 'hours')
            : date.subtract(-user.offset, 'hours');
    }
    return date.format('HH:mm:ss');
};
/**
 * @description Esecuzione script
 */
(async () => {
    await main();
})().catch((err) => console.error(err));
/**
 * @description Utilizzo un processo asincrono, più leggibile rispetto a callback o promises
 */
async function main() {
    const users = await getUsers();
    let user;
    // Utilizzo un loop per ritentare nel caso di credenziali errate
    while (true) {
        const username = await question('Username: ');
        const password = await question('Password: ');
        user = users.find((row) => row.username === username);
        // Credenziali non valide
        if (!user || !await passwordMatch(password, user.password)) {
            console.error('Invalid credentials');
            continue;
        }
        console.info(`Benvenuto ${user.username}, ecco l'ora attuale': ${getDate(user)}`);
        break;
    }
    rl.close();
}
exports.main = main;
