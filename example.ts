import { Riro, RiroPostInfo } from "./riro.mjs";
import { readFileSync } from 'fs';

(async ()=>{
    let riro = await Riro.logined(readFileSync('id.txt').toString(), readFileSync('pw.txt').toString());
    
    await riro.posttruefolder(await RiroPostInfo.frompath('./exampledir'))
})();