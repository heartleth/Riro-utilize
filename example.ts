import RiroSQLite from './rirosqlite.mjs'
import { readFileSync } from 'fs';

(async () => {
    let sq :RiroSQLite = await RiroSQLite.from({
        db: 'mydatabase',
        id: readFileSync('id.txt').toString(), 
        pw: readFileSync('pw.txt').toString()
    });
    await sq.connect();

    sq.query
    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('임진왜란');
    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('정유재란');
    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('병자호란');
    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('정묘호란');
    
    console.log(sq.query('SELECT * from mytable;')?.all());
    
    sq.close();
})();