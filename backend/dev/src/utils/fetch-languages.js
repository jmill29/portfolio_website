import db from '../config/db.js';

const getLanguages = async (format) => {
  const query = "SELECT id, name FROM languages";

  try {
    const [results] = await db.query(query);
    let languages = format === 'set' ? new Set(): 
    (
      format === 'multi' ?
      {
        'langSet': new Set(),
        'langMap': {}
      }: {
        'langSet': new Set(),
        'langMap': {},
        'reverseLangMap': {}
      }
    );

    for (let i = 0; i < results.length; i++) {
      const id = results[i]['id'];
      const name = results[i]['name'];

      if (format === 'set') {
        languages.add(name);
      } else {
        languages['langSet'].add(name);
        languages['langMap'][name] = Number(id);
        if (format === 'all') {
          languages['reverseLangMap'][Number(id)] = name;
        }
      }
    }
    
    return languages;
  } catch (e) {
    console.error(e);
  }
};

const verifyLangInput = (langArray, langSet) => {
  const invalidInput = langArray.filter(e => {
    return !langSet.has(e);
  });

  if (invalidInput.length !== 0) {
    return false;
  } else {
    return true;
  }
};

export { getLanguages, verifyLangInput };
/* getLanguages('all').then(langs => {
  const { langSet, langMap } = langs;
  console.log(langSet);
  console.log(langs);
}); */