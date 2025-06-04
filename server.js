const express =require('express')
const mongoose =require('mongoose')
const bcrypto =require('bcrypt')
const path = require('path')

const app=express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname))
const port = 3000;


mongoose.connect("mongodb+srv://zanelek366:Zanele23@surveyresultsdb.36vxtll.mongodb.net/?retryWrites=true&w=majority&appName=SurveyResultsDB",{ 
  
  tls: true
 })
 .then(() => console.log("Connected to MongoDB Atlas!"))
 .catch((err) => console.error("Connection error:", err));

 
const surveySchema= new mongoose.Schema({
    fname:String,
    email: String,
    dob:Date,
    contactNum:String,
    favFood:[String],
    likesMovies: String,
    likesRadio: String,
    likesEatOut: String,
    likesTV: String
});

const Survey = mongoose.model('Survey', surveySchema);

 app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); 
});


app.post("/submit-survey", (req, res)=>{
      let favFood = req.body.favFood;
      if (!favFood) {
      favFood = [];
    } else if (!Array.isArray(favFood)) {
      favFood = [favFood];
    }
    const newSurvey = new Survey({
        fname: req.body.fname,
        email: req.body.email,
        dob: new Date(req.body.dob),
        contactNum: req.body.cnum,
        favFood:req.body.favFood,
        likesMovies: req.body.row1,
        likesRadio: req.body.row2,
        likesEatOut: req.body.row3,
        likesTV: req.body.row4
    })
    
    
  

    app.listen(3000, () => console.log("Server running on http://localhost:3000"));


    newSurvey.save()
    .then(()=>{
         res.send(`
        <h1>Submitted successfully!</h1>
        <p><a href="/view-results">Click here to view results</a></p>
        <script>
          setTimeout(() => {
            window.location.href = "/view-results";
          }, 3000);
        </script>
      `);
    })
    .catch((err)=> res.status(500).send(err));
  });

app.get("/view-results", async (req, res) => {
  try {
    const surveys = await Survey.find({});
    if (surveys.length === 0) {
      return res.send(`
        <h1>No Surveys Available</h1>
        <a href="/">Back to survey</a>
      `);
    }

    let resultsHtml = "<h1>Survey Results</h1><ul>";
    surveys.forEach(survey => {
      resultsHtml += `<li>${survey.fname} (${survey.email}) - Favorite Food: ${survey.favFood.join(", ")}</li>`;
    });
    resultsHtml += "</ul><a href='/'>Back to survey</a>";
    res.send(resultsHtml);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/submit-survey', (req, res) => {
  console.log('Form data received:', req.body);
  res.send('Thanks for submitting the survey!');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
 




