import passive from "./passive.mjs";
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

export default function riropost(logininfo :any, filename :string, body :any, contenttype :string, foldernum :number) {
    let r = makeid(16);
    let buf = Buffer.from('------WebKitFormBoundary' + r + '\r\nContent-Disposition: form-data; name="did"\r\n\r\n0\r\n------WebKitFormBoundary' + r + '\r\nContent-Disposition: form-data; name="upfile[]"; filename="' + filename + '"\r\nContent-Type: ' + contenttype + '\r\n\r\n');
    buf = Buffer.concat([buf, Buffer.from(body), Buffer.from('\r\n------WebKitFormBoundary'+ r +'--')]);
    
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
