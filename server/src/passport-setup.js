import supabase from "./supabase-setup";

const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");

passport.serializeUser((user, done) => {
  console.log(user.id);
  done(null, user.id);
});

passport.deserializeUser(async (serializedUserId, done) => {
  let { data: users, error } = await supabase.from("users");
  let foundUser = users.find((user) => user.id === serializedUserId);
  if (foundUser) {
    console.log("found");
    done(null, foundUser);
  } else {
    console.log("not found");
    done(null, false);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/auth/google/redirect",
      scope: ["profile", "email"],
    },
    async function verify(issuer, profile, cb) {
      let { data: users, error } = await supabase.from("users");

      if (error) {
        console.log(error.messsage);
        return cb(error, null);
      }

      var user = users.find((user) => user.google_id === profile.id);
      if (user) {
        console.log(profile, user);
        return cb(null, user);
      }

      let { data: newUser, error: newUserError } = await supabase
        .from("users")
        .insert({
          google_id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });

      if (newUserError) {
        return cb(newUserError.message);
      }

      console.log(profile, newUser[0]);
      return cb(null, newUser[0]);
    }
  )
);
