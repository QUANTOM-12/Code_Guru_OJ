import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Submission = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Submitted code for problem ${id}:\n${code}`);
    setCode("");
  };

  return (
    <div>
      <h2>Submit Solution for Problem {id}</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={15}
          cols={60}
          placeholder="Write your code here..."
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Submission;