// OPEN BUGS
// [] fix youtube video responsive width

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
            optTerm: 'core,abs'
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

    // Function to display search results when button is clicked
    function displayWorkouts() {
        // Reset search results
        $('#workout-header-rec').empty();
        $('#workout-header').empty();
        $('#workout-view-rec').empty();
        $('#workout-view').empty();
        approvedIndices = [];
        otherIndices = [];

        // Display Random WOD Generator for metcon
        if ($('#metcon').attr('data-state') === 'active') {
            $('#workout-header-rec').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Recommended Workouts</h2>');
            $('#workout-view-rec').append($('#wod-item-template').html());
        }

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

                // Create workout div for approved channels
                if (approvedIndices.length > 0) {
                    // Create recommended header                
                    $('#workout-header-rec').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Recommended Workouts</h2>');
                    for (j = 0; j < approvedIndices.length; j++) {
                        var i = approvedIndices[j];
                        // Create workout div
                        workoutDiv = $('<div class="col-md-6 col-lg-4 mb-5">');
                        var title = $('<div class="item-title">').text(response.items[i].snippet.title + ' ');
                        var channel = $('<p class="small">').text('by ' + response.items[i].snippet.channelTitle);
                        var thumbnail = response.items[i].snippet.thumbnails.medium.url;
                        var thumbnailDiv = $('<div>').attr({
                            'id': response.items[i].id.videoId
                        });
                        var workoutItem = $('<img>').attr({
                            'src': thumbnail,
                            'class': 'workout-item'
                        });
                        thumbnailDiv.append(workoutItem);

                        // Append the new search results
                        var workoutLink = $('<a>').attr({
                            'href': 'https://www.youtube.com/watch?v=' + response.items[i].id.videoId,
                            'target': '_blank'
                        });
                        workoutLink.append(thumbnailDiv, title, channel);
                        workoutDiv.append(workoutLink);
                        $('#workout-view-rec').append(workoutDiv);

                        // Add channel ID to array
                        workoutDivIds.push(response.items[i].id.videoId)
                    }
                };

                // Display max 9 other workouts
                for (k = 0; k < maxResults; k++) {
                    // Create search results header
                    $('#workout-header').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Search Results</h2>');
                    var i = otherIndices[k];
                    // Create workout div
                    workoutDiv = $('<div class="col-md-6 col-lg-4 mb-5">');
                    var title = $('<div class="item-title">').text(response.items[i].snippet.title + ' ');
                    var channel = $('<p class="small">').text('by ' + response.items[i].snippet.channelTitle);
                    var thumbnail = response.items[i].snippet.thumbnails.medium.url;
                    var thumbnailDiv = $('<div>').attr({
                        'id': response.items[i].id.videoId
                    });
                    var workoutItem = $('<img>').attr({
                        'src': thumbnail,
                        'class': 'workout-item'
                    });
                    thumbnailDiv.append(workoutItem);

                    // Append the new search results
                    var workoutLink = $('<a>').attr({
                        'href': 'https://www.youtube.com/watch?v=' + response.items[i].id.videoId,
                        'target': '_blank'
                    });
                    workoutLink.append(thumbnailDiv, title, channel);
                    workoutDiv.append(workoutLink);
                    $('#workout-view').append(workoutDiv);

                    // Add channel ID to array
                    workoutDivIds.push(response.items[i].id.videoId)

                };

                console.log('approved: ' + approvedIndices.length)
                console.log('other: ' + otherIndices.length)

                // Fetch workout video stats
                var queryURLvideo = 'https://www.googleapis.com/youtube/v3/videos?'
                    + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
                    + '&id=' + workoutDivIds
                    + '&part=snippet,contentDetails'

                console.log(queryURLvideo)

                $.ajax({
                    url: queryURLvideo,
                    method: 'GET'
                }).done(function (response) {
                    console.log(response)

                    // Fetch data for each workout video
                    for (i = 0; i < response.items.length; i++) {
                        var videoId = response.items[i].id;
                        var ytDuration = response.items[i].contentDetails.duration;
                        var duration = moment
                            .duration(ytDuration)
                            .format('h:mm:ss')
                            .padStart(4, '0:0');
                        console.log(ytDuration);
                        console.log(duration);

                        // Add duration to each thumbnail
                        var durationDiv = $('<div class="ytd-thumbnail-overlay-time-status-renderer">');
                        durationDiv.text(duration);
                        $(`#${videoId}`).append(durationDiv);
                    }



                    // Advanced feature: filter by tags
                    // var tagURL = 'https://www.googleapis.com/youtube/v3/videos?'
                    // + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
                    // + '&part=snippet'
                    // + '&id=' + response.items[i].id.videoId;
                    // console.log(tagURL)

                });
            };

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

    // Click event listener to regenerate WOD
    $('#generate-wod').on('click', generateWod);

    // Calling the renderButtons function to display the intial buttons
    renderButtons();

    generateWod();

});