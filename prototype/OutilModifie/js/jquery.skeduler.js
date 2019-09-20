(function ($) {
  var defaultSettings = {
    // Data attributes
    headers: [],  // String[] - Array of column headers
    tasks: [],    // Task[] - Array of tasks. Required fields: 
    // id: number, startTime: number, duration: number, column: number

    // Card template - Inner content of task card. 
    // You're able to use ${key} inside template, where key is any property from task.
    cardTemplate: '<div>${id}</div>',

    // OnClick event handler
    onClick: function (e, task) { },

    // Css classes
    containerCssClass: 'skeduler-container',
    headerContainerCssClass: 'skeduler-headers',
    schedulerContainerCssClass: 'skeduler-main',
    taskPlaceholderCssClass: 'skeduler-task-placeholder',
    cellCssClass: 'skeduler-cell',

    lineHeight: 30,      // height of one half-hour line in grid
    borderWidth: 1,      // width of board of grid cell

    debug: false
  };
  var settings = {};

  /**
   * Convert double value of hours to zero-preposited string with 30 or 00 value of minutes
   */
  function toTimeString(value) {
    return (value < 10 ? '0' : '') + Math.floor(value) + (Math.ceil(value) > Math.floor(value) ? ':30' : ':00');
  }

  /**
   * Return height of task card based on duration of the task
   * duration - in hours
   */
  function getCardHeight(duration) {
    return (settings.lineHeight + settings.borderWidth) * (duration * 2) - 1;
  }

  /**
   * Return top offset of task card based on start time of the task
   * startTime - in hours
   */
  function getCardTopPosition(startTime) {
    return (settings.lineHeight + settings.borderWidth) * ((startTime-8) * 2);
  }

  /**
  * Render card template
  */
  function renderInnerCardContent(task) {
    var result = settings.cardTemplate;
    for (var key in task) {
      if (task.hasOwnProperty(key)) {
        // TODO: replace all
        result = result.replace('${' + key + '}', task[key]);
      }
    }

    return $(result);
  }

  /**
   * Generate task cards
   */
  function appendTasks(placeholder, tasks) {
    if(tasks.length==0) return;
    var findCoefficients = function () {
      var coefficients = [];
      for (var i = 0; i < tasks.length - 1; i++) {
        var k = 0;
        var j = i + 1;
          while (j < tasks.length && 
            (
              //tâche en même temps            
             (tasks[i].startTime == tasks[j].startTime && 
              (tasks[i].startTime + tasks[i].duration) == (tasks[j].startTime+ tasks[j].duration))
             ||
             //les tâches se chevauchent             
              (tasks[i].startTime == tasks[j].startTime && 
               (tasks[j].startTime+tasks[j].duration)!=(tasks[i].startTime+tasks[i].duration)
              )
              ||
              (tasks[i].startTime != tasks[j].startTime && 
               (tasks[j].startTime+tasks[j].duration)==(tasks[i].startTime+tasks[i].duration)
              )
              ||
              (tasks[i].startTime < tasks[j].startTime &&
                (tasks[i].startTime + tasks[i].duration) > tasks[j].startTime)
              )             
            ) {
              k++;
              j++;
            }
        coefficients.push(k);
      }

      coefficients.push(0);
      return coefficients;
    };

    var normalize = function (args,tasks) {
      var indexes = {};
      for (var i = 0; i < args.length; i++) {
        var start = i;
        var count = 0;
        while (args[i] != 0) {
          i++;
          count++;
        }
        var end = i;
        if (count) {
          count++;
        }
        //comptabiliser le nombre d'événements différents sur la période de chevauchement [start-end]
        //la largeur est égale à ce nombre
        var tab={};
        for (var j = start; j <= end; j++) {
          tab[tasks[j].groupe]=1;
        }
        var taille = 0;
        for (o in tab) ++taille;
        count=taille;
        //
        var index = 0;
        for (var j = start; j <= end; j++) {
          args[j] = count;
          indexes[j] = index++;          
        }
      }
      //largeur : args
      //positionnement à gauche : indexes
      return {args: args, indexes: indexes};
    };

    var args =
      normalize(
        findCoefficients(),tasks
      );

    for (var i = 0; i < args.args.length; i++) {
      var width = 194 / (args.args[i] || 1);      
      tasks[i].width = width;
      if(args.indexes[i]>=args.args[i]) {
        tasks[i].left = 0;
      }
      else tasks[i].left = (args.indexes[i] * width);
    }

    tasks.forEach(function (task, index) {
      var innerContent = renderInnerCardContent(task);
      var top = getCardTopPosition(task.startTime) + 2;
      var height = getCardHeight(task.duration);
      var width = task.width || 194;
      var left = task.left || 4;

      var card = $('<div></div>')
        .attr({
          id:task.typeCours,          
          style: 'top: ' + top + 'px; height: ' + (height - 4) + 'px; ' + 'width: ' + (width - 8) + 'px; left: ' + left + 'px',
          title: toTimeString(task.startTime) + ' - ' + toTimeString(task.startTime + task.duration)
        });
      card.on('click', function (e) { settings.onClick && settings.onClick(e, task) });
      card.append(innerContent)
        .appendTo(placeholder);
    }, this);
      
  }

  /**
  * Generate scheduler grid with task cards
  * options:
  * - headers: string[] - array of headers
  * - tasks: Task[] - array of tasks
  * - containerCssClass: string - css class of main container
  * - headerContainerCssClass: string - css class of header container
  * - schedulerContainerCssClass: string - css class of scheduler
  * - lineHeight - height of one half-hour cell in grid
  * - borderWidth - width of border of cell in grid
  */
  $.fn.skeduler = function (options) {
    settings = $.extend(defaultSettings, options);

    if (settings.debug) {
      console.time('skeduler');
    }

    var skedulerEl = $(this).clone();
    skedulerEl.empty();
    skedulerEl.addClass(settings.containerCssClass);

    var div = $('<div></div>');


    // Add headers
    var headerContainer = div.clone().addClass(settings.headerContainerCssClass);  
    settings.headers.forEach(function (element) {
      div.clone().text(element).appendTo(headerContainer);
    }, this);
    skedulerEl.append(headerContainer);

    // Add schedule
    var scheduleEl = div.clone().addClass(settings.schedulerContainerCssClass);
    var scheduleTimelineEl = div.clone().addClass(settings.schedulerContainerCssClass + '-timeline');
    var scheduleBodyEl = div.clone().addClass(settings.schedulerContainerCssClass + '-body');

    var gridColumnElement = div.clone();

    for (var i = 8; i < 19; i++) {
      // Populate timeline
      div.clone()
        .text(toTimeString(i))
        .appendTo(scheduleTimelineEl);
      div.clone().appendTo(scheduleTimelineEl);

      gridColumnElement.append(div.clone().addClass(settings.cellCssClass));
      gridColumnElement.append(div.clone().addClass(settings.cellCssClass));
      
    }

    //Add time
    var today=new Date();
    var h=today.getHours()+1;
    var startTime=h+today.getMinutes()/60;
    var offset=$(this).offset().top;
    var top=getCardTopPosition(startTime) + offset;
    if(h>=8 && h<=19){
      height=1;
      width=50;
      left=8;
       var _timeline=$('<div></div>')
        .attr({           
          style: 'top: ' + top + 'px; height: ' + height + 'px; ' + 'width: ' + width + 'px; ',
        });
        _timeline.addClass('skeduler-actualtime');
        _timeline.appendTo(scheduleTimelineEl);
    }

    // Populate grid
    for (var j = 0; j < settings.headers.length; j++) {
      var el = gridColumnElement.clone();

      var placeholder = div.clone().addClass(settings.taskPlaceholderCssClass);
      appendTasks(placeholder, settings.tasks.filter(function (t) { return t.column == j }));

      el.prepend(placeholder);
      el.appendTo(scheduleBodyEl);
    }

    scheduleEl.append(scheduleTimelineEl);
    scheduleEl.append(scheduleBodyEl);

    skedulerEl.append(scheduleEl);

    if (settings.debug) {
      console.timeEnd('skeduler');
    }
    $(this).fadeOut('slow',function(){
            $(this).replaceWith(skedulerEl);
            skedulerEl.hide().fadeIn('fast');
            $('.skeduler-headers').attr('value','EDT');
            var offset=$('.skeduler-main').offset().top;
            var top=getCardTopPosition(startTime) + offset - getCardTopPosition(9);
            $('.skeduler-actualtime').attr({style:'top:'+ top + 'px;'});            
        });

    return skedulerEl;
  };
}(jQuery));