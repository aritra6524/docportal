//create mini-express app(Separate route)
const exp = require("express");
const doctorsApp = exp.Router();
const verifyToken = require("./middlewares/verifyToken");
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

//body parser
doctorsApp.use(exp.json());

//CREATE USER API

//get all doctors
doctorsApp.get(
  "/doctors",
  expressAsyncHandler(async (req, res) => {
    //get doctorsCollection
    const doctorsCollection = req.app.get("doctorsCollection");
    //get doctor
    let doctors = await doctorsCollection.find({ status: true }).toArray();
    //send res
    res.send({ message: "all doctors", payload: doctors });
  })
);

//get all doctors with status false
doctorsApp.get(
  "/doctors-deleted",
  expressAsyncHandler(async (req, res) => {
    //get doctorsCollection
    const doctorsCollection = req.app.get("doctorsCollection");
    //get doctor
    let doctors = await doctorsCollection.find({ status: false }).toArray();
    //send res
    res.send({ message: "all doctors", payload: doctors });
  })
);

// //get a doctor by email
// userApp.get("/doctors/:docemail", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get email from url
//   let emailOfUrl = req.params.docemail;
//   //find user
//   let doctor = await doctorsCollection.findOne({
//     docemail: emailOfUrl,
//     status: true,
//   });
//   //send res
//   res.send({ message: "One user", payload: doctor });
// });

//create register doctor
doctorsApp.post(
  "/doctors",
  expressAsyncHandler(async (req, res) => {
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
      res.send({ message: "Doctor already exists." });
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
  })
);

//doctor login
doctorsApp.post("/doctor-login", async (req, res) => {
  //get doctorsCollection
  const doctorsCollection = req.app.get("doctorsCollection");
  //get user cred
  let doctorCred = req.body;
  //verify email
  let doctor = await doctorsCollection.findOne({
    docemail: doctorCred.docemail,
  });
  //if doctor not found
  if (doctor == null) {
    res.send({ message: "Doctor Not Found!" });
  }
  //if doctor found
  else {
    //compare passwords
    let result = await bcryptjs.compare(
      doctorCred.docpassword,
      doctor.docpassword
    );
    //if passwords not matched
    if (result == false) {
      res.send({ message: "Invalid password" });
    }
    //if passwords matched
    else {
      //create token
      let signedToken = jwt.sign({ email: doctor.docemail }, "abcdef", {
        expiresIn: 100,
      });
      //send token in res
      res.send({
        message: "Login success",
        token: signedToken,
        currentDoctor: doctor,
      });
    }
  }
});

//update doctor by email
doctorsApp.put(
  "/doctors",
  expressAsyncHandler(async (req, res) => {
    //get doctorsCollection
    const doctorsCollection = req.app.get("doctorsCollection");
    //get modified doctor from client
    const modifiedDoctor = req.body;
    //modify
    await doctorsCollection.updateOne(
      { docemail: modifiedDoctor.username },
      { $set: { ...modifiedDoctor } }
    );
    //send res
    res.send({ message: "User modified" });
  })
);

// //soft delete doctor by email
// doctorsApp.delete("/doctors-delete/:email", async (req, res) => {
//   //get doctorsCollection
//   const doctorsCollection = req.app.get("doctorsCollection");
//   //get email from url
//   let emailOfUrl = req.params.email;
//   //update user status to false
//   let doctor = await doctorsCollection.findOne({
//     docemail: emailOfUrl,
//     status: true,
//   });
//   if (doctor == null) {
//     res.send({ message: "Doctor does not exist in DB" });
//   } else {
//     await doctorsCollection.updateOne(
//       { docemail: emailOfUrl },
//       { $set: { status: false } }
//     );
//     res.send({ message: "Doctor is deleted" });
//   }
// });

//parmanently delete doctor by email
doctorsApp.delete("/doctors-delete/:email", async (req, res) => {
  //get doctorsCollection
  const doctorsCollection = req.app.get("doctorsCollection");
  //get email from url
  let emailOfUrl = req.params.email;
  //update user status to false
  let doctor = await doctorsCollection.findOne({
    docemail: emailOfUrl,
    status: true,
  });
  if (doctor == null) {
    res.send({ message: "Doctor does not exist in DB" });
  } else {
    await doctorsCollection.deleteOne({ docemail: emailOfUrl });
    res.send({ message: "Doctor is deleted" });
  }
});

//restore doctor by email
doctorsApp.get("/doctors-restore/:docemail", async (req, res) => {
  //get doctorsCollection
  const doctorsCollection = req.app.get("doctorsCollection");
  //get email from url
  let emailOfUrl = req.params.email;
  //update user status to true
  let doctor = await doctorsCollection.findOne({
    docemail: emailOfUrl,
    status: false,
  });
  if (doctor == null) {
    res.send({ message: "Deleted doctor does not exist in DB" });
  } else {
    await doctorsCollection.updateOne(
      { docemail: emailOfUrl },
      { $set: { status: true } }
    );
    res.send({ message: "Doctor is restored." });
  }
});

//private route
doctorsApp.get("/test-private", verifyToken, (req, res) => {
  res.send({ message: "This is private info" });
});

//export doctorsApp
module.exports = doctorsApp;
