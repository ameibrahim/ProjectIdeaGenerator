import OpenAI from "openai";
import env from "dotenv";
import pg from "pg";
import express from "express";
import bodyParser from "body-parser";
import pdf from "html-pdf"

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
app.use(bodyParser.json({limit: '50mb'}));
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
    const result = await db.query("INSERT INTO projects (title, field, difficulty, description, task) VALUES ($1, $2, $3, $4, $5)", [project.title, field, difficulty, project.description, JSON.stringify(project.tasks)]);
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
    res.render("home.ejs");
})
app.get("/generate", async(req, res)=>{
  res.render("index.ejs");
})
app.post("/project", async(req, res)=>{
    let field = req.body["field"];
    let difficulty = req.body["difficulty"];
    let length = req.body["duration"];

    const prompt = `Generate a project idea in ${field} field for a university student (Assume that the student has a medium level in programming, AI, IoT and Web development). The project should have a level of difficulty that is ${difficulty} and that could take ${length} weeks to complete. Give your response as a JSON with three elements the project's title, the project's description and an array of tasks to complete the project (the array should not have more than 10 elements)`;
    //console.log(prompt);
    let response = await main(prompt);
    let project = JSON.parse(response.message.content);
    
    let duplicate = await isDuplicate(project);
    while(duplicate){
      response = await main(prompt);
      project = JSON.parse(response.message.content);
      duplicate = await isDuplicate(project);
    }
    //console.log(project.tasks);
    await storeProject(project, field, difficulty);
    res.render("response.ejs", {
      project: project,
      field: field,
      difficulty: difficulty,
      length: length
    })
})
app.get("/list", async (req, res)=>{
  const result = await db.query("SELECT * FROM projects");
  //console.log(result.rows);
  res.render("projectList.ejs", {
    projects: result.rows
  });
})
app.post("/details", async (req, res)=>{
  let title = req.body["project-title"];
  //console.log(title);
  try{
    const result = await db.query("SELECT * FROM projects WHERE title = $1", [title]);
    //console.log(result.rows[0].task);
    const tasks = JSON.parse(result.rows[0].task)
    //console.log(tasks[0]);
    if(result.rows.length < 1){
      console.log("Error Project not found");
      res.redirect("/");
    } else{
      res.render("description.ejs", {
        project: result.rows[0],
        tasks: tasks
      })
    }
  }catch(err){
    console.log(err);
    res.redirect("/");
  }
});
app.post("/generate-pdf", (req, res) => {
  const htmlContent = req.body.html;
  const options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm'
  };

  pdf.create(htmlContent, options).toStream((err, stream) => {
    if (err) return res.status(500).send(err);

    res.setHeader('Content-type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=webpage.pdf');

    stream.pipe(res);
  });
});
 

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});
