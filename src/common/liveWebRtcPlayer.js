import axios from 'axios'

export default class LiveWebRtcPlayer {
  constructor(config, retries, [videoElementId, playerStatusElementId, connectionStatusElementId, logListElementId]) {
    this._PC = new RTCPeerConnection(config);
    this._retries = retries;

    this._setVariables();
    this._setHtmlElements(videoElementId, playerStatusElementId, connectionStatusElementId, logListElementId);
    this._setDefaultsPlayerStatuses();
  }

  get getPC() {
    return this._PC
  }

  get getLogs() {
    return this._logs;
  }

  get getCurrentLog() {
    return this._logs[this._logs.length - 1];
  }

  startPlay(url, audio) {
    this._addListeners();
    this._setDefaultsPlayerStatuses();

    try {
      if (this._PC) {
        this._trace('Successfully created local peer connection object: _PC');
      }
    } catch (err) {
      this._trace(err);
      throw new Error('Creation of local peer connection is failed: ' + err);
    }

    let sdp = '';
    let iceCount = 0;
    let postTimer;
    let waitCandidateTime = 1000;

    this._setConnectionStatus("Controller request...");

    this.isPlayed = true;
    this.isConnecting = true;

    try {
      this._setConnectionStatus('Connection to the controller...');

      this._PC.onicecandidate = (event) => {
        this._trace('PC-1 ICE candidate data: \n' + (event.candidate ? event.candidate.candidate : '(null)'));

        if (event.candidate) {
          console.log('Sending ICE candidate', event.candidate.candidate);
          sdp = sdp + 'a=' + event.candidate.candidate + '\n';
          iceCount++;

          if (postTimer) {
            clearTimeout(postTimer);
          }

          // postTimer = this._postSdp(url, sdp, waitCandidateTime, 3);

          postTimer = setTimeout(() => {
            this._trace('Post sdp to url: ' + url);

            this._postSdp(url, sdp, this._retries)
          }, waitCandidateTime)
        }
      };

      this._PC.oniceconnectionstatechange = (event) => {
        this._trace('ICE state: ' + this._PC.iceConnectionState);
        console.log('ICE state change event: ', event);

        if (this._PC.iceConnectionState === 'connected') {
          this._setConnectionStatus('Controller connected, waiting for stream...');

          if (postTimer) {
            clearTimeout(postTimer);
          }

          this.playTimer = setTimeout(function () {
            // this._setConnectionStatus'Контроллер подключен, ожидание потока...<br>Вероятно данная камера не поддерживает современные кодеки.<br>Рекомендутеся <a href='?hash=' + camHash + '&compat=1'>попробовать режим совместимости</a>.');
          }, 30000);
        }
        if (this._PC.iceConnectionState === 'disconnected') {
          this._setConnectionStatus('Controller off', true);
        }
        if (this._PC.iceConnectionState === 'failed') {
          this._setConnectionStatus('Error communicating with the controller', true);
        }
      };

      this._trace('Starting call');

      this._PC.ontrack = (e) => {
        this._trace('GOT REMOTE STREAM!');

        if (this._remoteVideo.srcObject !== e.streams[0]) {
          this._remoteVideo.srcObject = e.streams[0];
          // remoteVideo.play();
          this._trace('PC received remote stream');
        }
      };

      this._PC.createOffer({offerToReceiveAudio: audio, offerToReceiveVideo: 1})
        .then((desc) => {
            // on success
            this._trace('audio is' + audio);
            this._trace('Offer from controller:\n' + desc.sdp);
            this._trace('PC1 setLocalDescription start');

            console.log('RTCSessionsDescriptionInit: ', desc);

            this._PC.setLocalDescription(desc)
              .then(() => {
                this._trace('setLocalDescription complete');
              })
              .catch((err) => {
                this._trace('Failed to set session description: ' + error.toString());
                this._setConnectionStatus(err, true);
                throw new Error(err);
              });

            sdp = sdp + desc.sdp;
          },
        );

    } catch (exception) {
      this._setConnectionStatus(exception, true);
      throw new Error(exception);
    }
  }

  stopPlay() {
    this._PC.close();
    console.log('>>> Closing WebRtc Peer Connection')
  }

