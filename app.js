const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const homeContent = "Welcome to our blog page! Here you can share your thoughts and ideas about what you would do if you were reincarnated. Click on the 'Compose' button and start writing about the fascinating possibilities that come to your mind. Imagine getting a chance to relive your youth with all the knowledge and experience you have now. What would you do differently? How would you make the most of your second chance? Would you take risks you were too scared to take before? Or maybe focus on creating more meaningful relationships?  Share your vision with us and engage with like-minded individuals who are also pondering this philosophical question. Our blog is the perfect platform to express your creativity and imagination, and to learn from others who are on the same journey of self-discovery. So, join us and let's explore the boundless opportunities that life has to offer!";
const aboutContent = "Hi, my name is Thenamudhan and I'm glad you've landed on my about me page. I'm a masters student in Physics with a passion for programming. I specialize in JavaScript and have extensive experience with MongoDB, Node and EJS. Along with JavaScript, I also know Python and love experimenting with different programming languages. This website is a project I've built to showcase my skills and passion for programming. I hope you find it useful and informative. Thank you for visiting!";
const contactContent = "Are you looking for a dynamic and versatile individual who can bring fresh ideas and enthusiasm to your team? Then look no further! My name is Thenamudhan and I am a master's student in physics with extensive knowledge in JavaScript, Node, MongoDB, and EJS, as well as Python.This contact me page is a testament to my skills and showcases my ability to create professional and visually appealing web pages that engage users. I am constantly looking for ways to expand my skill set and learn new technologies to better serve my clients.Whether you are interested in hiring me or simply want to provide feedback on my work, I would love to hear from you. So please feel free to reach out through any of the channels provided on this page. I look forward to hearing from you soon!";
const composeContents = "Write your name that will display in the Home page and Content in Post form and also set a PASSWORD so That in Future IF you want to delete the Post you will need it ."

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


app.use(express.static("public"));



mongoURI = "mongodb+srv://thenamudhan111:amudhan11@cluster0.mqxlivp.mongodb.net/cardDB";
mongoose.connect(mongoURI);

const postSchema = {
  name: String , 
  mail:  String,
  phoneNumber: String,
  password: String,
  about : String,
  occupation : String,
  instaID : String
};
const PORT = process.env.PORT || 3000;
const Post = mongoose.model("Post", postSchema);

