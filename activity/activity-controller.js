const activityModel = require('./activity-model');

exports.postNewActivity = (req, res) => {
	let newActivity = new activityModel();
	newActivity.userID = req.body.userID;
	newActivity.name = req.body.name;
	newActivity.time = req.body.time;
	newActivity.duration = req.body.duration;
	newActivity.cardio.distance = req.body.cardio.distance;
	newActivity.routine = req.body.routine;
	newActivity.location = req.body.location;
	newActivity.inspiration = req.body.inspiration;
	newActivity.save()
	.then((activity) => {
		res.status(200).json({
			message: `New activity (${newActivity.name}) saved.`,
			data: activity
		})
	})
	.catch((error) => {
		res.status(500).json({
			message: `Error saving new activity (${newActivity.name}).`,
			data: error
		})
	})
}


exports.getAllActivities = (req, res) => {
		activityModel.find({userID: req.user.id}) 
	.then((activities) => {
		res.status(200).json({
			message: "Successfully retrieved all activities.",
			data: activities
		})
	}) 
	.catch((error) => {
		res.status(500).json({
			message: "Error retrieving all activities.",
			data: error
		})
	})
}


exports.getActivityByID = (req, res) => {
	activityModel.findById(req.params.id)
	.then((activity) => {
		res.status(200).json({
			message: `Successfully retrieved activity with ID ${req.params.id}.`,
			data: activity
		})
	})
	.catch((error) => {
		res.status(500).json({
			message: `Error retrieving activity with ID ${req.params.id}.`,
			data: error
		})
	})
}


exports.updateActivityByID = (req, res) => {
	if(!(req.params.id && req.params._body && req.params.id === req.params._body)){
		res.status(400).json({
			message: "Error. Request path id and request body id values must match."
    	});
	}
	const updated = {};
	const updateableFields = ["name","time","duration","cardio", "routine",
							  "location","inspiration"];
 	updateableFields.forEach(field => {
    	if (field in req.body){
      		updated[field] = req.body[field];
    	}
  	})
  	activityModel.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
	.then((updatedActivity) => {
		res.status(200).json({
			message: "Activity updated successfully."
		})
	})
	.catch((error) => {
		res.status(500).json({ 
			message: "Error updating activity."
		})	
	})	
}


exports.deleteActivityByID = (req,res) => {
	activityModel.findByIdAndRemove(req.params.id)
	.then(() => {
  		res.status(200).json({ 
  			message: `Successfully deleted activity with ID ${req.params.id}.` 
  		})
	})
	.catch((error) => {
  		res.status(500).json({ 
  			message: `Error deleting activity with ID ${req.params.id}.`,
  			data: error
  		})
	})
}


