/*
 * Plant related functions
 */

var PlantProvider = require('../data/plantProvider').PlantProvider;
var plantProvider= new PlantProvider('localhost', 27017);

exports.home = function(req, res){
  res.send("Looking for plants?");
  };

/**
 * Args:
 *  user
 *  pinged_at
 * Returns:
 *  List of new plants
 */
exports.get_plants = function(req, res){
  var pinged_at = new Date(+req.query.pinged_at);
  console.log([req.user.user_id,
    "( is lead:",
    req.user.is_lead,
    ") asked for plants.",
    "Since:", pinged_at].join(' '));
  plantProvider.checkPlants(
    req.user.user_id,
    pinged_at,
    function(error, plants){
      res.json(plants);
    }
  );
};

exports.post_plant = function(req, res){
  if (!req.user.is_lead){
    res.json("I'm sorry, you need to have gardener status.");
  } else {
    plantProvider.save({
      group_id: req.user.group_id,
      shared_with: JSON.parse(req.param('shared_with')),
      title: req.param('title'),
      salt: req.param('salt'),
      passphrase: req.param('passphrase'),
      }, function (error, plant){
        res.json(plant);
      }
    );
  }
};

exports.update_plant = function(req, res){
    plantProvider.updatePlant(req.params.id,
      req.param('state'),
      function(err, plant){
        res.json("Success!");
    });
  };
