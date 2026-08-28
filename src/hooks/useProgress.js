import { useEffect, useState } from "react";
import api from "../api/axios";

export default function useProgress() {

  const token = localStorage.getItem("token");

  const [progress, setProgress] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {

    try {

      const res = await api.get("/progress/student");

      const data = res.data;

      if (data.success) {
        setProgress(data.progress);
      }

    } catch (error) {

      console.log(error);

    }

  };

  const startItem = async (itemId, itemType) => {

    try {

      await api.post("/progress/start", {
        itemId,
        itemType,
      });

      loadProgress();

    } catch (error) {

      console.log(error);

    }

  };

  const completeItem = async (
  itemId,
  itemType,
  score = null,
  totalScore = null
) => {

  try {

    await api.post("/progress/complete", {
      itemId,
      itemType,
      score,
      totalScore,
    });

    loadProgress();

  } catch (error) {

    console.log(error);

  }

};

  const getStatus = (itemId) => {

  const item = progress.find(
    (p) => String(p.itemId) === String(itemId)
  );

  if (!item) return "not_started";

  return item.status;

};

  return {

    progress,

    startItem,

    completeItem,

    getStatus,

    refreshProgress: loadProgress,

  };

}