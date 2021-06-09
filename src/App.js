import { Octokit } from "@octokit/core";
import React from 'react';
import './App.css';
import RepoList from "./components/RepoList"
// const octokit = new Octokit();

// octokit.request('GET /repos/{owner}/{repo}/releases', {
//   owner: 'microsoft',
//   repo: 'vscode'
// }).then(
//   (response) => {
//     console.log(response);
//     console.log(Object.keys(response))
//   }
// );
//  octokit.request('GET /search/repositories', {
//   q: 'React'
// }).then((response) => {
//   console.log("search query")
// console.log(Object.keys(response))
// console.log(response.data)
// console.log(response.data.items[0].full_name)//This prop lets us get the first name of the best
// });

function App() {

  return (
    <div className="App">
      <RepoList></RepoList>
    </div>
  );
}

export default App;
