//create mini-express app(Separate route)
const exp = require("express");
const doctorsApp = exp.Router();
// const verifyToken = require("./middlewares/verifyToken");
const bcryptjs = require("bcryptjs");

//body parser
doctorsApp.use(exp.json());

//CREATE USER API

// //get all users
// doctorsApp.get("/doctors", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get users
//   let user = await doctorsCollection.find({ status: true }).toArray();
//   //send res
//   res.send({ message: "all doctors", payload: doctors });
// });

// //get a doctor by email
// userApp.get("/doctors/:email", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get email from url
//   let emailOfUrl = req.params.email;
//   //find user
//   let doctor = await doctorsCollection.findOne({
//     email: emailOfUrl,
//     status: true,
//   });
//   //send res
//   res.send({ message: "One user", payload: doctor });
// });

//create register doctor
doctorsApp.post("/doctors", async (req, res) => {
  //get doctorsCollection
  const doctorsCollection = req.app.get("doctorsCollection");
  //get newDoctor from client
  const newDoctor = req.body;
  //check for the email which already taken by someone
  let doctor = await doctorsCollection.findOne({
    docemail: newDoctor.docemail,
  });
  //if doctor existed with that username
  if (doctor != null) {
    res.send({ message: "Username has already taken. Choose another one" });
  } else {
    //add status
    newDoctor.status = true;
    //hash password
    let hashedPassword = await bcryptjs.hash(newDoctor.docpassword, 5);
    //replace plain password with hashed password
    newDoctor.docpassword = hashedPassword;
    //save new user
    await doctorsCollection.insertOne(newDoctor);
    res.status(201).send({ message: "created" });
  }
});

// //doctor login
// doctorsApp.post("/doctor-login", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get user cred
//   let doctorCred = req.body;
//   //verify username
//   let doctor = await doctorsCollection.findOne({ email: doctorCred.email });
//   //if doctor not found
//   if (doctor == null) {
//     res.send({ message: "Invalid username" });
//   }
//   //if doctor found
//   else {
//     //compare passwords
//     let result = await bcryptjs.compare(doctorCred.password, doctor.password);
//     //if passwords not matched
//     if (result == false) {
//       res.send({ message: "Invalid password" });
//     }
//     //if passwords matched
//     else {
//       //create token
//       let signedToken = jwt.sign({ email: doctor.email }, "abcdef", {
//         expiresIn: 100,
//       });
//       //send token in res
//       res.send({
//         message: "Login success",
//         token: signedToken,
//         currentUser: user,
//       });
//     }
//   }
// });

// //update doctor by email
// doctorsApp.put("/doctors", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get modified doctor from client
//   const modifiedDoctor = req.body;
//   //modify
//   await doctorsCollection.updateOne(
//     { email: modifiedDoctor.username },
//     { $set: { ...modifiedDoctor } }
//   );
//   //send res
//   res.send({ message: "User modified" });
// });

// //delete doctor by email
// doctorsApp.delete("/doctors/:email", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get email from url
//   let emailOfUrl = req.params.email;
//   //update user status to false
//   await doctorsCollection.updateOne(
//     { email: emailOfUrl },
//     { $set: { status: false } }
//   );
//   //send res
//   res.send({ message: "Doctor deleted" });
// });

// //restore doctor by email
// doctorsApp.get("/doctor-restore/:email", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get email from url
//   let emailOfUrl = req.params.email;
//   //update user status to false
//   await doctorsCollection.updateOne(
//     { email: emailOfUrl },
//     { $set: { status: true } }
//   );
//   //send res
//   res.send({ message: "Doctor restored" });
// });

// //private route
// userApp.get("/test-private", verifyToken, (req, res) => {
//   res.send({ message: "This is private info" });
// });
//export userApp
module.exports = doctorsApp;
