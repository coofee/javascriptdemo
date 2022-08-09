let processor = {
  timerCallback: function () {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    let self = this;
    setTimeout(function () {
      self.timerCallback();
    }, 0);
  },

  doLoad: function () {
    this.video = document.getElementById("video");

    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");

    this.c2 = document.getElementById("c2");
    this.ctx2 = this.c2.getContext("2d");

    let self = this;
    this.video.addEventListener("play", function () {
      self.width = self.video.videoWidth / 2;
      self.height = self.video.videoHeight / 2;
      self.timerCallback();
    }, false);
  },

  computeFrame: function () {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
    let l = frame.data.length / 4;

    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];
      if (g > 100 && r > 100 && b < 43)
        frame.data[i * 4 + 3] = 0;
    }

    this.ctx2.putImageData(frame, 0, 0);
    return;
  }
};


let recorder = {
  doLoad: function() {
    document.getElementById('start_record').addEventListener('click', (event) => {
      this.start()
    })
    document.getElementById('stop_record_and_download').addEventListener('click', (event) => {
      this.download()
    })

    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");
  },

  start: function() {
    if (!this.recorder) {

      // 转录video视频流
      let video = document.getElementById("video");
      let stream = video.captureStream(60)

      // 转录canvas视频流
      // let stream = c1.captureStream(60)
      // console.log('stream=' + stream)
      this.recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=h264" })
      this.recordedChunks = [];

      this.recorder.ondataavailable = event => {
        console.log('recv recorder data...')
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }
      this.recorder.onstart = event => {
        console.log(`recorder onstart ${event}`)
      }
      this.recorder.onresume = event => {
        console.log(`recorder onresume ${event}`)
      }
      this.recorder.onpause = event => {
        console.log(`recorder onpause ${event}`)
      }
      this.recorder.onstop = event => {
        console.log(`recorder onstop ${event}`)
      }
      this.recorder.onerror = event => {
        console.log(`recorder error ${event}`)
      }
    }

    let recorderState = this.recorder.state
    if (recorderState == 'recording') {
      return
    }  

    console.log('start recorder...')
    if (recorderState === 'paused') {
      this.recorder.resume()
    } else {
      this.recordedChunks = [];
      this.recorder.start()
    }
  },

  stop: function() {
    if (this.recorder.state != 'inactive') {
      console.log('stop recorder.')
      this.recorder.stop()
    }
  },

  download: function() {
    console.log('try stop recorder video....')
    this.stop()

    setTimeout(() => {
      console.log('dowload recorder video.')
      let blob = new Blob(this.recordedChunks, { type: "video/webm" });
      let videoUrl = URL.createObjectURL(blob);
      var link = document.createElement('a')
      link.download =['video_', (new Date() + '').slice(4, 28), '.webm'].join('')
      link.href = videoUrl
      link.click()
    }, 100);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  processor.doLoad();
  recorder.doLoad();
});