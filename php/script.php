<?php

class User
{

    private string $username;

    private string $password;

    private string $timeZone;

    private ?int $offset;

    /**
     * @param string $username
     * @param string $password
     * @param string $timeZone
     * @param int|null $offset
     */
    public function __construct(string $username, string $password, string $timeZone, ?int $offset)
    {
        $this->username = $username;
        $this->password = $password;
        $this->timeZone = $timeZone;
        $this->offset = $offset;
    }

    public function login(string $username, string $password): bool
    {
        return $this->username === $username && password_verify($password, $this->password);
    }

    public function showWelcomeMessage(): void
    {
        $date = $this->getTime();
        echo "Benvenuto $this->username, ecco l'ora attuale: $date";
    }

    /**
     * @throws Exception
     */
    private function getTime(): string
    {
        $date = new \DateTime();
        $date->setTimezone(new DateTimeZone($this->timeZone));

        if ($this->offset) {
            $date->modify($this->offset . ' hours');
        }

        return $date->format('H:i:s');
    }

}

$users = getUsersData();
$user = null;

// Loop per ritentare il login
while (!$user) {
    try {
        $user = login($users);
    }
    catch (Exception $exception) {
        print $exception->getMessage();
        echo "\n";
    }
}

$user->showWelcomeMessage();
exit();

/**
 * @param User[] $users
 * @return User
 * @throws Exception
 */
function login(array $users): User
{
    echo "Username: ";
    $username = trim(fgets(STDIN));

    echo "Password: ";
    $password = trim(fgets(STDIN));

    foreach ($users as $user) {
        if ($user->login($username, $password)) {
            return $user;
        }
    }

    throw new Exception('Credenziali non valide');

}

/**
 * @return User[]
 */
function getUsersData(): array
{
    $res = [];
    $data = json_decode(file_get_contents('../db.json'));

    foreach ($data as $datum) {
        $res[] = new User(
            $datum->username,
            $datum->password,
            $datum->timeZone,
            $datum->offset ?? null
        );
    }

    return $res;
}

