/**
 * Submissions example:
 [
 {
    "user": "flashsonic2015",
    "time": "14491",
    "score": "35.29",
    "link": "https://www.hackerrank.com/contests/birdso2023-cybersec-c-sat-feb/challenges/wild-bills-final-showdown/submissions/code/1356716782",
    "date": 1676989800000,
    "problem": "wild-bills-final-showdown"
  }, ... ]
 */
const submissions = require("./submissions.json");
const fs = require("fs");


// loop through and keep the highest score per problem for each user, but go backwards from the end of the array

// keep track of when the user solved their first problem, and ignore any submissions after 50 minutes after that.

const users = {};

for(let i = submissions.length - 1; i >= 0; i--) {
  const submission = submissions[i];
  const { user, time, score, link, date, problem } = submission;

  if(!users[user]) {
    users[user] = {
      firstSolve: null,
      problems: {},
    };
  }

  if(users[user].firstSolve === null) {
    users[user].firstSolve = date;
  }

  if(date > users[user].firstSolve + 50 * 60 * 1000) {
    continue;
  }

  if(!users[user].problems[problem]) {
    users[user].problems[problem] = {
      score: 0,
      link: "",
    };
  }

  if(users[user].problems[problem].score < score) {
    users[user].problems[problem].score = score;
    users[user].problems[problem].link = link;
  }
}

// loop through users and calculate their total score
for(const user in users) {
  users[user].totalScore = 0;
  for(const problem in users[user].problems) {
    users[user].totalScore += parseFloat(users[user].problems[problem].score);
  }
}

// export to csv
let csv = "user,firstSolve,totalScore,problem,score,link\n";

for(const user in users) {
  for(const problem in users[user].problems) {
    csv += `${user},${users[user].firstSolve},${users[user].totalScore},${problem},${users[user].problems[problem].score},${users[user].problems[problem].link}`;
    csv += "\n";
  }
}

fs.writeFileSync("users.csv", csv);

console.log(users);