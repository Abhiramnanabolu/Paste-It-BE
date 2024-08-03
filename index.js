const express = require("express");
const cors = require("cors")
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(cors())
const dbPath = path.join(__dirname, "pasteit.db");
const Port=process.env.PORT || 8080
const crypto = require('crypto');

const generateId = () => {
  return crypto.randomBytes(4).toString('hex').toLowerCase(); // 4 bytes = 8 hex characters
};


let db = null;

app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(Port, () => {
      console.log(`Server Running at http://localhost:${Port}/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();



app.get("/", async (req,res)=>{
    res.send("Its Working !!!!!!!!")
})

app.post("/pasteit/add", async (request, response) => {
    const { text } = request.body;
  
  if (!text) {
    return response.status(400).send("Text is required");
  }

  const id = generateId();
  const query = `
    INSERT INTO pastes (id, content, views)
    VALUES (?, ?, ?)
  `;
  
  try {
    await db.run(query, [id, text, 0]);
    const views=0;
    response.status(201).send({ id, text, views });
  } catch (error) {
    response.status(500).send(`Error: ${error.message}`);
  }
});

app.get("/pasteit/:id", async (request, response) => {
    const { id } = request.params;
  
    if (!id) {
      return response.status(400).send("ID is required");
    }
  
    try {
      const query = `
        SELECT * FROM pastes
        WHERE id = ?
      `;
      const paste = await db.get(query, [id]);
  
      if (paste) {
        await db.run(`
          UPDATE pastes
          SET views = views + 1
          WHERE id = ?
        `, [id]);
  
        response.status(200).send(paste);
      } else {
        response.status(404).send("Paste not found");
      }
    } catch (error) {
      response.status(500).send(`Error: ${error.message}`);
    }
  });
  