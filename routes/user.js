var login = function(req, res) {
  console.log("/process/login 라우팅 함수 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  console.log("요청 파라미터 : " + paramId + ", " + paramPassword);

  var database = req.app.get("database");
  if (database) {
    authUser(database, paramId, paramPassword, function(err, docs) {
      if (err) {
        console.log("에러가 발생했습니다" + err);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발송</h1>");
        res.end();
        return;
      }
      if (docs) {
        console.dir(docs);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>로그인 성공!</h1>");
        res.write("<div><p>사용자 : " + docs[0].name + "</p></div>");
        res.write('<br><br><a href="/public/login.html">다시 로그인하기</a>');
        res.end();
      } else {
        console.log("대상 데이터가 없음" + err);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>존재하지 않는 사용자입니다.</h1>");
        res.end();
      }
    });
  } else {
    console.log("데이터베이스 연결에러" + err);
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터베이스 연결에러</h1>");
    res.end();
  }
};

var adduser = function(req, res) {
  console.log("/process/adduser 라우팅 호출");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName = req.body.name || req.query.name;

  console.log(
    "요청 파라미터 : " + paramId + ", " + paramPassword + ", " + paramName
  );
  var database = req.app.get("database");
  if (database) {
    addUser(database, paramId, paramPassword, paramName, function(err, result) {
      if (err) {
        console.log("에러가 발생했습니다" + err);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발송</h1>");
        res.end();
        return;
      }
      if (result) {
        console.dir(result);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>등록 완료!</h1>");
        res.write("<div><p>사용자 : " + paramName + "</p></div>");
        res.end();
      } else {
        console.log("에러 발생" + err);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 추가에 실패했습니다.</h1>");
        res.end();
      }
    });
  } else {
    console.log("데이터베이스 연결에러" + err);
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터베이스 연결에러</h1>");
    res.end();
  }
};

var listuser = function(req, res) {
  console.log("/process/listuser 라우팅 함수 호출됨");
  // 사용자 리스트 전체 출력
  var database = req.app.get("database");
  if (database) {
    database.UserModel.findAll(function(err, results) {
      //해당 스키마의 내용 전부 가져오기
      if (err) {
        console.log("에러가 발생했습니다" + err);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발송</h1>");
        res.end();
        return;
      }
      if (results) {
        console.dir(results);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h3>사용자 리스트</h3>");
        res.write("<div><ul>");

        for (var i = 0; i < results.length; i++) {
          var curId = results[i]._doc.id;
          var curName = results[i]._doc.name;
          res.write(
            "    <li>#" + (i + 1) + "->" + curId + ", " + curName + "</li>"
          );
        }
        res.write("</ul></div>");
        res.end();
      } else {
        console.log("에러 발생" + err);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>조회된 사용자 없음</h1>");
        res.end();
      }
    });
  } else {
    console.log("데이터베이스 연결에러" + err);
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터베이스 연결에러</h1>");
    res.end();
  }
};

var authUser = function(db, id, password, callback) {
  console.log("authuser 호출됨" + id + ", " + password);

  db.UserModel.findById(id, function(err, docs) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log("id %s로 검색한 결과", id);
    if (docs.length > 0) {
      var user = new UserModel({ id: id });
      var authenticated = user.authenticate(
        password,
        docs[0]._doc.salt,
        docs[0]._doc.hashed_password
      );

      if (authenticated) {
        console.log("비밀번호 일치함");
        callback(null, docs);
      } else {
        console.log("비밀번호 일치하지 않음");
        callback(null, null);
      }
    } else {
      console.log("일치하는 사용자가 없음");
      callback(null, null);
    }
  });
  /*
  UserModel.find({ id: id, password: password }, function(err, docs) {
    if (err) {
      console.log("authUser에서 에러발생");
      callback(err, null);
      return;
    }
    if (docs.length > 0) {
      console.log("일치하는 사용자를 찾음");
      callback(null, docs);
    } else {
      console.log("일치하는 사용자를 찾지못함");
      callback(null, null);
    }
  });
  */
};

var addUser = function(database, id, password, name, callback) {
  console.log("adduser 호출");

  var user = new database.UserModel({ id: id, password: password, name: name });

  user.save(function(err) {
    if (err) {
      console.log("데이터 입력중 에러발생");
      callback(err, null);
      return;
    }
    console.log("사용자 데이터 추가함" + id);
    callback(null, user);
  });
};

module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;
