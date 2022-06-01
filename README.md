# 리로클라우드 DB 탑재

[리로스쿨 바로가기](https://rirosoft.com/)

리로클라우드에 DB를 탑재할 수 있다. 파일서버로도 쓸 수 있다. 리로클라우드를 살 수도 있고, 스승의날 이벤트에 참여해서 꽁짜로 얻을 수도 있다. 사는 경우 5GB 1년에 9,900원, 50기가 1년에 55,000원이다.

스승의날 이벤트로 공짜 5GB 클라우드를 받았는데 아까워서 이렇게 쓰기로 했다.

합법이라고 믿는다.

## docs: riro.mjs, class Riro

파일을 관리할 수 있다.

```ts
import { readFileSync, writeFileSync } from fs;
import Riro from './riro.mjs';

(async () => {
  let riro :Riro = new Riro();
  await riro.login('리로스쿨 통합회원 이메일', '통합회원 비밀번호');
  await riro.post('NameInRirocloud.png', Buffer.from(readFileSync('LocalFile.png').buffer));
  
  let list = await riro.list();
  let image = await list.find('NameInRirocloud.png')[0];
  
  writeFileSync('SaveToLocal.png', Buffer.from(image.get().arrayBuffer()));
  
  image.delete();
})();
```

리로클라우드에는 파일 혹은 폴더마다 did라는 고유번호가 있다. 그래서 파일명이 중복되더라도 다른 did를 가지며 충돌하지 않는다.

### Riro.login(id :string, pw :string)
async 함수이다.

### Riro.delete(did :number)
async 함수이다. 주어진 did를 가지는 파일을 삭제한다. 삭제하고 나오는 리스폰스의 바디를 리턴한다.

### Riro.cd(did :number)
주어진 did를 가지는 폴더로 이동한다.

### Riro.list() :Riro.RiroFileList 
async 함수이다. 현재 디렉토리에 있는 파일들과 폴더들을 RiroFileList 형태로 리턴한다.

### Riro.get(did :number)
async 함수이다. 주어진 did를 가진 파일을 반환한다.

| 뒤에 붙일 수 있는 것들 | 의미 |
|---|---|
| `.text()` | 텍스트를 얻는다. |
| `.arrayBuffer()` | `ArrayBuffer` 객체를 얻는다. `Buffer.from` 함수로 Buffer 객체로 만들 수 있고, 이를 로컬에 저장할 수도 있다. |
| `.json()` | json으로 파싱된 결과물을 준다. |

### Riro.pwd() :Riro.RiroFileList
async 함수이다. 현재 폴더와 상위 폴더들을 상위 폴더부터 RiroFileList 형태로 리턴한다.

### Riro.cdc :number
현재 cd의 값이다. 기본 0.

***

### Riro.RiroFileList.files()
파일들만 모아서 이터레이팅할 수 있다.

### Riro.RiroFileList.folders()
폴더들만 모아서 이터레이팅할 수 있다.

### Riro.RiroFileList.includes(did :number) :boolean
did를 가진 파일 혹은 폴더가 리스트 안에 있는지 알려준다.

### Riro.RiroFileList.find(filename :string) :RiroFile[]
filename을 이름으로 가지는 파일 혹은 폴더들을 배열로 리턴한다. 없으면 당연이 빈 배열이 나온다.

***

### Riro.RiroFile.delete()
async 함수이다. 파일을 삭제한다.

### Riro.RiroFile.get()
async 함수이다. 위의 get과 유사하다.

### Riro.Rirofile 프로퍼티들

`did :number`, `dname :string`, `folder :boolean`, `dcode :string`, `size :number` 가 있다.

## docs: rirosqlite.mjs

리로클라우드에다가 sqlite를 박을 수 있다.

```ts
import RiroSQLite from './rirosqlite.mjs'
import { readFileSync } from 'fs';

(async () => {
    let sq :RiroSQLite = await RiroSQLite.from({
        db: 'mydatabase',
        id: '리로스쿨 통합회원 아이디',
        pw: '리로스쿨 통합회원 비밀번호'
    });
    await sq.connect();

    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('a');
    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('b');
    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('c');
    sq.query('INSERT INTO mytable(val) VALUES(?);')?.run('d');
    
    console.log(sq.query('SELECT * from mytable;')?.all());
    
    sq.close();
})();
```

### static from(opt :any) :RiroSQLite

| opt 하위객체명 | 역할 |
|---|---|
| `db` \* | 익스텐션 제외, db의 이름 |
| `riro` | 로그인된 Riro 객체가 이미 있다면 여기에 넣어준다. |
| `id`, `pw` | id와 pw를 직접 박음으로써 Riro객체를 자동으로 만들고 접속할 수 있다. |

### connect()
async 함수이다. db에 접속한다.

### close()
async 함수이다. db 접속을 해제한다. 이때, `update()`도 같이 실행한다.

### update()
async 함수이다. update 쿼리가 아니라, 데이터베이스를 조작하면 로컬에서만 변경되기 때문에, 이것을 리로클라우드에 갱신한다.

### query(query :string) :better-sqlite3.Statement
better-sqlite3의 `prepare`로 쿼리를 준비한다. run() 할 수 있다.

### .concrete? : better-sqlite3.Database
better-sqlite3의 `Database`이다. query만으로 부족할 때 쓸 수 있다. 직접 접근하기에, 코드가 지저분해지고 쓰기에 좋지 않다.

## docs: riroqdb.mjs

Quick.DB 버젼이다. 위의 sqlite와 같지만, query함수가 없는 등 조금씩 차이가 있다.
