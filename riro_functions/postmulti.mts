import passive from "./passive.mjs";
import fetch from "node-fetch";
import { writeFileSync } from "fs";

function makeid(length :number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export class RiroPostInfo {
    public contenttype? :string;
    public filename :string;
    public body :any;
    constructor(a :string, b :any) {
        this.filename=a;
        this.body=b;
    }
};

export function riropostmulti(logininfo :any, foldername :string, bodies :RiroPostInfo[], foldernum :number) {
    let r = makeid(16);
    let buf = Buffer.from('------WebKitFormBoundary' + r + '\r\nContent-Disposition: form-data; name="did"\r\n\r\n0');
    let bodybufs :Buffer[] = bodies.map(b => {
        const header = Buffer.from('\r\n------WebKitFormBoundary' + r
            + '\r\nContent-Disposition: form-data; name="upfile[]"; filename="'
            + foldername + '/' + b.filename +
            '"\r\nContent-Type: ' + (b.contenttype ?? 'text/plain') + '\r\n\r\n');
        // console.log(b.body.toString());
        return Buffer.concat([header, Buffer.from(b.body)])
    });
        
    buf = Buffer.concat([buf, ...bodybufs, Buffer.from('\r\n------WebKitFormBoundary' + r + '\r\nContent-Disposition: form-data; name="dir_name"\r\n\r\n' + foldername + '\r\n------WebKitFormBoundary'+ r +'--')]);
    writeFileSync('asdf', buf);
    
    return fetch('https://cloud.riroschool.kr/drive/folders?did=' + foldernum + '&dname=' + encodeURIComponent(foldername), {
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
