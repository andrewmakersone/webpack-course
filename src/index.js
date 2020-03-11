import WebpackLogo from '@/assets/webpack-logo.png'
import axios from 'axios'
import './styles/styles.css'
import './styles/styles.scss'
import LiveWebRtcPlayer from './common/liveWebRtcPlayer'
import {
  CAMERAS_URL,
  CONNECTION_STATUS_ELEMENT_ID,
  LOG_LIST_ELEMENT_ID,
  PC_CONFIG,
  RETRIES,
  SDP_URL, SNAPSHOT_QUALITY, SNAPSHOT_URL,
  VIDEO_ELEMENT_ID
} from "@/common/config";

document.addEventListener("DOMContentLoaded", function () {

  const PC = new LiveWebRtcPlayer(PC_CONFIG, RETRIES, [
    VIDEO_ELEMENT_ID,
    VIDEO_ELEMENT_ID,
    CONNECTION_STATUS_ELEMENT_ID,
    LOG_LIST_ELEMENT_ID
  ]);

  console.log(PC);

  let cameras = [];
  let currentCamera = '123';
  let currentCameraSnapshot = '';
  let cameraName = '';
  let cameraId = Number((window.location.search).split("=")[1]);

  const fetchCameras = () => {
    axios.get(`${CAMERAS_URL}`)
      .then(response => {
        return response.data
      })
      .then((cameraList) => {
        let id = 1;
        let previewList = document.getElementsByTagName('img');
        let cc;
        for (let key in cameraList) {
          if (cameraList.hasOwnProperty(key)) {
            cameras.push({
              id: id,
              name: key,
              timestamp: cameraList[key],
              snapshot: `${SNAPSHOT_URL}/${key}/${SNAPSHOT_QUALITY}`,
            });
            previewList.item(id - 1).setAttribute('src', `${SNAPSHOT_URL}/${key}/${SNAPSHOT_QUALITY}`);
            id++;
          }
        }

        if (cameraId) {
          cc = cameras.find(camera => camera.id === cameraId);
          console.log(cc);
          window.location.search = `?camera=${cc.name}`;

        }
      })
      .catch(error => {
        console.log(error);
        return error
      });
  };

  // const setSnapshots = () => {
  //   let imgList = document.getElementsByTagName('img');
  //   // let q = cameraList.children;
  //   // console.log('q:', q);
  //   // console.log(cameraList);
  //   // for (let i = 0; i <= cameraList.length; i++) {
  //   for (let img of imgList) {
  //     console.log(img);
  //     img.setAttribute('src', cameras[i].snapshot)
  //     // console.log(cameraList.item(index));
  //     // cameraList.item(i).setAttribute('src', cameras[i].snapshot);
  //     // console.log(cameraList[i]);
  //   }
  // };

  cameraName = (window.location.search).split("=")[1];
  fetchCameras();
  // setSnapshots();

  async function startPlayer() {
    PC.startPlay(`${SDP_URL}/${cameraName}`, 1)
  }

  let btn = document.getElementById('button');
  if (btn) {
    btn.addEventListener('click', () => {
      startPlayer().catch(err => console.log(err));
    })
  }



});
