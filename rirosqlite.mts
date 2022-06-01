import Database from 'better-sqlite3';
import { unlinkSync, readFileSync, writeFileSync } from 'fs';
import Riro from './riro.mjs';

export default class RiroSQLite {
    public concrete? :Database.Database;
    private dbname :string;
    private fpath :string;
    private did? :number;
    private riro :Riro;
    
    static async from(opts :any) {
        if (opts.riro) {
            return new RiroSQLite(opts.riro, opts.db);
        }

        let riro = new Riro();
        try {
            await riro.login(opts.id, opts.pw);
        }
        catch (_) {
            throw new Error('Failed to login in RiroCloud. ID or password may be given incorrectly.');
        }
        return new RiroSQLite(riro, opts.db);
    }
    
    constructor(riro :Riro, dbname :string = '') {
        this.riro = riro;
        this.dbname = dbname + '.db';
        this.fpath = './temp/fetched' + this.dbname;
    }
    
    async connect() :Promise<RiroSQLite> {
        let list = await this.riro.list();
        let fls = list.find(this.dbname);
        
        if (fls.length) {
            this.did = fls[0].did;
            const body = await fls[0].get();
            writeFileSync(this.fpath, Buffer.from(await body.arrayBuffer()));
            this.concrete = new Database(this.fpath);
        }
        else {
            await this.riro.post(this.dbname, Buffer.from([]));
            list = await this.riro.list();
            fls = list.find(this.dbname);
            this.did = fls[0].did;

            const body = await fls[0].get();
            writeFileSync('./temp/fetched' + this.dbname, Buffer.from(await body.arrayBuffer()));
            this.concrete = new Database(this.fpath);
        }
        return this;
    }
    
    async update() {
        if (this.did) {
            const r = readFileSync(this.fpath);
            this.riro.post(this.dbname, Buffer.from(r.buffer));
            this.riro.delete(this.did);
            const list = await this.riro.list();
            let fls = list.find(this.dbname);
            this.did = fls[0].did;
        }
    }

    async close() {
        await this.update();
        this.concrete?.close();
        unlinkSync(this.fpath);
    }

    query(q :string) {
        return this.concrete?.prepare(q);
    }
};