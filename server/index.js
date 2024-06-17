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

app.get('/', (req, res) => {
    res.json('App is running');
});

app.get("/allBooks", (req, res) => {
    const q = "SELECT * FROM books";
    db.query(q, (err, data) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

app.post('/createBook', (req, res) => {
    const q = 'INSERT INTO books (`name`, `takenOn`, `returnOn`, `fine`, `returned`, `returnedOn`) VALUES (?)';
    
    const timeTaken = moment().format('YYYY-MM-DD HH:mm:ss');

    const timeToReturn = moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
    const returnedOn='2024-01-01 12:00:00'
    const values = [req.body.name, timeTaken, timeToReturn, req.body.fine, req.body.returned, returnedOn];
    
    console.log('Attempting to insert book with values:', values);
    
    db.query(q, [values], (err, data) => {
        if (err) {
            console.error('Error inserting book:', err);
            return res.status(500).json(err);
        }
        return res.json({
            message: 'Book has been added',
            book: {
                id: data.insertId,
                name: req.body.name,
                takenOn: timeTaken,
                returnOn: timeToReturn,
                fine: req.body.fine,
                returned: req.body.returned
            }
        });
    });
});

app.put('/calculateFine/:id', (req, res) => {
    const bookId = req.params.id;
    const q = "SELECT * FROM books WHERE id=?";
    db.query(q, [bookId], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }
        
        const book = data[0];
        const now = moment();
        const returnOn = moment(book.returnOn, 'YYYY-MM-DD HH:mm:ss');
        let fine = book.fine;

        if (now.isAfter(returnOn)) {
            const hoursPast = now.diff(returnOn, 'hours');
            fine += hoursPast * 10; // 10 Rs per hour
        }

        return res.json({ fine: fine });
    });
});

app.put('/returnBook/:id', (req, res) => {
    const bookId = req.params.id;
    const returnedOn = moment().format('YYYY-MM-DD HH:mm:ss');
    const q = "UPDATE books SET `returned` = ?, `returnedOn` = ? WHERE id = ?";
    const values = ["true", returnedOn, bookId];
    
    db.query(q, values, (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        return res.json({ message: "Book has been returned" });
    });
});

app.listen(8800, () => {
    console.log('Backend started.');
});
