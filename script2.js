const API_KEY = "AIzaSyBbY4j6K7TbMLIX1X1PfjxPXW4K8qDm7n0"; // APIキーを入力
const PLAYLIST_ID = "PLsRy2iansSOBfjNIy-9dwsF0s4-5ALMW5"; // プレイリストID
const CHANNEL_ID = 'UCf-wG6PlxW7rpixx1tmODJw'; // 対象のチャンネルID
const MAX_RESULTS = 40;

// 配列をシャッフルする関数
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// プレイリストから動画を取得する関数
async function fetchPlaylistVideos(playlistId, maxResults = 40, pageToken = "") {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&pageToken=${pageToken}&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    console.error("エラー詳細:", errorData);
    throw new Error("動画の取得に失敗しました。");
  }
  return response.json();
}

// チャンネルから動画を取得する関数
async function fetchChannelVideos(channelId, maxResults = 40, pageToken = "") {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&pageToken=${pageToken}&key=${API_KEY}&order=date`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    console.error("エラー詳細:", errorData);
    throw new Error("動画の取得に失敗しました。");
  }
  return response.json();
}

// 検索を行う関数
async function searchVideos(query) {
  try {
    let nextPageToken = "";
    let allVideos = [];
    let hasMoreVideos = true;

    // 複数ページを取得するためのループ
    while (hasMoreVideos) {
      const data = await fetchChannelVideos(CHANNEL_ID, MAX_RESULTS, nextPageToken);
      allVideos = allVideos.concat(data.items);
      nextPageToken = data.nextPageToken || "";
      hasMoreVideos = !!nextPageToken; // 次ページがあれば続行
    }

    console.log("取得した動画:", allVideos); // デバッグ用ログ

    const videos = shuffleArray(allVideos); // シャッフル

    const videosContainer = document.getElementById("videos");
    videosContainer.innerHTML = ""; // 前回の結果をクリア

    // 検索クエリに一致する動画をフィルタリング
    const filteredVideos = videos.filter(video =>
      video.snippet.title.toLowerCase().includes(query.toLowerCase())
    );

    console.log("フィルタリング後の動画:", filteredVideos); // デバッグ用ログ

    if (filteredVideos.length === 0) {
      videosContainer.innerHTML = "<p>検索結果が見つかりませんでした。</p>";
      return;
    }

    // 各動画を表示
    filteredVideos.forEach((video) => {
      const videoId = video.id.videoId;
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <a href="video.html?videoId=${videoId}">
          <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.snippet.title}">
          <div class="video-titles">
            <img id="video-title-icon" src="icon.jpg" alt="">
            <div class="video-title">${video.snippet.title}
            
            </div>
            <p class="ch-name">ジャルジャルアイランド JARUJARU ISLAND</p>
            
          </div>
        </a>
      `;
      videosContainer.appendChild(videoCard);
    });
  } catch (error) {
    console.error(error);
    alert("エラーが発生しました。もう一度お試しください。");
  }
}
// 動画詳細を取得する関数
async function fetchVideoDetails(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error("動画詳細の取得に失敗しました");
    return null;
  }
  const data = await response.json();
  return data.items[0]?.snippet.publishedAt || null; // 公開日を返す
}

// 動画を表示する関数（ランダム性をさらに高め、正しい公開日を表示）

document.querySelectorAll(".list a").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault(); // デフォルト動作を無効化

    // 選択されたプレイリストIDを取得
    const playlistId = event.target.getAttribute("data-playlist-id");

    if (playlistId) {
      console.log(`選択されたプレイリストID: ${playlistId}`); // デバッグ用
      await displayVideosByPlaylist(playlistId); // プレイリストに基づいて動画を表示
    } else {
      console.error("プレイリストIDが取得できませんでした。");
    }
  });
});




// ページが読み込まれたときに指定したプレイリストを初期表示
document.addEventListener("DOMContentLoaded", () => {
  const initialPlaylistId = "PLsRy2iansSOBfjNIy-9dwsF0s4-5ALMW5"; // 初期表示するプレイリストID
  displayVideosByPlaylist(initialPlaylistId);
});

