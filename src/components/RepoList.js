
import React, { useState, useEffect } from 'react';
import { Octokit } from "@octokit/core";
import RepoCard from "./RepoCard";
import {Button, TextField} from "@material-ui/core"
import "./RepoList.css"
//TODO: Figure out data format and then
const octokit = new Octokit();

const EXAMPLE_REPOS = []
const RepoList = () => {
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [addedRepo, setAddedRepo] = useState("");
    useEffect(() => {
    //   (async () => {
    //     //If we did not store any repos yet, simply make a new repo list with just vscode
     
    //   })();
    //want to scan for updates
    updateReleaseData();
    const interval = setInterval(() => updateReleaseData(), 60 * 1000)
        return () => {
          clearInterval(interval);
        }
    }, []);
    //when we add a repo
    function handleSubmit(event){
        event.preventDefault();
        addRepo(addedRepo);
    }
    //clears our localStorage
    function resetRepos(){
        localStorage.clear()
        setRepos(repos => [])
    }
    //sekects a repo and then marks it as read
    function selectAndMarkRepo(repo){
 
        repo.seen = true   
        //reflect choice on localstorage backend
        localStorage.setItem("repos", JSON.stringify(repos))
        setSelectedRepo(repo);
    

        
    }
    //based on provided query name, searches for the best possible repo, and then adds it to our list of repos
    async function addRepo(queryName){
        //use octokit to do the search
        //  octokit.request('GET /search/repositories', {
        //     q: queryName
        //   }).then((response) => {


        //   });

        let response = await octokit.request('GET /search/repositories', {
                q: queryName
              })
                    //TODO: Change this so user can choose best search
            //get the most recent release info for this best result 
        let mostRecentRelease = await getReleaseData(response.data.items[0].full_name)
            //get the most necessary info from the most relevant search
         let repoData = {id: response.data.items[0].id, full_name: response.data.items[0].full_name, last_release_date: mostRecentRelease, seen: false, hasUpdate: false};
         //save data to localstorage
        //push that data to the front of our list

        let newRepos = [repoData,...repos]
        localStorage.setItem("repos", JSON.stringify(newRepos))
        //  setRepos(repos => [repoData, ...repos])
        setRepos(JSON.parse(localStorage.getItem("repos")))
    }
    // based on the provided query name, attempts to find 
    async function getReleaseData(repoFullName) {
    //The full name for a repo contains a slash
    let nameParts = repoFullName.split("/")
    let response = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner: nameParts[0],
    repo: nameParts[1]
    })
    console.log(response.data)
    return response.data[0] ? response.data[0].published_at : "No latest Releases";
   
    }

    async function updateReleaseData(){
        //this is after a reset
        if (localStorage.getItem("repos") === null){
            localStorage.setItem("repos", JSON.stringify(EXAMPLE_REPOS))
        }
        let unupdatedRepos = JSON.parse(localStorage.getItem("repos"))
        //for each repo we have saved, determine if that repo has been seen already AND that there is a new update available
        for (let step = 0; step < unupdatedRepos.length; step++) {
            //ge
            let newReleaseDate = await getReleaseData(unupdatedRepos[step].full_name)
            //If they are not equal then we know that we have an update
            if (newReleaseDate !== unupdatedRepos[step].last_release_date) {
                unupdatedRepos[step].last_release_date = newReleaseDate;
                //if we have marked this as read, let user know we have an update
                if(unupdatedRepos[step].seen){
                    unupdatedRepos[step].hasUpdate = true
                }
            }
          }
          //reflect in storage first
          localStorage.setItem("repos", JSON.stringify(unupdatedRepos))
          //now reflect in our general repo state
          setRepos(JSON.parse(localStorage.getItem("repos")))
    }
  
    return (
      <div>
        <div>
            <Button onClick={() => resetRepos()}> Reset(clear) Repos</Button>
        <form  onSubmit={handleSubmit} >
        <TextField value={addedRepo}
                        onInput={ e=>setAddedRepo(e.target.value)}
                    />

        <Button type="submit">
                        Add Repo
                    </Button>
        </form>

          <h2>Repo List</h2>
          <ul>
            {repos.map(repo => (
              <li key={repo.id} onClick={() => selectAndMarkRepo(repo)}>
                  <p>{repo.full_name}</p>
                  <p>{repo.last_release_date}</p>
                  <p>{repo.seen ? "read" : "unread"}</p>
                  <p>{repo.hasUpdate ? "We have an Update": "We don't have an update"}</p>
                  </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Details for This Repo</h2>
          {selectedRepo ? <RepoCard key={selectedRepo.id} repo={selectedRepo} /> : <p></p>}
        </div>
      </div>
    )
  };
  export default RepoList;
