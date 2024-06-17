import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [book, setbook] = useState({
    name: "",
    fine: 0,
    returned: "false",
  });
  const [bookId, setbookId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      let temp = await axios.get("http://localhost:8800/allBooks");
      setBooks(temp.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/createBook", book);
      fetchBooks();
      setbook({ name: "", fine: 0, returned: "false" });
    } catch (err) {
      console.log(err);
    }
    setbookId(null);
  }

  async function calculateFine(id) {
    setbookId(id);
    try {
      const response = await axios.put(
        `http://localhost:8800/calculateFine/${id}`
      );
      console.log(response.data.fine);
      alert(`The fine for book ID ${id} is Rs. ${response.data.fine}`);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleReturn(id) {
    try {
      const response = await axios.put(
        `http://localhost:8800/returnBook/${id}`
      );
      alert(response.data.message);
      fetchBooks();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="parent">
      <div>
        <form onSubmit={handleSubmit}>
          <input
            name="book"
            value={book.name}
            onChange={(e) => setbook({ ...book, name: e.target.value })}
            type="text"
            placeholder="Name of book"
          />
          <button type="submit">Submit</button>
        </form>

        <div className="card-parent">
          {books.map((each) => {
            if (each.returned !== "true") {
              return (
                <div className="card" key={each.id}>
                  <div>
                    Name of book - <span className="block">{each.name}</span>
                  </div>

                  <div>
                    Book taken on -{" "}
                    <span className="block">
                      {new Date(each.takenOn).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    Book to be received back on -{" "}
                    <span className="block">
                      {new Date(each.returnOn).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    Fine till now -{" "}
                    <span className="block">INR {each.fine}</span>
                  </div>

                  {bookId === each.id ? (
                    <button onClick={() => handleReturn(each.id)}>
                      Return book
                    </button>
                  ) : (
                    <button onClick={() => calculateFine(each.id)}>
                      Calculate Fine
                    </button>
                  )}
                </div>
              );
            } else {
              return null; // Return null if the book is returned
            }
          })}
        </div>
      </div>

      <div>
        <h2>Received back books - </h2>

        <div className="card-parent">
          {books.map((each) => {
            if (each.returned === "true") {
              return (
                <div className="card" key={each.id}>
                  <div>
                    Name of book - <span className="block">{each.name}</span>
                  </div>

                  <div>
                    Book taken on -{" "}
                    <span className="block">
                      {new Date(each.takenOn).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    Book to be received back on -{" "}
                    <span className="block">
                      {new Date(each.returnOn).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    Book returned back on -
                    <span className="block">
                      {new Date(each.returnedOn).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            } else {
              return null; // Return null if the book is not returned
            }
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
