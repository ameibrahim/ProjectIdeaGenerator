import OpenAI from "openai";
import env from "dotenv";
import pg from "pg";
import express from "express";
import bodyParser from "body-parser"

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PW,
    port: process.env.DB_PORT,
  });
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.API_KEY 
})




async function main(prompt) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  //console.log(completion.choices[0]);
  return completion.choices[0];
}
async function storeProject(project, field, difficulty){
  try{
    const result = await db.query("INSERT INTO projects (title, field, difficulty, description) VALUES ($1, $2, $3, $4)", [project.title, field, difficulty, project.description]);
  }catch(err){
    console.log(err);
  }

}
async function isDuplicate(project){
  try{
    const result = await db.query("SELECT title FROM projects WHERE title = $1", [project.title]);
    if(result.rows.length > 0){
      return true;
    } else{
      return false;
    }
  }catch(err){
    console.log(err);
    return false;
  }
}

app.get("/", async(req, res)=>{
    res.render("index.ejs");
})
app.post("/project", async(req, res)=>{
    let field = req.body["field"];
    let difficulty = req.body["difficulty"];
    let length = req.body["duration"];

    const prompt = `Generate a project idea in ${field} field for a university student (Assume that the student is competent in programming, AI, IoT and Web development). The project should have a level of difficulty that is ${difficulty} and that could take ${length} weeks to complete. Give your response as a JSON with two elements the project's title and description`;
    let response = await main(prompt);
    let project = JSON.parse(response.message.content);
    
    let duplicate = await isDuplicate(project);
    while(duplicate){
      response = await main(prompt);
      project = JSON.parse(response.message.content);
      duplicate = await isDuplicate(project);
    }
    await storeProject(project, field, difficulty);
    res.render("response.ejs", {
      project: project
    })
})
 

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
