import React from "react";
import { Link } from "react-router-dom";

const mockProblems = [
  { id: "1", title: "Two Sum", difficulty: "Easy" },
  { id: "2", title: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
  { id: "3", title: "Median of Two Sorted Arrays", difficulty: "Hard" },
];

const ProblemsList = () => (
  <div>
    <h2>Problems</h2>
    <ul>
      {mockProblems.map((problem) => (
        <li key={problem.id}>
          <Link to={`/problems/${problem.id}`}>{problem.title}</Link> ({problem.difficulty})
        </li>
      ))}
    </ul>
  </div>
);

export default ProblemsList;
