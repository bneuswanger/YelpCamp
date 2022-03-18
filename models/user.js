const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

UserSchema.plugin(passportLocalMongoose); //adds on a username and password to the UserSchema, makes sure usernames are unique, also gives us additional methods we can use

module.exports = mongoose.model("User", UserSchema);
