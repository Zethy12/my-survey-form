require('dotenv').config();
const express =require('express')
const mongoose =require('mongoose')
const path = require('path')

const app=express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname))
const port = 3000;


mongoose.connect(process.env.MONGO_URI, { 
  tls: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.error("Connection error:", err));


 
const surveySchema= new mongoose.Schema({
    fname:String,
    email: String,
    dob:Date,
    contactNum:String,
    favFood:[String],
    likesMovies: { type: Number, required: true },
    likesRadio: { type: Number, required: true },
    likesEatOut: { type: Number, required: true },
    likesTV: { type: Number, required: true }
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
        favFood:favFood,
        likesMovies: req.body.row1,
        likesRadio: req.body.row2,
        likesEatOut: req.body.row3,
        likesTV: req.body.row4
    })
    

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
      const total = surveys.length;
  
      if (total === 0) {
        return res.send("<h1>No Surveys Available</h1><a href='/'>Back to survey</a>");
      }
  
      // Calculate age difference from DOB
      const ages = surveys.map(s => {
        const ageDifMs = Date.now() - new Date(s.dob).getTime();
        return Math.floor(ageDifMs / (1000 * 60 * 60 * 24 * 365.25));
      });
  
      const averageAge = (ages.reduce((a, b) => a + b, 0) / total).toFixed(1);
      const minAge = Math.min(...ages);
      const maxAge = Math.max(...ages);
  
      // Percentages for favorite foods
      const foodCounts = { Pizza: 0, Pasta: 0, "Pap and Wors": 0 };
      surveys.forEach(s => {
        if (s.favFood.includes("Pizza")) foodCounts.Pizza++;
        if (s.favFood.includes("Pasta")) foodCounts.Pasta++;
        if (s.favFood.includes("Pap and Wors")) foodCounts["Pap and Wors"]++;
      });
  
      const pizzaPct = ((foodCounts.Pizza / total) * 100).toFixed(1);
      const pastaPct = ((foodCounts.Pasta / total) * 100).toFixed(1);
      const papWorsPct = ((foodCounts["Pap and Wors"] / total) * 100).toFixed(1);
  
      // Average ratings
      const avg = key => {
        const ratings = surveys
          .map(s => Number(s[key]))
          .filter(n => !isNaN(n));
          
        return ratings.length
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : "N/A";
      };
      
      const avgMovies = avg("likesMovies");
      const avgRadio = avg("likesRadio");
      const avgEatOut = avg("likesEatOut");
      const avgTV = avg("likesTV");
      
      const html = `
        <h1>Survey Results</h1>
        <p>Total number of surveys: <b>${total}</b></p>
        <p>Average Age: <b>${averageAge}</b></p>
        <p>Oldest person who participated: <b>${maxAge}</b></p>
        <p>Youngest person who participated: <b>${minAge}</b></p>
        <br>
        <p>Percentage who like Pizza: <b>${pizzaPct}%</b></p>
        <p>Percentage who like Pasta: <b>${pastaPct}%</b></p>
        <p>Percentage who like Pap and Wors: <b>${papWorsPct}%</b></p>
        <br>
        <p>People who like to watch movies:${avgMovies}</p>
        <p>People who like to listen to radio:${avgRadio}</p>
        <p>People who like to eat out:${avgEatOut}</p>
        <p>People who like to watch TV :${avgTV}</p>
        <br>
        <a href="/">Back to survey</a>
      `;
      res.send(html);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving results.");
    }
  });
  

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
 




