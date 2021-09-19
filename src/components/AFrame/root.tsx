//@ts-nocheck
import "aframe";
import "aframe-physics-system";

import { DeepstreamClient } from "@deepstream/client";
import { useEffect, useRef, useState } from "react";
import { customAlphabet } from "nanoid";
import Assets from "./Assets";
// @ts-ignore
import { Entity } from "aframe-react";

function Root() {
  const [avatars, setAvatars] = useState({});

  function createAvatar(id, position, rotation) {
    var newBox = document.createElement("a-box");
    newBox.setAttribute("position", position);
    newBox.setAttribute("rotation", rotation);

    //compute and assign position values to other parts of the avatar
    //wrt the box
    var leye = document.createElement("a-entity");
    leye.setAttribute("mixin", "eye");
    var reye = document.createElement("a-entity");
    reye.setAttribute("mixin", "eye");

    var lpupil = document.createElement("a-entity");
    lpupil.setAttribute("mixin", "pupil");
    var rpupil = document.createElement("a-entity");
    rpupil.setAttribute("mixin", "pupil");

    var larm = document.createElement("a-entity");
    larm.setAttribute("mixin", "arm");
    var rarm = document.createElement("a-entity");
    rarm.setAttribute("mixin", "arm");

    var x = position.x;
    var y = position.y - 1.6;
    var z = position.z;

    var leyex = x + 0.25;
    var leyey = y + 0.2;
    var leyez = z - 0.6;

    var reyex = x - 0.25;
    var reyey = y + 0.2;
    var reyez = z - 0.6;

    var lpx = x + 0.25;
    var lpy = y + 0.2;
    var lpz = z - 0.8;

    var rpx = x - 0.25;
    var rpy = y + 0.2;
    var rpz = z - 0.8;

    leye.setAttribute("position", leyex + " " + leyey + " " + leyez);
    leye.setAttribute("id", "leye" + id);
    reye.setAttribute("position", reyex + " " + reyey + " " + reyez);
    reye.setAttribute("id", "reye" + id);

    lpupil.setAttribute("position", lpx + " " + lpy + " " + lpz);
    lpupil.setAttribute("id", "lpupil" + id);
    rpupil.setAttribute("position", rpx + " " + rpy + " " + rpz);
    rpupil.setAttribute("id", "rpupil" + id);

    var larmx = x - 0.5;
    var larmy = y - 1.8;
    var larmz = z;

    var rarmx = x + 0.5;
    var rarmy = y - 1.8;
    var rarmz = z;

    larm.setAttribute("position", larmx + " " + larmy + " " + larmz);
    larm.setAttribute("id", "larm" + id);
    larm.setAttribute("rotation", "0 0 -10");
    rarm.setAttribute("position", rarmx + " " + rarmy + " " + rarmz);
    rarm.setAttribute("id", "rarm" + id);
    rarm.setAttribute("rotation", "0 0 10");

    //wrap the whole avatar inside a single entity
    var avatarRoot = document.createElement("a-entity");
    avatarRoot.appendChild(newBox);
    avatarRoot.appendChild(leye);
    avatarRoot.appendChild(reye);
    avatarRoot.appendChild(lpupil);
    avatarRoot.appendChild(rpupil);
    avatarRoot.appendChild(larm);
    avatarRoot.appendChild(rarm);

    var scene = document.getElementById("scene");
    scene.appendChild(avatarRoot);

    avatars[id] = avatarRoot;
  }

  useEffect(() => {
    const camera = document.getElementById("camera");
    const client = new DeepstreamClient("116.193.190.143:6020");
    const id = customAlphabet(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      16
    )();

    const handleSubscriptions = (user: string) => {
      const record = client.record.getRecord("user/" + user);
      record.whenReady(() => {
        const state = record.get("state");
        if (state?.position && state?.rotation) {
          createAvatar(user, state.position, state.rotation);
        }
        record.subscribe("state", () => {
          const state = record.get("state");
          if (!avatars[user]) {
            createAvatar(user, state.position, state.rotation);
          } else {
            avatars[user].setAttribute("position", {
              x: state.position?.x,
              y: state.position?.y - 1.6,
              z: state.position?.z,
            });
            avatars[user].setAttribute("rotation", state.rotation);
          }
        });
      });
    };

    client.login({ username: id }, (success, data) => {
      if (success) {
        const userInfo = client.record.getRecord("user/" + id);
        userInfo.whenReady(() => {
          setInterval(() => {
            const position = camera?.getAttribute("position");
            const rotation = camera?.getAttribute("rotation");
            userInfo.set({
              state: {
                position: {
                  x: position.x,
                  y: position.y,
                  z: position.z,
                },
                rotation: {
                  x: rotation.x,
                  y: rotation.y,
                  z: rotation.z,
                },
              },
            });
          }, 75);
        });

        client.presence.getAll((_, query) => {
          query?.forEach((uid) => {
            if (uid !== id) {
              handleSubscriptions(uid);
            }
          });
        });

        client.presence.subscribe((user, online) => {
          if (online) {
            handleSubscriptions(user);
          } else {
            var scene = document.getElementById("scene");
            scene.removeChild(avatars[user]);
            client.record.getRecord("user/" + user).delete();
          }
        });
      }
    });
  }, []);

  return (
    <>
      <a-assets>
        <img
          id="pink"
          src="https://img.gs/bbdkhfbzkk/stretch/http://i.imgur.com/1hyyIUi.jpg"
          crossorigin="anonymous"
        />
        <img
          src="https://img.gs/bbdkhfbzkk/stretch/https://i.imgur.com/25P1geh.png"
          id="grid"
          crossorigin="anonymous"
        />
        <img
          src="https://img.gs/bbdkhfbzkk/2048x1024,stretch/http://i.imgur.com/WMNH2OF.jpg"
          id="chrome"
          crossorigin="anonymous"
        />
        <img
          id="sky"
          src="https://img.gs/bbdkhfbzkk/2048x2048,stretch/http://i.imgur.com/WqlqEkq.jpg"
          crossorigin="anonymous"
        />

        <a-asset-item
          id="dawningFont"
          src="https://cdn.glitch.com/c719c986-c0c5-48b8-967c-3cd8b8aa17f3%2FdawningOfANewDayRegular.typeface.json?1490305922844"
        ></a-asset-item>
        <a-asset-item
          id="exoFont"
          src="https://cdn.glitch.com/c719c986-c0c5-48b8-967c-3cd8b8aa17f3%2Fexo2Black.typeface.json?1490305922150"
        ></a-asset-item>
        <a-asset-item
          id="exoItalicFont"
          src="https://cdn.glitch.com/c719c986-c0c5-48b8-967c-3cd8b8aa17f3%2Fexo2BlackItalic.typeface.json?1490305922725"
        ></a-asset-item>
        <a-asset-item id="glbtestmodel" src="/cudillero.glb"></a-asset-item>

        <a-mixin
          id="eye"
          geometry="primitive: sphere; radius: 0.2"
          material="shader: flat; side: double; color: #FFF"
        ></a-mixin>
        <a-mixin
          id="pupil"
          geometry="primitive: sphere; radius: 0.05"
          material="shader: flat; side: double; color: #222"
        ></a-mixin>
        <a-mixin
          id="arm"
          geometry="primitive: box; depth: 0.2; height: 1.5; width: 0.2"
          material="color: #222; shader: flat"
        ></a-mixin>
      </a-assets>{" "}
      <a-scene id="scene">
        <Entity primitive="a-camera" id="camera" />
        <a-sky src="#sky" rotation="0 -90 0"></a-sky>
        <a-entity
          position="0 -5 0"
          geometry="primitive: plane; width: 10000; height: 10000;"
          rotation="-90 0 0"
          material="src: #grid; repeat: 10000 10000; transparent: true;metalness:0.6; roughness: 0.4; sphericalEnvMap: #sky;"
        ></a-entity>
        <a-entity
          id="glbtest"
          gltf-model="#glbtestmodel"
          position="0 0 0"
        ></a-entity>
      </a-scene>
    </>
  );
}

export default Root;
