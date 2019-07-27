UserSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true, default: "" },
  hashed_password: { type: String, required: true, default: "" },
  salt: { type: String, required: true },
  name: { type: String, index: "hashed", default: "" },
  age: { type: Number, default: -1 },
  created_at: { type: Date, index: { unique: false }, default: Date.now() },
  updated_at: { type: Date, index: { unique: false }, default: Date.now() }
}); //user 테이블 정의
console.log("UserSchema 정의함");
UserSchema.static("findById", function(id, callback) {
  return this.find({ id: id }, callback);
});
/*
      UserSchema.statics.findById = function(id, callback) {
          return this.find({id:id}, callback);
      }*/

UserSchema.static("findAll", function(callback) {
  return this.find({}, callback);
});
