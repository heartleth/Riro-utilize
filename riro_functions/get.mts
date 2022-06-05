import passive from "./passive.mjs";
import fetch from "node-fetch";

export default function riroget(logininfo :any, did :number) {
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