import Database from 'better-sqlite3';

const db = new Database('mock.bblx');

db.exec(`
  CREATE TABLE IF NOT EXISTS Details (Description NVARCHAR(255), Abbreviation NVARCHAR(50), Comments TEXT, Version INT, RightToLeft BOOL, OT BOOL, NT BOOL, Strong BOOL);
  DELETE FROM Details;
  INSERT INTO Details (Description, Abbreviation, Comments, Version, RightToLeft, OT, NT, Strong) VALUES ('Mock Bible', 'MOCK', 'Base de datos de prueba', 3, 0, 1, 1, 0);

  CREATE TABLE IF NOT EXISTS Bible (Book INT, Chapter INT, Verse INT, Scripture TEXT);
  DELETE FROM Bible;
  INSERT INTO Bible (Book, Chapter, Verse, Scripture) VALUES (1, 1, 1, 'En el principio creó Dios los cielos y la tierra.');
  INSERT INTO Bible (Book, Chapter, Verse, Scripture) VALUES (1, 1, 2, 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.');
  INSERT INTO Bible (Book, Chapter, Verse, Scripture) VALUES (1, 1, 3, 'Y dijo Dios: Sea la luz; y fue la luz.');
  INSERT INTO Bible (Book, Chapter, Verse, Scripture) VALUES (1, 1, 4, 'Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.');
  
  INSERT INTO Bible (Book, Chapter, Verse, Scripture) VALUES (45, 1, 1, 'Pablo, siervo de Jesucristo, llamado a ser apóstol, apartado para el evangelio de Dios,');
  INSERT INTO Bible (Book, Chapter, Verse, Scripture) VALUES (45, 1, 2, 'que él había prometido antes por sus profetas en las santas Escrituras,');
  INSERT INTO Bible (Book, Chapter, Verse, Scripture) VALUES (45, 1, 3, 'acerca de su Hijo, nuestro Señor Jesucristo, que era del linaje de David según la carne,');
`);

console.log("Base de datos falsa mock.bblx generada con éxito.");
