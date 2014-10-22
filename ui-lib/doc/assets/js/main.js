
$(document).ready(function() {
  Tooltip.create($('#right-tooltip'), 'right');
  Tooltip.create($('#left-tooltip'), "left");
  Tooltip.create($('#top-tooltip'), "top");
  Tooltip.create($('#down-tooltip'), "bottom");
  Tooltip.create($('#cursor-tooltip'), "cursor");  
});
