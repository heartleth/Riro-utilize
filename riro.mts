import fetch from "node-fetch";

function makeid(length :number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function passive(c :any) {
    let p :any = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'max-age=0',
        'referer': 'https://cloud.riroschool.kr/drive/folders',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36'
    };
    for (const i in c) {
        p[i] = c[i];
    }
    return p;
}

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

function rirodelete(logininfo :any, did :number) {
    let form = new URLSearchParams();
    form.append('did', '0');
    form.append('del_did', `${did}`);
    return fetch('https://cloud.riroschool.kr/drive/folders', {
        method: 'DELETE',
        body: form,  
        headers: passive({
            cookie: logininfo.awsalb + '; ' + logininfo.cloud_token,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'content-length': form.toString().length,
            'referer': 'https://cloud.riroschool.kr/drive/folders?did=0',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        })
    }).then(e => e.json());
}

function rirolist(logininfo :any, foldernum :number) {
    return fetch('https://cloud.riroschool.kr/drive/folders/' + `${foldernum}` + '?_=1653467468063', {
        method: 'GET', 
        headers: passive({
            cookie: logininfo.awsalb + '; ' + logininfo.cloud_token,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'referer': 'https://cloud.riroschool.kr/drive/folders/' + `${foldernum}` + '?_=1653467468063',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        })
    }).then(e => {
        return e.json();
    });
}

async function riropost(logininfo :any, filename :string, body :any, contenttype :any, foldernum :any) {
    let r = makeid(16);
    let buf = Buffer.from('------WebKitFormBoundary' + r + '\r\nContent-Disposition: form-data; name="did"\r\n\r\n0\r\n------WebKitFormBoundary' + r + '\r\nContent-Disposition: form-data; name="upfile[]"; filename="' + filename + '"\r\nContent-Type: ' + contenttype + '\r\n\r\n');
    buf = Buffer.concat([buf, body, Buffer.from('\r\n------WebKitFormBoundary'+ r +'--')]);
    
    return fetch('https://cloud.riroschool.kr/drive/folders?did=' + foldernum, {
        method: 'post',
        body: buf,
        headers: passive({
            cookie: logininfo.cloud_token + ';' + logininfo.awsalb,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'content-length': buf.length,
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary' + r,
            'referer': 'https://cloud.riroschool.kr/drive/folders?did=' + `${foldernum}`,
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        })
    });
}

function riroget(logininfo :any, did :number) {
    return fetch('https://cloud.riroschool.kr/drive/files/0?did=' + did + '&down_token=', {
        method: 'GET', 
        headers: passive({
            cookie: logininfo.awsalb + '; ' + logininfo.cloud_token,
            'accept-encoding': 'gzip, deflate, br',
            'referer': 'https://cloud.riroschool.kr/drive/report',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36'
        })
    });
}

class RiroFile {
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
        return this.riro.pwd().then(e=>e.append(this.c));
    }
};

class RiroFileList {
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
    }

    *[Symbol.iterator]() {
        for (const file of this.fl) {
            yield file
        }
    }

    *files() {
        for (const file of this.fl) {
            if (!file.folder) {
                yield new RiroFile(file, this.riro);
            }
        }
    }

    *folders() {
        for (const file of this.fl) {
            if (file.folder) {
                yield new RiroFile(file, this.riro);
            }
        }
    }
}

export default class Riro {
    public RiroFileList = RiroFileList;
    public RiroFile = RiroFile;
    public logininfo :any;
    public cdc :number;
    public "0" = false;
    
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
    rawlist() {
        return rirolist(this.logininfo, this.cdc);
    }
    pwd() {
        return this.rawlist().then((e :any)=>e.path).then(e=>new RiroFileList(e, this))
    }
    list() {
        return this.rawlist().then((e:any)=>e.files).then(e=>new RiroFileList(e, this))
    }
    post(filename :string, body :any, contenttype :string = 'text/plain') {
        return riropost(this.logininfo, filename, body, contenttype, this.cdc);
    }
    get(did :number) {
        return riroget(this.logininfo, did);
    }
    cd(did :number) {
        this.cdc = did;
    }
};