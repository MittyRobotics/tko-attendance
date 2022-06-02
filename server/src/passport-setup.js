import { ExtractJwt } from "passport-jwt";
import supabase from "./supabase-setup";

const passport = require("passport");
const GoogleOneTapStrategy =
  require("passport-google-one-tap").GoogleOneTapStrategy;
const JwtStrategy = require("passport-jwt").Strategy;

passport.use(
  new GoogleOneTapStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      verifyCsrfToken: false,
    },
    async (profile, cb) => {
      let { data: users, error } = await supabase.from("users");

      if (error) {
        return cb(error, false);
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
        return cb(newUserError.message, false);
      }

      return cb(null, newUser[0]);
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env["JWT_SECRET"],
    },
    async (jwtPayload, done) => {
      try {
        const id = jwtPayload.id;
        let { data: users, error } = await supabase.from("users");
        var user = users.find((user) => user.google_id === id);

        if (error || !user) {
          return done(error, false);
        }

        done(null, user);
      } catch (e) {
        done(e, false);
      }
    }
  )
);
