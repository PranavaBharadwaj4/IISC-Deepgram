//Uses deeprgrams live transcription model to convert speech to text.
var mediaRecorder
DEEPGRAM_API_KEY = 'a54c31499dde506264b9dcbd795c9a0d8c54da20'



document.querySelector('#start-recording').onclick = function() {
    document.querySelector('#stop-recording').disabled=false;
    this.disabled = true;
    
    
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        console.log({ stream })
        if (!MediaRecorder.isTypeSupported('audio/webm'))
          return alert('Browser not supported')
         mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })
        //I have added the punctuation option, default use case endpoint is 'wss://api.deepgram.com/v1/listen'
        const socket = new WebSocket('wss://api.deepgram.com/v1/listen?punctuate=true', [
          'token',
          DEEPGRAM_API_KEY,
        ])
        socket.onopen = () => {
          document.querySelector('#status').textContent = 'Connected'
          console.log({ event: 'onopen' })
          mediaRecorder.addEventListener('dataavailable', async (event) => {
            if (event.data.size > 0 && socket.readyState == 1) {
              socket.send(event.data)
            }
          })
          mediaRecorder.start(1000)
        }

        socket.onmessage = (message) => {
          const received = JSON.parse(message.data)
          const transcript = received.channel.alternatives[0].transcript
          if (transcript && received.is_final) {
            console.log(transcript)
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
            xhr.send(transcript);
            document.querySelector('#transcript').textContent +=
              transcript + ' '
          }
        }

        socket.onclose = () => {
          console.log({ event: 'onclose' })
        }

        socket.onerror = (error) => {
          console.log({ event: 'onerror', error })
        }
      })
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
function onMediaError(e) {
    console.error('media error', e);
}

var audiosContainer = document.getElementById('audios-container');
var index = 1;