app.get("/",function(req,res){
  Post.find({})
    .then(posts => {
      res.render("loginorsignin", { 
        Posts: posts ,
        startingContent: homeContent,
      
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});
const ObjectId = mongoose.Types.ObjectId;

const id = new ObjectId();


app.get("/about",function(req,res){
  res.render("about", {aboutcontents: aboutContent});
});

app.get("/contact",function(req,res){
  res.render("contact",{contactcontents: contactContent});
});

app.get("/admin", function(req, res) {
  res.render("admin");
});

app.get("/register",function(req,res){
  res.render("register");
});


app.get("/admin-info", function(req, res) {
      res.render("admin-info");
});


app.get("/update/:postId", function(req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId})
    .then(post => {
      res.render("updated", {post: post});
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});









app.post("/register",function(req,res){
  const post = new Post({
    name: req.body.cardname,
    mail: req.body.cardmail,
    phoneNumber:req.body.cardnumber,
    password: req.body.cardpassword,
    about : req.body.cardabout,
    occupation : req.body.cardoccupation,
    instaID : req.body.cardinstaID

  });

  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});


app.post("/", function(req, res) {
  const name = req.body.userName;
  const password = req.body.userPassword;

  Post.findOne({ name: name, password: password }).exec()
    .then(post => {
      if (!post) {
        res.render("loginorsignin", { error: "Invalid username or password." });
      } else {
        // Fetch the user's phone number and occupation
        const phoneNumber = post.phoneNumber;
        const occupation = post.occupation;

        // Find potential matches based on occupation
        Post.find({ occupation: phoneNumber }).then(potentialMatches => {
          let matchFound = false;
          let matchingUser;

          // Iterate through potential matches to check for reciprocal interest
          for (const potentialMatch of potentialMatches) {
            if (potentialMatch.phoneNumber === occupation) {
              matchFound = true;
              matchingUser = potentialMatch;
              break; // Exit the loop once a match is found
            }
          }

          // Render the post page with appropriate message
          res.render("post", {
            post: post,
            name: post.name,
            number: post.phoneNumber,
            insta: post.instaID,
            occupations: post.occupation,
            _id: post._id,
            matchFound: matchFound,
            matchingUser: matchingUser
            interestedPersonNumber: post.occupation
          });
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Internal server error");
    });
});


// app.post("/", function(req, res) {
//   const name = req.body.userName;
//   const password = req.body.userPassword;

//   Post.findOne({ name: name, password: password }).exec()
//     .then(post => {
//       if (!post) {
//         res.render("loginorsignin", { error: "Invalid username or password." });
//       } else {
//         res.render("post", {
//            post: post,
//            name: post.name,
//            mail: post.mail,
//            number:post.phoneNumber,
//            insta : post.instaID,
//            occupations : post.occupation,
//            abouts : post.about,
//            _id: post._id 
          
//           });
//       }
//     })
//     .catch(err => {
//       console.error(err);
//       res.sendStatus(500);
//     });
// });

app.post("/delete/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  const postPassword = req.body.password;

  Post.findOne({_id: requestedPostId})
    .then(post => {
      if (post.password === postPassword ) {
        Post.deleteOne({_id: requestedPostId})
          .then(() => {
            res.redirect("/");
          })
          .catch(err => {
            console.error(err);
            res.sendStatus(500);
          });
      } else {
        res.status(403).send("Invalid password");
      }
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});


app.post("/admin", function(req, res) {
  const password = req.body.password;
  const adminPassword = "THENamudhan";

  if (password === adminPassword) {
    Post.find({})
      .then(posts => {
        res.render("admin-info", { posts: posts });
      })
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
  } else {
    res.render("admin", { error: "Invalid password" });
  }
});


app.post("/admin/delete/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  const postPassword = req.body.password;

  // Check if the password is correct
  if (postPassword !== "THENamudhan") {
    return res.status(403).send("Invalid admin password");
  }

  // Find and delete the post with the given ID
  Post.deleteOne({_id: requestedPostId})
    .then(() => {
      res.redirect("/admin");
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});




// app.post("/updated/:postId", function(req, res) {
//   const requestedPostId = req.params.postId;
//   const newName = req.body.newName;
//   const newMail = req.body.newMail;
//   const newPhoneNumber = req.body.newPhoneNumber;
//   const newPassword = req.body.newPassword;
//   const newAbout = req.body.newAbout;
//   const newOccupation = req.body.newOccupation;
//   const newInstaID = req.body.newInstaID;

//   Post.findOne({_id: requestedPostId})
//     .then(post => {
//       post.name = newName;
//       post.mail = newMail;
//       post.phoneNumber = newPhoneNumber;
//       post.password = newPassword;
//       post.about = newAbout;
//       post.occupation = newOccupation;
//       post.instaID = newInstaID;

//       post.save()
//         .then(() => {
//           res.redirect("/");
//         })
//         .catch(err => {
//           console.error(err);
//           res.sendStatus(500);
//         });
//     })
//     .catch(err => {
//       console.error(err);
//       res.sendStatus(500);
//     });
// });


app.post("/update/:postId", function(req, res) {
  const requestedPostId = req.params.postId;

  Post.updateOne({_id: requestedPostId}, {
    $set: {
      name: req.body.cardname,
      mail: req.body.cardmail,
      phoneNumber:req.body.cardnumber,
      about : req.body.cardabout,
      occupation : req.body.cardoccupation,
      instaID : req.body.cardinstaID
    }
  })
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});



app.listen(PORT, function() {
  console.log("Server started on port 3000");
});


