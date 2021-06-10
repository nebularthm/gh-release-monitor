import React, { useState, useEffect } from 'react';
import octokit from "../globals/octo"

const RepoCard = ({ repo }) => {
    const [repoDetails, setRepoDetails] = useState(null);

    useEffect(() => {
    loadDetails();
    }, []);
    async function loadDetails(){
      let nameParts = repo.full_name.split("/");
      let response = await octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: nameParts[0],
      repo: nameParts[1]
      })
      setRepoDetails(response.data[0])
    }
    if (!repoDetails) {
      return <div>Loading Repo Details</div>;
    }
  
    return (
      <div>
        {repoDetails && (
          <>
            <h3> {repoDetails.name}</h3>
            <p>This release was created at {repoDetails.created_at}</p>
            <p>The last commit message was</p>
            <p>{repo.commitMessage}</p>
            <p>{repoDetails.assets}</p>
            <br/>
            <span>{repoDetails.body}</span>
            <p>{repoDetails.description}</p>
        
            <br/>
            <span>{repoDetails.descriptionHTML}</span>
          </>
        )}
      </div>
    );
  };
  export default RepoCard;