const API_KEY = 'AIzaSyBbY4j6K7TbMLIX1X1PfjxPXW4K8qDm7n0'; // 取得したAPIキーを入力
    const CHANNEL_ID = 'UCf-wG6PlxW7rpixx1tmODJw'; // 対象のチャンネルI

async function fetchOtherVideos(query = '') {
      let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&type=video&key=${API_KEY}`;
      if (query) {
        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('その他動画の取得に失敗しました。');
      }
      const data = await response.json();
      return data.items;
    }

    function getVideoIdFromURL() {
      const params = new URLSearchParams(window.location.search);
      return params.get('videoId');
    }

    async function initializePage() {
      const videoId = getVideoIdFromURL();
      if (!videoId) {
        alert('動画IDが見つかりません。');
        return;
      }

      // YouTube APIを使って動画の詳細情報を取得
      const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
      const videoDetailsResponse = await fetch(videoDetailsUrl);
      if (!videoDetailsResponse.ok) {
        console.error('動画の詳細情報の取得に失敗しました。');
        return;
      }
      const videoDetailsData = await videoDetailsResponse.json();
      const videoTitle = videoDetailsData.items[0]?.snippet.title || '動画';

      // タイトルをページのタブに設定
      document.title = videoTitle;

      // 自動再生を有効にするため、URLに `autoplay=1` を追加
      const videoPlayer = document.getElementById('videoPlayer');
      videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

      try {
        const otherVideos = await fetchOtherVideos();
        const otherVideosContainer = document.getElementById('otherVideos');
        otherVideosContainer.innerHTML = '';

        otherVideos.forEach(video => {
          const otherVideoId = video.id.videoId;
          const videoCard = document.createElement('div');
          videoCard.className = 'video-card';
          videoCard.innerHTML = `
            <a href="video.html?videoId=${otherVideoId}">
              <img src="https://img.youtube.com/vi/${otherVideoId}/mqdefault.jpg" alt="${video.snippet.title}">
            </a>
            <div class="video-info">
              <div class="video-title">${video.snippet.title}</div>
            </div>
          `;
          otherVideosContainer.appendChild(videoCard);
        });
      } catch (error) {
        console.error(error);
        alert('その他動画の取得に失敗しました。');
      }
    }

    document.getElementById('searchButton').addEventListener('click', async () => {
      const query = document.getElementById('searchQuery').value.trim();
      if (query) {
        try {
          const otherVideos = await fetchOtherVideos(query);
          const otherVideosContainer = document.getElementById('otherVideos');
          otherVideosContainer.innerHTML = '';

          otherVideos.forEach(video => {
            const otherVideoId = video.id.videoId;
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.innerHTML = `
              <a href="video.html?videoId=${otherVideoId}">
                <img src="https://img.youtube.com/vi/${otherVideoId}/mqdefault.jpg" alt="${video.snippet.title}">
              </a>
              <div class="video-info">
                <div class="video-title">${video.snippet.title}</div>
              </div>
            `;
            otherVideosContainer.appendChild(videoCard);
          });
        } catch (error) {
          console.error(error);
          alert('検索に失敗しました。');
        }
      }
    });

    // ページ読み込み時に初期化
    initializePage();