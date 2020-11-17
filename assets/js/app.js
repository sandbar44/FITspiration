// OPEN TO DO
// [] Refactor code
// [] Add sort by duration after results retrieved
// [] Update Readme
// [] Loading icon

// READY DOCUMENT
$(document).ready(function () {

    // GLOBAL VARIABLES
    // ==================================================

    // Define arrays for query filters (term = display name; optTerm = optimal keywords, query friendly)
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
            term: 'upper',
            optTerm: 'upper+body'
        },
        {
            term: 'lower',
            optTerm: 'lower+body'
        },
        {
            term: 'full',
            optTerm: 'full+body'
        }
    ];

    // Define array for sort options
    // Note: YouTube API search client does not allow sorting by duration until after results are retrieved.
    //      Therefore, this application will retrieve top relevant videos, and THEN sort by duration will be an option. 
    var sortBy = [
        {
            term: 'relevance',
            optTerm: 'relevance'
        },
        {
            term: 'popularity',
            optTerm: 'viewCount'
        },
        {
            term: 'newest',
            optTerm: 'date'
        }
        // {
        //     term: 'duration (asc)',
        //     sortTerm: 'relevance',
        //     sortDuration: 'shortest'
        // },
        // {
        //     term: 'duration (desc)',
        //     sortTerm: 'relevance',
        //     sortDuration: 'longest'
        // }
    ];

    // Define array for Approved Channels (personally picked by me!) 
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

    // Define application variables
    // [] Refactor: Which of these varaibles are truly 'global' vs. 'local'
    var maxResults = 9; // confirmed global
    var query = []; // confirmed global
    var sortQuery = 'relevance'; // confirmed global
    var approvedIndices = [];
    var otherIndices = [];
    var workoutDivIds = [];

    // FIREBASE
    // ==================================================

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

    // Define variable to reference firebase database
    var database = firebase.database();

    // FUNCTIONS
    // ==================================================

    // INITIAL PAGE LOAD
    // ==================================================

    // Create function to Fetch Random Quote Generator
    var generateQuote = function () {
        fetch('https://api.quotable.io/random?tags=inspirational')
            .then(response => response.json())
            .then(data => {
                var quote = data.content;
                var author = data.author;
                $('#quote').text(quote);
                $('#author').text(author);
            });
    };

    // Create function to Display filter buttons
    var renderButtons = function (section, array, btnClass) {
        // Delete buttons prior to adding new buttons (to prevent repeat buttons)
        // This is necessary for future feature: "Add your own custom keywords"
        $(section).empty();
        // Loop through designated array to create each button
        for (var i = 0; i < array.length; i++) {
            // Dynamicaly generate buttons for each topic in the array
            var a = $('<button>').attr({
                'type': 'btn',
                'data-name': array[i].optTerm,
                'data-state': 'inactive',
                'id': array[i].term,
                'defaultId': i
            })
                .text(array[i].term)
                .addClass('btn btn-outline-filter ' + btnClass);
            // Add button to the buttons div
            $(section).append(a);
        };
        // Set default sort to Relevance
        if (btnClass === 'sort-btn') {
            $('.sort-btn[defaultId=0]').attr('data-state', 'active')
                .addClass('active');
        };
    };

    // BUTTON FUNCTIONS
    // ==================================================

    // Create function to Define filter query (when user clicks a filter button)
    var createFilter = function () {
        // Get data-state of clicked button
        var state = $(this).attr('data-state');
        // Get data-name of clicked button
        var searchTerm = $(this).attr('data-name');
        // If the clicked button data-state is inactive, set button data-state and styling to active
        if (state === 'inactive') {
            $(this).attr('data-state', 'active')
                .addClass('active');
            // Add value to query array
            query.push(searchTerm);
        } else {
            // Else set button data-state to inactive and remove active styling
            $(this).attr('data-state', 'inactive')
                .removeClass('active');
            // Then remove from query array, if it exists
            var removeTerm = query.findIndex(term => term === searchTerm);
            if (removeTerm > -1) {
                query.splice(removeTerm, 1)
            };
        };
        console.log(query);
    };

    // Create function to Define Sort query (when user clicks a sort button)
    var createSort = function () {
        // Get data-state of clicked button
        var state = $(this).attr('data-state');
        // If the clicked button data-state is inactive:
        if (state === 'inactive') {
            // Disable all sort-btn buttons
            $('.sort-btn').attr('data-state', 'inactive')
                .removeClass('active');
            // Then set button data-state and styling to active
            $(this).attr('data-state', 'active')
                .addClass('active');
            // Update sortQuery variable
            sortQuery = $(this).attr('data-name');
        } else {
            // Else set button data-state to inactive and remove active styling
            $(this).attr('data-state', 'inactive')
                .removeClass('active');
            // Then empty sortQuery variable
            sortQuery = '';
        };
        console.log(sortQuery);
    };

    // Create function to Reset filters
    var resetFilters = function () {
        // Reset buttons
        $('.filter-btn').attr('data-state', 'inactive')
            .removeClass('active');
        $('.sort-btn[defaultId=0]').attr('data-state', 'active')
            .addClass('active');
        // Reset queries
        query = [];
        sortQuery = 'relevance';
        console.log(query);
        console.log(sortQuery);
    };

    // POST-SEARCH FUNCTIONS
    // ==================================================

    // Create function to Display search results when Search button is clicked
    var displayWorkouts = function () {
        // Reset search results
        $('#workout-header-rec').empty();
        $('#workout-header').empty();
        $('#workout-view-rec').empty();
        $('#workout-view').empty();
        approvedIndices = [];
        otherIndices = [];
        // Prepare AJAX call to fetch workouts
        var queryURL = 'https://www.googleapis.com/youtube/v3/search?'
            + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
            + '&part=snippet'
            + '&type=video'
            + '&maxResults=50'
            + '&topicId=/m/027x7n'
            + '&order=' + sortQuery
            + '&q=workout,' + query;
        console.log(queryURL);
        // Create AJAX call for the specific search
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).done(function (response) {
            console.log(response);
            // If no results, show message
            if (response.pageInfo.totalResults === 0) {
                $('#workout-view').html('<div class="col-md-12 col-lg-12 mb-12 text-center">Sorry, no results! Try again.</div>');
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
                // Create function to Create workout divs
                var createWorkoutDiv = function (i, section) {
                    // Fetch video ID
                    var workoutId = response.items[i].id.videoId;
                    // Create workout div container
                    var workoutDiv = $('<div>').addClass('col-md-6 col-lg-4 mb-5');
                    // Create workout div content
                    var itemDiv = $('<div>').attr({
                        'id': workoutId,
                        'class': 'workout-item mx-auto'
                    });
                    // Create link for thumbnail image and title
                    var workoutLink = $('<a>').attr({
                        'href': 'https://www.youtube.com/watch?v=' + workoutId,
                        'target': '_blank'
                    });
                    // Fetch and display thumbnail
                    var thumbnail = response.items[i].snippet.thumbnails.medium.url;
                    var workoutImg = $('<img>').attr({
                        'src': thumbnail,
                        'class': 'workout-img'
                    });
                    // Fetch and display title
                    var title = $('<div>').addClass('item-title')
                        .text(response.items[i].snippet.title + ' ');
                    workoutLink.append(workoutImg, title);
                    // Fetch and display channel and like stats
                    var channel = $('<span class="channel">').text('by ' + response.items[i].snippet.channelTitle);
                    var like = $('<span class="like">').html(
                        `<i class="like-btn far fa-thumbs-up" workout-id="${workoutId}"></i>
                        <span id="${workoutId}-likes">0</span>`
                    );
                    // Fill workout div content
                    itemDiv.append(workoutLink, channel, like);
                    // Add div content to workout div container
                    workoutDiv.append(itemDiv);
                    // Add workout div to desired section
                    $(section).append(workoutDiv);
                    // Add workout ID to array for future usage (video API, video stats) 
                    workoutDivIds.push(workoutId);
                }
            };
            // Populate search results under Recommended Workouts (approved channels)
            if (approvedIndices.length > 0) {
                // Create recommended header                
                var workoutHeader = $('<h2>').addClass('page-section-heading text-center text-uppercase text-secondary mb-0')
                    .text('Recommended Workouts');
                $('#workout-header-rec').html(workoutHeader);
                // Call function to Create workout divs with relevant Indices and into desired section
                for (j = 0; j < approvedIndices.length; j++) {
                    createWorkoutDiv(approvedIndices[j], '#workout-view-rec');
                };
            };
            // Populate search results under Search Results (other channels, max results set in global variables)
            // Create search results header
            var workoutHeader = $('<h2>').addClass('page-section-heading text-center text-uppercase text-secondary mb-0')
                .text('Search Results');
            $('#workout-header').html(workoutHeader);
            // Call function to Create workout divs with relevant Indices and into desired section
            for (j = 0; j < maxResults; j++) {
                createWorkoutDiv(otherIndices[j], '#workout-view');
            };
            // Prepare AJAX call to fetch video stats
            var queryURLvideo = 'https://www.googleapis.com/youtube/v3/videos?'
                + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
                + '&id=' + workoutDivIds
                + '&part=snippet,contentDetails';
            console.log(queryURLvideo);
            // Fetch workout video stats
            $.ajax({
                url: queryURLvideo,
                method: 'GET'
            }).done(function (response) {
                console.log(response);
                // Fetch data for each workout video
                for (i = 0; i < response.items.length; i++) {
                    // Fetch video ID
                    var videoId = response.items[i].id;
                    // Fetch video duration and convert to user friendly display
                    var ytDuration = response.items[i].contentDetails.duration;
                    var duration = moment
                        .duration(ytDuration)
                        .format('h:mm:ss')
                        .padStart(4, '0:0');
                    // Add duration to each thumbnail
                    var durationDiv = $('<div>').addClass('ytd-thumbnail-overlay-time-status-renderer');
                    durationDiv.text(duration);
                    $(`#${videoId}`).append(durationDiv);
                };
            });
            // Retrieve Firebase data
            database.ref('/workouts').on('child_added', function (snapshot) {
                // Get snapshot data
                console.log(snapshot.val());
                var workoutId = snapshot.val().workoutId;
                var likeCount = snapshot.val().likeCount;
                // Display stats for each workout
                $(`#${workoutId}-likes`).text(likeCount);
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
            // Display Random WOD Generator for metcon
            if ($('#metcon').attr('data-state') === 'active') {
                // Create recommended header                
                var workoutHeader = $('<h2>').addClass('page-section-heading text-center text-uppercase text-secondary mb-0')
                    .text('Recommended Workouts');
                $('#workout-header-rec').html(workoutHeader);
                // Prepend WOD html to Recommended results
                $('#workout-view-rec').prepend($('#wod-item-template').html());
            }
        }).fail(function (response) {
            // Empty the contents of search results
            $('#workout-header-rec').empty();
            $('#workout-header').empty();
            $('#workout-view').empty();
            console.log(response);
            $('#workout-view').html('<div class="col-md-12 col-lg-12 mb-12 text-center">Error. Please try again later.</div>');
            console.log('GET failed!');
        });
    };

    // Create function to Fetch random WOD
    var generateWod = function () {
        fetch('https://dgurkaynak.github.io/wod-generator/data/wods.txt')
            .then(response => response.text())
            .then(data => {
                var wodArray = data.split('|');
                var i = Math.floor(Math.random() * wodArray.length);
                var wodContent = wodArray[i];
                wodContent = wodContent.replace(/\r\n/g, '<br>');
                $('#wod-text').html(wodContent);
            });
    }

    // Create function to Display and Increase like count
    var increaseLikes = function () {
        // Fetch current Like count
        var workoutId = $(this).attr('workout-id');
        var likeCount = $(`#${workoutId}-likes`).text();
        // Increase Like count by 1        
        likeCount++;
        console.log(workoutId);
        console.log(likeCount);
        // Update Firebase data
        database.ref('workouts/' + workoutId).update({
            workoutId,
            likeCount
        });
        // Display updated stats for workout
        $(`#${workoutId}-likes`).text(likeCount);
        // Disable like btn
        // Note: Will not persist disable if user refreshes search 
        $(`[workout-id='${workoutId}'`).removeClass("like-btn")
            .addClass("disabled");
    };

    // YOUTUBE API USER DISCLOSURE
    // ==================================================

    // Create function to Disable form submission, if user does not agree
    var validateForm = function () {
        'use strict';
        window.addEventListener('load', function () {
            // Fetch all forms
            var forms = document.getElementsByClassName('needs-validation');
            // Loop over them and prevent submission
            var validation = Array.prototype.filter.call(forms, function (form) {
                form.addEventListener('submit', function (event) {
                    if (form.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                        $('#user-agreement').modal('open');
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }, false);
    };

    // Initialize Modals
    $('#user-agreement').modal({
        'dismissible': false,
        'onCloseStart': validateForm()
    });
    $('#user-agreement').modal('open');

    // EXECUTE
    // ==================================================

    // Set click event listener to Execute filter / sort buttons
    $(document).on('click', '.filter-btn', createFilter);
    $(document).on('click', '.sort-btn', createSort);

    // Set click event listener to Execute search
    $('#submit-btn').on('click', displayWorkouts);

    // Set click event listener to Reset filters
    $('#reset-btn').on('click', resetFilters);

    // Set click event listener to Execute 'Like' button
    $(document).on('click', '.like-btn', increaseLikes);

    // Click event listener to Regenerate WOD
    $('#generate-wod').on('click', generateWod);

    // Calling the renderButtons function to display the intial buttons
    renderButtons('#workout-type-btns', workoutTypes, 'filter-btn');
    renderButtons('#muscle-group-btns', muscleGroups, 'filter-btn');
    renderButtons('#sort-by-btns', sortBy, 'sort-btn');

    // Execute Generate Quote function 
    generateQuote();

    // Execute Generate WOD function 
    generateWod();

});