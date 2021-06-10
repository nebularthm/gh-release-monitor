
import React, { useState, useEffect } from 'react';
import RepoCard from "./RepoCard";
import {Button, TextField, Card} from "@material-ui/core"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./RepoList.css"
import octokit from "../globals/octo"

const EXAMPLE_REPOS = []
const RepoList = () => {
     const notify = () => toast("New Update For Repo");

    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [addedRepo, setAddedRepo] = useState("");
    useEffect(() => {
    //   (async () => {
    //     //If we did not store any repos yet, simply make a new repo list with just vscode
     
    //   })();
    //want to scan for updates
    updateReleaseData();
    const interval = setInterval(() => updateReleaseData(), 15000)
        return () => {
          clearInterval(interval);
        }
    }, []);
    // filters our repo list to only display repos with updates(since we have last seen them)
    function filterUpdates(){
      setRepos([...repos].filter((repo) => {
        return repo.hasUpdate;
      }));
    }
    //sorts our repos based on amount of open issues, desc
    function sortByIssuesNum(){

      setRepos([...repos].sort(function(a,b){ return b.issueNum - a.issueNum}));
    }
    //this function sorts only our displayed repos by commit number, desc
    function sortByCommitsNum(){
      setRepos([...repos].sort(function(a,b){ return b.commitNum - a.commitNum}));

    }
    //when we add a repo
    function handleSubmit(event){
        event.preventDefault();
        addRepo(addedRepo);
    }
    //clears our localStorage
    function resetRepos(){
        localStorage.clear();
        setRepos(repos => []);
    }
    //restores diplayed repos based on what was last saved to localstorage
    function rollbackRepos(){
      setRepos(JSON.parse(localStorage.getItem("repos")));
    }

    //sekects a repo and then marks it as read
    function selectAndMarkRepo(repo){
        repo.seen = true;
        if (repo.hasUpdate) {
            repo.hasUpdate = false;
        }  
        //reflect choice on localstorage backend
        localStorage.setItem("repos", JSON.stringify(repos));
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
              });
                    //TODO: Change this so user can choose best search
            //get the most recent release info for this best result 
        let mostRecentRelease = await getReleaseDate(response.data.items[0].full_name);
        let issueNumber = await getNumberOfIssues(response.data.items[0].full_name);
        let commitData = await getCommitDateAndNumberMsg(response.data.items[0].full_name)
            //get the most necessary info from the most relevant search
         let repoData = {id: response.data.items[0].id, full_name: response.data.items[0].full_name, last_release_date: mostRecentRelease, seen: false, hasUpdate: false, issueNum: issueNumber, commitNum: commitData.commits, commitDate: commitData.date, commitMessage: commitData.message};
         //save data to localstorage
        //push that data to the front of our list

        let newRepos = [repoData,...repos];
        localStorage.setItem("repos", JSON.stringify(newRepos));
        //  setRepos(repos => [repoData, ...repos])
        setRepos(JSON.parse(localStorage.getItem("repos")));
    }
    // based on the provided query name, attempts to find 
    async function getReleaseDate(repoFullName) {
    //The full name for a repo contains a slash
    let nameParts = repoFullName.split("/");
    let response = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner: nameParts[0],
    repo: nameParts[1]
    })
    return response.data[0] ? response.data[0].published_at : "No latest Releases";
   
    }
    //returns the number of issues associated with a repository
    async function getNumberOfIssues(repoFullName) {
        let nameParts = repoFullName.split("/");
        let response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner: nameParts[0],
        repo: nameParts[1]
        })
        return response.data ? response.data.length : 0;
    }

    //returns the date of the last commit and also the number of commits
    async function getCommitDateAndNumberMsg(repoFullName) {
        let nameParts = repoFullName.split("/");
        let response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner: nameParts[0],
        repo: nameParts[1]
        })
        return {commits: response.data ? response.data.length : 0, message: response.data[0].commit.message, date: response.data[0].commit.committer.date ? response.data[0].commit.committer.date : "No Commit Date"};
    }

    //function for updating the release dates for all repos that have been added
    // TODO: Extend this to also track commits
    async function updateReleaseData(){
        //this is after a reset
        if (localStorage.getItem("repos") === null){
            localStorage.setItem("repos", JSON.stringify(EXAMPLE_REPOS));
        }
        let unupdatedRepos = JSON.parse(localStorage.getItem("repos"))
        //for each repo we have saved, determine if that repo has been seen already AND that there is a new update available
        for (let step = 0; step < unupdatedRepos.length; step++) {
            //ge
            let newReleaseDate = await getReleaseDate(unupdatedRepos[step].full_name);
            //If they are not equal then we know that we have an update
            if (newReleaseDate !== unupdatedRepos[step].last_release_date) {
                unupdatedRepos[step].last_release_date = newReleaseDate;
                //if we have marked this as read, let user know we have an update
                if(unupdatedRepos[step].seen){
                    unupdatedRepos[step].hasUpdate = true;
                    notify();

                }
            }
          }
          //reflect in storage first
          localStorage.setItem("repos", JSON.stringify(unupdatedRepos));
          //now reflect in our general repo state
          setRepos(JSON.parse(localStorage.getItem("repos")));
    }
  
    return (
      <div className="row">
        <div className="column">
            <Button variant="outlined" color="secondary" size="medium" onClick={() => resetRepos()}> Reset(clear) Repos</Button>
            <Button variant="outlined" color="primary" size="medium" onClick={() => updateReleaseData()}> Refresh Release Data</Button>
            <Button variant="outlined" color="secondary" size="medium" onClick={() => filterUpdates()}> Show only updated Repos</Button>
            <Button variant="outlined" color="primary" size="medium" onClick={() => sortByIssuesNum()}> Sort By Issues #</Button>
            <Button variant="outlined" color="secondary" size="medium" onClick={() => sortByCommitsNum()}> Sort BY Commit #</Button>
            <Button variant="outlined" color="primary" size="medium" onClick={() => rollbackRepos()}> Reload LAst Saved Repos</Button>
        <form  onSubmit={handleSubmit} >
        <TextField variant="filled" label="repo name here" helperText="Enter name of repo to be added,best match will be used" value={addedRepo}
                        onInput={ e=>setAddedRepo(e.target.value)}
                    />

        <Button variant="outlined"  color="secondary" type="submit">
                        Add Repo
                    </Button>
        </form>

          <h2>Repo List</h2>
          <ul>
            {repos.map(repo => (
              <li key={repo.id} onClick={() => selectAndMarkRepo(repo)}>
                <Card variant="outlined" style={{backgroundColor: repo.hasUpdate ? "green" : "grey"}}>
                       

                        <p>{repo.full_name}</p>
                  <p> Recent Release Date {repo.last_release_date}</p>
                  <p>{repo.seen ? "read" : "unread"}</p>
                  <p>{repo.issueNum} outstanding issues</p>
                  <p>{repo.commitNum} commits</p>
                  <p> commit date {repo.commitDate}</p>
                
                  <p>{repo.hasUpdate ? "We have an Update": ""}</p>
                    
                 
                </Card>


                  </li>
            ))}
          </ul>
        </div>
        <div className="column" >
          <h2>Details for This Repo</h2>
          {selectedRepo ? <RepoCard key={selectedRepo.id} repo={selectedRepo} /> : <p></p>}
        </div>
        <ToastContainer />
      </div>
    )
  };
  export default RepoList;
