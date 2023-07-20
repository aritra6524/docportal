const exp = require("express");
const app = exp();
const path = require("path");

//connect angular build with nodejs server
app.use(exp.static(path.join(__dirname, "./dist/docportal")));

//get MongoClient
const mClient = require("mongodb").MongoClient;
//connect to DB server
mClient
  .connect("mongodb://127.0.0.1:27017/docportaldb")
  .then((client) => {
    //get DB obj
    const docportaldb = client.db("docportaldb");
    //get collection obj
    const doctorsCollection = docportaldb.collection("doctors");
    const patientsCollection = docportaldb.collection("patients");

    app.set("doctorsCollection", doctorsCollection);
    app.set("patientsCollection", patientsCollection);

    console.log("DB connection success");
  })
  .catch((err) => console.log("err in DB connect", err));

const doctorsApp = require("./apis/doctorsApi");
const patientsApp = require("./apis/patientsApi");

app.use("/doctors-api", doctorsApp);
app.use("/patients-api", patientsApp);

//assign port
app.listen(3000, () => {
  console.log("server listening on port 3000...");
});
