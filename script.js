let title = document.getElementById("title")
let pdpimg = document.getElementById("pdpimga");
let usernameel = document.getElementById("username");
let cstatus = document.getElementById("cstatus");
let albumart = document.getElementById("albumart");
let songtitle = document.getElementById("songtitle");
let songartist = document.getElementById("songartist");
let progress = document.getElementById("progress");
let songtime = document.getElementById("songtime");
let songtime2 = document.getElementById("songtime2");
let spoli = document.getElementById("spoli");
let progressbarfill = document.getElementById("progressbarfill");
let userid = "704002391464214548"
let upprog = null
datasend = {
    op: 2,
    d: {
      subscribe_to_id: userid
    }
  }

function formatnum(word) {
    word = word.toString();
    if (word.length == 1) {
        return "0"+word;
    } else {
        return word;
    }
}

function update(datas) {
    let username = datas.d.discord_user.username;
    title.innerHTML = username;
    usernameel.innerHTML = username+"#"+datas.d.discord_user.discriminator;
    if ( pdpimg.src !== "https://cdn.discordapp.com/avatars/"+userid+"/"+datas.d.discord_user.avatar) {
        pdpimg.src = "https://cdn.discordapp.com/avatars/"+userid+"/"+datas.d.discord_user.avatar;
    }
    if (datas.d.discord_status == "dnd") {
        document.getElementById("status").style.backgroundColor = "#c63e40";
        document.getElementById("status").title = "Discord Status : Do Not Disturb";
    } else if (datas.d.discord_status == "online") {
        document.getElementById("status").style.backgroundColor = "#00ff00";
        document.getElementById("status").title = "Discord Status : Online";
    } else if (datas.d.discord_status == "idle") {
        document.getElementById("status").style.backgroundColor = "#ffff00";
        document.getElementById("status").title = "Discord Status : Idle";
    } else if (datas.d.discord_status == "offline") {
        document.getElementById("status").style.backgroundColor = "#747f8d";
        document.getElementById("status").title = "Discord Status : Offline";
    }

    if (datas.d.activities.length == 0) {
        cstatus.innerHTML = ""
    } else {
        if (datas.d.spotify) {
            if (datas.d.activities["0"].state == datas.d.spotify.artist) {
                cstatus.innerHTML = ""
            }
        }
        let cstatusd = datas.d.activities["0"].state;
        cstatus.innerHTML = cstatusd
        if (cstatusd.startsWith("http") || cstatusd.startsWith("https")) {
            cstatus.innerHTML = "<a href='"+datas.d.activities["0"].state+"'>"+datas.d.activities["0"].state+"</a>";
        }
    }

    if (datas.d.spotify) {
        clearInterval(upprog);
        albumart.hidden = false;
        songartist.hidden = false;
        progress.hidden = false;
        songtime.hidden = false;
        songtime2.hidden = false;
        spoli.href = "https://open.spotify.com/track/"+datas.d.spotify.track_id;
        albumart.src = datas.d.spotify.album_art_url;
        songtitle.innerHTML = datas.d.spotify.song;
        songartist.innerHTML = datas.d.spotify.artist;
        songtime2.innerHTML = parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000/60)+"m"+formatnum(parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000%60))+"s";
        upprog = setInterval(() => {
            now = new Date().getTime();
            duration = datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start;
            wherenow = now - datas.d.spotify.timestamps.start;
            prcnt = (wherenow/duration) * 100;
            songtime.innerHTML = parseInt((Date.now() - datas.d.spotify.timestamps.start)/1000/60)+"m"+formatnum(parseInt((Date.now() - datas.d.spotify.timestamps.start)/1000%60))+"s";
            progressbarfill.style.width = prcnt+"%";
        }, 100);
    } else {
        albumart.hidden = true;
        songartist.hidden = true;
        progress.hidden = true;
        songtime.hidden = true;
        songtime2.hidden = true;
        spoli.href = "";
        if (upprog !== null) {
            clearInterval(upprog);
        }
        songtitle.innerHTML = "No song currently playing";
    }
}

let lanyard = new WebSocket("wss://api.lanyard.rest/socket");

lanyard.onmessage = function(event) {
    jsonData = JSON.parse(event.data);
    if (jsonData.op == 1) {
        lanyard.send(JSON.stringify(datasend));
        ITer = setInterval(() => {
            lanyard.send(JSON.stringify({op: 3}));
        }, jsonData.d.heartbeat_interval);
    }
    if (jsonData.op == 0) {
        update(jsonData);
    }
  };

lanyard.onerror = function(error) {
    console.log(`[error] ${error.message}`);
  };

lanyard.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    console.log('[close] Connection died');
  }
  clearInterval(ITer);
  clearInterval(upprog);
};
