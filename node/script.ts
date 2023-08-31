import * as readline from 'readline';
import moment from 'moment-timezone';
import { promises as fsPromises } from 'fs';
import * as bcrypt from 'bcrypt';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => {
        rl.question(prompt, resolve);
    });

type User = {
    username: string,
    password: string,
    timeZone: string,
    offset?: number
};

/**
 * @description Ottengo i dati degli utenti dal db
 * @returns {Promise<any>}
 */
const getUsers = async (): Promise<User[]> => {
    const dbData = await fsPromises.readFile('../db.json', 'utf8');
    return JSON.parse(dbData);
};

/**
 * @description Verifica password, la pasw è stata generata tramite bycrpt con 10 "round"
 * @param password
 * @param dbPasw
 */
const passwordMatch = async (password: string, dbPasw: string): Promise<boolean> => {
    return await bcrypt.compare(password, dbPasw);
}

const getDate = (user: User): string => {
    let date = moment().tz(user.timeZone);

    if (user.offset) {
        (user.offset > 0)
            ? date.add(user.offset, 'hours')
            : date.subtract(-user.offset, 'hours');
    }

    return date.format('HH:mm:ss');
}


/**
 * @description Esecuzione script
 */
(async () => {
    await main();
})().catch((err) => console.error(err));

/**
 * @description Utilizzo un processo asincrono, più leggibile rispetto a callback o promises
 */
export async function main() {
    const users: User[] = await getUsers();
    let user: User | undefined;

    // Utilizzo un loop per ritentare nel caso di credenziali errate
    while (true) {
        const username: string = await question('Username: ');
        const password: string = await question('Password: ');

        user = users.find((row: User) => row.username === username);

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