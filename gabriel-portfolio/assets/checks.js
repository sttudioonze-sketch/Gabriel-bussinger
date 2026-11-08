function restartCourseChecks(){
  if(document.hidden)return;
  document.querySelectorAll('.check-stroke').forEach(check=>{
    check.style.animation='none';
    void check.getBoundingClientRect();
    check.style.animation='';
  });
}
document.addEventListener('visibilitychange',restartCourseChecks);
addEventListener('pageshow',restartCourseChecks);
if(location.search.includes('export'))document.documentElement.classList.add('preview-static');
