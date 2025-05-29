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
  // verify route parameters and req body

  // Update the project with id (= route param)

  /*
    IF updating language array:
      retrieve current language array using id route param
      loop through new language array and make necessary changes to tech_stack table
  */
  
});

export default admin;