import { riropostmulti, riroposttruefolder } from "./riro_functions/postmulti.mjs";
import riropostfolder from "./riro_functions/postfolder.mjs";
import mime from './node_modules/mime-type/index.js';
import rirodelete from "./riro_functions/delete.mjs";
import riroinfo from "./riro_functions/info.mjs";
import rirolist from "./riro_functions/list.mjs";
import riropost from "./riro_functions/post.mjs";
import riroget from "./riro_functions/get.mjs";
import fetch from "node-fetch";
import * as fs from "fs";
import path from "path";

type buildFile = {
    name :string,
    body :any,
    contenttype? :string
};

type buildDir = {
    name :string,
    dir :(buildFile|buildDir)[]
};

export class RiroPostInfo {
    public folder :boolean = false;
    public contenttype? :string;
    public name :string;
    public body :any;
    
    constructor(a :string, b :any, c :string = 'text/plain') {
        this.name = a;
        this.body = b;
        this.folder = false;
    }

    setname(x :string) {
        this.name = x;
        return this;
    }

    build() {
        return {
            name: this.name,
            body: this.body,
            contenttype: this.contenttype
        }
    }

    static async frompath(fpath :string, buildup = '') :Promise<RiroTrueDir> {
        if (fs.lstatSync(buildup + fpath).isDirectory()) {
            const p = path.parse(buildup + fpath);
            const entries = [...fs.readdirSync(buildup + fpath).entries()];
            const d = new RiroPostDirInfo(p.base, await Promise.all(
                entries.map(e=>RiroPostInfo.frompath(e[1], buildup + fpath + '/'))
            ));

            return d;
        }
        else {
            const p = path.parse(buildup + fpath);
            // @ts-ignore
            return new RiroPostInfo(p.base, fs.readFileSync(buildup + fpath), (mime()).lookup(p.ext));
        }
    }

    static build(b :buildDir|buildFile) :RiroTrueDir {
        // @ts-ignore
        if (b.body === undefined) {
            // @ts-ignore
            return new RiroPostDirInfo(b.name, b.dir.map(e=>RiroPostInfo.build(e)));
        }
        else {
            // @ts-ignore
            return new RiroPostInfo(b.name, b.body, b.contenttype);
        }
    }
};

export class RiroPostDirInfo {
    public folder :boolean = true;
    public dir :RiroTrueDir[];
    public name :string;

    constructor(n :string, x :RiroTrueDir[]) {
        this.name = n,
        this.dir = x;
    }
    
    setname(x :string) {
        this.name = x;
        return this;
    }
}

export type RiroTrueDir = (RiroPostInfo | RiroPostDirInfo);

async function login(id :string, pw :string) {
    let awsalb :any = await fetch('https://cloud.riroschool.kr/member/login.php').then(e=>e.headers.get('set-cookie'));
    awsalb = awsalb.substring(awsalb.indexOf('=') + 1).split(';')[0];
    const k = await fetch('https://cloud.riroschool.kr/member/ajax.php?action=login', {
        method: 'post',
        body: 'id=' + encodeURIComponent(id) + '&pw=' + encodeURIComponent(pw),
        headers: {
            'cookie': 'AWSALB=' + awsalb,
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-length': '44',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8,',
            'origin': 'https://cloud.riroschool.kr',
            'referer': 'https://cloud.riroschool.kr/member/login.php',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        }
    });

    if (JSON.parse(await k.text()).status) {
        let cs :any = k.headers.get('set-cookie');
        awsalb = 'AWSALB=' + awsalb;
        cs = cs.substring(cs.indexOf('AWSALBCORS='));
        const awsalbcors = cs.substring(0, cs.indexOf(';'));
        cs = cs.substring(cs.indexOf('cloud_token='));
        const cldtok = cs.substring(0, cs.indexOf(';'));
        return { awsalb, awsalbcors, cloud_token: cldtok };
    }
}

export class RiroFile {
    private c :any;
    public riro :Riro;
    public did :number;
    public dcode :string;
    public dname :string;
    public folder :boolean;
    public size :number;

