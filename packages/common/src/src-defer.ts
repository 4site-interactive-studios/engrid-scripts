// Build Notes: Add the vanilla Javascript version inline inside the page template right before </body>
// In the event the vanilla javascript is not inlined we should still process any assets with a data-src still defined on it. Plus we only process background video via this JS file as to not block the page with a large video file downloading.

// // 4Site's simplified image lazy loader
// var srcDefer = document.querySelectorAll("img[data-src]");
// window.addEventListener('DOMContentLoaded', (event) => {
//   for (var i = 0; i < srcDefer.length; i++) {
//     let dataSrc = srcDefer[i].getAttribute("data-src");
//     if (dataSrc) {
//       srcDefer[i].setAttribute("defer", "async"); // Gets image processing off the main working thread
//       srcDefer[i].setAttribute("loading", "lazy"); // Lets the browser determine when the asset should be downloaded
//       srcDefer[i].setAttribute("src", dataSrc); // Sets the src which will cause the browser to retrieve the asset
//       srcDefer[i].setAttribute("data-engrid-data-src-processed", "true"); // Sets an attribute to mark that it has been processed by ENGrid
//       srcDefer[i].removeAttribute("data-src"); // Removes the data-source
//     }
//   }
// });
export class SrcDefer{

  // Find all images and videos with a data-src defined
  public imgSrcDefer = document.querySelectorAll("img[data-src]") as NodeListOf<Element>;
  public videoBackground = document.querySelectorAll("video") as NodeListOf<Element>;
  public videoBackgroundSource = document.querySelectorAll("video source") as NodeListOf<Element>;

  constructor() {

    // Process images
    for (let i = 0; i < this.imgSrcDefer.length; i++) {
      let img = this.imgSrcDefer[i] as HTMLImageElement;
      if(img){
        img.setAttribute("defer", "async"); // Gets image processing off the main working thread, does nothing for video tags but doesn't hurt
        img.setAttribute("loading", "lazy"); // Lets the browser determine when the asset should be downloaded using it's native lazy loading
        let imgDataSrc = img.getAttribute("data-src");
        if(imgDataSrc){
          img.setAttribute("src", imgDataSrc); // Sets the src which will cause the browser to retrieve the asset
        }
        img.setAttribute("data-engrid-data-src-processed", "true"); // Sets an attribute to mark that it has been processed by ENGrid
        img.removeAttribute("data-src"); // Removes the data-source
      }
    }

    // Process video
    for (let i = 0; i < this.videoBackground.length; i++) {
      let video = this.videoBackground[i] as HTMLVideoElement;
      video.setAttribute("loading", "lazy"); // Lets the browser determine when the asset should be downloaded

      // Process one or more defined sources in the <video> tag
      let videoBackgroundSource = video.querySelectorAll("source");
      let videoBackgroundSourcedDataSrc = this.videoBackgroundSource[i].getAttribute("data-src") as string;

      if (videoBackgroundSource){
        for (let i = 0; i < this.videoBackgroundSource.length; i++) {

          // Construct the <video> tags new <source>
          if(videoBackgroundSourcedDataSrc){
            this.videoBackgroundSource[i].setAttribute("src", videoBackgroundSourcedDataSrc);
            this.videoBackgroundSource[i].setAttribute("data-engrid-data-src-processed", "true"); // Sets an attribute to mark that it has been processed by ENGrid
            this.videoBackgroundSource[i].removeAttribute("data-src"); // Removes the data-source
          }

          // To get the browser to request the video asset defined we need to remove the <video> tag and re-add it
          let videoBackgroundParent = video.parentNode; // Determine the parent of the <video> tag
          let copyOfVideoBackground = video; // Copy the <video> tag
          if(videoBackgroundParent && copyOfVideoBackground){
            videoBackgroundParent.replaceChild(copyOfVideoBackground, this.videoBackground[i]); // Replace the <video> with the copy of itself
            
            // Update the video to auto play, mute, loop
            video.muted = true; // Mute the video by default
            video.controls = false; // Hide the browser controls
            video.loop = true; // Loop the video
            video.playsInline = true; // Encourage the user agent to display video content within the element's playback area
            video.play(); // Plays the video
          }
        }
      }
    }
  }
}