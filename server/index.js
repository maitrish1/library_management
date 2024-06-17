const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const moment = require('moment-timezone');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Babadook@gublu11',
    database: 'library'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

app.get("/allBooks", (req, res) => {
    const q = "SELECT * FROM books";
    db.query(q, (err, data) => {
        if (err) {
            return res.json(err);
        }
        return res.json(data);
    });
});

app.post('/createBook', (req, res) => {
    const q = 'INSERT INTO books (`name`, `takenOn`, `returnOn`, `fine`, `returned`, `returnedOn`) VALUES (?)';
    
    const timeTaken = moment().format('YYYY-MM-DD HH:mm:ss');

    const timeToReturn = moment().add(2, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const returnedOn='2024-01-01 12:00:00'
    const values = [req.body.name, timeTaken, timeToReturn, req.body.fine, req.body.returned, returnedOn];
        
    db.query(q, [values], (err, data) => {
        if (err) {
            console.error('Error inserting book:', err);
            return res.json(err);
        }
        return res.json('Book has been added');
    });
});

app.put('/calculateFine/:id', (req, res) => {
    const bookId = req.params.id;
    const q = "SELECT * FROM books WHERE id=?";
    db.query(q, [bookId], (err, data) => {
        if (err) {
            return res.json(err);
        }
        const book = data[0];
        const now = moment();
        const returnOn = moment(book.returnOn, 'YYYY-MM-DD HH:mm:ss');
        let fine = book.fine;

        if (now.isAfter(returnOn)) {
            const hoursPast = now.diff(returnOn, 'minutes');
            fine += hoursPast * 10;
        }

        return res.json({ fine: fine });
    });
});

app.put('/returnBook/:id', (req, res) => {
    const fine = req.body.fine;
    const bookid=req.params.id
    console.log(req)
    const returnedOn = moment().format('YYYY-MM-DD HH:mm:ss');
    const q = "UPDATE books SET `returned` = ?, `returnedOn` = ?,  `fine` = ? WHERE id = ?";
    const values = ["true", returnedOn, fine, bookid];
    console.log('attempting api cALL',values)
    db.query(q, values, (err, data) => {
        if (err) {
            console.error('Error inserting book:', err);
            return res.json(err);
        }
        return res.json("Book has been returned" );
    });
});

app.listen(8800, () => {
    console.log('Backend started.');
});