    constructor(c :any, rr :Riro) {
        this.c = c;
        this.riro = rr;
        this.did = c.DID ?? c.did;
        this.dcode = c.DCODE ?? c.dcode;
        this.dname = c.DNAME ?? c.dname;
        this.folder = (c.FOLDER ?? c.folder) == '1';
        this.size = c.SIZE ?? c.size;
    }
    
    async folderlist() {
        if (this.folder) {
            let origin = this.riro.cdc;
            this.riro.cd(this.did);
            let ret = await this.riro.list();
            this.riro.cd(origin);
            return ret;
        }
    }

    get() {
        return this.riro.get(this.did);
    }

    delete() {
        return this.riro.delete(this.did);
    }

    path() {
        return this.riro.pwd().then((e :RiroFileList)=>e.append(this.c));
    }
};

export class RiroFileList {
    public riro :Riro;
    private fl :Array<any>;

    constructor(l :any, rr :Riro) {
        this.riro = rr;
        this.fl = [];
        for (const file of l) {
            this.fl.push(new RiroFile(file, rr));
        }
    }
    
    find(filename :string) :Array<RiroFile> {
        let ret :Array<RiroFile> = [];
        for (const file of this.fl) {
            if (file.dname == filename) {
                ret.push(new RiroFile(file, this.riro));
            }
        }
        return ret;
    }

    includes(did :number) :boolean {
        for (const file of this.fl) {
            if (file.did == did) {
                return true;
            }
        }
        return false;
    }

    append(x :any) {
        this.fl.push(x);
        return this;
    }

    *[Symbol.iterator]() :Generator<RiroFile> {
        for (const file of this.fl) {
            yield file
        }
    }

    *files() :Generator<RiroFile> {
        for (const file of this.fl) {
            if (!file.folder) {
                yield new RiroFile(file, this.riro);
            }
        }
    }

    *folders() :Generator<RiroFile> {
        for (const file of this.fl) {
            if (file.folder) {
                yield new RiroFile(file, this.riro);
            }
        }
    }
}

export class Riro {
    public logininfo :any;
    public cdc :number;
    
    static async logined(id :string, pw :string) {
        let r = new Riro();
        await r.login(id, pw);
        return r;
    }

    constructor() {
        this.logininfo = {};
        this.cdc = 0
    }
    
    async login(id :string, pw :string) {
        this.logininfo = await login(id, pw);
    }

    delete(did :number) {
        return rirodelete(this.logininfo, did);
    }

    rawlist(x? :number) {
        return rirolist(this.logininfo, x ?? this.cdc);
    }

    pwd() {
        return this.rawlist().then((e :any)=>e.path).then(e=>new RiroFileList(e, this));
    }

    list(cd? :number) :Promise<RiroFileList> {
        return this.rawlist(cd ?? this.cdc).then((e:any)=>e.files).then(e=>new RiroFileList(e, this));
    }
    
    post(file :RiroPostInfo, did = this.cdc) {
        return riropost(this.logininfo, file.name, file.body, file.contenttype ?? 'text/plain', did);
    }
    
    post_folder(dname :string, bodies :RiroPostInfo[], did = this.cdc) {
        return riropostmulti(this.logininfo, dname, bodies, did);
    }

    get(did :number) {
        return riroget(this.logininfo, did);
    }

    cd(did :number) {
        this.cdc = did;
    }

    info(did :number) {
        return riroinfo(this.logininfo, did);
    }

    pathdid(path :string): Promise<number> {
        if (path == '/') { return Promise.resolve(0) };
        return path.split('/').slice(1).reduce(async (c :Promise<number>, f :string)=>(await this.list(await c)).find(f).filter(e=>e.folder)[0].did, Promise.resolve(0));
    }
    
    async mkdir(dname :string, did = this.cdc) {
        await riropostfolder(this.logininfo, did, dname);
        const d = (await this.list(did)).find(dname).filter(e=>e.folder)[0].did;
        return {
            get: () => this.cd(d),
            did: d
        };
    }
    
    browse(cd = this.cdc) {
        return 'https://cloud.riroschool.kr/drive/folders/' + cd;
    }

    posttruefolder(d :RiroTrueDir, cd = this.cdc) {
        return riroposttruefolder(this, d, cd);
    }
};