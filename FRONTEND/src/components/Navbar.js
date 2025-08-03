import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav>
    <Link to="/">Home</Link> |{" "}
    <Link to="/problems">Problems</Link> |{" "}
    <Link to="/profile">Profile</Link>
  </nav>
);

export default Navbar;