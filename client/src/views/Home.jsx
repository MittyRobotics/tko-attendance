import React from "react";

function Home({ user, authenticated }) {
  console.log(user);

  return (
    <div>
      <h1>Home</h1>
      <a href={process.env.REACT_APP_SERVER_URL + "/auth/logout"}>Sign out</a>
    </div>
  );
}

export default Home;
