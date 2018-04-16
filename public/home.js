//motifit quote
//fitgoals
//fitweek
//categories
//exercises
//modal functionality


//token --local storage

//will be executed anytime we refresh
function initApp() {
    let userName = localStorage.getItem('name');
    if (userName) {
        $('.greeting .firstname').html(userName);
        getCurrentFitGoals();
        getUserWeek();
    }
    //anytime we check, and we don't have have the token it will go back to index pg
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html'; //always an object
    }
    //token and ID exists
    //We do the check to get user info
    else {
        console.log(localStorage.getItem('userID'));
    }
}
initApp();



/***   S I G N  O U T    ***/
function signOut() {
    $('.signout').on('click', event => {
        event.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
}
signOut();



/***   M O T I F I T   Q U O T E    ***/

//calls take the most time
// do the random grab serverside
//adds button listener
function setupMotiFitQuote() {
    $('.motifit-button').on('click', event => {
        event.preventDefault();
        $.get('/quote/random/' + localStorage.getItem('token'), (randomQuote) => {

            localStorage.setItem('randomQuote', randomQuote.data);

            showMotiFitQuote();
        })
    })
}
setupMotiFitQuote();


// displays the given quote to the "random-quote" element
function showMotiFitQuote() {
    let currentQuote = localStorage.getItem('randomQuote');
    $('.random-quote').html(`${currentQuote}`);
}
showMotiFitQuote();







/***   F I T   G O A L S   ***/

//Get all completed fit goals (for history log).
function getAllCompletedGoals() {
    $('.fitgoal-history-button').on('click', event => {
        event.preventDefault();
        $('[data-popup="popup-fitgoal-history"]').fadeIn(350);
        let url = '/goal/all/' + localStorage.getItem('token');
        $.get(url, (allGoals) => {
            console.log(allGoals);
            displayCompletedFitGoals(allGoals);
        })
    });
}
getAllCompletedGoals();


function renderCompletedFitGoals(fitgoal) {
    let formatedDate = moment(fitgoal.createDate).format('dddd, MMMM Do YYYY');
    if (fitgoal.completed === true) {
        return `
            <div class="completed-goal">
                <p>Completed on: ${formatedDate}</p>
                <h3>Title: ${fitgoal.title}</h3>
                <p>Description: ${fitgoal.description}</p>
            </div>  
        `
    }
}


function displayCompletedFitGoals(allGoals) {
    let completedFitGoalOutput = allGoals.data.map(fitgoal => renderCompletedFitGoals(fitgoal)).join('');
    $('.goalhistory-list').html(completedFitGoalOutput);
}



//Post a new fit goal
function postNewFitGoal() {
    $('.post-fitgoal-form').on('click', '#add-fitgoal-button', event => {
        event.preventDefault();
        let body = {
            'title': $('#fitgoal-title').val(),
            'userID': localStorage.getItem('userID'),
            'createDate': Date.now(),
            'description': $('#fitgoal-description').val(),
            'completed': false,
            'token': localStorage.getItem('token')
        }
        $.ajax({
                type: "POST",
                contentType: 'application/json',
                url: '/goal/new',
                data: JSON.stringify(body)
            })
            .done(function(fitgoal) {
                console.log(fitgoal);
                closeModal();
                getCurrentFitGoals();
            })
            .fail(function(fitgoal) {
                console.log('Post new fit goal failed!');
            })
    })
}
postNewFitGoal();


function getCurrentFitGoals() {
    let url = '/goal/all/' + localStorage.getItem('token');
    $.get(url, (allGoals) => {
        console.log(allGoals);
        displayCurrentFitGoals(allGoals);
    });
}
getCurrentFitGoals();


function renderCurrentFitGoals(fitgoal) {
    let formatedDate = moment(fitgoal.createDate).format('dddd, MMMM Do YYYY');
    if (fitgoal.completed === false) {
        $('#fitgoal-title').val('');
        $('#fitgoal-description').val('');
        $('.current-fitgoal').removeClass('hidden');
        return `
        <p class="current-fitgoal-date">${formatedDate}</p>
        <h3 class="current-fitgoal-title">${fitgoal.title}</h3>
        <p class="current-fitgoal-description">${fitgoal.description}</p>
        <button class="completed-fitgoal-button" value="${fitgoal._id}">Completed!</button>
        <button class="edit-fitgoal-button" value="${fitgoal._id}"><img class="edit-icon" src="https://i.pinimg.com/originals/2b/5d/21/2b5d21752e9b782f5b97e07b2317314f.png" alt="edit icon"/></button></button>
        <button class="delete-fitgoal-button" value="${fitgoal._id}"><img class="delete-icon" src="https://png.icons8.com/metro/1600/delete.png" alt="delete icon"/></button>
        `
    }
}


function displayCurrentFitGoals(allGoals) {
    let currentFitGoalOutput = allGoals.data.map(fitgoal => renderCurrentFitGoals(fitgoal)).join('');
    $('.current-fitgoal').html(currentFitGoalOutput);
}


//Completed fit goal.
function completedFitGoal() {
    $('.current-fitgoal').on('click', '.completed-fitgoal-button', event => {
        event.preventDefault();
        let ID = $(event.currentTarget).attr('value');
        console.log(ID);
        let body = {
            '_id': `${ID}`,
            'completed': true,
            'createDate': Date.now(),
            'userID': localStorage.getItem('userID'),
            'token': localStorage.getItem('token')
        };
        $.ajax({
            type: 'PUT',
            url: `/goal/${ID}/` + localStorage.getItem('token'),
            contentType: 'application/json',
            data: JSON.stringify(body)
        }).done((fitgoal) => {
            getCurrentFitGoals();
            getAllCompletedGoals();
        }).fail((error) => {
            console.log('Completeing fit goal failed!');
        })
    });
}
completedFitGoal();


//Delete selected fit goal.
function deleteFitGoal() {
    $('.current-fitgoal').on('click', '.delete-fitgoal-button', event => {
        event.preventDefault();
        let ID = $(event.currentTarget).attr("value");
        console.log(ID);
        $.ajax({
            url: `goal/${ID}/` + localStorage.getItem('token'),
            type: 'DELETE'
        }).done((fitgoal) => {
            getCurrentFitGoals();
        }).fail((error) => {
            console.log('Deleting fit goal failed!');
        })
    });
}
deleteFitGoal();


//Get fitgoal details when edit button is clicked.
function openEditFitGoalModal() {
    $('body').on('click', '.edit-fitgoal-button', event => {
        event.preventDefault();
        $('[data-popup="popup-edit-fitgoal"]').fadeIn(350);
        let ID = $(event.currentTarget).attr("value");
        $.ajax({
            url: `goal/${ID}/` + localStorage.getItem('token'),
            type: 'GET'
        }).done(function(fitgoal) {
            console.log(fitgoal);
            $('.edit-fitgoal-form').html(`
                <fieldset>
                    <legend>Update Current Fit Goal</legend>
                    <label for="fitgoal-title-edit">Fit Goal</label>
                    </br>
                    <input id="fitgoal-title-edit" type="text" value="${fitgoal.data.title}" />
                    </br>
                    <label for="fitgoal-description-edit">Description</label>
                    </br>
                    <input id="fitgoal-description-edit" type="text" value="${fitgoal.data.description}" />
                    <button type="submit" id="update-fitgoal-button" data-popup-close="popup-edit-fitgoal" value="${fitgoal.data._id}">Update</button>
                    <button type="submit" id="cancel-fitgoal-button" data-popup-close="popup-edit-fitgoal">Cancel</button>
                </fieldset> 
            `);
        }).fail(function(fitgoal) {
            console.log('Updating new fit goal failed!');
        });
    });
}
openEditFitGoalModal();


//Put fitgoal edits.
function putFitGoalEdits() {
    $('.edit-fitgoal-form').on('click', '#update-fitgoal-button', event => {
        event.preventDefault();
        let ID = $(event.currentTarget).attr("value");
        let body = {
            '_id': `${ID}`,
            'title': $('#fitgoal-title-edit').val(),
            'createDate': Date.now(),
            'description': $('#fitgoal-description-edit').val(),
            'completed': false,
            'userID': localStorage.getItem('userID'),
            'token': localStorage.getItem('token')
        }
        $.ajax({
                type: "PUT",
                contentType: 'application/json',
                url: `/goal/${ID}/` + localStorage.getItem('token'),
                data: JSON.stringify(body)
            })
            .done(function(fitgoal) {
                console.log(fitgoal);
                $('.popup').fadeOut(350);
                displayEditedFitGoal(fitgoal);
            })
            .fail(function(fitgoal) {
                console.log('Updating new fit goal failed!');
            })
    })
}
putFitGoalEdits();


//Cancel fitgoal update.
function cancelFitGoalUpdate() {
    $('.edit-fitgoal-form').on('click', '#cancel-fitgoal-button', event => {
        $('.popup').fadeOut(350);
    });
}
cancelFitGoalUpdate();


function displayEditedFitGoal(fitgoal) {
    let formatedDate = moment(fitgoal.data.createDate).format('dddd, MMMM Do YYYY');
    $('#fitgoal-title').val('');
    $('#fitgoal-description').val('');
    $('.current-fitgoal').html(`
        <p class="current-fitgoal-date">${formatedDate}</p>
        <h3 class="current-fitgoal-title">${fitgoal.data.title}</h3>
        <p class="current-fitgoal-description">${fitgoal.data.description}</p>
        <button class="completed-fitgoal-button" value="${fitgoal.data._id}">Completed!</button>
        <button class="edit-fitgoal-button" value="${fitgoal.data._id}"><img class="edit-icon" src="https://i.pinimg.com/originals/2b/5d/21/2b5d21752e9b782f5b97e07b2317314f.png" alt="edit icon"/></button>
        <button class="delete-fitgoal-button" value="${fitgoal.data._id}"><img class="delete-icon" src="https://png.icons8.com/metro/1600/delete.png" alt="delete icon"/></button>
    `)
}



/***   D A Y   P L A N   F O R M   G LO B A L   V A R I A B L E   ***/
let dayplanFormObject = {};



/***   C A T E G O R I E S   ***/

//Get all categories
function getAllCategories() {
    $.get('/category/all/' + localStorage.getItem('token'), (allCategories) => {
        console.log(allCategories);
        displayAllCategories(allCategories);
    });
}
getAllCategories();


function renderCategories(category) {
    return `
        <div class="col-3">
            <div class="category-container">
                <label for="${category.name}"><input type="radio" name="toggle" id="${category.name}" value="${category._id}" style="background-image: url(http://i54.tinypic.com/4zuxif.jpg)"><img class="category-img" src="${category.img}" alt="${category.name} image" width="100px" height="100px"/><p>${category.name}</p></label>
                <button class="delete-category-btn" value="${category._id}"><img class="delete-icon" src="https://png.icons8.com/metro/1600/delete.png" alt="delete icon"/></button>
            </div>
        </div>
    `
}
//ADD CATEGORY EDIT BUTTON???
//  <button class="edit-category-btn"><img class="edit-icon" src="https://i.pinimg.com/originals/2b/5d/21/2b5d21752e9b782f5b97e07b2317314f.png" alt="edit icon"/></button>


function displayAllCategories(allCategories) {
    let categoriesOutput = allCategories.data.map(category => renderCategories(category)).join('');
    $('.category-icons').html(categoriesOutput);
}



//Remove category delete button on category focus.
// $('.category-icons').on('checked', 'input', function(event) {
//     $(event.target).next('.delete-category-btn').addClass('hidden');
// });

// //Return category delete button on category focusout.
// $('.category-icons').on('focusout', '.category-toggle', function() {
//     $('.category-container').children('.delete-category-btn').removeClass('hidden');
// });




function revealNewCategoryForm() {
    $('.popdown-post-category').on('click', event => {
        event.preventDefault();
        $('.new-category-form').removeClass('hidden');
    })
}
revealNewCategoryForm();


//Post a new category
function postNewCategory() {
    $('.new-category-form').on('click', '.post-category-btn', event => {
        event.preventDefault();
        let body = {
            'name': $('#category-name').val(),
            'img': $('#category-img').val(),
            'userID': localStorage.getItem('userID'),
            'token': localStorage.getItem('token')
        }
        $.ajax({
                type: "POST",
                contentType: 'application/json',
                url: '/category/new/' + localStorage.getItem('token'),
                data: JSON.stringify(body),
            })
            .done(function(data) {
                console.log(data);
                getAllCategories(data);
                $('#category-name').val(''),
                    $('#category-img').val(''),
                    $('.new-category-form').addClass('hidden');
            })
            .fail(function(error) {
                console.log('Posting new category failed!')
            })
    })
}
postNewCategory();


function cancelNewCategory() {
    $('.new-category-form').on('click', '.cancel-category-btn', event => {
        event.preventDefault();
        $('.new-category-form').addClass('hidden');
    });
}
cancelNewCategory();


//Delete category.
function deleteCategory() {
    $('.category-icons').on('click', '.delete-category-btn', event => {
        event.preventDefault();
        let ID = $(event.currentTarget).attr("value");
        console.log(ID);
        $.ajax({
            url: `/category/${ID}/` + localStorage.getItem('token'),
            type: 'DELETE'
        }).done((category) => {
            console.log(category);
            getAllCategories();
        }).fail((error) => {
            console.log('Deleting category failed!');
        })
    });
}
deleteCategory();


//Get selected/checked category
function getSelectedCategory() {
    $('.dayplan-category-get').on('click', event => {
        event.preventDefault();
        let ID = $('input[name="toggle"]:checked').val();
        dayplanFormObject.categoryID = ID;
        console.log(dayplanFormObject);
    })
}
getSelectedCategory();



/***   A C T I V I T Y   ***/


// Post new activity.
function postNewActivity() {
    $('.post-dayplan-form').on('click', '#submit-dayplan-button', event => {
        event.preventDefault();
        let body = {
            'name': $('#activity-name').val(),
            'time': $('#activity-time').val(),
            'duration': $('#activity-duration').val(),
            'cardio': {
                'distance': $('#cardio-distance').val(),
                'duration': $('#cardio-duration').val()
            },
            'location': $('#activity-location').val(),
            'inspiration': $('#activity-inspiration').val(),
            'completed': false,
        }
        dayplanFormObject.activity = body;
        dayplanFormObject.userID = localStorage.getItem('userID');
        dayplanFormObject.token = localStorage.getItem('token');
        console.log(dayplanFormObject);
        createDayPlan(dayplanFormObject);
        // })
        // $.ajax({
        //         type: 'POST',
        //         contentType: 'application/json',
        //         url: 'activity/new/' + localStorage.getItem('token'),
        //         data: JSON.stringify(body)
        //     })
        //     .done(( activity ) => {
        //         console.log(activity);
        //         dayplanFormObject.activity = body;
        //         dayplanFormObject.userID = localStorage.getItem('userID');
        //         dayplanFormObject.token = localStorage.getItem('token');
        //     })
        // //     .fail(( error ) => {
        // //         console.log('Post new activity failed!');
        //     })
    })
}
postNewActivity();






/***   E X E R C I S E S   ***/


function clearExerciseValue() {
    $('#exercise-name').val("");
    $('#exercise-sets').val("");
    $('#exercise-reps').val("");
    $('#exercise-weight').val("");
}


//Get all exercises.
function getAllExercises() {
    $.get('/exercise/all/' + localStorage.getItem('token'), (allExercises) => {
        console.log(allExercises);
        displayExercises(allExercises);
    });
}
getAllExercises();


function renderExercises(exercise) {
    return `
      <tr class="exercise-rows">
        <td><input type="checkbox" id="select-exercise" value="${exercise._id}"></td>
        <td class="td-exercise-name" width="25%">${exercise.name}</td>
        <td class="td-exercise-weight" width="25%">${exercise.weight}</td> 
        <td class="td-exercise-sets" width="25%">${exercise.sets}</td>
        <td class="td-exercise-reps" width="25%">${exercise.reps}</td>
        <td><button type="submit" class="edit-exercise-btn" value="${exercise._id}"><img class="edit-icon" src="https://i.pinimg.com/originals/2b/5d/21/2b5d21752e9b782f5b97e07b2317314f.png"/></button></td>
        <td><button type="submit" class="delete-exercise-btn" value="${exercise._id}"><img class="delete-icon" src="https://png.icons8.com/metro/1600/delete.png"/></button></td>
      </tr>
    `
}


function displayExercises(allExercises) {
    let exercisesOutput = allExercises.data.map(exercise => renderExercises(exercise)).join('');
    $('.exercise-list').html(exercisesOutput);
}


function showNewExerciseForm() {
    $('.popdown-post-exercise').on('click', event => {
        event.preventDefault();
        $('.new-exercise-form').removeClass('hidden');
    })
}
showNewExerciseForm();


//Post new exercise.
function postNewExercise() {
    $('.post-exercise-form').on('click', '.post-exercise-btn', event => {
        event.preventDefault();
        let body = {
            'name': $('#exercise-name').val(),
            'sets': $('#exercise-sets').val(),
            'reps': $('#exercise-reps').val(),
            'weight': $('#exercise-weight').val(),
            'token': localStorage.getItem('token'),
            'userID': localStorage.getItem('userID')
        }
        $.ajax({
                type: "POST",
                contentType: 'application/json',
                url: '/exercise/new/' + localStorage.getItem('token'),
                data: JSON.stringify(body)
            })
            .done(function(newExercise) {
                console.log(newExercise);
                clearExerciseValue();
                $('.new-exercise-form').addClass('hidden');
                getAllExercises();
            })
            .fail(function(error) {
                console.log('Post new weights routine failed!');
            })
    })
}
postNewExercise();

//Cancel adding new exercise.
function cancelNewExercise() {
    $('.new-exercise-form').on('click', '.cancel-exercise-btn', event => {
        event.preventDefault();
        clearExerciseValue();
        $('.new-exercise-form').addClass('hidden');
    });
}
cancelNewExercise();


//Delete exercise table.
function deleteExerciseTable() {
    $('.exercise-list').on('click', '.delete-exercise-btn', event => {
        event.preventDefault();
        let ID = $(event.currentTarget).attr("value");
        console.log(ID);
        $.ajax({
            url: `/exercise/${ID}/` + localStorage.getItem('token'),
            type: 'DELETE'
        }).done((exercise) => {
            console.log(exercise);
            getAllExercises();
        }).fail((error) => {
            console.log('Deleting exercise routine table failed!');
        })
    });
}
deleteExerciseTable();


//Get exercise details when edit button is clicked.
function showEditExerciseForm() {
    $('.exercise-list').on('click', '.edit-exercise-btn', event => {
        event.preventDefault();
        $('.popdown-edit-exercise').removeClass('hidden');
        let ID = $(event.currentTarget).attr("value");
        $.ajax({
            url: `/exercise/${ID}/` + localStorage.getItem('token'),
            type: 'GET'
        }).done(function(exercise) {
            console.log(exercise);
            $('.edit-exercise-form').html(`
                <fieldset>
                    <legend>Update Exercise Routine</legend>
                    <label for="exercise-name-edit">Name:</label>
                    <input id="exercise-name-edit" type="text" value="${exercise.data.name}"/>  
                    </br>
                    <label for="exercise-weight-edit">Weight:</label>
                    <input id="exercise-weight-edit" type="text" value="${exercise.data.weight}"/>
                    </br>       
                    <label for="exercise-sets-edit">Sets:</label>
                    <input id="exercise-sets-edit" type="text" value="${exercise.data.sets}"/>  
                    </br>
                    <label for="exercise-reps-edit">Reps:</label>
                    <input id="exercise-reps-edit" type="text" value="${exercise.data.reps}"/>
                    </br>
                    <button type="submit" class="put-exercise-btn" value="${exercise.data._id}">Update</button>
                    <button type="submit" class="cancel-exercise-btn">Cancel</button>
                </fieldset> 
            `);
        }).fail(function(error) {
            console.log('Updating exercise failed!');
        });
    });
}
showEditExerciseForm();



//Put exercise edits.
function putExerciseEdits() {
    $('.edit-exercise-form').on('click', '.put-exercise-btn', event => {
        event.preventDefault();
        let ID = $(event.currentTarget).attr("value");
        let body = {
            '_id': `${ID}`,
            'name': $('#exercise-name-edit').val(),
            'sets': $('#exercise-sets-edit').val(),
            'reps': $('#exercise-reps-edit').val(),
            'weight': $('#exercise-weight-edit').val(),
            'userID': localStorage.getItem('userID')
        }
        $.ajax({
                type: "PUT",
                contentType: 'application/json',
                url: `exercise/${ID}/` + localStorage.getItem('token'),
                data: JSON.stringify(body)
            })
            .done(function(exercise) {
                console.log(exercise);
                $('.popdown-edit-exercise').addClass('hidden');
                getAllExercises();
            })
            .fail(function(error) {
                console.log('Updating exercise failed!');
            })
    })
}
putExerciseEdits();



//Cancel exercise update.
function cancelExerciseEdit() {
    $('.edit-exercise-form').on('click', '.cancel-exercise-btn', event => {
        $('.popdown-edit-exercise').addClass('hidden');
    });
}
cancelExerciseEdit();



//Get selected/checked exercises.
function getSelectedExercises() {
    $('.dayplan-exercise-get').on('click', event => {
        event.preventDefault();
        let ID = $(":checkbox:checked").val();
        let checked = $(":checkbox:checked");
        console.log(checked);

        let exercisesIDs = [];
        for (let i = 0; i < checked.length; i++) {
            exercisesIDs.push(checked[i].value);
        }

        // let exercisesIDs = checked.map((i, exercise) => { //map expects index as first param
        //     return exercise.value 
        // });

        dayplanFormObject.exercisesIDs = exercisesIDs;
        console.log(dayplanFormObject);
    })
}
getSelectedExercises();






/***   D A Y    P L A N  ***/


//Post new day plan
function createDayPlan() {
    $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: 'dayplan/new/' + localStorage.getItem('token'),
            data: JSON.stringify(dayplanFormObject)
        })
        .done(function(dayplan) {
            console.log(dayplan);
        })
        .fail(function(error) {
            console.log('Post new day plan failed!');
        })
}



function getUserWeek() {
    $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: 'dayplan/all/' + localStorage.getItem('token')
        })
        .done(function( week ) {
            console.log( week );
        })
        .fail(function(error) {
            console.log('Post new day plan failed!');
        })
}


/***   M O D A L   F U N C T I O N A L I T Y   ***/

function openModal() {
    $('[data-popup-open]').on('click', function(event) {
        event.preventDefault();
        dayplanFormObject.day = $(event.target).attr('value');
        let targeted_popup_class = $(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
    });
}
openModal();



function closeModal() {
    $('[data-popup-close]').on('click', function(event) {
        event.preventDefault();
        let targeted_popup_class = $(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
    });
}
closeModal();



function closeModalOnClickOutsideModal() {
    //Close Modal on click outside of modal
    $(".popup").click(function() {
        $('.popup').fadeOut(350).removeClass("active");
    });
    $('.popup-inner').click(function(event) {
        event.stopPropagation();
    });
}
closeModalOnClickOutsideModal();





///////////////////////////////////////////////////////////////