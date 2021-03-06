const express = require('express');
const router = express.Router();
const fitgoalController = require('./fitgoal-controller');
const commonController = require('../common/common');



router.post('/new', commonController.verifyToken, fitgoalController.postNewFitGoal);
router.get('/all/:token', commonController.verifyToken, fitgoalController.getAllFitGoals);
router.get('/:id/:token', commonController.verifyToken, fitgoalController.getFitGoalByID);
router.put('/:id/:token', commonController.verifyToken, fitgoalController.updateFitGoalByID);
router.delete('/:id/:token', commonController.verifyToken, fitgoalController.deleteFitGoalByID);



module.exports = router;
