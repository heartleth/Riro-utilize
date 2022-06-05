import passive from "./passive.mjs";
import fetch from "node-fetch";

export default function rirodelete(logininfo :any, did :number) {
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