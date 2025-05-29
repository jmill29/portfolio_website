import express from 'express';
import db from '../config/db.js';
import { getLanguages, verifyLangInput } from '../utils/fetch-languages.js';

const general = express.Router();

// fetch all projects (GET /projects)

general.get('/projects', async (req, res) => {
  const langFilterRaw = req.query.lang;
  const langArray = langFilterRaw ? langFilterRaw.split(','): [];

  const selected_columns = [
    'projects.id AS project_id',
    'projects.name AS project',
    'projects.description',
    'projects.link',
    'projects.created_at',
    'languages.id AS language_id',
    'languages.name AS languages_used'
  ];

  let query = `SELECT ${selected_columns.join(', ')} ` +
              "FROM projects " + 
              "LEFT JOIN tech_stack ON projects.id = tech_stack.project_id " +
              "LEFT JOIN languages ON languages.id = tech_stack.language_id";

  if (langArray.length > 0) {
    const langSet = await getLanguages('set');

    if (!verifyLangInput(langArray, langSet)) {
      return res.status(400).json({ error: 'Invalid language input detected' });
    }

    const placeholder = langArray.map(lang => '?').join(', ');
    query += ` WHERE projects.id IN (
      SELECT DISTINCT projects.id
      FROM projects
      JOIN tech_stack ON projects.id = tech_stack.project_id
      JOIN languages ON tech_stack.language_id = languages.id
      WHERE languages.name IN (${placeholder})
    )`;
  }

  try {
    const [result] = langArray.length > 0 ? await db.query(query, langArray): await db.query(query);

    let projectMap = {};
    result.forEach(row => {
      const {
        project_id,
        project,
        description,
        link,
        created_at,
        language_id,
        languages_used
      } = row;

      if (!projectMap[project_id]) {
        projectMap[project_id] = {
          id: project_id,
          name: project,
          description,
          "github_url": link,
          created_at,
          languages: []
        };
      }

      if (language_id) {
        projectMap[project_id].languages.push(languages_used);
      }
    })

    res.json(Object.values(projectMap));
  } catch (e) {
    console.error('Error in /projects:', e);
    res.status(500).send({ message: 'Internal server error' });
  }
});


export default general;