  _setVariables() {
    this._logs = [];
    this.playTimer = 0;

    // this.scheduleCountdownTimer = 0;
    // this.retries = 0;
    // this.maxRetries = 3;
  }

  _setHtmlElements(videoElementId, playerStatusElementId, connectionStatusElementId, logListElementId) {
    this._remoteVideo = document.getElementById(videoElementId);
    this._connectionStatus = document.getElementById(connectionStatusElementId);
    this._playerStatus = document.getElementById(playerStatusElementId);
    this._logList = document.getElementById(logListElementId);

    // console.log(this._remoteVideo);
    // console.log(this._connectionStatus);
    // console.log(this._playerStatus);
    // console.log(this._logList);
  }

  _setDefaultsPlayerStatuses() {
    this.isPlayed = false;
    this.isConnecting = false;
    this.isConnected = false;
  }

  _addListeners() {
    this._remoteVideo.addEventListener('abort', (e) => {
      console.log('abort', e)
    }, true);
    this._remoteVideo.addEventListener('error', (e) => {
      console.log('error', e)
    }, true);
    this._remoteVideo.addEventListener('waiting', (e) => {
      console.log('waiting', e)
    }, true);
    this._remoteVideo.addEventListener('play', (e) => {
      console.log('play', e)
    }, true);
    this._remoteVideo.addEventListener('playing', (e) => {
      console.log('playing', e);
      this.isConnecting = false;
      this.isConnected = true;
      this._setConnectionStatus('Connection established');
    }, true);
    this._remoteVideo.addEventListener('pause', (e) => {
      console.log('pause', e)
    }, true);

    this._remoteVideo.setAttribute('autoplay', '');
  }

  _postSdp(url, sdp, retries) {
    axios(url, {method: 'POST', data: sdp, timeout: 5000})
      .then((response) => {
        console.log('GOT', response);

        let data = {type: 'answer', sdp: response.data};
        let desc = new RTCSessionDescription(data);

        this._trace('Answer from controller:\n' + desc.sdp);

        this._PC.setRemoteDescription(desc)
          .then(() => {
            this._trace('setRemoteDescription complete');
            this._setConnectionStatus('Received response from controller...');
          })
          .catch((err) => {
            this._trace('Failed to set session description: ' + err.toString());
            this._setConnectionStatus('Error communicating with the controller', true);
            throw new Error(err);
          })
      })
      .catch(err => {
        console.log(err);
        this._trace(err);
        if (retries) {
          setTimeout(() => {
            console.log('Retry to post sdp:', retries--);
            this._postSdp(url, sdp, retries--);
          }, 2000);
        } else {
          this._setConnectionStatus('Request failed. Error receiving data', true);
          throw new Error(err);
        }
      })
  }

  // _schedulePlay(ms) {
  //   this._cancelSchedule();
  //   if (this.retries++ > this.maxRetries) {
  //     return;
  //   }
  //   this.playTimer = setTimeout(this.startPlay, ms);
  //   this._connectionStatus.innerHTML = "Повтор через <span>" + (Math.round(ms / 1000) + "</span> секунд");
  //   this.scheduleCountdownTimer = setInterval(() => {
  //     // TODO check how it works?
  //     this._connectionStatus.innerHTML = this._connectionStatus.innerHTML - 1;
  //   }, 1000);
  // }

  // _cancelSchedule() {
  //   if (this.playTimer) {
  //     clearTimeout(this.playTimer);
  //   }
  //   if (this.scheduleCountdownTimer) {
  //     clearInterval(this.scheduleCountdownTimer);
  //   }
  // }

  _trace(log) {
    let time = (window.performance.now() / 1000).toFixed(3);
    if (!this._logList) {
      console.log(`${time}: ${log}`);
    } else {
      if (log) {
        this._logs.push(`${time}: ${log}`);
        if (this._logs.length) {
          this._logList.lastElementChild.scrollIntoView();
        }
      }
    }
  }

  _setConnectionStatus(message, isError) {
    this._connectionStatus.innerHTML = message;
    console.info('>>> ' + message);
    if (isError) {
      this.isConnecting = false;
      // this._schedulePlay(5000);
    }
  }
}
