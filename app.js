// password encrypt

var express = require("express"); // セットアップ必要(npm install express)
var http = require("http"); // httpオブジェクト生成
var static = require("serve-static");
var path = require("path");

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");

//에러 핸들러
var expressErrorHandler = require("express-error-handler");

var user = require("./routes/user");

//암호화 모듈
var crypto = require("crypto");
//mongoose 사용
var mongoose = require("mongoose");
var database;
var UserSchema;
var UserModel;

function connectDB() {
  var databaseUrl = "mongodb://localhost:27017/local";

  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  database.on("open", function() {
    console.log("데이터베이스에 연결됨 : " + databaseUrl);

    createUserShcema(database);
  });

  database.on("disconnected", function() {
    console.log("데이터베이스 연결 끊어짐");
  });

  database.on("error", console.error.bind(console, "mongoose 연결에러"));
}

function createUserShcema(database) {
  database.UserSchema = require("./database/user_schema").createSchema(
    mongoose
  );

  database.UserModel = mongoose.model("users3", database.UserSchema); //UserSchema와 user를 연결
  console.log("usermodel 정의함");
}

var app = express(); // express server object

app.set("port", process.env.PORT || 3000); // configure server port
app.use("/public", static(path.join(__dirname, "public"))); //폴더의 패스를 static으로 불러올 수 있다.

// post데이터 사용
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 쿠키 컨트롤
app.use(cookieParser());
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true
  })
); // express-Session

var router = express.Router();

router.route("/process/login").post(user.login);

router.route("/process/adduser").post(user.adduser);

router.route("/process/listuser").post(user.listuser);

app.use("/", router);

var authUser = function(db, id, password, callback) {
  console.log("authuser 호출됨" + id + ", " + password);

  UserModel.findById(id, function(err, docs) {
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

  var user = new UserModel({ id: id, password: password, name: name });

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

var errorHandler = expressErrorHandler({
  ststic: {
    "404": "./public/404.html"
  }
});
//app.use('/public', static(path.join(__dirname, 'public'))); 처럼 public폴더도 경로에 포함시킬 수 있다.

var server = http.createServer(app).listen(app.get("port"), function() {
  console.log("express web server started : " + app.get("port"));
  connectDB();
}); //익스프레스를 이용해서 웹서버를 작성
