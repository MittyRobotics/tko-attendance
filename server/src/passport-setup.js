import supabase from "./supabase-setup";

const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let { data: users, error } = await supabase.from("users");
  let user = users.find((user) => user.id === id);
  done(error, user);
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
        console.log(error);
        return cb(error, null);
      }

      var user = users.find((user) => user.google_id === profile.id);
      if (user) {
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
        return cb(newUserError);
      }

      return cb(null, newUser);
    }
  )
);
