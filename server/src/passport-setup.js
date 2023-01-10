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

      var user = users.find((user) => user.name === profile.displayName);

      // if user found with matching name
      if (user) {
        // if user initialized
        if (user.email) {
          // double check its the exact same user, then log them in
          if (user.email === profile.emails[0].value) {
            console.log(user);
            return cb(null, user);
          } else {
            // wrong email used
            return cb(
              null,
              "The user with the name '" +
                profile.displayName +
                "' has already been initialized with a different email."
            );
          }

          // initialize user on their first login
        } else {
          // check that they have the correct domain (Mitty)
          if (
            !(
              profile.emails[0].value.includes("mittymonarch.com") ||
              profile.emails[0].value.includes("mittymonarchs.com")
            )
          ) {
            // Mentors are the exception, can use personal email
            if (user.department !== "Mentor") {
              return cb(
                null,
                "You are not a mentor. Please use your Mitty email."
              );
            }
          }

          let { data: newUser, error: newUserError } = await supabase
            .from("users")
            .update({
              google_id: profile.id,
              email: profile.emails[0].value,
            })
            .match({ name: profile.displayName });

          if (newUserError) {
            return cb(
              null,
              "There was an error initializing this user. Please try again."
            );
          }
          return cb(null, newUser[0]);
        }
      } else {
        // failed to find matching user, error
        return cb(
          null,
          "There is no user in the database matching your name. Please use your Mitty email."
        );
      }
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

        if (!users) {
          return done(error, false);
        }

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
