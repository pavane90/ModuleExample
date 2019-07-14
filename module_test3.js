//모듈 파일에서 설정한 객체를 그대로 참조
var user = require("./user3");

function showUser() {
  return user.getUser().name + ", " + user.group.name;
}

console.log("사용자 정보 -> " + showUser());
