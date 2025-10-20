import express from 'express';
import db from '../config/db.js';
import { getLanguages, verifyLangInput } from '../utils/fetch-languages.js';
import authenticateFirebaseToken from '../middleware/authMiddleware.js';

const admin = express.Router();

// Apply auth middleware to all /admin routes
admin.use(authenticateFirebaseToken);

admin.post('/add-project', async (req, res) => {
  const { name, description, link, languages } = req.body;

  const { langSet, langMap } = await getLanguages('multi');

  if (!name || !link || !languages || !Array.isArray(languages) || languages.length === 0 || 
    !verifyLangInput(languages, langSet)) {
      return res.status(400).json({ 
        error: "Missing or invalid required fields: 'name', 'link', " +
          "and a non-empty 'languages' array are required." 
      });
  }

  try {
    // add project to projects table

    const [ result ] = await db.query(
      'INSERT INTO projects (name, description, link) VALUES (?, ?, ?)', 
      [name, description || null, link]
    );

    // retrieve project id of project that was added to the table (insertId)

    const projectId = result.insertId;

    // loop through the languages array and create a new entry to the tech_stack table for every language in the array

    const langFilterPromises = languages.map(lang => {
      const query = 'INSERT INTO tech_stack (project_id, language_id) VALUES (?, ?)';
      const langId = langMap[lang];
      return db.query(query, [projectId, langId]);
    });

    await Promise.all(langFilterPromises);

    res.status(201).json({ message: 'Project successfully created', projectId });
  } catch (e) {
    console.error('Error in /admin/add-project:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

admin.put('/edit-project/:id', async (req, res) => {
  const id = req.params.id;
  const { name, description, link, languages } = req.body;

  // verify route parameters and req body
  if ( 
        (languages !== undefined && !Array.isArray(languages)) ||
        (name !== undefined && typeof name !== 'string') ||
        (description !== undefined && typeof description !== 'string') ||
        (link !== undefined && typeof link !== 'string')
    ) {
    return res.status(400).json({
      "error": "Invalid request: 'name', 'description', and 'link' must be strings, and 'languages' must be an array of strings."
    });
  }

  try {
    // grab project id and save as project_id
    const [ result ] = await db.query("SELECT * FROM projects WHERE id = ?", id);

    if (result.length === 0) {
      return res.status(404).json({ "error": `Project with id ${id} not found` });
    }

    // make any specified edits to the project (name, description, link)

    let changesToMake = {};
    let keysToChange = Object.keys(req.body).filter(key => 
      key !== "languages" && req.body[key] !== undefined &&
        req.body[key] !== null && (typeof req.body[key] === 'string'
        && req.body[key].trim() !== ''));
    for (let key of keysToChange) {
      const field = req.body[key];
      if (field !== null && field !== result[0][key]) {
        changesToMake[key] = field;
      }
    }

    const updateResult = await db.query("UPDATE projects SET ? WHERE id = ?", [changesToMake, id]);

    // make necessary changes to the tech_stack table by checking which languages are currently in the project and which ones are being added/removed
    if (languages !== undefined) {
      const [currentLangs] = await db.query("SELECT language_id FROM tech_stack WHERE project_id = ?", id);
      const currentLangSet = new Set(currentLangs.map(l => l.language_id));
      const newLangSet = new Set(languages.map(l => langMap[l]));

      // find languages to add
      const langsToAdd = [...newLangSet].filter(l => !currentLangSet.has(l));
      // find languages to remove
      const langsToRemove = [...currentLangSet].filter(l => !newLangSet.has(l));

      // perform add/remove operations
      await Promise.all([
        ...langsToAdd.map(langId => db.query("INSERT INTO tech_stack (project_id, language_id) VALUES (?, ?)", [id, langId])),
        ...langsToRemove.map(langId => db.query("DELETE FROM tech_stack WHERE project_id = ? AND language_id = ?", [id, langId]))
      ]);
    }

    res.status(200).json(updateResult);
    
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
    console.error(`Error in PUT /admin/edit-project/:id : ${e}`);
  }
  
});

export default admin;