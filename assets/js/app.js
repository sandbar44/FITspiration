// OPEN TO DO
// [] Glitchy filter behavior on mobile (does not untap)
// [] Refactor code
// [] Update Readme
// [] Check Reddit API
// [] Loading icon

// READY DOCUMENT
$(document).ready(function () {

    // GLOBAL VARIABLES
    // ==================================================
    var workoutTypes = [
        {
            term: 'HIIT',
            optTerm: 'hiit'
        },
        {
            term: 'metcon',
            optTerm: 'metcon'
        },
        {
            term: 'barre',
            optTerm: 'barre'
        },
        {
            term: 'yoga',
            optTerm: 'yoga'
        }
    ];

    var muscleGroups = [
        {
            term: 'core',
            optTerm: 'core,abs,6+pack'
        },
        {
            term: 'upper body',
            optTerm: 'upper+body'
        },
        {
            term: 'lower body',
            optTerm: 'lower+body'
        },
        {
            term: 'full body',
            optTerm: 'full+body'
        }
    ];
    var approvedChannels = [
        // HIIT / CORE
        'UCqjwF8rxRsotnojGl4gM0Zw' // THENX
        , 'UCaBqRxHEMomgFU-AkSfodCw' // Chris Heria
        , 'UCERm5yFZ1SptUEU4wZ2vJvw' // Jeremy Ethier
        , 'UCe0TLA0EsQbE-MjuHXevj2A' // ATHLEAN-X
        // METCON
        , 'UCzG8mjsSZCl2v5dUFy-kGsg' // Jump Rope Fit
        , 'UCEtMRF1ywKMc4sf3EXYyDzw' // ScottHermanFitness
        , 'UCrzICdOsXhtn4zMlk4bnTIg' // Funk Roberts
        // BARRE
        , 'UCBINFWq52ShSgUFEoynfSwg' // POPSUGAR Fitness
        , 'UCpy8VXKDK6Kfp9evUI' // Coach Kel
        , 'UCIiI9tAbgvSPPL_50gefFtw' // nourishmovelove
        // YOGA
        , 'UCFKE7WVJfvaHW5q283SxchA' // Yoga With Adriene 
    ];

    var maxResults = 9;
    var quote = '';
    var author = '';
    var query = [];
    var approvedIndices = [];
    var otherIndices = [];
    var workoutDiv = '';
    var workoutDivIds = [];

    // Initialize Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCWk94a0_WAd_Cl4W7sveje-QAhV_q2ZVU",
        authDomain: "fitspiration-a396c.firebaseapp.com",
        databaseURL: "https://fitspiration-a396c.firebaseio.com",
        projectId: "fitspiration-a396c",
        storageBucket: "fitspiration-a396c.appspot.com",
        messagingSenderId: "362967630013",
        appId: "1:362967630013:web:292b5a043baf914b1237d4",
        measurementId: "G-EHZ21B7JL1"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Create a variable to reference the database.
    var database = firebase.database();

    // Firebase Psuedo Code
    // [X] Display current stats for each value in firebase
    //      [X] Grab each video id
    //      [X] Display like count
    // [X] When a user likes a workout, store the workout ID and like count in firebase
    //      [X] Store videoID
    //      [X] Increase likeCount
    //      [X] Store updated likeCount in firebase
    // [X] Look for font awesome icon for "fist bump"
    // [] Add like button + count to workoutDiv creation
    // [] Display like count under video

    var workoutId = '';
    var likeCount = 0;

    // When a user clicks the 'Like' Button on a video
    $(document).on('click', '.like-btn', function () {
        workoutId = $(this).attr('workout-id');
        likeCount = $(`#${workoutId}-likes`).text()
        likeCount++

        console.log(workoutId);
        console.log(likeCount);

        database.ref('workouts/' + workoutId).update({
            workoutId,
            likeCount
        })

        // Update stats for workout
        $(`#${workoutId}-likes`).text(likeCount)

        // Disable like btn
        $(`[workout-id='${workoutId}'`)
            .removeClass("like-btn")
            .addClass("disabled")
    });

    // FUNCTIONS
    // ==================================================

    // Create filters
    function createFilter() {
        // Get data-state of clicked button
        var state = $(this).attr('data-state');
        // If the clicked button data-state is inactive, set data-state to active
        // Update button styling to active
        // Then add to query array
        if (state === 'inactive') {
            $(this).attr('data-state', 'active');
            $(this).addClass('active');
            var searchTerm = $(this).attr('data-name');
            query.push(searchTerm);
            // Else set data-state to inactive
            // Remove active button styling
            // Then remove from query array, if it exists
        } else {
            $(this).attr('data-state', 'inactive');
            $(this).removeClass('active');
            var searchTerm = $(this).attr('data-name');
            var removeTerm = query.findIndex(term => term === searchTerm);
            if (removeTerm > -1) {
                query.splice(removeTerm, 1)
            }
        };
        console.log(query);
    };

    // Reset filters
    function resetFilters() {
        $('.filter-btn')
            .attr('data-state', 'inactive')
            .removeClass('active')
        query = [];
        console.log(query);
    };

    // Function to display search results when button is clicked
    function displayWorkouts() {
        // Reset search results
        $('#workout-header-rec').empty();
        $('#workout-header').empty();
        $('#workout-view-rec').empty();
        $('#workout-view').empty();
        approvedIndices = [];
        otherIndices = [];


        // Prepare AJAX call
        var queryURL = 'https://www.googleapis.com/youtube/v3/search?'
            + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
            + '&part=snippet'
            + '&type=video'
            + '&maxResults=50'
            + '&topicId=/m/027x7n'
            + '&q=workout,' + query;
        console.log(queryURL);

        // Creating an AJAX call for the specific search
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).done(function (response) {

            console.log(response);

            // If no results, show message
            if (response.pageInfo.totalResults === 0) {
                $('#workout-view').html('<center>Sorry, no results!</center>');
            }

            // If results exist, populate search results
            else {

                // Fetch workout data for all results
                for (i = 0; i < response.pageInfo.resultsPerPage; i++) {

                    // Identify workouts from approved channels
                    var approvedChannel = approvedChannels.findIndex(approve => approve === response.items[i].snippet.channelId)
                    if (approvedChannel > -1) {
                        approvedIndices.push(i);
                    }
                    else {
                        otherIndices.push(i);
                    };
                };

                // Create function to create workout divs
                var createWorkoutDiv = function (i, section) {
                    // Create workout div
                    workoutDiv = $('<div class="col-md-6 col-lg-4 mb-5">');
                    var title = $('<div class="item-title">').text(response.items[i].snippet.title + ' ');
                    var channel = $('<span class="channel">').text('by ' + response.items[i].snippet.channelTitle);
                    workoutId = response.items[i].id.videoId;
                    var like = $('<span class="like">').html(
                        `<i class="like-btn far fa-thumbs-up" workout-id="${workoutId}"></i>
                        <span id="${workoutId}-likes">0</span>`
                    );
                    var thumbnail = response.items[i].snippet.thumbnails.medium.url;
                    var thumbnailDiv = $('<div>').attr({
                        'id': response.items[i].id.videoId
                    });
                    var workoutImg = $('<img>').attr({
                        'src': thumbnail,
                        'class': 'workout-item'
                    });
                    thumbnailDiv.append(workoutImg);

                    // Append the new search results
                    var workoutLink = $('<a>').attr({
                        'href': 'https://www.youtube.com/watch?v=' + response.items[i].id.videoId,
                        'target': '_blank'
                    });
                    workoutLink.append(thumbnailDiv, title);
                    workoutDiv.append(workoutLink, channel, like);

                    // Generate divs under desired section
                    $(section).append(workoutDiv);

                    // Add channel ID to array
                    workoutDivIds.push(response.items[i].id.videoId)
                }
            };

            // Create workout div for approved channels
            if (approvedIndices.length > 0) {
                // Create recommended header                
                $('#workout-header-rec').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Recommended Workouts</h2>');

                // Call function to create workout div with relevant Indices and into desired section
                for (j = 0; j < approvedIndices.length; j++) {
                    createWorkoutDiv(approvedIndices[j], '#workout-view-rec');
                }
            };

            // Display max 9 other workouts
            // Create search results header
            $('#workout-header').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Search Results</h2>');

            for (k = 0; k < maxResults; k++) {
                createWorkoutDiv(otherIndices[k], '#workout-view');
            };

            // Fetch workout video stats
            var queryURLvideo = 'https://www.googleapis.com/youtube/v3/videos?'
                + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
                + '&id=' + workoutDivIds
                + '&part=snippet,contentDetails';

            console.log(queryURLvideo);

            $.ajax({
                url: queryURLvideo,
                method: 'GET'
            }).done(function (response) {
                console.log(response);

                // Fetch data for each workout video
                for (i = 0; i < response.items.length; i++) {
                    var videoId = response.items[i].id;
                    var ytDuration = response.items[i].contentDetails.duration;
                    var duration = moment
                        .duration(ytDuration)
                        .format('h:mm:ss')
                        .padStart(4, '0:0');

                    // Add duration to each thumbnail
                    var durationDiv = $('<div class="ytd-thumbnail-overlay-time-status-renderer">');
                    durationDiv.text(duration);
                    $(`#${videoId}`).append(durationDiv);
                };

                // Advanced feature: filter by tags
                // var tagURL = 'https://www.googleapis.com/youtube/v3/videos?'
                // + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
                // + '&part=snippet'
                // + '&id=' + response.items[i].id.videoId;
                // console.log(tagURL)

            });


            database.ref('/workouts').on('child_added', function (snapshot) {
                // Get snapshot data
                console.log(snapshot.val());
                workoutId = snapshot.val().workoutId;
                likeCount = snapshot.val().likeCount;

                // Display stats for each workout
                $(`#${workoutId}-likes`).text(likeCount);

            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

            // Display Random WOD Generator for metcon
            if ($('#metcon').attr('data-state') === 'active') {
                $('#workout-header-rec').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Recommended Workouts</h2>');
                $('#workout-view-rec').prepend($('#wod-item-template').html());
            }


        }).fail(function (response) {
            // Empty the contents of search results
            $('#workout-view').empty();
            console.log(response);
            $('#workout-view').html('<div class="col-md-12 col-lg-12 mb-12 text-center">Error. Please try again later.</div>');

            console.log('GET failed!');
        });
    };

    // Fetch random WOD
    function generateWod() {
        fetch('https://dgurkaynak.github.io/wod-generator/data/wods.txt')
            .then(response => response.text())
            .then(data => {
                // $("#wod-text").text(JSON.stringify(data));
                var wodArray = data.split('|');
                var i = Math.floor(Math.random() * wodArray.length);
                var wodContent = wodArray[i];
                wodContent = wodContent.replace(/\r\n/g, '<br>');
                $('#wod-text').html(wodContent);
            });
    }

    // Function for displaying buttons
    function renderButtons() {

        // Deleting the buttons prior to adding new buttons
        // (this is necessary to prevent repeat buttons)
        $('#workout-type').empty();

        // Loop through the array of WORKOUT TYPES
        for (var i = 0; i < workoutTypes.length; i++) {
            // Then dynamicaly generate buttons for each topic in the array
            var a = $('<button type="btn" class="btn btn-outline-filter filter-btn">');
            // Provide the initial button text
            a.text(workoutTypes[i].term);
            // Add data-attributes
            a.attr('data-name', workoutTypes[i].optTerm);
            a.attr('data-state', 'inactive');
            a.attr('id', workoutTypes[i].term);
            // Adding the button to the buttons div
            $('#workout-type').append(a);
        }

        // Loop through the array of MUSCLE GROUPS
        for (var i = 0; i < muscleGroups.length; i++) {
            // Then dynamicaly generate buttons for each topic in the array
            var a = $('<button type="btn" class="btn btn-outline-filter filter-btn">');
            // Provide the initial button text
            a.text(muscleGroups[i].term);
            // Add data-attributes
            a.attr('data-name', muscleGroups[i].optTerm);
            a.attr('data-state', 'inactive');
            // Adding the button to the buttons div
            $('#muscle-group').append(a);
        }
    };

    // Disable form submissions if there are invalid fields
    var validateForm = function () {
        'use strict';
        window.addEventListener('load', function () {
            // Fetch all forms
            var forms = document.getElementsByClassName('needs-validation');
            // Loop over them and prevent submission
            var validation = Array.prototype.filter.call(forms, function (form) {
                form.addEventListener('submit', function (event) {
                    if (form.checkValidity() === false) {
                        // event.preventDefault();
                        // event.stopPropagation();
                        $('#user-agreement').modal('open');
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }, false);
    };

    // Initialize Modals
    $('.modal').modal();
    $('#user-agreement').modal('open', {
        dismissible: false,
        onCloseStart: validateForm()
    });

    // EXECUTE
    // ==================================================

    // Random Quote Generator
    fetch('https://api.quotable.io/random?tags=inspirational')
        .then(response => response.json())
        .then(data => {
            quote = data.content;
            author = data.author;
            $('#quote').text(quote);
            $('#author').text(author);
        });

    // Click event listener to all elements with a class of 'filter-btn'
    $(document).on('click', '.filter-btn', createFilter);

    // Click event listener to execute search
    $('#submit-btn').on('click', displayWorkouts);

    // Click event listener to reset filters
    $('#reset-btn').on('click', resetFilters);

    // Click event listener to regenerate WOD
    $('#generate-wod').on('click', generateWod);

    // Calling the renderButtons function to display the intial buttons
    renderButtons();

    generateWod();

});