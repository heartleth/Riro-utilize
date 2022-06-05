import passive from "./passive.mjs";
import fetch from "node-fetch";

export default function riropostfolder(logininfo :any, did :number, dname :string) {
    return fetch('https://cloud.riroschool.kr/drive/folders', {
        method: 'POST',
        // @ts-ignore
        body: new URLSearchParams({ did, dname, 'type': 'dir' }),
        headers: passive({
            cookie: logininfo.awsalb + '; ' + logininfo.cloud_token,
            'accept-encoding': 'gzip, deflate, br',
            'referer': 'https://cloud.riroschool.kr/drive/folders',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        })
    });
}