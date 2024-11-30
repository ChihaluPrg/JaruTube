const API_KEY = 'AIzaSyBbY4j6K7TbMLIX1X1PfjxPXW4K8qDm7n0'; // 取得したAPIキーを入力
    const CHANNEL_ID = 'UCf-wG6PlxW7rpixx1tmODJw'; // 対象のチャンネルID
    const MAX_RESULTS = 10; // 一度に取得する動画の最大数

    async function fetchVideos(channelId, query = '') {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&channelId=${channelId}&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('動画の取得に失敗しました。');
      }
      const data = await response.json();
      return data.items;
    }

    async function displayVideos(query = '') {
      try {
        const videos = await fetchVideos(CHANNEL_ID, query);
        const videosContainer = document.getElementById('videos');
        videosContainer.innerHTML = ''; // 前回の検索結果をクリア

        if (videos.length === 0) {
          videosContainer.innerHTML = '<p>動画が見つかりませんでした。</p>';
          return;
        }

        videos.forEach(video => {
          const videoId = video.id.videoId;
          const videoCard = document.createElement('div');
          videoCard.className = 'video-card';
          videoCard.innerHTML = `
            <a href="video.html?videoId=${videoId}">
              <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.snippet.title}">
              <div class="video-title">${video.snippet.title}</div>
            </a>
          `;
          videosContainer.appendChild(videoCard);
        });
      } catch (error) {
        console.error(error);
        alert('エラーが発生しました。もう一度お試しください。');
      }
    }

    document.getElementById('searchButton').addEventListener('click', () => {
      const query = document.getElementById('searchQuery').value.trim();
      if (query) {
        displayVideos(query);
      } else {
        alert('検索ワードを入力してください。');
      }
    });

    // ページ読み込み時に指定チャンネルの動画を表示
    displayVideos(); // 初期表示時に動画を取得して表示