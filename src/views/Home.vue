<template>
  <div>
    <p>Video Chat</p>
    <b-container>
      <b-row>
        <b-col cols="4">
          <video class="my-video" ref="my-video" id="my-video" autoplay="true" muted="muted" playsinline></video>
          <p>Your Video</p>
        </b-col>

        <b-col cols="4" v-for="(peer,index) in Object.keys(peers)" :key="index">
          <video class="user-video" :ref="'user-video-'+peer" :id="'user-video'+peer" autoplay="true" muted="muted"
                 playsinline>
          </video>
          <p>User ID: {{peer}}</p>
        </b-col>

      </b-row>
    </b-container>
  </div>
</template>

<script>
import io from 'socket.io-client'
import Peer from 'simple-peer';

var socket = io('http://localhost:4000/');
export default {
  name: "VideoChat",
  metaInfo: {
    title: 'Video Chat - Simple Peer',
    titleTemplate: '%s - Yay!',
    htmlAttrs: {
      lang: 'en',
      amp: true
    }
  },
  data() {
    return {
      stream: null,
      socketId: null,
      otherUser: null,
      peers: []
    }
  },
  mounted() {
    this.getPermissions().then((stream) => {
      this.stream = stream
      try {
        this.$refs['my-video'].srcObject = stream;
      } catch (e) {
        this.$refs['my-video'].src = URL.createObjectURL(stream);
      }
      this.$refs['my-video'].play();
    });

    let outerThis = this;
    setTimeout(() => {
      if (outerThis.socketId == null) {
        outerThis.socketId = socket.id
      }
      socket.on('peer', response => {
        if (response.peerId != outerThis.socketId) {
          outerThis.startConnection(response.peerId)
        }
      })
    }, 1000)

    socket.on('signal', data => {
      const peerId = data.from
      if (peerId != socket.id) {
        let peer = this.peers[peerId]
        if (peer == undefined) {
          peer = this.startPeer(peerId, false)
        }
        peer.signal(data.data);
      }
    })

    socket.on('unpeer', response => {
      delete this.peers[response.peerId]
      this.$forceUpdate()
    })


  },
  methods: {
    getPermissions() {
      return new Promise((res) => {
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
            .then((stream) => {
              res(stream);
            })
            .catch(err => {
              throw new Error(`Unable to fetch stream ${err}`);
            })
      });
    },
    startPeer(peerId, initiator = true) {
      const peer = new Peer({
        initiator,
        stream: this.stream,
        trickle: false
      });
      peer.on('signal', (data) => {
        const msg = {data: data, to: peerId, from: this.socketId}
        socket.emit('signal', msg)
      });

      peer.on('stream', (stream) => {
        let ref = 'user-video-' + peerId;
        let el = this.$refs[ref]
        try {
          el[0].srcObject = stream;
        } catch (e) {
          el[0].src = URL.createObjectURL(stream);
        }
        el[0].play();
      });

      this.peers[peerId] = peer
      this.$forceUpdate()
      return peer;
    },
    startConnection(peerID) {
      this.peers[peerID] = this.startPeer(peerID)
    }
  }
}
</script>

<style scoped>
.my-video {
  width: 300px;
  height: 300px;
}.user-video {
  width: 300px;
  height: 300px;
}
</style>
