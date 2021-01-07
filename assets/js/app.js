// Remaining TO DO
// [] Replace &amp; to &
// [] Refactor UI code

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
            optTerm: 'upper+body,arms,shoulders'
        },
        {
            term: 'lower',
            optTerm: 'lower+body,glutes,legs'
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

    // Define variables to set up Query
    var maxResults = 9;
    var query = [];
    var sortQuery = 'relevance';

    // Define variables to Display Results
    var workoutIndices = {
        'rec': [],
        'other': []
    };
    var workoutDivIds = {
        'rec': [],
        'other': []
    };

    // Define variables to Sort by Duration
    //// Selected sort order (default, asc, desc)
    var durationSortSelection = '';
    //// Duration of each video, in default sort order
    var videoDurationsDefault = {
        'rec': [{ workoutId: '', seconds: '' }],
        'other': [{ workoutId: '', seconds: '' }]
    };
    //// Duration of each video
    var videoDurations = {
        'rec': [{ workoutId: '', seconds: '' }],
        'other': [{ workoutId: '', seconds: '' }]
    };
    //// Array of video durations in seconds, to be sorted
    var durationOrder = {
        'rec': [],
        'other': []
    };
    //// Final sorted output of workout ids
    var orderOfVideos = {
        'rec': [{ workoutId: '', seconds: '' }],
        'other': [{ workoutId: '', seconds: '' }]
    };

    // FIREBASE
    // ==================================================

    // Initialize Firebase configuration
    var firebaseConfig = {
        apiKey: "",
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
    // Firebase Authentication
    firebase.auth().signInAnonymously()
        .then(() => {
            // Signed in..
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            var uid = user.uid;
            // ...
        } else {
            // User is signed out
            // ...
        }
    });

    // FirebaseUI config.
    var uiConfig = {
        signInSuccessUrl: '../index.html',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            // firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ]
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        // tosUrl: '<your-tos-url>',
        // Privacy policy url/callback.
        // privacyPolicyUrl: function () {
        //     window.location.assign('<your-privacy-policy-url>');
        // }
    };

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

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
            var removeTerm = query.indexOf(searchTerm);
            if (query.indexOf(searchTerm) !== -1) {
                query.splice(removeTerm, 1)
            };
        };
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
    };

    // Create function to Reset filters
    var resetFilters = function () {
        // Reset buttons
        $('.filter-btn').attr('data-state', 'inactive')
            .removeClass('active');
        $('.sort-btn').attr('data-state', 'inactive')
            .removeClass('active');
        $('.sort-btn[defaultId=0]').attr('data-state', 'active')
            .addClass('active');
        // Reset queries
        query = [];
        sortQuery = 'relevance';
    };

    // POST-SEARCH FUNCTIONS
    // ==================================================

    // Create function to Prepare duration sorting
    var sortDuration = function (array, order, key) {
        array.sort(function (a, b) {
            var A = a[key], B = b[key];
            if (order.indexOf(A) > order.indexOf(B)) {
                return 1;
            } else {
                return -1;
            }
        });
        return array;
    }

    // Create function to Apply Duration Sort when Apply button is clicked
    var applyDurationSort = function (section) {
        // Determine which option user selected (default, asc, desc)
        $('select').formSelect(); // Workaround for Materialize bug: must re-initialize form to fetch current selection
        durationSortSelection = $('#duration-sort-selection').formSelect('getSelectedValues').toString();

        // Sort videos
        if (durationSortSelection === 'asc') {
            // Sort array of seconds (durationOrder) ascending
            durationOrder[section].sort(function (a, b) { return a - b });
            // Order videoDurations array based on order of durationOrder array
            orderOfVideos[section] = sortDuration(videoDurations[section], durationOrder[section], 'seconds');
        }
        else if (durationSortSelection === 'desc') {
            // Sort array of seconds (durationOrder) descending
            durationOrder[section].sort(function (a, b) { return b - a });
            // Order videoDurations array based on order of durationOrder array
            orderOfVideos[section] = sortDuration(videoDurations[section], durationOrder[section], 'seconds');
        }
        else {
            // Maintain original sort
            orderOfVideos[section] = videoDurationsDefault[section];
        };

        // Execute function to Sort duration
        for (i = 0; i < workoutIndices[section].length; i++) {
            var workoutId = orderOfVideos[section][i].workoutId;
            $(`[position-id='${i}-${section}'`).prepend($(`#${workoutId}`));
        };
    };

    // Create function to Display search results when Search button is clicked
    var displayWorkouts = function () {
        // Display loading icon
        $('#preloader').removeClass('hide');

        // Reset search results
        $('#workout-header-rec').empty();
        $('#workout-header').empty();
        $('#workout-view-rec').empty();
        $('#workout-view').empty();
        $("#duration-sort-selection").val('none').change();
        $('select').formSelect(); // Workaround for Materialize bug: must re-initialize form to fetch current selection

        workoutIndices = { 'rec': [], 'other': [] };
        workoutDivIds = { 'rec': [], 'other': [] };
        durationOrder = { 'rec': [], 'other': [] };
        videoDurationsDefault = { 'rec': [], 'other': [] };
        videoDurations = { 'rec': [], 'other': [] };
        orderOfVideos = { 'rec': [], 'other': [] };
        durationSortSelection = '';

        // Prepare AJAX call to fetch workouts
        var queryURL = 'https://www.googleapis.com/youtube/v3/search?'
            + 'key='
            + '&part=snippet'
            + '&type=video'
            + '&maxResults=50'
            + '&topicId=/m/027x7n'
            + '&order=' + sortQuery
            + '&q=workout,' + query;
        // Create AJAX call for the specific search
        $.ajax({
            url: queryURL,
            method: 'GET',
        }).done(function (response) {
            // console.log(response);
            // Hide loading icon
            $('#preloader').addClass('hide');
            // Display Duration Sort element
            $('#duration-sort-html').removeClass('hide');
            // If no results, show message
            if (response.items.length === 0) {
                $('#workout-view').html('<div class="col-md-12 col-lg-12 mb-12 text-center">Sorry, no results! Try again.</div>');
            }
            // If results exist, populate search results
            else {
                // Fetch workout data for all results
                for (i = 0; i < response.items.length; i++) {
                    // Identify workouts from approved channels
                    var channelId = response.items[i].snippet.channelId;
                    var workoutId = response.items[i].id.videoId;
                    var approvedChannel = approvedChannels.findIndex(approve => approve === channelId)
                    if (approvedChannel !== -1) {
                        // If workout is from approved channel, push index and workout id into rec array
                        // Index will be used to fetch content for workout divs; Id will be used for video API call
                        workoutIndices.rec.push(i);
                        workoutDivIds.rec.push(workoutId);
                    }
                    else {
                        // If workout is from other channels and less than max # of results, push index and workout id into other array
                        // (max results set in global variables)
                        if (workoutIndices.other.length < 9) {
                            workoutIndices.other.push(i);
                            workoutDivIds.other.push(workoutId);
                        }
                    }
                };
                // Create function to Create workout divs
                //// i = index; div = rec or other div section; position = initial sort order; section = rec or other 
                var createWorkoutDiv = function (i, div, position, section) {
                    // Fetch video ID
                    var workoutId = response.items[i].id.videoId;
                    // Create workout div container
                    var workoutDiv = $('<div>').addClass('col-md-6 col-lg-4 mb-5')
                        .attr('position-id', `${position}-${section}`);
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
                    var channel = $('<span>').addClass('channel')
                        .text('by ' + response.items[i].snippet.channelTitle);
                    var like = $('<span>').addClass('like')
                        .html(`
                        <button class="like-btn" workout-id="${workoutId}">
                        <i class="far fa-thumbs-up"></i>
                        <span id="${workoutId}-likes">0</span>
                        </button>
                        `);
                    // Fill workout div content
                    itemDiv.append(workoutLink, channel, like);
                    // Add div content to workout div container
                    workoutDiv.append(itemDiv);
                    // Add workout div to desired section
                    $(div).append(workoutDiv);
                }
            };
            // Populate search results under Recommended Workouts (approved channels)
            if (workoutIndices.rec.length > 0) {
                // Create recommended header
                var workoutHeader = $('<h2>').addClass('page-section-heading text-center text-uppercase text-secondary mb-0')
                    .text('Recommended Workouts');
                $('#workout-header-rec').html(workoutHeader);
                // Call function to Create workout divs with relevant Indices and into Rec'd Workouts section
                for (j = 0; j < workoutIndices.rec.length; j++) {
                    // Parameters: index, div section, position, section 
                    createWorkoutDiv(workoutIndices.rec[j], '#workout-view-rec', j, 'rec');
                };
            };
            // Populate search results under Search Results (other channels, max results set in global variables)
            // Create search results header
            var workoutHeader = $('<h2>').addClass('page-section-heading text-center text-uppercase text-secondary mb-0')
                .text('Search Results');
            $('#workout-header').html(workoutHeader);
            // Call function to Create workout divs with relevant Indices and into Search Results section
            for (j = 0; j < maxResults && j < workoutIndices.other.length; j++) {
                // Parameters: index, div section, position, section 
                createWorkoutDiv(workoutIndices.other[j], '#workout-view', j, 'other');
            };
            // Create function to Execute AJAX call to fetch video stats
            var fetchVideoStats = function (workoutIds, section) {
                var queryURLvideo = 'https://www.googleapis.com/youtube/v3/videos?'
                    + 'key='
                    + '&id=' + workoutIds
                    + '&part=snippet,contentDetails';
                // Fetch workout video stats
                $.ajax({
                    url: queryURLvideo,
                    method: 'GET',
                }).done(function (response) {
                    // console.log(response);
                    // Fetch data for each workout video
                    for (i = 0; i < response.items.length; i++) {
                        // Fetch video ID
                        var workoutId = response.items[i].id;
                        // Fetch video duration and convert to user friendly display
                        var ytDuration = response.items[i].contentDetails.duration;
                        var duration = moment.duration(ytDuration)
                            .format('h:mm:ss')
                            .padStart(4, '0:0');
                        // Add duration to each thumbnail
                        var durationDiv = $('<div>').addClass('ytd-thumbnail-overlay-time-status-renderer');
                        durationDiv.text(duration);
                        $(`#${workoutId}`).append(durationDiv);
                        // Convert duration to seconds for duration sorting
                        var mjSeconds = moment.duration(ytDuration)
                            .format('ss');
                        var durationSeconds = parseInt(mjSeconds.replace(/,/g, ''), 10);
                        // Push each video stat to videoDuration arrays
                        videoDurationsDefault[section].push({
                            workoutId: workoutId,
                            seconds: durationSeconds
                        });
                        videoDurations[section].push({
                            workoutId: workoutId,
                            seconds: durationSeconds
                        });
                        // Push durations into durationOrder array to be sorted
                        durationOrder[section].push(durationSeconds);
                    };
                }).fail(function (response) {
                    console.log('GET failed for video stats!');
                    console.log(response);
                    // Hide loading icon
                    $('#preloader').addClass('hide');
                });
            };
            // Execute function to Fetch video stats for Rec'd and Other workouts
            fetchVideoStats(workoutDivIds.rec, 'rec');
            fetchVideoStats(workoutDivIds.other, 'other');
            // Retrieve Firebase data
            database.ref('/workouts').on('child_added', function (snapshot) {
                // Get snapshot data
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
            };
        }).fail(function (response) {
            console.log('GET failed for initial search!');
            console.log(response);
            // Hide loading icon
            $('#preloader').addClass('hide');
            // Empty the contents of search results
            $('#workout-header-rec').empty();
            $('#workout-header').empty();
            $('#workout-view').empty();
            $('#workout-view').html('<div class="col-md-12 col-lg-12 mb-12 text-center">Error. Please try again later.</div>');
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
                        // event.preventDefault();
                        // event.stopPropagation();
                        $('#user-agreement').modal('open');
                    }
                    else {
                        $('#user-agreement').modal('close');
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }, false);
    };

    // Initialize Modals
    $('#user-agreement').modal({
        'dismissible': false,
    });
    $('#user-agreement').modal('open');

    // EXECUTE
    // ==================================================

    // Set click event listener to Execute filter / sort buttons
    $(document).on('click', '.filter-btn', createFilter);
    $(document).on('click', '.sort-btn', createSort);

    // Set click event listener to Execute search
    $('#search-btn').on('click', displayWorkouts);

    // Set click event listener to Reset filters
    $('#reset-btn').on('click', resetFilters);

    // Set click event listener to Execute 'Like' button
    $(document).on('click', '.like-btn', increaseLikes);

    // Set click event listener to Regenerate WOD
    $('#generate-wod').on('click', generateWod);

    // Set click event listener to Retrieve Duration Sort
    $('#apply-btn').on('click', function () {
        applyDurationSort('rec');
        applyDurationSort('other');
    })

    // Execute Validate User Agreement
    validateForm();

    // Execute renderButtons function to display the intial buttons
    renderButtons('#workout-type-btns', workoutTypes, 'filter-btn');
    renderButtons('#muscle-group-btns', muscleGroups, 'filter-btn');
    renderButtons('#sort-by-btns', sortBy, 'sort-btn');

    // Execute Generate Quote function 
    generateQuote();

    // Execute Generate WOD function 
    generateWod();

    // Initialize Duration Sort drop down
    $('select').formSelect();

});
