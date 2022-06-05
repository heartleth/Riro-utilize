import { QuickDB } from './node_modules/quick.db/out/index.js';
import { unlinkSync, readFileSync, writeFileSync } from 'fs';
import Riro from './riro.mjs';

export default class RiroQDB {
    public concrete? :QuickDB;
    private dbname :string;
    private did? :number;
    private riro :Riro;
    
    static async from(opts :any) {
        if (opts.riro) {
            return new RiroQDB(opts.riro, opts.db);
        }

        let riro = new Riro();
        try {
            await riro.login(opts.id, opts.pw);
        }
        catch (_) {
            throw new Error('Failed to login in RiroCloud. ID or password may be given incorrectly.');
        }
        return new RiroQDB(riro, opts.db);
    }

    constructor(riro :Riro, dbname :string = '') {
        this.riro = riro;
        this.dbname = dbname + '.sqlite';
    }
    
    async connect() :Promise<RiroQDB> {
        let list = await this.riro.list();
        let fls = list.find(this.dbname);
        
        if (fls.length) {
            this.did = fls[0].did;
            const body = await fls[0].get();
            writeFileSync('./temp/fetched' + this.dbname, Buffer.from(await body.arrayBuffer()));
            this.concrete = new QuickDB({ filePath: './temp/fetched' + this.dbname });
        }
        else {
            await this.riro.post({
                body: Buffer.from([]),
                filename: this.dbname
            });
            list = await this.riro.list();
            fls = list.find(this.dbname);
            this.did = fls[0].did;

            const body = await fls[0].get();
            writeFileSync('./temp/fetched' + this.dbname, Buffer.from(await body.arrayBuffer()));
            this.concrete = new QuickDB({ filePath: './temp/fetched' + this.dbname });
        }
        return this;
    }
    
    async update() {
        if (this.did) {
            const r = readFileSync('./temp/fetched' + this.dbname);
            this.riro.post({
                filename: this.dbname,
                body: Buffer.from(r.buffer)
            });
            this.riro.delete(this.did);
            const list = await this.riro.list();
            let fls = list.find(this.dbname);
            this.did = fls[0].did;
        }
    }
};