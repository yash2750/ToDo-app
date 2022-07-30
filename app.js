//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash")
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb+srv://yashpal:27052002@cluster0.xuybdcf.mongodb.net/tododb");
const itemschema = new mongoose.Schema({
  name: String
});
const items = new mongoose.model("item", itemschema);
const item1 = new items({
  name: "WelCome to yout todolist!"
});
const item2 = new items({
  name: "Hit the + button to add a new item"
});
const item3 = new items({
  name: "<-- Hit this to delete an item"
});
const defalt = [item1, item2, item3];
const listschema = {
  name: String,
  items: [itemschema]
};
const list = mongoose.model("list", listschema)

app.get("/", function(req, res) {

  items.find({}, (err, fi) => {
    if (fi.length === 0) {
      items.insertMany(defalt, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("successful")
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: fi
      });
    }
  })
});
app.get("/:topic", (req, res) => {
      const lname = _.capitalize(req.params.topic);
      list.findOne({
        name: lname
      }, (err, fi2) => {
        if (!err) {
          if (!fi2) {
            const llist = new list({
              name: lname,
              items: defalt
            })
            llist.save();
            res.redirect("/"+lname);
          } else {
            res.render("list", {
              listTitle: fi2.name,
              newListItems: fi2.items
            })
          }
        }
})
})
      app.post("/", function(req, res) {

        const itemname = req.body.newItem;
        const listname=req.body.list;
        const item4 = new items({
          name: itemname
        });
        if(listname==="Today"){
          item4.save();
          res.redirect("/");
        }else{
          list.findOne({name:listname},(err,fi3)=>{
            fi3.items.push(item4);
            fi3.save();
            res.redirect("/"+listname)
          })
        }

      });
      app.post("/delete", function(req, res) {
        const checkedid = req.body.checkbox;
        const listname=req.body.listname;
        if(listname==="Today")
        {
          items.findByIdAndRemove(checkedid, (err) => {
            if (err) {
              console.log(err)
            } else {
              console.log("done dana");
              res.redirect("/")
            }
          })
        }
else
{
  list.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedid}}},(err,fi4)=>{
    if(!err)
    {
      res.redirect("/"+listname);
    }
  })
}
      })


      app.get("/about", function(req, res) {
        res.render("about");
      });
      let port = process.env.PORT;
      if (port == null || port == "") {
        port = 3000;
      }

      app.listen(port, function() {
        console.log("Server started succesfully");
      }); 
