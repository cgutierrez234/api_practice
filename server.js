// bring in depenedencies
const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

const dbString = process.env.DATABASE_URL;
const PORT = process.env.PORT;

//create new pool connection to db

const pool = new Pool({
  connectionString: dbString,
});

//bring in middleware
app.use(express.static("public"));
app.use(express.json());

app.get("/magic_cards", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM magic_cards");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Cannot fetch magic cards from database");
  }
});

app.get("/magic_cards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM magic_cards WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0) {
      res.status(404).send("Cannot locate magic card at that id");
    } else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Cannot fet magic card from the database");
  }
});

app.post("/magic_cards", async (req, res) => {
  const { type_of, name, mana_cost } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO magic_cards (type_of, name, mana_cost) VALUES ($1,$2,$3) RETURNING*",
      [type_of, name, mana_cost]
    );
    res.status(201).send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Unable to commit new card to database");
  }
});

app.put("/magic_cards/:id", async (req, res) => {
  const { id } = req.params;
  const { type_of, name, mana_cost } = req.body;
  try {
    const result = await pool.query(
      "UPDATE magic_cards SET type_of = $1, name=$2, mana_cost=$3 WHERE id=$4 RETURNING*",
      [type_of, name, mana_cost, id]
    );
    if (result.rowCount === 0) {
      res.status(404).send("Cannot update card at that id");
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Unable to update card in the database");
  }
});

app.delete("/magic_cards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM magic_cards WHERE id=$1 RETURNING*",
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).send("Unable to delete magic card at the given id");
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Unable to delete magic card from database");
  }
});

// create listener

app.listen(PORT, () => {
  console.log(`Server is running ON ${PORT}`);
});
