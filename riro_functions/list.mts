import passive from "./passive.mjs";
import fetch from "node-fetch";

export default function rirolist(logininfo :any, foldernum :number) {
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