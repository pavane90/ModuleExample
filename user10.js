function User(id, name) {
  this.id = id;
  this.name = name;
}

User.prototype.getUser = function() {
  return { id: this.id, name: this.name };
};

User.prototype.group = { id: "group01", name: "친구" };

User.prototype.printUser = function() {
  console.log("user의 이름은 : " + this.name + ", group : " + this.group.name);
};

module.exports = User;
