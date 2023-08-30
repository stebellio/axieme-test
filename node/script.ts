import * as readline from 'readline';
import { promisify } from 'util';
import moment from 'moment-timezone';
import { promises as fsPromises } from 'fs';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = promisify(rl.question).bind(rl);

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
    const dbData = await fsPromises.readFile('db.json', 'utf8');
    return JSON.parse(dbData);
};

/**
 * @description Utilizzo un processo asincrono, più leggibile rispetto a callback o promises
 */
(async () => {

    const users: User[] = await getUsers();
    let user: User | undefined;

    // Utilizzo un loop per ritentare nel caso di credenziali errate
    while (true) {
        const username: unknown = await question('Username: ');
        const password: unknown = await question('Password: ');

        user = users.find((row: User) => row.username === username && row.password === password);

        if (user) {
            break;
        }

        console.error('Invalid credentials');
    }

    console.info(`Benvenuto ${user.username}, ecco la data odierna: ${getDate(user)}`);
    rl.close();

})().catch((e) => console.error(e));

function getDate(user: User): moment.Moment {
    let date = moment().tz(user.timeZone);

    if (user.offset) {
        (user.offset > 0)
            ? date.add(user.offset, 'hours')
            : date.subtract(-user.offset, 'hours');
    }

    return date;
}

