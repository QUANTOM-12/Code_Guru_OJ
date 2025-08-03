import React from "react";
import { useParams, Link } from "react-router-dom";

const problemsDB = {
  1: { title: "Two Sum", content: "Given an array of integers, ...", difficulty: "Easy" },
  2: { title: "Longest Substring Without Repeating Characters", content: "Given a string s, ...", difficulty: "Medium" },
  3: { title: "Median of Two Sorted Arrays", content: "Given two sorted arrays, ...", difficulty: "Hard" },
};

const ProblemDetails = () => {
  const { id } = useParams();
  const problem = problemsDB[id];

  if (!problem) return <p>Problem not found.</p>;

  return (
    <div>
      <h2>{problem.title}</h2>
      <p>Difficulty: {problem.difficulty}</p>
      <pre>{problem.content}</pre>
      <Link to={`/submit/${id}`}>Submit Solution</Link>
    </div>
  );
};

export default ProblemDetails;