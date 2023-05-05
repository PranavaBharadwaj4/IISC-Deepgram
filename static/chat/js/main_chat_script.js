var textTranscription = ""
var mediaRecorder
var l=0
var end = false

            
//this is the pause function that handles voice recording and sending.
function detectSilence(stream, onSoundEnd =_=>{}, onSoundStart =_=>{}, silence_delay = 2000, min_decibels = -80) {
    mediaRecorder = new MediaStreamRecorder(stream);

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const streamNode = ctx.createMediaStreamSource(stream);
    streamNode.connect(analyser);
    analyser.minDecibels = min_decibels;
    
    const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
    let silence_start = performance.now();
    let triggered = false; // trigger only once per silence event
    console.log(end)
    function loop(time) {
    console.log(++l)
    if(!end){
        requestAnimationFrame(loop);
     } // we'll loop every 60th of a second to check
        analyser.getByteFrequencyData(data); // get current data
        if (data.some(v => v)) { // if there is data above the given db limit
        if(triggered && !end){
            triggered = false;
            onSoundStart(stream);

            }
        silence_start = time; // set it to now
        }
        if (!triggered && time - silence_start > silence_delay) {
        onSoundEnd();
        triggered = true;
        }
        
    }

        loop();
    
    document.querySelector('#stop-recording').disabled = false;
    document.querySelector('#pause-recording').disabled = false;
    document.querySelector('#save-recording').disabled = false;
}
    
function onSilence(mediaRecorder) {
    textTranscription += 'silence\n';
    console.log("silence")
    if(mediaRecorder != undefined){

        mediaRecorder.stop();
        mediaRecorder.stream.stop();
    }
    // consx

    while (audiosContainer.firstChild) {
        audiosContainer.removeChild(audiosContainer.firstChild);
    }

    document.querySelector('#pause-recording').disabled = true;
    document.querySelector('#start-recording').disabled = false;

}


function onSpeak(stream) {

    textTranscription += 'speaking\n';
    console.log("sound");
    var audio = document.createElement('audio');

    audio = mergeProps(audio, {
        controls: true,
        muted: true
    });
    audio.srcObject = stream;
    audio.play();

    audiosContainer.appendChild(audio);
    audiosContainer.appendChild(document.createElement('hr'));

    mediaRecorder.stream = stream;


    mediaRecorder.recorderType = StereoAudioRecorder;
    mediaRecorder.mimeType = 'audio/wav';


    // don't force any mimeType; use above "recorderType" instead.
    // mediaRecorder.mimeType = 'audio/webm'; // audio/ogg or audio/wav or audio/webm

    mediaRecorder.audioChannels = true;
        mediaRecorder.ondataavailable = function(blob) {
        if(end){
            return;
        }
        var a = document.createElement('a');
        a.target = '_blank';
        a.innerHTML = 'Open Recorded Audio No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') Time Length: ' + getTimeLength(timeInterval);

        a.href = URL.createObjectURL(blob);

        // {#audiosContainer.appendChild(a);#}
        // {#audiosContainer.appendChild(document.createElement('hr'));#}

            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                
                return cookieValue;
            }
            
            var csrftoken = getCookie('csrftoken');
            console.log("posting")
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'upload/', true);
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
            xhr.setRequestHeader("MyCustomHeader", "Put anything you need in here, like an ID");
            xhr.send(blob);
        }
        var timeInterval = 10000;
        if (timeInterval) timeInterval = parseInt(timeInterval);
        else timeInterval = 5 * 1000;
        mediaRecorder.start();
}

function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

var mediaConstraints = {
    audio: true
};

document.querySelector('#start-recording').onclick = function() {
    this.disabled = true;
    end=false
    navigator.mediaDevices.getUserMedia({
        audio: true
      })
      .then(stream => {
        detectSilence(stream, onSilence, onSpeak, 2000, -50);
        // do something else with the stream
      }).catch(e=>console.log(e));
};

document.querySelector('#stop-recording').onclick = function() {
    this.disabled = true;
    end=true
    mediaRecorder.stop();
    mediaRecorder.stream.stop();

    while (audiosContainer.firstChild) {
        audiosContainer.removeChild(audiosContainer.firstChild);
    }

    document.querySelector('#pause-recording').disabled = true;
    document.querySelector('#start-recording').disabled = false;
};

document.querySelector('#pause-recording').onclick = function() {
    this.disabled = true;
    mediaRecorder.pause();

    document.querySelector('#resume-recording').disabled = false;
};

document.querySelector('#resume-recording').onclick = function() {
    this.disabled = true;
    mediaRecorder.resume();

    document.querySelector('#pause-recording').disabled = false;
};


function onMediaError(e) {
    console.error('media error', e);
}

var audiosContainer = document.getElementById('audios-container');
var index = 1;


//helper functions

// below function via: http://goo.gl/B3ae8c
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

// below function via: http://goo.gl/6QNDcI
function getTimeLength(milliseconds) {
    var data = new Date(milliseconds);
    return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";
}
window.onbeforeunload = function() {
    document.querySelector('#start-recording').disabled = false;
}
