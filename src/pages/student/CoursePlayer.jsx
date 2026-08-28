import { useEffect, useState, useRef } from "react";
import YouTube from "react-youtube";
import { useParams } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

import useProgress from "../../hooks/useProgress";
import api from "../../api/axios";

import "./CoursePlayer.css";


export default function CoursePlayer(){


const { id } = useParams();


const [course,setCourse] = useState(null);

const [resumeTime,setResumeTime]=useState(0);

const token = localStorage.getItem("token");

const playerRef = useRef(null);

const trackingRef = useRef(null);

const lastTimeRef = useRef(0);

const [watchedPercent,setWatchedPercent] = useState(0);

const [videoReady,setVideoReady] = useState(false);

const getVideoId = (url)=>{

try{

const urlObj = new URL(url);


if(urlObj.hostname.includes("youtu.be")){

return urlObj.pathname.slice(1);

}


return urlObj.searchParams.get("v");


}catch(error){

console.log("Invalid YouTube URL");

return "";

}

};

useEffect(()=>{


return ()=>{

if(trackingRef.current){

clearInterval(trackingRef.current);

}

};


},[]);


const saveWatchProgress = async (percent, time) => {
  if (!course) return;

  try {
    await api.post("/progress/watch", {
      itemId: course._id,
      watchPercentage: percent,
      watchTime: time,
    });
  } catch (error) {
    console.log("SAVE WATCH PROGRESS ERROR:", error);
  }
};

const opts = {

height:"100%",

width:"100%",

playerVars:{

autoplay:0,

controls:1,

rel:0,

modestbranding:1,

disablekb:1

}

};



const onReady = (event)=>{

playerRef.current = event.target;

setVideoReady(true);

};


useEffect(()=>{

if(
videoReady &&
resumeTime > 0 &&
playerRef.current
){

setTimeout(()=>{

playerRef.current.seekTo(
resumeTime,
true
);

},1000);


}


},[videoReady,resumeTime]);

const onStateChange = (event)=>{


// تشغيل الفيديو
if(event.data === 1){

startTracking();

}


// إيقاف الفيديو
if(event.data === 0 || event.data === 2){

if(trackingRef.current){

clearInterval(trackingRef.current);

trackingRef.current=null;

}

}


};
const startTracking = ()=>{


if(trackingRef.current)
return;


trackingRef.current = setInterval(()=>{


if(!playerRef.current)
return;



const current =
playerRef.current.getCurrentTime();


if(current > lastTimeRef.current + 5){

playerRef.current.seekTo(
lastTimeRef.current
);

return;

}


lastTimeRef.current = current;



const duration =
playerRef.current.getDuration();



const percent =
(current / duration) * 100;



setWatchedPercent(
Math.floor(percent)
);

saveWatchProgress(

Math.floor(percent),

current

);

},1000);


};
const {
  completeItem
} = useProgress();




useEffect(()=>{

loadCourse();

},[]);


useEffect(()=>{

if(id){

loadWatchProgress();

}

},[id]);





const loadCourse = async()=>{


try{


const res = await api.get(`/courses/${id}`);

const data = res.data;


console.log("COURSE PLAYER:",data);

if(data.success){

setCourse(data.course);

}

}catch(error){

console.log(error);

}

};

const loadWatchProgress = async()=>{

try{

const res = await api.get(`/progress/watch/${id}`);

const data = res.data;

if(
data.success &&
data.progress
){

setResumeTime(
data.progress.watchTime || 0
);

lastTimeRef.current =
data.progress.watchTime || 0;

}



}catch(error){

console.log(error);

}


};




const finishCourse = ()=>{


completeItem(
course._id,
"course"
);


};





if(!course){

return (

<div>

جاري تحميل الدرس...

</div>

);

}





return(

<div className="course-player">



<div className="player-header">


<button
onClick={()=>window.history.back()}
>

<FiArrowRight/>

رجوع

</button>



<h1>

{course.title}

</h1>


</div>





<div className="video-container">


{
course.videoUrl && getVideoId(course.videoUrl) && (

<YouTube

key={course._id}

videoId={getVideoId(course.videoUrl)}

opts={opts}

onReady={onReady}

onStateChange={onStateChange}

/>

)
}


</div>





<div className="course-info">


<h2>
{course.title}
</h2>


<p>
{course.description}
</p>




{
watchedPercent >= 95 ?

<button
className="complete-course"
onClick={finishCourse}
>
✅ تم الانتهاء من الدرس
</button>

:

<div className="watch-warning">

  <div className="watch-status">
    <span>⏳ يجب مشاهدة 95% من الفيديو لتفعيل الإكمال</span>

    <strong>
      {watchedPercent}%
    </strong>
  </div>

  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{
        width: `${Math.min(watchedPercent, 100)}%`
      }}
    />
  </div>

  <div className="progress-labels">
    <span>نسبة المشاهدة</span>
    <span>{watchedPercent}% / 95%</span>
  </div>

</div>

}



</div>




</div>

);


}