import express from 'express';
import db from '../config/db.js';
import { getLanguages, verifyLangInput } from '../utils/fetch-languages.js';
// import authenticateFirebaseToken from '../middleware/authMiddleware.js';

const admin = express.Router();

// Apply auth middleware to all /admin routes
// admin.use(authenticateFirebaseToken);

admin.post('/add-project', async (req, res) => {
  const { name, description, link, languages } = req.body;

  const { langSet, langMap } = await getLanguages('multi');

  // console.log(langSet);

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

  /*
    Current approach:
    - When editing project languages, remove all related rows in the tech_stack table for the given project.
    - Then, re-insert all languages specified in the request body.

    BACKLOG (optimization):
    - Only remove languages the user has deselected, and preserve existing ones that remain unchanged.
    - Avoid deleting and re-adding all rows unnecessarily.
  */


  try {
    // grab project id and save as project_id
    const [ result ] = await db.query("SELECT * FROM projects WHERE id = ?", id);

    if (result.length === 0) {
      return res.status(404).json({ "error": `Project with id ${id} not found` });
    }

    // make any specified edits to the project (name, description, link)

    let changesToMake = {};
    for (let key of Object.keys(req.body)) {
      if (key !== "languages") {
        const field = req.body[key];
        if (field !== null && field !== result[0][key]) {
          changesToMake[key] = field;
        }
      }
    }

    const updateResult = await db.query("UPDATE projects SET ? WHERE id = ?", [changesToMake, id]);

    // delete all rows from tech_stack where tech_stack.project_id = project_id
    // add all languages specified in request body to tech_stack (project_id, language_id)

    res.status(200).json(updateResult);
    
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
    console.error(`Error in PUT /admin/edit-project/:id : ${e}`);
  }

  

  // Update the project with id (= route param)

  /*
    IF updating language array:
      retrieve current language array using id route param
      loop through new language array and make necessary changes to tech_stack table
  */
  
});

export default admin;