// 各リンクにイベントリスナーを追加してクリック時にプレイリストを表示
document.querySelectorAll(".list a").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault(); // デフォルト動作を無効化
    const playlistId = event.target.getAttribute("data-playlist-id");

    if (playlistId) {
      console.log(`選択されたプレイリストID: ${playlistId}`); // デバッグ用
      await displayVideosByPlaylist(playlistId); // プレイリストを表示
    } else {
      console.error("プレイリストIDが取得できませんでした。");
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // 取得中メッセージを表示

  try {
    const initialPlaylistId = "PLsRy2iansSOBfjNIy-9dwsF0s4-5ALMW5"; // 初期表示するプレイリストID
    await displayVideosByPlaylist(initialPlaylistId);
  } catch (error) {
    console.error("初期読み込み時のエラー:", error);
  } finally {
    loadingMessage.style.display = "none"; // 初期読み込み完了後に非表示
  }
});

async function displayVideosByPlaylist(playlistId) {
  const loadingMessage = document.getElementById("loadingMessage");
  
  try {
    loadingMessage.style.display = "block"; // 動画取得処理の開始時にメッセージを表示

    let allVideos = [];
    let nextPageToken = "";

    while (true) {
      const data = await fetchPlaylistVideos(playlistId, MAX_RESULTS, nextPageToken);
      allVideos = allVideos.concat(data.items);
      nextPageToken = data.nextPageToken || "";
      if (!nextPageToken) break; // 次ページがなければ終了
    }

    if (allVideos.length === 0) {
      document.getElementById("videos").innerHTML = "<p>動画が見つかりませんでした。</p>";
      return;
    }

    // シャッフルして表示
    const shuffledVideos = shuffleArray(allVideos);
    const videosContainer = document.getElementById("videos");
    videosContainer.innerHTML = ""; // 前回の結果をクリア

    shuffledVideos.forEach((video) => {
      const videoId = video.snippet.resourceId.videoId;
      const videoTitle = video.snippet.title;

      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <a href="video.html?videoId=${videoId}">
          <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${videoTitle}">
          <div class="video-titles">
            <div class="video-title">${videoTitle}</div>
          </div>
        </a>
      `;
      videosContainer.appendChild(videoCard);
    });
  } catch (error) {
    console.error("エラー:", error);
  } finally {
    loadingMessage.style.display = "none"; // 処理が完了した後にメッセージを非表示
  }
}


// オーバーレイをクリックしたときメニューを閉じる
document.getElementById("overlay").addEventListener("click", () => {
  const sideMenu = document.getElementById("sidemenu");
  const overlay = document.getElementById("overlay");

  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
});




// 検索ボタンのイベントリスナー
document.getElementById("searchButton").addEventListener("click", async () => {
  const query = document.getElementById("searchQuery").value.trim();
  if (query) {
    console.log(`検索ワード: ${query}`); // デバッグ用ログ
    await searchVideos(query);
  } else {
    alert("検索ワードを入力してください。");
  }
});


// ポップアップを表示する関数
function showPopup(videoId) {
  const videoPopup = document.getElementById("videoPopup");
  const videoFrame = document.getElementById("videoFrame");
  videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  videoPopup.style.display = "block";
}

// ポップアップを閉じる関数
document.getElementById("closePopup").addEventListener("click", () => {
  const videoPopup = document.getElementById("videoPopup");
  const videoFrame = document.getElementById("videoFrame");
  videoFrame.src = ""; // フレームをクリアして再生を停止
  videoPopup.style.display = "none";
});

// 各動画カードにイベントリスナーを追加
document.querySelectorAll(".video-card a").forEach(link => {
  link.addEventListener("click", (event) => {
    event.preventDefault(); // デフォルトのリンク動作を無効化
    const videoId = link.href.split("videoId=")[1];
    showPopup(videoId);
  });
});


// 初期表示
initialPlaylistId();




// メニューの開閉を制御する関数
function toggleMenu() {
  const sideMenu = document.getElementById("sidemenu");
  const hum = document.querySelector(".hum");
  const overlay = document.getElementById("overlay");

  sideMenu.classList.toggle("open");
  hum.classList.toggle("open");
  overlay.classList.toggle("active");
  document.body.style.overflow = sideMenu.classList.contains("open") ? "hidden" : "auto";
}

// オーバーレイをクリックしたときメニューを閉じる
document.getElementById("overlay").addEventListener("click", () => {
  const sideMenu = document.getElementById("sidemenu");
  const overlay = document.getElementById("overlay");

  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
});
