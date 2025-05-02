import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function VideoPlayer() {
  const videoRef = useRef(null);
  const [watchedIntervals, setWatchedIntervals] = useState([]);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  let playStartTime = null; // Start of a play session

  const mergeIntervals = (intervals) => {
    if (intervals.length === 0) return [];
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
      const last = merged[merged.length - 1];
      if (intervals[i][0] <= last[1]) {
        last[1] = Math.max(last[1], intervals[i][1]);
      } else {
        merged.push(intervals[i]);
      }
    }
    return merged;
  };

  const calculateProgress = (intervals) => {
    const total = intervals.reduce((acc, [start, end]) => acc + (end - start), 0);
    return videoDuration > 0 ? ((total / videoDuration) * 100).toFixed(2) : 0;
  };

  useEffect(() => {
    const video = videoRef.current;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    const handlePlay = () => {
      playStartTime = Math.floor(video.currentTime);
    };

    const handlePauseOrSeekedOrEnded = async () => {
      if (playStartTime !== null) {
        const playEndTime = Math.floor(video.currentTime);
        if (playEndTime > playStartTime) {
          const newInterval = [playStartTime, playEndTime];

          // 👉 Merge new interval with previously watched intervals
          const updatedIntervals = mergeIntervals([...watchedIntervals, newInterval]);

          // 👉 calculate progress from merged unique intervals
          const updatedProgress = calculateProgress(updatedIntervals);

          setWatchedIntervals(updatedIntervals);
          setProgress(updatedProgress);

          // 👉 Post updated intervals to backend
          await axios.post('http://localhost:5000/api/progress', {
            userId: 'user123',
            videoId: 'video001',
            intervals: updatedIntervals
          });
        }
        playStartTime = null; // Reset start
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePauseOrSeekedOrEnded);
    video.addEventListener('seeked', handlePauseOrSeekedOrEnded);
    video.addEventListener('ended', handlePauseOrSeekedOrEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePauseOrSeekedOrEnded);
      video.removeEventListener('seeked', handlePauseOrSeekedOrEnded);
      video.removeEventListener('ended', handlePauseOrSeekedOrEnded);
    };
  }, [watchedIntervals, videoDuration]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/progress/user123/video001')
      .then(res => {
        if (res.data && res.data.intervals.length > 0) {
          const merged = mergeIntervals(res.data.intervals);
          setWatchedIntervals(merged);
          setProgress(calculateProgress(merged));

          const lastPos = Math.max(...merged.map(i => i[1]));
          videoRef.current.currentTime = lastPos;
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <video ref={videoRef} width="640" controls className="rounded shadow">
        <source src="/sih.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="mt-4 text-lg font-semibold">
        Progress: {progress}%
      </div>
    </div>
  );
}

export default VideoPlayer;
