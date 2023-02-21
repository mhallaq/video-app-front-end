import React, { useState, useEffect } from "react";
import VideoList from "./VideoList";
import VideoAdder from "./VideoAdder";

const backEndUrl = "https://youtube-videos-backend.up.railway.app/videos";
const App = () => {
  const videoUrl = "https://www.youtube.com/embed/";

  const [videos, setVideos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to get the Video Url Link
  const getVideoUrl = function (video) {
    const regex = /v=([^&]*)/;
    const match = video.url.match(regex);
    let container = {};
    if (match) {
      const videoId = match[1];
      const videoLink = videoUrl.concat(videoId);
      container = { ...video, url: videoLink };
    }
    return container;
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(backEndUrl);
      const data = await response.json();
      const newVideoArray = data.map((video) => {
        return getVideoUrl(video);
      });
      newVideoArray.sort((a, b) => b.rating - a.rating);
      setVideos(newVideoArray);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onVote = async (id, vote) => {
    try {
      const response = await fetch(`${backEndUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote }),
      });
      const updatedVideo = await response.json();

      setVideos(
        videos.map((video) => {
          if (video.id === id) {
            return { ...video, rating: updatedVideo.rating };
          }
          return video;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const onRemove = async (id) => {
    try {
      const response = await fetch(`${backEndUrl}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVideos(videos.filter((video) => video.id !== id));
      } else {
        console.error("Error deleting video");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onAdd = async (video) => {
    try {
      const response = await fetch(backEndUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(video),
      });
      if (response.ok) {
        const newVideo = await response.json();
        console.log("newVideo:", newVideo);
        setVideos([...videos, { ...getVideoUrl(newVideo) }]);
        console.log(videos);
        setIsOpen(false);
      } else {
        console.error("Error adding video");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      <VideoAdder
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onAdd={onAdd}
        onClose={onClose}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsOpen(true)}
      >
        Add Video
      </button>
      <div className="flex flex-wrap">
        <VideoList videos={videos} onVote={onVote} onRemove={onRemove} />
      </div>
    </div>
  );
};

export default App;