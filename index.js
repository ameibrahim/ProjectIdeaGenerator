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

app.get("/", async(req, res)=>{
    /*let field = ["AI and IoT", "AI", "IoT"];
    let difficulty = ["easy", "medium", "hard"];
    let length = [2, 4, 6];
    const prompt = `Generate a simple project idea in ${field[2]} for a university student with a level of difficulty that is ${difficulty[0]} and that could take ${length[0]} weeks to complete. Give your response as a JSON with two elements the project's title and description`;
    let response = await main(prompt);
    res.send(response.message.content);*/
    res.render("index.ejs");
})
app.post("/project", async(req, res)=>{
    let field = req.body["field"];
    let difficulty = req.body["difficulty"];
    let length = req.body["duration"];
    const prompt = `Generate a project idea in ${field} field for a university student (Assume that the student is competent in programming, AI, IoT and Web development). The project should have a level of difficulty that is ${difficulty} and that could take ${length} weeks to complete. Give your response as a JSON with two elements the project's title and description`;
    console.log(prompt);
    let response = await main(prompt);
    let project = JSON.parse(response.message.content);
    //res.send(response.message.content);
    //console.log(project);
    res.render("response.ejs", {
      project: project
    })
    //res.redirect("/");
})
 

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
