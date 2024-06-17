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
  const [fine, setfine] = useState(0);
  const [fineId, setfineId] = useState(null)
  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      let temp = await axios.get("http://localhost:8800/allBooks");
      console.log(temp.data)
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
      setfine(response.data.fine);
      setfineId(id)
    } catch (err) {
      console.log(err);
    }
  }

  async function handleReturn(id) {
    try {
      const response = await axios.put(
        `http://localhost:8800/returnBook/${id}`, {fine:fine}
      );
      alert(response.data);
      fetchBooks();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="parent">
      <div className="card-parent left">
        <form onSubmit={handleSubmit}>
          <input style={{margin:'2em'}}
            name="book"
            value={book.name}
            onChange={(e) => setbook({ ...book, name: e.target.value })}
            type="text"
            placeholder="Name of book"
          />
          <button type="submit">Submit</button>
        </form>
        {books.map((each) => {
          if (each.returned !== "true") {
            return (
              <div className="card" key={each.id}>
                <div>
                  Name of book - <span className="block">{each.name}</span>
                </div>

                <div>
                  Book taken on -
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
                  {fineId===each.id? <span className="block">{`Fine till now - INR ${fine}`}</span> :'' }
                </div>

                {bookId === each.id ? (
                  <button
                    className="return"
                    onClick={() => handleReturn(each.id)}
                  >
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
            return null;
          }
        })}
      </div>

      <div className="card-parent">
        <h2>Received back books - </h2>

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
                  Book returned back on -
                  <span className="block">
                    {new Date(each.returnedOn).toLocaleString()}
                  </span>
                </div>

                <div>
                  Fine paid -
                  <span className="block">
                    {each.fine}
                  </span>
                </div>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
}

export default App;
