import express from 'express';
import general from './routes/general.js';
import admin from './routes/admin.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/', general);
app.use('/admin', admin);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});