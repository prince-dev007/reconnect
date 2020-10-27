//const config = require('config.json');


require("dotenv").config();

const config = {
    "secret": `${process.env.JWT_SECRET}`
}
const jwt = require('jsonwebtoken');

// users hardcoded for simplicity, store in a db for production applications
const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];

module.exports = {
    authenticate,
    getAll,
    myDetails
};

function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//randomNumber(100000, 999999)

async function authenticate({ username, password }) {
    console.log(username,password);
    try {
        //const user = users.find(u => u.username === username && u.password === password);
        let sql = `Select Id from users where email="${username}" and password="${password}"`;
        let user = clientInformation.query(sql, function (err, resp) {
            if (err) {
                console.log(`Error:::  >>>>`, err);
                return { 'success': false, 'error': err };
            } else {
                console.log(resp);
                return { 'success': true, 'data': resp };
            }
        });
        if (user.success) {
            const token = jwt.sign({ sub: user.data.rows[0].id }, config.secret);
            const { password, ...userWithoutPassword } = user.data.rows[0];
            return {
                ...userWithoutPassword,
                token
            };
        }
    } catch (e) {
        console.log(`Error:  >>> `, e);
        return {
            ...userWithoutPassword,
            token
        };
    }

}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        console.log(u);
        return userWithoutPassword;
    });
}

async function myDetails() {
    const user = { "id": "123", "name": "Rohit" };
    if (user) {
        const password = 'some random password';
        const keys = ['id']
        const algorithm = 'aes256'
        const encoding = 'hex'

        const output = cryptoJSON.encrypt(
            user, { encoding, keys, algorithm }
        )
        console.log(output);
        const output2 = cryptoJSON.decrypt(
            output, password, { encoding, keys, algorithm }
        )
        console.log(output2);
        return user;
    }
}