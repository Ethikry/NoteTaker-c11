const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');

const app = express();
const PORT = 3001;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.static('public'));

// app.get('/', (req, res) => res.send('Navigate to /index or /notes'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, './public/notes.html'))
);

// Function to edit notes
const editNote = (notes) => {
  // fs.writeFile("./db/db.json", JSON.stringify(notes), (err) => {
  //   if (err) {
  //     console.error(err);
  //   };
  // });
  fs.writeFile(
    './db/db.json',
    JSON.stringify(notes, null, 4),
    (writeErr) =>
      writeErr
        ? console.error(writeErr)
        : console.info('Successfully updated notes!')
  );
};

// GET request for notes
app.get('/api/notes', (req, res) => {  
    // Log our request to the terminal
    console.info(`${req.method} request received to get notes`);

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          // Parse data and send result
          res.json(JSON.parse(data));
        }
    });
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to add a note`);
  
    // Destructuring assignment for the items in req.body
    const {title, text} = req.body;
  
    // If all the required properties are present
    if (title && text) {
      // Variable for the object we will save
      const newNote = {
        title,
        text,
        id: uuid(),
      };
  
      // Obtain existing notes
      fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          // Convert string into JSON object
          const parsedNotes = JSON.parse(data);
  
          // Add a new review
          parsedNotes.push(newNote);
  
          // Write updated reviews back to the file
          editNote(parsedNotes);
        }
      });
  
      const response = {
        status: 'success',
        body: newNote,
      };
  
      console.log(response);
      res.status(201).json(response);
    } else {
      res.status(500).json('Error in posting note');
    }
  });

app.put("/api/notes/:id", (req, res) => {
  const noteToEditId = req.params.id;

  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      let notes = JSON.parse(data);
      let noteToEdit = notes.find((note) => note.id === noteToEditId);

      if (noteToEdit) {
        let editedNote = {
          title: req.body.title,
          text: req.body.text,
          id: noteToEdit.id,
        };
        let targetIndex = notes.indexOf(noteToEdit);
        notes.splice(targetIndex, 1, editedNote);

        res.sendStatus(204);
        editNote(notes);
        res.json(notes);
      } else {
        res.sendStatus(404);
      };
    };
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const noteToDeleteId = req.params.id;
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      let notes = JSON.parse(data);
      let noteToDelete = notes.find((note) => note.id === noteToDeleteId);
      let targetIndex = notes.indexOf(noteToDelete);
      notes.splice(targetIndex, 1);
      res.sendStatus(204);
      editNote(notes);
      console.log(`Note deleted. Deleted note title: ${noteToDelete.title}`);
    }
  })
});

app.listen(PORT, () =>
  console.log(`Note_Taker app listening at http://localhost:${PORT}`)
);